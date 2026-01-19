# Story 0.2: Docker Development Environment

Status: Ready for Review

## Story

As a developer,
I want Docker Compose configuration for local development,
so that I can run the entire stack locally with all dependencies.

## Acceptance Criteria

1. **AC-1: Docker Compose Startup**
   - Given Docker and Docker Compose installed
   - When I run `docker compose -f docker/docker-compose.yml up`
   - Then PostgreSQL 16 container starts on port 5432
   - And Redis 7 container starts on port 6379
   - And Backend container starts on port 4000
   - And Frontend container starts on port 3000
   - And all services pass health checks

2. **AC-2: Hot Reload Development**
   - Given the development environment is running
   - When I make code changes
   - Then hot reload is enabled for frontend (Vite HMR)
   - And backend can restart to pick up changes

3. **AC-3: Database Migrations**
   - Given database containers are running
   - When I run `pnpm db:migrate`
   - Then Prisma migrations are applied to PostgreSQL
   - And the database schema matches prisma/schema.prisma

## Tasks / Subtasks

- [x] Task 1: Create docker directory structure (AC: 1)
  - [x] 1.1: Create docker/ directory at project root
  - [x] 1.2: Create docker-compose.yml with all services (postgres, redis, backend, frontend)
  - [x] 1.3: Configure PostgreSQL 16 with healthcheck and volume persistence
  - [x] 1.4: Configure Redis 7 with healthcheck and volume persistence
  - [x] 1.5: Configure environment variables for backend service

- [x] Task 2: Create Dockerfile.frontend (AC: 1, 2)
  - [x] 2.1: Create multi-stage build Dockerfile for frontend
  - [x] 2.2: Configure pnpm workspace installation
  - [x] 2.3: Build shared and frontend packages
  - [x] 2.4: Create nginx production stage with dist files
  - [x] 2.5: Create nginx.conf for serving SPA

- [x] Task 3: Create Dockerfile.backend (AC: 1)
  - [x] 3.1: Create multi-stage build Dockerfile for backend
  - [x] 3.2: Configure pnpm workspace installation
  - [x] 3.3: Run prisma generate in build stage
  - [x] 3.4: Build shared and backend packages
  - [x] 3.5: Create production stage with compiled output

- [x] Task 4: Configure development environment (AC: 2, 3)
  - [x] 4.1: Add docker:up, docker:down, docker:logs scripts to root package.json
  - [x] 4.2: Ensure db:migrate script works with Docker PostgreSQL
  - [x] 4.3: Create .env.example with required environment variables

- [x] Task 5: Verify complete Docker setup (AC: 1-3)
  - [x] 5.1: Run docker compose up and verify all services start
  - [x] 5.2: Verify PostgreSQL healthcheck passes
  - [x] 5.3: Verify Redis healthcheck passes
  - [x] 5.4: Verify backend container can connect to postgres and redis
  - [x] 5.5: Verify frontend container serves application

## Dev Notes

### Architecture Requirements (CRITICAL)

**Docker Configuration from architecture.md - MUST follow exactly:**

```
docker/
├── Dockerfile.frontend    # Multi-stage: node builder → nginx production
├── Dockerfile.backend     # Multi-stage: node builder → node production
├── docker-compose.yml     # Development orchestration
└── nginx.conf             # Frontend SPA routing
```

### Technology Stack (MANDATORY)

| Component | Technology | Version | Port |
|-----------|------------|---------|------|
| Database | PostgreSQL | 16-alpine | 5432 |
| Cache/Pub-Sub | Redis | 7-alpine | 6379 |
| Backend | Node.js | 20-alpine | 4000 |
| Frontend | Nginx | alpine | 3000 (mapped to 80 internal) |
| Package Manager | pnpm | 8 | - |

### Docker Compose Configuration (from architecture.md)

The docker-compose.yml MUST include:
- **postgres service**: PostgreSQL 16, healthcheck with pg_isready, volume for persistence
- **redis service**: Redis 7, healthcheck with redis-cli ping, volume for persistence
- **backend service**: Depends on postgres and redis (condition: service_healthy)
- **frontend service**: Depends on backend

**Environment Variables for Backend:**
```
NODE_ENV=development
DATABASE_URL=postgresql://classroom:classroom@postgres:5432/classroom
REDIS_URL=redis://redis:6379
JWT_SECRET=dev-secret-change-in-production
PORT=4000
```

**Environment Variables for Frontend:**
```
VITE_API_URL=http://localhost:4000
```

### Dockerfile Patterns (CRITICAL)

**Frontend Dockerfile Pattern:**
1. Build stage: node:20-alpine with pnpm
2. Copy workspace files and install dependencies
3. Copy source, build shared then frontend
4. Production stage: nginx:alpine
5. Copy nginx.conf and built dist files

**Backend Dockerfile Pattern:**
1. Build stage: node:20-alpine with pnpm
2. Copy workspace files and install dependencies
3. Generate Prisma client
4. Copy source, build shared then backend
5. Production stage: node:20-alpine
6. Copy compiled dist, prisma folder, and node_modules

### Nginx Configuration for SPA

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Scripts to Add (from architecture.md)

```json
{
  "docker:up": "docker compose -f docker/docker-compose.yml up -d",
  "docker:down": "docker compose -f docker/docker-compose.yml down",
  "docker:logs": "docker compose -f docker/docker-compose.yml logs -f",
  "db:migrate": "pnpm --filter backend prisma migrate dev",
  "db:seed": "pnpm --filter backend prisma db seed",
  "db:studio": "pnpm --filter backend prisma studio"
}
```

### Previous Story Intelligence (Story 0.1)

From Story 0.1 implementation:
- Monorepo structure established: packages/frontend, packages/backend, packages/shared
- pnpm-workspace.yaml configured for packages/*
- TypeScript configured with tsconfig.json in each package
- Jest testing framework set up with 70% coverage threshold
- Root package.json has "type": "module"
- Frontend uses Vite, backend placeholder exists
- Prisma folder placeholder exists at packages/backend/prisma/

**Key Learnings:**
- Frontend jest.config.cjs (not .js) due to ES module compatibility
- Using `--runInBand` flag for Jest coverage in monorepo
- React ESLint plugins added for proper linting

### Testing Strategy for This Story

- Verify docker compose up starts all containers
- Check container health via docker healthcheck
- Test database connectivity from backend
- Test redis connectivity from backend
- Verify frontend serves at localhost:3000
- No unit tests for Docker configs - integration verification only

### File Structure After Implementation

```
docker/
├── Dockerfile.frontend
├── Dockerfile.backend
├── docker-compose.yml
└── nginx.conf
```

### References

- [Source: docs/architecture.md#Docker-Configuration] - Complete Docker configs
- [Source: docs/architecture.md#Project-Structure] - Directory structure
- [Source: docs/architecture.md#Environment-Configuration] - Environment variables
- [Source: docs/epics.md#Story-0.2] - Story requirements

## Dev Agent Record

### Context Reference

Context loaded from: docs/prd.md, docs/architecture.md, docs/epics.md
Previous story: docs/sprint-artifacts/0-1-repository-structure-and-ci-pipeline.md

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

### Completion Notes List

- All Docker configuration files created following architecture.md specifications
- Both frontend and backend Docker images build successfully
- docker-compose.yml configured with all services (postgres, redis, backend, frontend)
- PostgreSQL 16-alpine and Redis 7-alpine with health checks
- Multi-stage Dockerfiles for optimized image sizes
- nginx.conf configured for SPA routing with API proxy
- Added docker:up, docker:down, docker:logs scripts to root package.json
- Created .env.example with all required environment variables
- Added minimal Prisma schema (HealthCheck model) for Docker build testing - full schema in Story 0.3
- Added @prisma/client and prisma dependencies to backend package.json
- All existing tests pass (37 tests, 100% coverage)
- All builds pass (lint, format, typecheck, build)

### File List

**Docker Configuration Files:**
- `docker/docker-compose.yml` - Docker Compose orchestration with all services
- `docker/Dockerfile.frontend` - Multi-stage frontend build (node → nginx)
- `docker/Dockerfile.backend` - Multi-stage backend build (node → node production)
- `docker/nginx.conf` - Nginx configuration for SPA and API proxy

**Configuration Updates:**
- `package.json` - Added docker:up, docker:down, docker:logs, db:migrate, db:seed, db:studio scripts
- `packages/backend/package.json` - Added @prisma/client and prisma dependencies
- `packages/backend/prisma/schema.prisma` - Minimal Prisma schema for Docker build
- `.env.example` - Environment variable template
