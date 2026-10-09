"""
Request validation utilities for the API
"""
from fastapi import HTTPException, status
from pydantic import BaseModel, validator
from typing import List, Optional

class FileUploadValidator:
    """Validates file uploads"""
    
    # Maximum file size: 10 MB
    MAX_FILE_SIZE = 10 * 1024 * 1024
    
    # Allowed file types
    ALLOWED_TYPES = {
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    }
    
    @staticmethod
    def validate_file_size(file_size: int):
        """Validate file size"""
        if file_size > FileUploadValidator.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size exceeds maximum of 10 MB. Got {file_size / 1024 / 1024:.2f} MB"
            )
    
    @staticmethod
    def validate_file_type(content_type: str):
        """Validate file type"""
        if content_type not in FileUploadValidator.ALLOWED_TYPES:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"File type '{content_type}' not supported. Allowed: PDF, DOCX, DOC, TXT"
            )

class TextValidation:
    """Validates text input"""
    
    # Maximum text length: 50,000 characters
    MAX_TEXT_LENGTH = 50_000
    
    # Minimum length: 10 characters for most inputs
    MIN_TEXT_LENGTH = 10
    
    @staticmethod
    def validate_length(text: str, max_length: int = MAX_TEXT_LENGTH, min_length: int = 0):
        """Validate text length"""
        if len(text.strip()) > max_length:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"Text exceeds maximum length of {max_length} characters"
            )
        
        if min_length > 0 and len(text.strip()) < min_length:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Text must be at least {min_length} characters"
            )
    
    @staticmethod
    def validate_email(email: str) -> str:
        """Validate email format"""
        if not email or '@' not in email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )
        return email.lower()
    
    @staticmethod
    def validate_password(password: str):
        """Validate password strength"""
        if len(password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long"
            )
        
        if not any(c.isupper() for c in password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must contain at least one uppercase letter"
            )
        
        if not any(c.isdigit() for c in password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must contain at least one digit"
            )

class ContentValidation(BaseModel):
    """Validates message content"""
    content: str
    
    @validator('content')
    def validate_message_content(cls, v):
        """Validate message content"""
        if not v or not v.strip():
            raise ValueError("Message content cannot be empty")
        
        if len(v) > TextValidation.MAX_TEXT_LENGTH:
            raise ValueError(f"Message exceeds maximum length of {TextValidation.MAX_TEXT_LENGTH} characters")
        
        return v.strip()

class ChatMessageValidation(BaseModel):
    """Validates chat message structure"""
    session_id: str
    content: str
    
    @validator('session_id')
    def validate_session_id(cls, v):
        """Validate session ID"""
        if not v or not v.strip():
            raise ValueError("Session ID cannot be empty")
        return v.strip()
    
    @validator('content')
    def validate_content(cls, v):
        """Validate message content"""
        TextValidation.validate_length(v, min_length=1)
        return v.strip()
