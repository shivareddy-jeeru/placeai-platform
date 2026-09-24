# Post-Installation Verification Script
# Run this after upgrading to Python 3.11+

Write-Host "╔════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           PROJECT VERIFICATION & TEST EXECUTION SCRIPT                    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Step 1: Verify Python version
Write-Host "STEP 1: Verifying Python version..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($pythonVersion -match "3\.(8|9|10|11|12)") {
    Write-Host "✓ $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "✗ ERROR: $pythonVersion - Please upgrade to Python 3.8+" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 2: Install dependencies
Write-Host "STEP 2: Installing production dependencies..." -ForegroundColor Yellow
pip install -q -r backend/requirements.txt 2>&1 | Select-Object -Last 3
Write-Host "✓ Production dependencies installed" -ForegroundColor Green
Write-Host ""

Write-Host "STEP 3: Installing development/test dependencies..." -ForegroundColor Yellow
pip install -q -r backend/requirements-dev.txt 2>&1 | Select-Object -Last 1
Write-Host "✓ Development dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 3: List available tests
Write-Host "STEP 4: Available test files:" -ForegroundColor Yellow
Get-ChildItem backend/tests/test_*.py | ForEach-Object {
    $testCount = (Select-String -Path $_.FullName -Pattern "def test_" | Measure-Object | Select-Object -ExpandProperty Count)
    Write-Host "  • $($_.Name): $testCount test functions" -ForegroundColor Cyan
}
Write-Host ""

# Step 4: Run tests
Write-Host "STEP 5: Running comprehensive test suite..." -ForegroundColor Yellow
Write-Host "  Command: pytest backend/tests/ --cov=backend/app -v" -ForegroundColor Magenta
Write-Host ""
pytest backend/tests/ --cov=backend/app -v --tb=short
$testResult = $LASTEXITCODE

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
if ($testResult -eq 0) {
    Write-Host "║  ✅ ALL TESTS PASSED - Project is ready for deployment                   ║" -ForegroundColor Green
} else {
    Write-Host "║  ⚠️  SOME TESTS FAILED - Review output above for details                  ║" -ForegroundColor Yellow
}
Write-Host "╚════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Display coverage report location
Write-Host "Coverage report generated at: htmlcov/index.html" -ForegroundColor Cyan
Write-Host "View in browser: start htmlcov/index.html" -ForegroundColor Cyan
Write-Host ""

# Next steps
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Update .env with your GEMINI_API_KEY from: https://aistudio.google.com/app/apikey" -ForegroundColor White
Write-Host "2. Review QUICK_START.md for local development setup" -ForegroundColor White
Write-Host "3. Review PRODUCTION_CHECKLIST.md for production deployment" -ForegroundColor White
Write-Host ""
