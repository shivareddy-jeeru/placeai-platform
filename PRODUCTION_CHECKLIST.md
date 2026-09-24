# Production Deployment Checklist

This document provides a comprehensive checklist for deploying the AI-Powered Placement Assistant to production.

## Pre-Deployment Checklist

### Security
- [ ] Generate a strong SECRET_KEY: `openssl rand -hex 32`
- [ ] Set CORS_ORIGINS to specific domains (not "*")
- [ ] Generate strong PostgreSQL credentials
- [ ] Set ENVIRONMENT=production in .env
- [ ] Ensure all API keys are in .env (not in code)
- [ ] Enable HTTPS/TLS (use nginx reverse proxy or AWS ALB)
- [ ] Setup Web Application Firewall (WAF) if using AWS/GCP
- [ ] Configure rate limiting appropriately for your traffic
- [ ] Review CORS, authentication, and authorization policies

### Database
- [ ] Create PostgreSQL database and user
- [ ] Set strong PostgreSQL password
- [ ] Configure PostgreSQL backups
- [ ] Enable PostgreSQL SSL connections
- [ ] Setup database connection pooling
- [ ] Configure automatic table creation on startup
- [ ] Test database connectivity from app container
- [ ] Setup monitoring for database performance

### Environment Configuration
- [ ] Create .env file with all required variables
- [ ] Ensure .env is in .gitignore (never commit secrets)
- [ ] Validate all environment variables are set
- [ ] Setup environment variables in deployment platform
- [ ] Test app with production environment variables locally

### Container & Infrastructure
- [ ] Review Docker images (no hardcoded secrets)
- [ ] Test Docker Compose setup in staging environment
- [ ] Configure resource limits (CPU, memory)
- [ ] Setup container health checks
- [ ] Configure logging (stdout/stderr for container orchestration)
- [ ] Setup automatic container restart policies
- [ ] Create persistent volumes for ChromaDB and PostgreSQL

### Monitoring & Logging
- [ ] Setup centralized logging (CloudWatch, ELK, etc.)
- [ ] Configure application performance monitoring
- [ ] Setup error tracking (Sentry, etc.)
- [ ] Create dashboards for key metrics
- [ ] Setup alerts for critical errors
- [ ] Enable structured logging in JSON format
- [ ] Test log aggregation pipeline

### Testing
- [ ] Run all tests locally: `pytest`
- [ ] Achieve >70% code coverage
- [ ] Test authentication and authorization
- [ ] Test rate limiting
- [ ] Load test the API (use k6, JMeter, or Locust)
- [ ] Test failover scenarios
- [ ] Test database backup and recovery

## Deployment Steps

### Using Docker Compose (Self-Hosted)

1. **Prepare Server**
   ```bash
   # Install Docker and Docker Compose
   sudo apt-get update
   sudo apt-get install docker.io docker-compose
   ```

2. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd placement-assistant
   ```

3. **Configure Environment**
   ```bash
   # Copy example and edit with production values
   cp .env.example .env
   
   # Edit .env with production settings
   nano .env
   ```

4. **Generate Secrets**
   ```bash
   # Generate SECRET_KEY
   openssl rand -hex 32 >> .env
   
   # Generate PostgreSQL password
   openssl rand -base64 32 >> .env
   ```

5. **Start Services**
   ```bash
   docker-compose up -d --build
   ```

6. **Verify Deployment**
   ```bash
   # Check container health
   docker-compose ps
   
   # Check logs
   docker-compose logs -f backend
   
   # Test API
   curl http://localhost:8000/health
   ```

### Using Render (Recommended for Quick Setup)

1. **Push to GitHub**
   - Ensure .env files are in .gitignore
   - Push code to GitHub

2. **Create Backend Service on Render**
   - Click "New Web Service"
   - Connect GitHub repository
   - Set Root Directory: `backend`
   - Set Build Command: `pip install -r requirements.txt`
   - Set Start Command: `gunicorn app.main:app --worker-class uvicorn.workers.UvicornWorker`
   - Add Environment Variables:
     - GEMINI_API_KEY
     - SECRET_KEY
     - DATABASE_URL (Render PostgreSQL)
     - ENVIRONMENT=production
   - Mount Persistent Disk at `/app/chroma_db`

3. **Create Frontend Service on Render**
   - New Web Service from same repo
   - Set Root Directory: `frontend`
   - Set Build Command: `pip install -r requirements.txt`
   - Set Start Command: `streamlit run app.py --server.port 10000`
   - Add Environment Variable:
     - BACKEND_API_URL (from Backend service)

### Using AWS ECS

1. **Build and Push Docker Images**
   ```bash
   # Build images
   docker build -t placement-backend ./backend
   docker build -t placement-frontend ./frontend
   
   # Push to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
   
   docker tag placement-backend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/placement-backend:latest
   docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/placement-backend:latest
   ```

2. **Create RDS PostgreSQL Database**
   - Create PostgreSQL instance
   - Configure security groups
   - Create database and user
   - Get connection string

3. **Create ECS Cluster and Services**
   - Create Fargate cluster
   - Create task definitions for backend and frontend
   - Set environment variables from Secrets Manager
   - Configure Application Load Balancer

## Post-Deployment Verification

- [ ] Access application via browser
- [ ] Test login/registration
- [ ] Test file upload (resume)
- [ ] Test API endpoints with curl
- [ ] Monitor logs for errors
- [ ] Check resource usage
- [ ] Verify backups are working
- [ ] Test health check endpoint
- [ ] Verify SSL certificate (if using HTTPS)
- [ ] Load test to establish baseline performance

## Production Operations

### Daily Tasks
- [ ] Monitor application logs
- [ ] Check error rates
- [ ] Verify backups completed

### Weekly Tasks
- [ ] Review error logs and metrics
- [ ] Check disk usage
- [ ] Verify rate limiting is working

### Monthly Tasks
- [ ] Review and update dependencies
- [ ] Analyze performance metrics
- [ ] Plan for capacity growth
- [ ] Review security configurations

### Backup & Recovery
```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U placement_user placement_db > backup.sql

# Restore from backup
docker-compose exec postgres psql -U placement_user placement_db < backup.sql

# Backup ChromaDB
tar -czf chroma_backup.tar.gz chroma_db/
```

### Scaling Considerations
- [ ] Setup database read replicas for load distribution
- [ ] Use Redis for caching to reduce API calls
- [ ] Implement CDN for static assets
- [ ] Consider multi-region deployment for global coverage
- [ ] Setup auto-scaling policies if using cloud platforms

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Check container status
docker-compose ps

# Restart container
docker-compose restart backend
```

### Database Connection Issues
```bash
# Test database connectivity
docker-compose exec backend psql -h postgres -U placement_user -d placement_db -c "SELECT 1"

# Check database logs
docker-compose logs postgres
```

### API Not Responding
```bash
# Check API health
curl http://localhost:8000/health

# Restart all services
docker-compose restart

# Rebuild images
docker-compose up -d --build
```

## Security Hardening

After deployment:
1. Configure nginx reverse proxy with rate limiting
2. Setup SSL/TLS certificates (Let's Encrypt via Certbot)
3. Enable HSTS header
4. Configure security headers
5. Setup DDoS protection
6. Enable database encryption at rest
7. Configure VPC and security groups
8. Implement automated security scanning
