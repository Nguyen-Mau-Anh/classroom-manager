# Deployment Documentation

## GitHub Secrets Configuration

The following secrets must be configured in GitHub repository settings for staging deployment:

### Required Secrets

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `STAGING_HOST` | IP address or hostname of staging server | `staging.classroom.example.com` or `192.168.1.100` |
| `STAGING_USER` | SSH username for deployment | `deploy` or `ubuntu` |
| `STAGING_SSH_KEY` | Private SSH key for authentication | Full content of private key file |
| `STAGING_URL` | Base URL of staging application | `https://staging.classroom.example.com` |

### How to Configure Secrets

1. Navigate to your GitHub repository
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the name and value from the table above

## Staging Server Setup

### Prerequisites

- Ubuntu 20.04+ or similar Linux distribution
- Docker and Docker Compose installed
- SSH access configured
- Ports 80/443 open for web traffic
- Port 22 open for SSH (or custom SSH port)

### Step-by-Step Setup

#### 1. Install Docker and Docker Compose

```bash
# Update package index
sudo apt-get update

# Install Docker
sudo apt-get install -y docker.io

# Install Docker Compose
sudo apt-get install -y docker-compose

# Add deploy user to docker group (optional but recommended)
sudo usermod -aG docker deploy

# Verify installation
docker --version
docker-compose --version
```

#### 2. Create Deployment Directory

```bash
# Create application directory
sudo mkdir -p /opt/classroom-manager
sudo chown deploy:deploy /opt/classroom-manager

# Navigate to directory
cd /opt/classroom-manager
```

#### 3. Create docker-compose.yml

Create `/opt/classroom-manager/docker-compose.yml` with the following content:

```yaml
services:
  frontend:
    image: ghcr.io/nguyen-mau-anh/classroom-manager-frontend:staging-latest
    ports:
      - "3000:80"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=${STAGING_API_URL}
    restart: unless-stopped

  backend:
    image: ghcr.io/nguyen-mau-anh/classroom-manager-backend:staging-latest
    ports:
      - "4000:4000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      - NODE_ENV=staging
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
      - PORT=4000
      - CORS_ORIGIN=${STAGING_FRONTEND_URL}
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

#### 4. Create Environment File

Create `/opt/classroom-manager/.env`:

```bash
# Database Configuration
DB_USER=classroom
DB_PASSWORD=your-secure-password-here
DB_NAME=classroom
DATABASE_URL=postgresql://classroom:your-secure-password-here@postgres:5432/classroom

# Redis Configuration
REDIS_URL=redis://redis:6379

# Application Configuration
JWT_SECRET=your-secure-jwt-secret-here
NODE_ENV=staging
PORT=4000

# CORS Configuration
STAGING_FRONTEND_URL=https://staging.classroom.example.com
STAGING_API_URL=https://staging.classroom.example.com/api

# GitHub Container Registry (update with your repository)
GITHUB_REPO=nguyen-mau-anh/classroom-manager
```

**⚠️ Security Note:** Use strong, randomly generated passwords and secrets. Never commit this file to version control.

#### 5. Configure SSH Key for Deployment

Generate a deployment-specific SSH key (on your local machine):

```bash
# Generate Ed25519 key (more secure than RSA)
ssh-keygen -t ed25519 -f ~/.ssh/classroom_deploy -C "classroom-deploy"

# Copy public key to clipboard (macOS)
cat ~/.ssh/classroom_deploy.pub | pbcopy

# Or display it to copy manually
cat ~/.ssh/classroom_deploy.pub
```

Add the public key to the staging server:

```bash
# On staging server, as deploy user
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
# Paste the public key, save and exit

chmod 600 ~/.ssh/authorized_keys
```

Add the private key to GitHub Secrets as `STAGING_SSH_KEY`:

```bash
# On your local machine, copy private key
cat ~/.ssh/classroom_deploy
# Copy the entire output including BEGIN and END lines
# Paste into GitHub Secret: STAGING_SSH_KEY
```

#### 6. Login to GitHub Container Registry

On the staging server, login to ghcr.io to pull private images:

```bash
# Create a GitHub Personal Access Token with read:packages permission
# Then login:
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

**Note:** This step is required if your container images are private.

#### 7. Test Manual Deployment

```bash
cd /opt/classroom-manager

# Pull latest images
docker compose pull

# Start services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f

# Test health endpoint
curl http://localhost:4000/api/health
```

Expected health response:

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-01-21T10:00:00Z"
  }
}
```

#### 8. Database Migrations (First Time)

On first deployment, run database migrations:

```bash
# Enter backend container
docker compose exec backend sh

# Run migrations
npx prisma migrate deploy

# Exit container
exit
```

## Deployment Workflow

### Automatic Deployment

1. Merge pull request to `main` branch
2. CI workflow runs automatically (lint, typecheck, test, build)
3. On CI success, Deploy Staging workflow triggers
4. Workflow builds and pushes Docker images to ghcr.io
5. Workflow SSHs to staging server and deploys new images
6. Health check validates deployment success

### Manual Deployment

Trigger deployment manually via GitHub Actions:

1. Go to **Actions** tab in GitHub
2. Select **Deploy Staging** workflow
3. Click **Run workflow**
4. Select `main` branch
5. Click **Run workflow** button

## Monitoring and Debugging

### View Deployment Logs

**GitHub Actions:**
- Navigate to **Actions** tab
- Click on the deployment workflow run
- View logs for each step

**Staging Server:**

```bash
# View all services
docker compose logs -f

# View specific service
docker compose logs -f backend
docker compose logs -f frontend

# Check running containers
docker compose ps

# Check container health
docker inspect classroom-manager-backend-1 | grep Health
```

### Common Issues

#### Health Check Timeout

**Problem:** Health check fails after 30 seconds

**Solutions:**
- Increase sleep time in workflow
- Check container startup logs: `docker compose logs backend`
- Verify database migrations are complete
- Check environment variables are set correctly

#### Image Pull Fails

**Problem:** Cannot pull images from ghcr.io

**Solutions:**
- Verify ghcr.io login on staging server
- Check GitHub token has `read:packages` permission
- Verify image names match repository structure

#### SSH Connection Fails

**Problem:** Deployment workflow cannot SSH to server

**Solutions:**
- Verify `STAGING_HOST`, `STAGING_USER`, `STAGING_SSH_KEY` secrets
- Check SSH key has correct permissions
- Verify firewall allows SSH connections
- Test SSH connection manually: `ssh -i key deploy@staging-host`

#### Database Connection Errors

**Problem:** Backend cannot connect to database

**Solutions:**
- Verify `DATABASE_URL` in `.env` file
- Check postgres container is healthy: `docker compose ps`
- Run migrations: `docker compose exec backend npx prisma migrate deploy`
- Check database logs: `docker compose logs postgres`

#### CORS Errors

**Problem:** Frontend cannot call backend API

**Solutions:**
- Verify `CORS_ORIGIN` environment variable matches frontend URL
- Check frontend `VITE_API_URL` points to backend
- Verify network configuration in docker-compose.yml

## Security Considerations

### SSH Key Management
- Use deployment-specific SSH keys (not personal keys)
- Restrict SSH key to deployment user only
- Use Ed25519 keys for better security
- Store private keys only in GitHub Secrets

### Container Registry
- GITHUB_TOKEN has automatic write permissions for packages
- Images are private by default in ghcr.io
- Staging server needs authentication to pull private images

### Environment Variables
- Never commit secrets to repository
- Use GitHub Secrets for sensitive values
- Use `.env` files on staging server (not in git)
- Rotate JWT_SECRET and database passwords regularly

### Network Security
- Use firewall to restrict access to staging server
- Use HTTPS for all external traffic (configure reverse proxy)
- Keep Docker and system packages updated
- Limit SSH access to specific IP addresses if possible

## Production Deployment

**Note:** Production deployment is not yet implemented. This is for staging only.

Production deployment will follow similar patterns but with additional considerations:
- Blue-green deployment strategy
- Database migration rollback procedures
- Comprehensive health checks
- Automated rollback on failure
- Production-specific secrets and configuration
