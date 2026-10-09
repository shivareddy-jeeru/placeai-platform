"""
Pytest configuration and fixtures for the AI-Powered Placement Assistant
"""
import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.main import app
from backend.app.database import Base, get_db

# Use in-memory SQLite for testing
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(autouse=True)
def setup_database():
    """Create all tables before each test and drop them after"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture
def client():
    """Provides test client for FastAPI app"""
    yield TestClient(app)

@pytest.fixture
def db_session():
    """Provides database session for tests"""
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()

@pytest.fixture
def test_user(db_session):
    """Creates a test user"""
    from backend.app import models
    from backend.app.security import get_password_hash
    
    user = models.User(
        email="test@example.com",
        hashed_password=get_password_hash("testpassword123"),
        full_name="Test User",
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def auth_token(client, test_user, db_session):
    """Generates JWT token for test user"""
    response = client.post(
        "/api/auth/token",
        data={"username": "test@example.com", "password": "testpassword123"}
    )
    return response.json()["access_token"]

@pytest.fixture
def auth_headers(auth_token):
    """Returns authorization headers"""
    return {"Authorization": f"Bearer {auth_token}"}
