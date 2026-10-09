from fastapi import APIRouter, HTTPException, status, Request
from backend.app.schemas import (
    CodeAnalysisRequest, CodeAnalysisResponse,
    DocstringRefactorRequest, DocstringRefactorResponse,
    PytestGenerateRequest, PytestGenerateResponse,
    PytestRunRequest, PytestRunResponse
)
from backend.app.services.code_analyzer import code_analyzer_service
from backend.app.agents.code_agent import code_agent
from backend.app.rate_limiting import limiter, get_rate_limit

router = APIRouter(prefix="/code", tags=["Code Reviewer"])

@router.post("/analyze", response_model=CodeAnalysisResponse)
@limiter.limit(get_rate_limit("workflow"))
def analyze_code(request: Request, payload: CodeAnalysisRequest):
    """
    Analyzes Python code AST, calculates docstring coverage,
    and runs PEP 257 + parameter mismatch validation.
    """
    if not payload.code.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Source code cannot be empty."
        )
    result = code_analyzer_service.analyze_code(payload.code, payload.filename or "main.py")
    return result

@router.post("/refactor-docstrings", response_model=DocstringRefactorResponse)
@limiter.limit(get_rate_limit("workflow"))
def refactor_docstrings(request: Request, payload: DocstringRefactorRequest):
    """
    Refactors or adds docstrings using specified convention (google, numpy, rest).
    Enforces Layer 3 AST compile check safety net.
    """
    if not payload.code.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Source code cannot be empty."
        )
    result = code_agent.refactor_docstrings(payload.code, payload.style or "google")
    return result

@router.post("/generate-tests", response_model=PytestGenerateResponse)
@limiter.limit(get_rate_limit("workflow"))
def generate_tests(request: Request, payload: PytestGenerateRequest):
    """
    Synthesizes a comprehensive pytest unit test suite for candidate code.
    """
    if not payload.code.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Source code cannot be empty."
        )
    result = code_agent.generate_pytest(payload.code)
    return result

@router.post("/run-tests", response_model=PytestRunResponse)
@limiter.limit(get_rate_limit("workflow"))
def run_tests(request: Request, payload: PytestRunRequest):
    """
    Executes Pytest unit tests in an isolated sandbox context and returns metrics and execution logs.
    """
    if not payload.code.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Source code cannot be empty."
        )
    result = code_agent.run_pytest_sandbox(payload.code, payload.test_code)
    return result

