# Testing Guide

## Setup

Install testing dependencies:
```bash
pip install -r backend/requirements-dev.txt
```

## Running Tests

### Run all tests
```bash
pytest
```

### Run specific test file
```bash
pytest backend/tests/test_auth.py
```

### Run specific test
```bash
pytest backend/tests/test_auth.py::TestPasswordHashing::test_password_hashing
```

### Run with coverage report
```bash
pytest --cov=backend/app --cov-report=html
```

Open `htmlcov/index.html` in browser to view coverage report.

### Run only unit tests
```bash
pytest -m unit
```

### Run only integration tests
```bash
pytest -m integration
```

### Run with verbose output
```bash
pytest -v
```

### Run and stop on first failure
```bash
pytest -x
```

## Test Structure

```
backend/tests/
├── __init__.py
├── test_auth.py              # Authentication tests
├── test_agents.py            # Multi-agent system tests
├── test_models.py            # Database model tests
└── test_api.py               # API endpoint tests (to be added)
```

## Available Fixtures

- `client`: FastAPI TestClient
- `db_session`: SQLAlchemy session
- `test_user`: Pre-created test user
- `auth_token`: JWT token for test user
- `auth_headers`: Authorization headers

## Test Categories

### Unit Tests
- Password hashing/verification
- Token generation
- Model creation
- Agent logic

### Integration Tests
- Full API flows (register → upload → analyze)
- Database transactions
- Agent chains

## Coverage Goals
- Target: 70%+ code coverage
- Priority: Authentication, agents, API routes
- Optional: UI helpers, utilities

## Continuous Integration

Tests can be run in CI/CD pipelines:
```bash
pytest --cov=backend/app --cov-report=xml  # For CI tools
```

## Debugging Tests

Run with print statements:
```bash
pytest -s
```

Run with debugging info:
```bash
pytest -v --tb=long
```

Use pytest-pdb for interactive debugging:
```bash
pytest --pdb
```
