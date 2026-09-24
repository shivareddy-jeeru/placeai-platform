# Running the Project: Step-by-Step Commands

Follow these commands to run and test the application on your local machine.

---

## 💻 Option 1: Standard Local Development (PowerShell / Windows)

### 1. Setup Virtual Environment & Install Dependencies
Run these commands from the project root directory (`C:\Users\hp\project`):

```powershell
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
venv\Scripts\activate

# Install Backend dependencies
pip install -r backend/requirements.txt
pip install -r backend/requirements-dev.txt

# Install Frontend dependencies
pip install -r frontend/requirements.txt
```

### 2. Configure Environment variables
Copy the environment variables template and configure your keys:
```powershell
# Copy the example env file
cp .env.example .env

# (Optional) Generate a random secure SECRET_KEY to paste into .env
$key = (New-Object System.Security.Cryptography.RNGCryptoServiceProvider).GetBytes(32) | ForEach-Object { '{0:x2}' -f $_ }
Write-Host "SECRET_KEY=$key"
```
*Note: Make sure to add your `GEMINI_API_KEY` inside the newly created `.env` file.*

### 3. Run the Backend API Server
In your first activated terminal, run:
```powershell
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```
* **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **Backend Endpoint**: [http://localhost:8000](http://localhost:8000)

### 4. Run the Streamlit Frontend Server
Open a **second PowerShell terminal**, navigate to the project root, and run:
```powershell
# Activate environment in the new window/tab
venv\Scripts\activate

# Launch Streamlit app
streamlit run frontend/app.py
```
* **Frontend Application**: [http://localhost:8501](http://localhost:8501)

---

## 🐳 Option 2: Docker Compose (Quick Containerized Setup)

If you have Docker installed, you can start the entire stack (PostgreSQL, Redis, Backend, Frontend) with:

```powershell
# Build and run all containers in background mode
docker-compose up -d --build

# View real-time container logs
docker-compose logs -f
```

---

## 🧪 Testing and Verification

To verify that your installation works and all tests pass:

```powershell
# Run all unit/integration tests with coverage report
pytest backend/tests/ --cov=backend/app --cov-report=html -v
```
