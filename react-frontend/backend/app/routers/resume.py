import io
import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Request
from typing import List

from pypdf import PdfReader
from docx import Document as DocxDocument

from backend.app import schemas
from backend.app.agents.resume_agent import ResumeAgent
from backend.app.rate_limiting import limiter, get_rate_limit
from backend.app.services.ats_scorer import ats_scorer

router = APIRouter(prefix="/resume", tags=["resume"])
resume_agent = ResumeAgent()
logger = logging.getLogger(__name__)

# Allowed MIME types and extensions
ALLOWED_EXTENSIONS = {".pdf", ".docx"}
ALLOWED_MIMES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


def validate_and_extract_text(file: UploadFile) -> str:
    """
    Validates extension, MIME type, file size, and actual content structure.
    Raises HTTP 400 / 415 / 413 with user-safe messages on failure.
    Returns extracted plain text.
    """
    filename = file.filename or ""
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    content_type = file.content_type or ""

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{ext}'. Please upload a PDF or DOCX file.",
        )

    # Read bytes once
    file.file.seek(0)
    raw_bytes = file.file.read()

    if len(raw_bytes) == 0:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")
    if len(raw_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail="File exceeds the 5 MB size limit. Please compress or trim your resume.",
        )

    try:
        if ext == ".pdf":
            reader = PdfReader(io.BytesIO(raw_bytes))
            text = ""
            for page in reader.pages:
                text += page.extract_text() or ""
            if not text.strip():
                raise HTTPException(
                    status_code=422,
                    detail="Could not extract text from this PDF. It may be scanned, image-based, or password-protected.",
                )
            return text
        else:
            doc = DocxDocument(io.BytesIO(raw_bytes))
            text = "\n".join([p.text for p in doc.paragraphs])
            if not text.strip():
                raise HTTPException(
                    status_code=422,
                    detail="Could not extract text from this DOCX file.",
                )
            return text
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error parsing uploaded file '{filename}': {e}")
        raise HTTPException(
            status_code=422,
            detail="Could not parse the resume file. Please ensure it is a valid, uncorrupted PDF or DOCX.",
        )


@router.post("/ats-score", response_model=schemas.ATSScoringResponse)
@limiter.limit(get_rate_limit("upload"))
def score_resume_ats(
    request: Request,
    file: UploadFile = File(...),
    job_description: str = None,
):
    """
    Deterministic ATS scoring endpoint.
    Validates, extracts, and scores the resume using the deterministic engine.
    Scores are never set by the client.
    """
    text = validate_and_extract_text(file)
    ats_eval = ats_scorer.calculate_resume_ats_score(text)
    jd_eval = ats_scorer.calculate_job_match_score(text, job_description or "")

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
        recommendations=jd_eval["recommendations"],
    )



