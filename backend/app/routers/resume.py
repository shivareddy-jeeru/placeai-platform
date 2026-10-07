import io
import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional

from pypdf import PdfReader
from docx import Document as DocxDocument

from backend.app.database import get_db
from backend.app import models, schemas
from backend.app.agents.resume_agent import ResumeAgent
from backend.app.rate_limiting import limiter, get_rate_limit
from backend.app.security import get_current_user_optional, get_current_user
from backend.app.session import get_session_id_from_request, get_or_create_session, update_session_resume
from backend.app.services.ats_scorer import ats_scorer

router = APIRouter(prefix="/resume", tags=["resume"])
resume_agent = ResumeAgent()
logger = logging.getLogger(__name__)

# Max file size: 10 MB
MAX_FILE_SIZE = 10 * 1024 * 1024

def extract_text_from_file(file: UploadFile) -> str:
    """
    Validates file format, size, MIME type, magic bytes, encryption, and page count,
    then extracts and cleans the text content.
    """
    content_type = file.content_type or ""
    filename = (file.filename or "").lower()

    # 1. Extension check
    allowed_exts = (".pdf", ".docx", ".doc", ".txt")
    if not any(filename.endswith(ext) for ext in allowed_exts):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file format '{filename}'. PlaceAI accepts PDF, DOCX, and TXT resumes."
        )

    try:
        file.file.seek(0, 2)
        file_size = file.file.tell()
        file.file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds maximum size limit of 10 MB. Got {file_size / (1024 * 1024):.1f} MB."
            )

        if filename.endswith(".pdf") or "pdf" in content_type:
            pdf_bytes = file.file.read()
            if len(pdf_bytes) == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="The uploaded PDF file is empty."
                )

            # Check magic bytes for PDF
            if not pdf_bytes.startswith(b"%PDF-"):
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Corrupted file: The file does not have a valid PDF header."
                )

            reader = PdfReader(io.BytesIO(pdf_bytes))

            if reader.is_encrypted:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Password-protected PDF files cannot be evaluated. Please remove the password and re-upload."
                )

            if len(reader.pages) > 10:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Resume exceeds the maximum supported length of 10 pages."
                )

            text = ""
            for page in reader.pages:
                text += page.extract_text() or ""
            return text

        elif filename.endswith(".docx") or "word" in content_type:
            docx_bytes = file.file.read()
            if len(docx_bytes) == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="The uploaded DOCX file is empty."
                )
            doc = DocxDocument(io.BytesIO(docx_bytes))
            text = "\n".join([p.text for p in doc.paragraphs])
            return text

        else:
            raw_bytes = file.file.read()
            return raw_bytes.decode("utf-8", errors="replace")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error parsing uploaded file {filename}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Could not parse resume file. The file may be corrupt or malformed: {str(e)}"
        )

@router.post("/ats-score", response_model=schemas.ATSScoringResponse, status_code=status.HTTP_200_OK)
@limiter.limit(get_rate_limit("upload"))
def score_resume_ats(
    request: Request,
    file: UploadFile = File(...),
    job_description: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    session_id: str = Depends(get_session_id_from_request)
):
    """
    Deterministic ATS scoring pipeline with user isolation.
    Extracts PDF/DOCX text, calculates structural ATS readability sub-scores,
    metrics presence, contact links, and JD match score.
    """
    text = extract_text_from_file(file)
    if not text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded resume file contains no readable text or is empty."
        )

    # 1. Deterministic Resume ATS Score (Documented 9-factor transparent model)
    ats_eval = ats_scorer.calculate_resume_ats_score(text)

    # 2. Deterministic Job Match Score if JD text is provided
    jd_eval = ats_scorer.calculate_job_match_score(text, job_description or "")

    # 3. If authenticated user, save or update resume in database for persistence
    user_id = current_user.id if current_user else None
    db_resume = models.Resume(
        user_id=user_id,
        session_id=session_id,
        filename=file.filename or "uploaded_resume.pdf",
        extracted_skills=ats_eval["detected_skills"],
        ats_score=ats_eval["resumeAtsScore"],
        improvements=ats_eval["warnings"],
        strengths=ats_eval["strengths"],
        faults=ats_eval["warnings"]
    )
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)

    # Update active SessionState
    update_session_resume(db, session_id, {
        "ats_score": ats_eval["resumeAtsScore"],
        "extracted_skills": ats_eval["detected_skills"],
        "breakdown": ats_eval["breakdown"]
    }, resume_id=db_resume.id)

    return schemas.ATSScoringResponse(
        resumeAtsScore=ats_eval["resumeAtsScore"],
        jobMatchScore=jd_eval["jobMatchScore"],
        is_scanned_pdf=ats_eval["is_scanned_pdf"],
        breakdown=schemas.ATSBreakdownOut(**ats_eval["breakdown"]),
        detectedSkills=ats_eval["detected_skills"],
        detectedSections=ats_eval["detected_sections"],
        matchedSkills=jd_eval["matchedSkills"],
        missingSkills=jd_eval["missingSkills"],
        warnings=ats_eval["warnings"],
        recommendations=jd_eval["recommendations"]
    )

@router.post("/analyze", response_model=schemas.ResumeOut, status_code=status.HTTP_201_CREATED)
@limiter.limit(get_rate_limit("upload"))
def analyze_resume(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    session_id: str = Depends(get_session_id_from_request)
):
    """
    Performs in-depth structural resume analysis using deterministic ATS scorer
    and qualitative agent recommendations.
    """
    text = extract_text_from_file(file)
    if not text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded resume appears to be empty."
        )

    # 1. Deterministic ATS scoring
    ats_eval = ats_scorer.calculate_resume_ats_score(text)

    # 2. Process qualitative analysis
    analysis = resume_agent.run({"resume_text": text})
    if "error" in analysis:
        analysis = {}

    user_id = current_user.id if current_user else None

    # Save to database associated with authenticated user
    db_resume = models.Resume(
        session_id=session_id,
        user_id=user_id,
        filename=file.filename or "uploaded_resume.pdf",
        extracted_skills=ats_eval["detected_skills"] or analysis.get("extracted_skills", []),
        education=analysis.get("education", []),
        experience=analysis.get("experience", []),
        projects=analysis.get("projects", []),
        ats_score=ats_eval["resumeAtsScore"],
        improvements=ats_eval["warnings"] or analysis.get("improvements", []),
        strengths=ats_eval["strengths"] or analysis.get("strengths", []),
        faults=ats_eval["warnings"] or analysis.get("faults", []),
        suitable_roles=analysis.get("suitable_roles", ["Software Engineer"]),
        roadmap=analysis.get("roadmap", {})
    )
    
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)

    update_session_resume(db, session_id, {
        "ats_score": db_resume.ats_score,
        "extracted_skills": db_resume.extracted_skills,
        "improvements": db_resume.improvements
    }, resume_id=db_resume.id)

    return db_resume

@router.get("/analysis", response_model=schemas.ResumeOut)
def get_current_analysis(
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    session_id: str = Depends(get_session_id_from_request)
):
    """
    Fetches the latest active resume analysis for the authenticated user or session.
    """
    if current_user:
        resume = db.query(models.Resume).filter(
            models.Resume.user_id == current_user.id
        ).order_by(models.Resume.created_at.desc()).first()
    else:
        session_obj = get_or_create_session(db, session_id)
        if not session_obj.active_resume_id:
            raise HTTPException(status_code=404, detail="No resume uploaded in this session yet.")
        resume = db.query(models.Resume).filter(
            models.Resume.id == session_obj.active_resume_id
        ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume analysis details not found.")
    return resume

@router.get("", response_model=List[schemas.ResumeOut])
def list_resumes(
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    session_id: str = Depends(get_session_id_from_request)
):
    """
    Lists resumes strictly isolated to the authenticated user.
    """
    if current_user:
        return db.query(models.Resume).filter(models.Resume.user_id == current_user.id).all()
    return db.query(models.Resume).filter(models.Resume.session_id == session_id).all()

@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    session_id: str = Depends(get_session_id_from_request)
):
    """
    Deletes a resume, verifying resource ownership. Student A cannot delete Student B's resume.
    """
    resume = db.query(models.Resume).filter(models.Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Authorization verification
    if current_user:
        if resume.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete this resume."
            )
    elif resume.session_id != session_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this resume."
        )

    db.delete(resume)
    db.commit()
    return None
