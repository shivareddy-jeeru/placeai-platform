from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from backend.app.config import settings
from backend.app.database import get_db
from backend.app import models

import bcrypt

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/token",
    auto_error=False
)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8')[:72], hashed_password.encode('utf-8'))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8')[:72], salt).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def get_current_user(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
) -> models.User:
    """
    Strict authentication dependency. Validates JWT Bearer token and returns authenticated student.
    Returns 401 Unauthorized if token is missing, invalid, or expired.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        raise credentials_exception
        
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.id == user_id, models.User.is_active == True).first()
    if user is None:
        raise credentials_exception
        
    return user

def get_current_user_optional(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
) -> Optional[models.User]:
    """
    Optional authentication dependency. Returns User if valid token is provided, None otherwise.
    """
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            return None
        return db.query(models.User).filter(models.User.id == user_id, models.User.is_active == True).first()
    except JWTError:
        return None

def get_or_create_demo_student(db: Session) -> models.User:
    """
    Provisions a demo student account for sandbox review and instant exploration.
    """
    demo_email = "demo.student@placeai.co"
    user = db.query(models.User).filter(models.User.email == demo_email).first()
    if not user:
        user = models.User(
            email=demo_email,
            full_name="Alex Chen (Demo Student)",
            hashed_password=get_password_hash("demo_password_123!"),
            target_role="Full Stack Software Engineer",
            target_companies=["Google", "Amazon", "Microsoft", "TCS"],
            preparation_level="Intermediate",
            target_company_tier="Tier 1",
            current_streak=3,
            longest_streak=5,
            dsa_problems_solved=15,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user
