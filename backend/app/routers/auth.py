import logging
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app import models, schemas
from backend.app.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
    get_or_create_demo_student
)
from backend.app.validation import TextValidation

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = logging.getLogger(__name__)

@router.post("/register", response_model=schemas.AuthResponse, status_code=status.HTTP_201_CREATED)
def register(
    payload: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    """
    Registers a new student account, assigning a unique UUID and persistent profile.
    """
    email_clean = TextValidation.validate_email(payload.email)
    
    if len(payload.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    existing = db.query(models.User).filter(models.User.email == email_clean).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please log in instead."
        )

    new_user = models.User(
        email=email_clean,
        hashed_password=get_password_hash(payload.password),
        full_name=payload.full_name or email_clean.split("@")[0].title(),
        target_role=payload.target_role or "Software Engineer",
        target_companies=payload.target_companies or ["Amazon", "Google", "Microsoft", "TCS"],
        preparation_level=payload.preparation_level or "Intermediate",
        target_company_tier=payload.target_company_tier or "Tier 2",
        current_streak=1,
        longest_streak=1,
        last_active_date=datetime.utcnow(),
        dsa_problems_solved=0,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": new_user.id, "email": new_user.email})
    return schemas.AuthResponse(
        access_token=token,
        token_type="bearer",
        user=new_user
    )

@router.post("/login", response_model=schemas.AuthResponse)
def login(
    payload: schemas.UserLogin,
    db: Session = Depends(get_db)
):
    """
    Authenticates a student and returns a fresh JWT access token.
    """
    email_clean = payload.email.strip().lower()
    user = db.query(models.User).filter(models.User.email == email_clean).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Please contact support."
        )

    # Update streak & active timestamp
    now = datetime.utcnow()
    if user.last_active_date:
        delta = now.date() - user.last_active_date.date()
        if delta.days == 1:
            user.current_streak += 1
            if user.current_streak > user.longest_streak:
                user.longest_streak = user.current_streak
        elif delta.days > 1:
            user.current_streak = 1
    user.last_active_date = now
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": user.id, "email": user.email})
    return schemas.AuthResponse(
        access_token=token,
        token_type="bearer",
        user=user
    )

@router.post("/demo-login", response_model=schemas.AuthResponse)
def demo_login(
    db: Session = Depends(get_db)
):
    """
    Provides instant demo student login for frictionless evaluation and testing.
    """
    demo_user = get_or_create_demo_student(db)
    token = create_access_token(data={"sub": demo_user.id, "email": demo_user.email})
    return schemas.AuthResponse(
        access_token=token,
        token_type="bearer",
        user=demo_user
    )

@router.get("/me", response_model=schemas.UserOut)
def get_current_student_profile(
    current_user: models.User = Depends(get_current_user)
):
    """
    Returns the authenticated student's profile and progress metrics.
    """
    return current_user

@router.put("/profile", response_model=schemas.UserOut)
def update_student_profile(
    payload: schemas.UpdateUserProfileRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates the authenticated student's career preparation goals and preferences.
    """
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.target_role is not None:
        current_user.target_role = payload.target_role
    if payload.target_companies is not None:
        current_user.target_companies = payload.target_companies
    if payload.preparation_level is not None:
        current_user.preparation_level = payload.preparation_level
    if payload.target_company_tier is not None:
        current_user.target_company_tier = payload.target_company_tier

    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/activity", response_model=schemas.UserOut)
def log_student_activity(
    payload: schemas.ActivityLogRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Records student learning activity (e.g. solved DSA problems, completed task) in the database.
    """
    if payload.category == "DSA":
        count = payload.details.get("count", 1) if payload.details else 1
        current_user.dsa_problems_solved += count
        
    now = datetime.utcnow()
    current_user.last_active_date = now
    db.commit()
    db.refresh(current_user)
    return current_user
