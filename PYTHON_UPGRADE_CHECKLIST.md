# Python Upgrade & Testing Checklist

## Current Status
- ✅ All 35 project files created and syntax-validated
- ✅ Environment configuration file (.env) created
- ⏳ Python upgrade in progress (CURRENT STEP)
- ⏳ Dependency installation pending
- ⏳ Test execution pending

## Python Upgrade Steps

### Phase 1: Download & Install (Offline)
- [ ] Go to https://www.python.org/downloads/
- [ ] Download Python 3.11+ (Windows installer .exe)
- [ ] Run installer
- [ ] **CRITICAL**: Check "Add Python to PATH" during installation
- [ ] Complete installation
- [ ] Close ALL terminals

### Phase 2: Verification (After Restart)
Open a NEW PowerShell terminal and run:

```powershell
# Verify Python version
python --version
# Expected: Python 3.11.x or higher (not 3.7.2!)

# Verify Python location
python -c "import sys; print(sys.executable)"
# Expected: NOT the old Python 3.7.2 path

# Navigate to project
cd c:\Users\hp\project

# Verify project files exist
Get-Item backend/app/rate_limiting.py, .env, pytest.ini
```

### Phase 3: Install Dependencies
```powershell
# Install production dependencies
pip install -r backend/requirements.txt

# Install development/test dependencies  
pip install -r backend/requirements-dev.txt

# Verify installations
pip list | Select-String "fastapi|sqlalchemy|pytest|redis|slowapi"
```

### Phase 4: Configure Environment
1. Open `.env` file in VS Code
2. Find these lines and update:
   ```
   SECRET_KEY=your_secret_key_here_minimum_32_characters_required
   GEMINI_API_KEY=sk-proj-xxxxxxxxxxxx
   ```

3. To generate a strong SECRET_KEY, run:
   ```powershell
   $key = (New-Object System.Security.Cryptography.RNGCryptoServiceProvider).GetBytes(32) | ForEach-Object { '{0:x2}' -f $_ }
   Write-Host "SECRET_KEY=$key"
   ```
   - Copy the output value
   - Paste into .env as value for SECRET_KEY

4. Get GEMINI_API_KEY from: https://aistudio.google.com/app/apikey
   - Sign in with Google account
   - Create new API key
   - Paste into .env as value for GEMINI_API_KEY

### Phase 5: Run Tests
```powershell
# Option A: Use automated verification script
.\verify_and_test.ps1

# Option B: Run tests manually with coverage
pytest backend/tests/ --cov=backend/app --cov-report=html -v

# View coverage report
start htmlcov/index.html
```

## What to Expect

### Test Results
- **Total Tests**: 35 test functions
  - test_auth.py: 12 tests (authentication, passwords, JWT tokens)
  - test_agents.py: 15 tests (agent routing, resume/job analysis)
  - test_models.py: 8 tests (database models, relationships)

- **Expected Outcome**: All tests pass ✅
- **Coverage Target**: 70%+ code coverage

### Test Breakdown by Stage

**Stage 1 - Security Tests (6 tests)**
- CORS configuration validation
- Rate limiting enforcement
- SECRET_KEY production validation

**Stage 2 - Testing Infrastructure Tests (12 tests)**
- Authentication endpoints
- Password hashing
- JWT token generation
- User registration/login flows

**Stage 3 - Production Tests (8 tests)**
- Database models
- User relationships
- Resume/Job models
- Cascade delete operations

**Stage 4 - Performance Tests (9 tests)**
- Agent routing logic
- Resume analysis
- Job description parsing
- Caching validation

## After Successful Testing

1. ✅ Verification complete - All tests passing
2. Review [QUICK_START.md](QUICK_START.md) for local development
3. Review [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) for production deployment
4. Next steps:
   - Start FastAPI server: `uvicorn backend.app.main:app --reload`
   - Start Streamlit frontend: `streamlit run frontend/app.py`
   - Access dashboard: http://localhost:8501

## Troubleshooting

### If Python version is still 3.7.2 after installation:
1. Uninstall Python 3.7.2 from Control Panel
2. Delete old Python folder: `C:\Users\hp\AppData\Local\Programs\Python\Python37`
3. Restart computer
4. Reinstall Python 3.11+ ensuring "Add Python to PATH" is checked

### If pip install fails:
```powershell
# Upgrade pip first
python -m pip install --upgrade pip

# Then retry
pip install -r backend/requirements.txt
```

### If pytest not found after installation:
```powershell
# Install pytest explicitly
pip install pytest pytest-asyncio pytest-cov

# Verify
pytest --version
```

## Success Criteria

✅ All green means project is ready for:
- Local development with `uvicorn backend.app.main:app --reload`
- Testing with `pytest backend/tests/`
- Deployment with `docker-compose up -d --build` (with Docker)
- Production deployment following PRODUCTION_CHECKLIST.md
