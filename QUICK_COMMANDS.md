# Quick Command Reference - After Python Installation

## Copy-Paste Commands (After Python 3.11+ is Installed)

### Verify Installation
```powershell
python --version
cd c:\Users\hp\project
```

### Install All Dependencies
```powershell
pip install -r backend/requirements.txt
pip install -r backend/requirements-dev.txt
```

### Generate SECRET_KEY for .env
```powershell
$key = (New-Object System.Security.Cryptography.RNGCryptoServiceProvider).GetBytes(32) | ForEach-Object { '{0:x2}' -f $_ }
Write-Host "SECRET_KEY=$key"
# Copy the output and paste into .env
```

### Run All Tests with Coverage
```powershell
pytest backend/tests/ --cov=backend/app --cov-report=html -v
```

### Run Specific Test Files
```powershell
# Authentication tests only
pytest backend/tests/test_auth.py -v

# Agent tests only  
pytest backend/tests/test_agents.py -v

# Model tests only
pytest backend/tests/test_models.py -v
```

### Run Specific Test
```powershell
# Example: Run only password hashing tests
pytest backend/tests/test_auth.py::TestPasswordHashing -v
```

### View Coverage Report
```powershell
start htmlcov/index.html
```

### Syntax Check (Python 3.7.2 compatible)
```powershell
python -m py_compile backend/app/*.py backend/conftest.py backend/tests/*.py
```

### Run Automated Verification Script
```powershell
.\verify_and_test.ps1
```

## Development Server (After Testing Passes)

### Start Backend API
```powershell
cd c:\Users\hp\project
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

### Start Frontend (New Terminal)
```powershell
cd c:\Users\hp\project
streamlit run frontend/app.py
```

### Access Applications
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Frontend: http://localhost:8501

## Environment Configuration

### Edit .env file
```powershell
code .env
```

Required values to update:
1. `SECRET_KEY` - Generated using command above
2. `GEMINI_API_KEY` - From https://aistudio.google.com/app/apikey

## Verification Checklist

Run these to verify everything works:

```powershell
# 1. Python version (should be 3.8+)
python --version

# 2. FastAPI installed
python -c "import fastapi; print(fastapi.__version__)"

# 3. All tests pass
pytest backend/tests/ -q

# 4. Database models work
python -c "from backend.app.models import User, Resume, Job; print('✓ Models OK')"

# 5. Configuration loads
python -c "from backend.app.config import Settings; print('✓ Config OK')"
```

## If Things Go Wrong

### Clear pip cache and reinstall
```powershell
pip cache purge
pip install --force-reinstall -r backend/requirements.txt
```

### Remove __pycache__ and try again
```powershell
Get-ChildItem -Path backend -Filter __pycache__ -Recurse | Remove-Item -Recurse -Force
pytest backend/tests/ -v
```

### Reset everything
```powershell
# Remove virtual environment (if created)
if (Test-Path "venv") { Remove-Item venv -Recurse -Force }

# Remove old Python cache
Get-ChildItem -Filter "*.pyc" -Recurse | Remove-Item

# Reinstall everything
pip install --upgrade pip
pip install -r backend/requirements.txt
pip install -r backend/requirements-dev.txt
```

## Success Indicators

You'll know everything is working when:

✅ `python --version` shows 3.8 or higher  
✅ `pip list` shows fastapi, sqlalchemy, pytest, redis, slowapi  
✅ `pytest backend/tests/ -q` shows "35 passed" (or similar)  
✅ Coverage report shows 70%+ code coverage  
✅ `uvicorn backend.app.main:app --reload` starts without errors  
✅ `streamlit run frontend/app.py` opens in browser  

## Next Steps After Success

1. **Review Architecture**: Read [QUICK_START.md](QUICK_START.md)
2. **Local Development**: Start both servers and test the UI
3. **Production Deploy**: Follow [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md)
4. **Cloud Deployment**: Reference [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
