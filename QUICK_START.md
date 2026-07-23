# Quick Start Guide - Production-Ready Setup

## 🚀 Get Started in 5 Minutes

### Option 1: Local Development

```bash
# 1. Setup Python environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r backend/requirements.txt
pip install -r backend/requirements-dev.txt
pip install -r frontend/requirements.txt

# 3. Create environment file
cp .env.example .env

# 4. Start Docker services (PostgreSQL, Redis)
docker-compose up -d postgres redis

# 5. Run tests
pytest backend/tests/ --cov=backend/app

# 6. Start backend
cd backend
uvicorn app.main:app --reload --port 8000

# 7. In another terminal, start frontend
cd frontend
streamlit run app.py

# 8. Access application
# Backend: http://localhost:8000
# Frontend: http://localhost:8501
# Docs: http://localhost:8000/docs
```

### Option 2: Docker Compose (Recommended)

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env with your values (especially GEMINI_API_KEY)

# 2. Start all services
docker-compose up -d --build

# 3. Check services are running
docker-compose ps

# 4. Verify health
curl http://localhost:8000/api/health

# 5. Access application
# Frontend: http://localhost:8501
# Backend API: http://localhost:8000/api
```

### Option 3: Production (Render)

```bash
# 1. Push to GitHub
git add .
git commit -m "Production-ready deployment"
git push origin main

# 2. On Render Dashboard:
# - Create Backend Web Service
# - Create Frontend Web Service
# - Add environment variables
# - Mount persistent disks

# 3. Done! Services auto-deploy on push
```

---

## 🔧 Configuration

### Environment Variables (`.env`)

```bash
# Required for production
ENVIRONMENT=production
SECRET_KEY=<generate with: openssl rand -hex 32>
GEMINI_API_KEY=<from Google AI Studio>

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/db
POSTGRES_USER=placement_user
POSTGRES_PASSWORD=<strong password>

# Caching
REDIS_URL=redis://localhost:6379/0
REDIS_PASSWORD=<password>
ENABLE_CACHE=true

# Security
CORS_ORIGINS=https://yourdomain.com,https://api.yourdomain.com

# Deployment
BACKEND_API_URL=https://api.yourdomain.com
```

---

## 🧪 Running Tests

```bash
# Run all tests
pytest

# Run with coverage report
pytest --cov=backend/app --cov-report=html

# Run specific test file
pytest backend/tests/test_auth.py -v

# Run and stop on first failure
pytest -x

# Run in watch mode (requires pytest-watch)
ptw
```

---

## 🔐 Security Checklist

Before deploying:
- [ ] Change all default passwords
- [ ] Set strong `SECRET_KEY` (not development key)
- [ ] Configure `CORS_ORIGINS` for your domain
- [ ] Enable HTTPS/TLS
- [ ] Setup rate limiting appropriately
- [ ] Configure database backups
- [ ] Enable security headers
- [ ] Disable debug mode (`DEBUG=false`)

---

## 📊 Monitoring

### Health Checks
```bash
# Backend health
curl http://localhost:8000/api/health

# Database
docker-compose exec postgres psql -U placement_user -c "SELECT 1"

# Redis
docker-compose exec redis redis-cli ping

# Frontend
curl http://localhost:8501
```

### Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last N lines
docker-compose logs --tail=100 backend
```

### Metrics
```bash
# Container resource usage
docker stats

# Database connections
docker-compose exec postgres psql -U placement_user -c "SELECT count(*) FROM pg_stat_activity"

# Redis memory
docker-compose exec redis redis-cli INFO memory
```

---

## 🔄 Deployment Workflow

### Development → Staging → Production

```bash
# 1. Develop and test locally
pytest  # Ensure all tests pass
docker-compose up  # Test with full stack

# 2. Push to GitHub
git push origin feature-branch
# PR review and merge to main

# 3. Staging deployment
# Services auto-deploy from main branch
# Run smoke tests

# 4. Production deployment
# Tag release: git tag -a v1.0.0 -m "Release 1.0.0"
# Services auto-deploy
# Monitor logs and metrics
```

---

## 🛠️ Common Tasks

### Database Migration
```bash
# Backup current database
docker-compose exec postgres pg_dump -U placement_user placement_db > backup.sql

# Create new database
docker-compose exec postgres psql -U placement_user -c "CREATE DATABASE new_db"

# Restore from backup
docker-compose exec postgres psql -U placement_user new_db < backup.sql
```

### Clear Cache
```bash
# Clear Redis cache
docker-compose exec redis redis-cli FLUSHDB

# Clear ChromaDB
rm -rf ./chroma_db/*
docker-compose restart backend
```

### Reset Everything
```bash
# Stop and remove all containers/volumes
docker-compose down -v

# Rebuild from scratch
docker-compose up -d --build

# Seed initial data
# (if applicable for your app)
```

### View Logs
```bash
# Real-time logs for all services
docker-compose logs -f

# Last 50 lines
docker-compose logs --tail=50

# Only errors
docker-compose logs | grep ERROR

# Export logs
docker-compose logs > logs.txt
```

---

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill process
kill -9 PID  # macOS/Linux
taskkill /PID PID /F  # Windows
```

### Docker Issues
```bash
# Restart Docker daemon
sudo service docker restart

# Clean up unused resources
docker system prune -a

# Rebuild images
docker-compose build --no-cache

# Full reset
docker-compose down -v && docker-compose up -d
```

### Database Connection Issues
```bash
# Test connection
docker-compose exec backend psql -h postgres -U placement_user -d placement_db -c "SELECT 1"

# Check database logs
docker-compose logs postgres

# Verify PostgreSQL is running
docker-compose ps postgres
```

### Memory Issues
```bash
# Check resource usage
docker stats

# Increase resource limits in docker-compose.yml
# Restart services
docker-compose up -d
```

---

## 📚 Documentation References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Streamlit Documentation](https://docs.streamlit.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [Docker Documentation](https://docs.docker.com/)
- [LangChain Documentation](https://python.langchain.com/)

---

## 💡 Pro Tips

1. **Use `.env.local` for local overrides**
   ```bash
   cp .env .env.local
   # Modify .env.local as needed (not committed)
   ```

2. **Enable debug logging**
   ```bash
   DEBUG=true docker-compose up
   ```

3. **Use pytest markers for selective testing**
   ```bash
   pytest -m unit  # Unit tests only
   pytest -m integration  # Integration tests only
   ```

4. **Setup pre-commit hooks**
   ```bash
   pip install pre-commit
   # Add to .pre-commit-config.yaml
   ```

5. **Monitor resource usage continuously**
   ```bash
   watch -n 1 docker stats
   ```

---

## 🎯 Next Steps

1. ✅ Complete local setup
2. ✅ Run all tests (`pytest`)
3. ✅ Review security configuration
4. ✅ Deploy to staging
5. ✅ Run load tests
6. ✅ Deploy to production

---

**For detailed information**, refer to:
- `PRODUCTION_CHECKLIST.md` - Comprehensive deployment guide
- `IMPLEMENTATION_SUMMARY.md` - All changes made
- `backend/TESTING.md` - Testing guide
- `.env.example` - Configuration template

