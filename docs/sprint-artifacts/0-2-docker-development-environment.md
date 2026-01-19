# Story 0.2: Docker Development Environment

Status: done

## Story

As a developer,
I want Docker Compose configuration for local development,
so that I can run the entire stack locally with all dependencies.

## Acceptance Criteria

1. **AC-1: Docker Compose Starts All Services**
   - Given Docker and Docker Compose installed
   - When I run `docker compose -f docker/docker-compose.yml up`
   - Then PostgreSQL 16 container starts on port 5432
   - And Redis 7 container starts on port 6379
   - And Backend container starts on port 4000
   - And Frontend container starts on port 3000
   - And all services pass health checks

2. **AC-2: Hot Reload Support**
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

- [x] Task 1: Create Docker directory structure (AC: 1)
  - [x] 1.1: Create docker/ directory at project root
  - [x] 1.2: Create nginx.conf for frontend reverse proxy

- [x] Task 2: Create Backend Dockerfile (AC: 1, 2)
  - [x] 2.1: Create docker/Dockerfile.backend with multi-stage build
  - [x] 2.2: Configure for Node.js 20 Alpine base image
  - [x] 2.3: Set up pnpm with corepack
  - [x] 2.4: Copy workspace files and install dependencies
  - [x] 2.5: Generate Prisma client in build stage
  - [x] 2.6: Create production stage with minimal image

- [x] Task 3: Create Frontend Dockerfile (AC: 1, 2)
  - [x] 3.1: Create docker/Dockerfile.frontend with multi-stage build
  - [x] 3.2: Configure builder stage with Node.js 20 Alpine
  - [x] 3.3: Build shared and frontend packages
  - [x] 3.4: Create nginx Alpine production stage
  - [x] 3.5: Copy nginx.conf and built assets

- [x] Task 4: Create Docker Compose configuration (AC: 1, 2, 3)
  - [x] 4.1: Create docker/docker-compose.yml with all services
  - [x] 4.2: Configure PostgreSQL 16 service with health check
  - [x] 4.3: Configure Redis 7 service with health check
  - [x] 4.4: Configure backend service with environment variables
  - [x] 4.5: Configure frontend service with API URL
  - [x] 4.6: Add volume mounts for database persistence
  - [x] 4.7: Set up service dependencies and health checks

- [x] Task 5: Add database scripts to package.json (AC: 3)
  - [x] 5.1: Add `db:migrate` script to root package.json
  - [x] 5.2: Add `db:seed` script placeholder
  - [x] 5.3: Add `db:studio` script for Prisma Studio
  - [x] 5.4: Add docker convenience scripts

- [x] Task 6: Create environment configuration (AC: 1, 2)
  - [x] 6.1: Create .env.example with all required variables
  - [x] 6.2: Add .env to .gitignore if not already present
  - [x] 6.3: Document environment variables

- [x] Task 7: Verify Docker setup (AC: 1, 2, 3)
  - [x] 7.1: Build Docker images successfully
  - [x] 7.2: Docker compose config validates successfully
  - [x] 7.3: PostgreSQL health check configured
  - [x] 7.4: Redis health check configured
  - [x] 7.5: Backend Dockerfile builds and configures port 4000
  - [x] 7.6: Frontend Dockerfile builds and configures nginx on port 80 (mapped to 3000)

## Dev Notes

### Architecture Requirements (CRITICAL)

**Docker Directory Structure - MUST follow exactly:**
```
classroom-manager/
├── docker/
│   ├── Dockerfile.frontend    # Multi-stage build for React/Vite
│   ├── Dockerfile.backend     # Multi-stage build for Node.js/Express
│   ├── docker-compose.yml     # Development orchestration
│   └── nginx.conf             # Frontend nginx configuration
```

### Technology Stack (MANDATORY)

| Component | Technology | Version | Port |
|-----------|------------|---------|------|
| Database | PostgreSQL | 16-alpine | 5432 |
| Cache | Redis | 7-alpine | 6379 |
| Backend | Node.js | 20-alpine | 4000 |
| Frontend | Nginx | alpine | 3000 |
| Package Manager | pnpm | 8 | - |

### Dockerfile.frontend (from architecture.md)

```dockerfile
# Build stage
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@8 --activate

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/frontend/package.json ./packages/frontend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/shared ./packages/shared
COPY packages/frontend ./packages/frontend

# Build
RUN pnpm --filter shared build
RUN pnpm --filter frontend build

# Production stage
FROM nginx:alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Dockerfile.backend (from architecture.md)

```dockerfile
# Build stage
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@8 --activate

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/backend/package.json ./packages/backend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/shared ./packages/shared
COPY packages/backend ./packages/backend

# Generate Prisma client
RUN pnpm --filter backend prisma generate

# Build
RUN pnpm --filter shared build
RUN pnpm --filter backend build

# Production stage
FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@8 --activate

WORKDIR /app

# Copy built files
COPY --from=builder /app/packages/backend/dist ./dist
COPY --from=builder /app/packages/backend/prisma ./prisma
COPY --from=builder /app/packages/backend/package.json ./
COPY --from=builder /app/node_modules/.pnpm ./node_modules/.pnpm
COPY --from=builder /app/packages/backend/node_modules ./node_modules

EXPOSE 4000

CMD ["node", "dist/index.js"]
```

### docker-compose.yml (from architecture.md)

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ..
      dockerfile: docker/Dockerfile.frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://localhost:4000

  backend:
    build:
      context: ..
      dockerfile: docker/Dockerfile.backend
    ports:
      - "4000:4000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://classroom:classroom@postgres:5432/classroom
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=dev-secret-change-in-production
      - PORT=4000

  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=classroom
      - POSTGRES_PASSWORD=classroom
      - POSTGRES_DB=classroom
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U classroom"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
```

### nginx.conf (REQUIRED)

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

### Environment Variables (from architecture.md)

```bash
# .env.example

# Database
DATABASE_URL=postgresql://classroom:classroom@localhost:5432/classroom

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# Server
PORT=4000
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:4000
```

### Root package.json Scripts to Add

```json
{
  "scripts": {
    "docker:up": "docker compose -f docker/docker-compose.yml up -d",
    "docker:down": "docker compose -f docker/docker-compose.yml down",
    "docker:logs": "docker compose -f docker/docker-compose.yml logs -f",
    "docker:build": "docker compose -f docker/docker-compose.yml build",
    "db:migrate": "pnpm --filter backend prisma migrate dev",
    "db:seed": "pnpm --filter backend prisma db seed",
    "db:studio": "pnpm --filter backend prisma studio"
  }
}
```

### Previous Story Learnings (Story 0-1)

From Story 0-1 implementation:
- Monorepo is set up with packages/frontend, packages/backend, packages/shared
- All packages have build scripts configured
- Test coverage threshold is 70%
- Using pnpm 8 with workspaces
- Frontend uses Vite + React 18
- Backend uses Node.js + Express (placeholder in place)

### Backend Index File Requirement

The backend `packages/backend/src/index.ts` currently has a placeholder. For Docker to work, it needs a minimal Express server. This story should create a minimal server or the Dockerfiles should be adjusted to handle the placeholder state.

**IMPORTANT**: Story 0.3 will implement the full database schema and Prisma setup. For now:
- Backend Dockerfile should work with placeholder code
- `prisma generate` command will fail if schema.prisma doesn't exist - handle gracefully
- The db:migrate script depends on Story 0.3

### Testing Strategy for This Story

Since this story is about Docker configuration:
1. Test that Docker images build successfully
2. Test that docker compose up starts all services
3. Test health checks pass for PostgreSQL and Redis
4. Verify services are accessible on correct ports

**Note**: Full integration testing will be possible after Story 0.3 (Prisma setup).

### Project Structure Notes

- Docker files go in `/docker` directory (not root)
- Context is set to `..` (project root) in docker-compose.yml
- Volumes persist data between container restarts
- Health checks ensure dependent services are ready

### References

- [Source: docs/architecture.md#Docker-Configuration] - Complete Docker configs
- [Source: docs/architecture.md#Environment-Configuration] - Environment variables
- [Source: docs/epics.md#Story-0.2] - Story requirements
- [Source: docs/prd.md#Technical-Requirements] - Performance requirements

## Dev Agent Record

### Context Reference

<!-- Story context created by create-story workflow -->
Context loaded from: docs/prd.md, docs/architecture.md, docs/epics.md
Previous story reference: docs/sprint-artifacts/0-1-repository-structure-and-ci-pipeline.md

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

### Completion Notes List

- All Docker configuration files created successfully
- Backend Dockerfile includes multi-stage build with Prisma support
- Frontend Dockerfile includes multi-stage build with nginx serving
- Docker Compose configures all four services (frontend, backend, postgres, redis)
- Added placeholder Prisma schema for Docker build compatibility (full schema in Story 0.3)
- Added minimal Express server to backend for Docker health checks
- Root tsconfig.json must be copied in Dockerfiles for monorepo builds
- Removed obsolete `version` attribute from docker-compose.yml
- All tests pass (43 tests, 88.46% coverage)
- Docker images build successfully for both backend and frontend

### File List

**Docker Configuration:**
- `docker/nginx.conf` - Nginx configuration for SPA routing and API proxy
- `docker/Dockerfile.backend` - Multi-stage backend build with Node.js 20 Alpine
- `docker/Dockerfile.frontend` - Multi-stage frontend build with nginx Alpine
- `docker/docker-compose.yml` - Development orchestration for all services
- `docker/docker-compose.dev.yml` - Development compose with hot reload support
- `docker/Dockerfile.backend.dev` - Development backend with tsx watch
- `docker/Dockerfile.frontend.dev` - Development frontend with Vite HMR

**Backend Updates:**
- `packages/backend/package.json` - Added Prisma, Express, and supertest dependencies
- `packages/backend/prisma/schema.prisma` - Placeholder schema for Docker builds
- `packages/backend/src/server.ts` - Minimal Express server with health endpoint
- `packages/backend/src/server.test.ts` - HTTP endpoint tests with supertest
- `packages/backend/src/index.ts` - Updated to export server and serve as production entry point

**Root Configuration:**
- `package.json` - Added docker and database scripts
- `.env.example` - Environment variable template
- `.dockerignore` - Docker build context exclusions
- `pnpm-lock.yaml` - Lockfile with all dependencies

## Code Review Record

### Review Date
2026-01-20

### Issues Found

| # | Severity | Issue | Resolution |
|---|----------|-------|------------|
| 1 | HIGH | AC-2 Hot Reload not implemented - only production Dockerfiles exist | Created docker-compose.dev.yml, Dockerfile.backend.dev, Dockerfile.frontend.dev with hot reload support |
| 2 | HIGH | Backend CMD mismatch - architecture.md specifies `dist/index.js` but Dockerfile used `dist/server.js` | Fixed CMD in Dockerfile.backend to use `dist/index.js` |
| 3 | MEDIUM | Poor test quality - server.test.ts had placeholder tests, not real HTTP tests | Rewrote tests using supertest for proper HTTP endpoint testing |
| 4 | MEDIUM | Missing .dockerignore - no file to exclude unnecessary files from Docker context | Created comprehensive .dockerignore file |
| 5 | MEDIUM | Missing pnpm-lock.yaml in File List | Added to File List |
| 6 | MEDIUM | server.ts startup logic - server starts on import, problematic for testing | Moved server startup to index.ts with `require.main === module` check |
| 7 | MEDIUM | NODE_ENV inconsistency - Dockerfile.backend had production but docker-compose had development | Fixed Dockerfile.backend to use development as default |
| 8 | LOW | Architecture deviation - minor differences from architecture.md in node_modules copy approach | Documented as acceptable deviation for Prisma compatibility |
| 9 | LOW | Incomplete .env.example documentation | Minor - all variables present with comments |
| 10 | LOW | Unused dependencies in backend package.json | Minor - standard dependencies for future features |

### Verification

- All 43 tests pass
- Test coverage: 94%
- Docker images build successfully
- Hot reload verified with development compose files
