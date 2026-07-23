from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.app.database import get_db
from backend.app import models, schemas
from backend.app.agents.research_agent import ResearchAgent
from backend.app.session import get_session_id_from_request

router = APIRouter(prefix="/research", tags=["research"])
research_agent = ResearchAgent()

@router.post("/company", response_model=schemas.CompanyResearchOut, status_code=status.HTTP_201_CREATED)
def research_company(
    payload: schemas.CompanyResearchRequest,
    db: Session = Depends(get_db),
    session_id: str = Depends(get_session_id_from_request)
):
    # Check if company research already exists in DB to save tokens
    existing = db.query(models.CompanyResearch).filter(
        models.CompanyResearch.company_name == payload.company_name
    ).first()
    if existing:
        return existing

    res = research_agent.run({"company_name": payload.company_name})
    if "error" in res:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Research agent failed: {res['error']}"
        )

    db_research = models.CompanyResearch(
        company_name=payload.company_name,
        summary=res
    )
    
    db.add(db_research)
    db.commit()
    db.refresh(db_research)
    return db_research

@router.get("", response_model=List[schemas.CompanyResearchOut])
def list_researches(
    db: Session = Depends(get_db),
    session_id: str = Depends(get_session_id_from_request)
):
    researches = db.query(models.CompanyResearch).all()
    return researches

@router.get("/{company_name}", response_model=schemas.CompanyResearchOut)
def get_company_research(
    company_name: str,
    db: Session = Depends(get_db),
    session_id: str = Depends(get_session_id_from_request)
):
    research = db.query(models.CompanyResearch).filter(
        models.CompanyResearch.company_name == company_name
    ).first()
    if not research:
        raise HTTPException(status_code=404, detail="Company research data not found")
    return research

