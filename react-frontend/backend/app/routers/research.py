from fastapi import APIRouter, HTTPException, status, Request
from typing import List

from backend.app import schemas
from backend.app.agents.research_agent import ResearchAgent
from backend.app.rate_limiting import limiter, get_rate_limit

router = APIRouter(prefix="/research", tags=["research"])
research_agent = ResearchAgent()

@router.post("/company", response_model=schemas.CompanyResearchOut, status_code=status.HTTP_201_CREATED)
@limiter.limit(get_rate_limit("workflow"))
def research_company(
    request: Request,
    payload: schemas.CompanyResearchRequest
):
    res = research_agent.run({"company_name": payload.company_name})
    if "error" in res:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Research agent failed: {res['error']}"
        )

    # Return a stateless response
    return {
        "id": "stateless_id",
        "company_name": payload.company_name,
        "summary": res,
        "created_at": "2024-01-01T00:00:00Z"
    }

