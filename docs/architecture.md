---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - prd.md
  - analysis/product-brief-classroom-manager-2026-01-19.md
workflowType: 'architecture'
lastStep: 8
project_name: 'classroom-manager'
user_name: 'Anhnm'
date: '2026-01-19'
status: complete
---

# Architecture Decision Document - classroom-manager

**Author:** Anhnm
**Date:** 2026-01-19
**Version:** 1.0
**Status:** Complete

---

## Executive Summary

This document defines the architecture for **classroom-manager**, a web-based classroom management system with scheduling, substitute teacher management, and multi-role dashboards. Key architectural decisions focus on:

- **Monorepo structure** with shared packages
- **Docker-based development and deployment**
- **GitHub Actions CI/CD** with lint, test, and deploy stages
- **PostgreSQL + Redis** data layer
- **React frontend + Node.js backend** stack

---

## System Context

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS                                    │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                   │
│  │  Admin   │    │ Teacher  │    │ Student  │                   │
│  └────┬─────┘    └────┬─────┘    └────┬─────┘                   │
│       │               │               │                          │
│       └───────────────┼───────────────┘                          │
│                       ▼                                          │
│              ┌─────────────────┐                                │
│              │   Web Browser   │                                │
│              └────────┬────────┘                                │
└───────────────────────┼─────────────────────────────────────────┘
                        │ HTTPS
                        ▼
┌───────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE                                  │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    Load Balancer / CDN                      │  │
│  │                    (Nginx / Cloudflare)                     │  │
│  └──────────────────────────┬──────────────────────────────────┘  │
│                             │                                      │
│  ┌──────────────────────────┴──────────────────────────────────┐  │
│  │                      Docker Compose                          │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │  │
│  │  │  Frontend   │  │   Backend   │  │   Workers   │          │  │
│  │  │  (React)    │  │  (Node.js)  │  │ (Optional)  │          │  │
│  │  │  Port 3000  │  │  Port 4000  │  │             │          │  │
│  │  └─────────────┘  └──────┬──────┘  └─────────────┘          │  │
│  │                          │                                   │  │
│  │  ┌───────────────────────┴───────────────────────────────┐  │  │
│  │  │              Data Layer                                │  │  │
│  │  │  ┌─────────────────┐    ┌─────────────────┐           │  │  │
│  │  │  │   PostgreSQL    │    │     Redis       │           │  │  │
│  │  │  │   Port 5432     │    │   Port 6379     │           │  │  │
│  │  │  └─────────────────┘    └─────────────────┘           │  │  │
│  │  └───────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack Decisions

### ADR-001: Frontend Framework

| Attribute | Decision |
|-----------|----------|
| **Decision** | React 18 + TypeScript + Vite |
| **Rationale** | Component-based architecture, type safety, fast HMR, large ecosystem |
| **Alternatives Considered** | Vue.js (smaller community), Angular (heavier), Next.js (SSR not needed) |
| **Consequences** | Team must know React/TS, need state management solution |

### ADR-002: Backend Framework

| Attribute | Decision |
|-----------|----------|
| **Decision** | Node.js + Express + TypeScript |
| **Rationale** | JavaScript ecosystem consistency, fast development, good for REST APIs |
| **Alternatives Considered** | NestJS (more opinionated), Go (different language), Python/FastAPI (team skills) |
| **Consequences** | Single language across stack, need to handle async carefully |

### ADR-003: Database

| Attribute | Decision |
|-----------|----------|
| **Decision** | PostgreSQL 16 |
| **Rationale** | Relational data model fits well, complex queries, reliability, ACID compliance |
| **Alternatives Considered** | MySQL (less features), MongoDB (not relational), SQLite (not scalable) |
| **Consequences** | Need DB migrations strategy, connection pooling |

### ADR-004: Caching & Real-time

| Attribute | Decision |
|-----------|----------|
| **Decision** | Redis 7 |
| **Rationale** | Session storage, real-time pub/sub for schedule updates, caching |
| **Alternatives Considered** | Memcached (no pub/sub), in-memory (not distributed) |
| **Consequences** | Additional infrastructure, need Redis client in backend |

### ADR-005: ORM

| Attribute | Decision |
|-----------|----------|
| **Decision** | Prisma |
| **Rationale** | Type-safe queries, auto-generated types, excellent migrations, schema-first |
| **Alternatives Considered** | TypeORM (less type-safe), Sequelize (older), Drizzle (newer, less docs) |
| **Consequences** | Schema defined in Prisma DSL, migration workflow |

---

## Project Structure

```
classroom-manager/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Lint + Test on every push/PR
│       ├── deploy-staging.yml     # Deploy to staging on main branch
│       └── deploy-production.yml  # Deploy to production on release
├── docker/
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   └── docker-compose.yml
├── packages/
│   ├── frontend/                  # React application
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── stores/
│   │   │   └── types/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tsconfig.json
│   ├── backend/                   # Express API
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── middlewares/
│   │   │   ├── routes/
│   │   │   ├── utils/
│   │   │   └── types/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── shared/                    # Shared types & utilities
│       ├── src/
│       │   ├── types/
│       │   └── utils/
│       └── package.json
├── scripts/
│   ├── setup.sh
│   └── seed.sh
├── package.json                   # Root workspace
├── pnpm-workspace.yaml
├── .eslintrc.js
├── .prettierrc
├── jest.config.js
└── README.md
```

---

## CI/CD Pipeline Architecture

### Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        GITHUB ACTIONS                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  TRIGGER: Push to any branch / Pull Request                │     │
│  └────────────────────────────────────────────────────────────┘     │
│                              │                                       │
│                              ▼                                       │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │                    CI WORKFLOW (ci.yml)                    │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │     │
│  │  │  Lint    │  │  Type    │  │   Unit   │  │  Build   │   │     │
│  │  │  Check   │→ │  Check   │→ │  Tests   │→ │  Check   │   │     │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │     │
│  └────────────────────────────────────────────────────────────┘     │
│                              │                                       │
│                              ▼ (if main branch)                      │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │              DEPLOY STAGING (deploy-staging.yml)           │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │     │
│  │  │  Build   │  │  Push    │  │  Deploy  │  │  Health  │   │     │
│  │  │  Images  │→ │  to Reg  │→ │  to Stg  │→ │  Check   │   │     │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │     │
│  └────────────────────────────────────────────────────────────┘     │
│                              │                                       │
│                              ▼ (if release tag)                      │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │            DEPLOY PRODUCTION (deploy-production.yml)       │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │     │
│  │  │  Build   │  │  Push    │  │  Deploy  │  │  Health  │   │     │
│  │  │  Images  │→ │  to Reg  │→ │  to Prod │→ │  Check   │   │     │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### CI Workflow: `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: ['**']
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '8'

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run ESLint
        run: pnpm lint

      - name: Run Prettier check
        run: pnpm format:check

  typecheck:
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run TypeScript check
        run: pnpm typecheck

  test:
    name: Unit Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: classroom_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate Prisma client
        run: pnpm --filter backend prisma generate

      - name: Run database migrations
        run: pnpm --filter backend prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/classroom_test

      - name: Run unit tests
        run: pnpm test:ci
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/classroom_test
          REDIS_URL: redis://localhost:6379

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: false

  build:
    name: Build Check
    runs-on: ubuntu-latest
    needs: [lint, typecheck, test]
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build all packages
        run: pnpm build

      - name: Build Docker images (test)
        run: |
          docker build -f docker/Dockerfile.frontend -t classroom-frontend:test .
          docker build -f docker/Dockerfile.backend -t classroom-backend:test .
```

### Deploy Staging: `.github/workflows/deploy-staging.yml`

```yaml
name: Deploy Staging

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  deploy:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    environment: staging
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=sha,prefix=staging-

      - name: Build and push Frontend
        uses: docker/build-push-action@v5
        with:
          context: .
          file: docker/Dockerfile.frontend
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-frontend:staging-${{ github.sha }}

      - name: Build and push Backend
        uses: docker/build-push-action@v5
        with:
          context: .
          file: docker/Dockerfile.backend
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-backend:staging-${{ github.sha }}

      - name: Deploy to Staging Server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /opt/classroom-manager
            docker compose pull
            docker compose up -d --remove-orphans
            docker system prune -f

      - name: Health Check
        run: |
          sleep 30
          curl -f ${{ secrets.STAGING_URL }}/api/health || exit 1
```

### Deploy Production: `.github/workflows/deploy-production.yml`

```yaml
name: Deploy Production

on:
  release:
    types: [published]
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to deploy'
        required: true

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    environment: production
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Get version
        id: version
        run: |
          if [ "${{ github.event_name }}" = "release" ]; then
            echo "VERSION=${{ github.event.release.tag_name }}" >> $GITHUB_OUTPUT
          else
            echo "VERSION=${{ github.event.inputs.version }}" >> $GITHUB_OUTPUT
          fi

      - name: Build and push Frontend
        uses: docker/build-push-action@v5
        with:
          context: .
          file: docker/Dockerfile.frontend
          push: true
          tags: |
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-frontend:${{ steps.version.outputs.VERSION }}
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-frontend:latest

      - name: Build and push Backend
        uses: docker/build-push-action@v5
        with:
          context: .
          file: docker/Dockerfile.backend
          push: true
          tags: |
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-backend:${{ steps.version.outputs.VERSION }}
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-backend:latest

      - name: Deploy to Production Server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          script: |
            cd /opt/classroom-manager
            docker compose -f docker-compose.prod.yml pull
            docker compose -f docker-compose.prod.yml up -d --remove-orphans
            docker system prune -f

      - name: Health Check
        run: |
          sleep 30
          curl -f ${{ secrets.PRODUCTION_URL }}/api/health || exit 1

      - name: Notify Deployment
        if: success()
        run: |
          echo "✅ Deployed ${{ steps.version.outputs.VERSION }} to production"
```

---

## Docker Configuration

### Frontend Dockerfile: `docker/Dockerfile.frontend`

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

### Backend Dockerfile: `docker/Dockerfile.backend`

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

### Docker Compose: `docker/docker-compose.yml`

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

---

## Code Quality Configuration

### ESLint: `.eslintrc.js`

```javascript
module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./packages/*/tsconfig.json'],
  },
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc' },
      },
    ],
  },
  settings: {
    'import/resolver': {
      typescript: {
        project: ['./packages/*/tsconfig.json'],
      },
    },
  },
};
```

### Prettier: `.prettierrc`

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

### Jest Config: `jest.config.js`

```javascript
module.exports = {
  projects: [
    '<rootDir>/packages/frontend',
    '<rootDir>/packages/backend',
    '<rootDir>/packages/shared',
  ],
  collectCoverageFrom: [
    'packages/*/src/**/*.{ts,tsx}',
    '!packages/*/src/**/*.d.ts',
    '!packages/*/src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### Package.json Scripts (Root)

```json
{
  "name": "classroom-manager",
  "private": true,
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "build": "pnpm -r build",
    "lint": "eslint packages/*/src --ext .ts,.tsx",
    "lint:fix": "eslint packages/*/src --ext .ts,.tsx --fix",
    "format": "prettier --write \"packages/*/src/**/*.{ts,tsx,json}\"",
    "format:check": "prettier --check \"packages/*/src/**/*.{ts,tsx,json}\"",
    "typecheck": "pnpm -r typecheck",
    "test": "jest",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "test:watch": "jest --watch",
    "docker:up": "docker compose -f docker/docker-compose.yml up -d",
    "docker:down": "docker compose -f docker/docker-compose.yml down",
    "docker:logs": "docker compose -f docker/docker-compose.yml logs -f",
    "db:migrate": "pnpm --filter backend prisma migrate dev",
    "db:seed": "pnpm --filter backend prisma db seed",
    "db:studio": "pnpm --filter backend prisma studio"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.50.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-import-resolver-typescript": "^3.6.0",
    "eslint-plugin-import": "^2.28.0",
    "jest": "^29.7.0",
    "prettier": "^3.0.0",
    "typescript": "^5.2.0"
  }
}
```

---

## Database Schema (Prisma)

```prisma
// packages/backend/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  ADMIN
  TEACHER
  STUDENT
}

enum AbsenceStatus {
  PENDING
  APPROVED
  COVERED
  CANCELLED
}

enum TimeSlotStatus {
  SCHEDULED
  CANCELLED
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  role          UserRole
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  teacher       Teacher?
  student       Student?
}

model Teacher {
  id                  String    @id @default(cuid())
  userId              String    @unique
  user                User      @relation(fields: [userId], references: [id])
  name                String
  phone               String?
  isActive            Boolean   @default(true)
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  qualifications      TeacherQualification[]
  timeSlots           TimeSlot[]
  absences            TeacherAbsence[]
  substitutions       TeacherAbsence[]  @relation("SubstituteTeacher")
}

model Student {
  id            String    @id @default(cuid())
  userId        String    @unique
  user          User      @relation(fields: [userId], references: [id])
  name          String
  gradeLevel    Int
  classId       String?
  class         Class?    @relation(fields: [classId], references: [id])
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  enrollments   Enrollment[]
}

model Subject {
  id              String    @id @default(cuid())
  name            String
  code            String    @unique
  description     String?
  isMandatory     Boolean   @default(false)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  prerequisites   Subject[] @relation("SubjectPrerequisites")
  prerequisiteOf  Subject[] @relation("SubjectPrerequisites")
  qualifications  TeacherQualification[]
  timeSlots       TimeSlot[]
  enrollments     Enrollment[]
}

model TeacherQualification {
  id          String    @id @default(cuid())
  teacherId   String
  teacher     Teacher   @relation(fields: [teacherId], references: [id])
  subjectId   String
  subject     Subject   @relation(fields: [subjectId], references: [id])
  createdAt   DateTime  @default(now())

  @@unique([teacherId, subjectId])
}

model Class {
  id          String    @id @default(cuid())
  name        String
  gradeLevel  Int
  capacity    Int       @default(50)
  roomId      String?
  room        Room?     @relation(fields: [roomId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  students    Student[]
  timeSlots   TimeSlot[]
}

model Room {
  id          String    @id @default(cuid())
  name        String
  capacity    Int
  type        String    @default("classroom") // classroom, lab, gym
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  classes     Class[]
  timeSlots   TimeSlot[]
}

model TimeSlot {
  id          String          @id @default(cuid())
  dayOfWeek   Int             // 0=Sunday, 1=Monday, etc.
  startTime   String          // "08:00"
  endTime     String          // "09:30"
  classId     String
  class       Class           @relation(fields: [classId], references: [id])
  subjectId   String
  subject     Subject         @relation(fields: [subjectId], references: [id])
  teacherId   String
  teacher     Teacher         @relation(fields: [teacherId], references: [id])
  roomId      String
  room        Room            @relation(fields: [roomId], references: [id])
  status      TimeSlotStatus  @default(SCHEDULED)
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  @@index([dayOfWeek, startTime])
  @@index([teacherId, dayOfWeek])
  @@index([roomId, dayOfWeek])
}

model Enrollment {
  id          String    @id @default(cuid())
  studentId   String
  student     Student   @relation(fields: [studentId], references: [id])
  subjectId   String
  subject     Subject   @relation(fields: [subjectId], references: [id])
  createdAt   DateTime  @default(now())

  @@unique([studentId, subjectId])
}

model TeacherAbsence {
  id                  String         @id @default(cuid())
  teacherId           String
  teacher             Teacher        @relation(fields: [teacherId], references: [id])
  date                DateTime       @db.Date
  reason              String?
  status              AbsenceStatus  @default(PENDING)
  substituteTeacherId String?
  substituteTeacher   Teacher?       @relation("SubstituteTeacher", fields: [substituteTeacherId], references: [id])
  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt

  @@index([teacherId, date])
  @@index([date, status])
}

model Notification {
  id          String    @id @default(cuid())
  userId      String
  type        String
  title       String
  message     String
  isRead      Boolean   @default(false)
  createdAt   DateTime  @default(now())

  @@index([userId, isRead])
}
```

---

## Environment Configuration

### Required Secrets (GitHub)

| Secret | Description | Used In |
|--------|-------------|---------|
| `STAGING_HOST` | Staging server IP/hostname | deploy-staging.yml |
| `STAGING_USER` | SSH username for staging | deploy-staging.yml |
| `STAGING_SSH_KEY` | SSH private key for staging | deploy-staging.yml |
| `STAGING_URL` | Staging app URL for health check | deploy-staging.yml |
| `PRODUCTION_HOST` | Production server IP/hostname | deploy-production.yml |
| `PRODUCTION_USER` | SSH username for production | deploy-production.yml |
| `PRODUCTION_SSH_KEY` | SSH private key for production | deploy-production.yml |
| `PRODUCTION_URL` | Production app URL for health check | deploy-production.yml |

### Environment Variables

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

---

## Pipeline Summary

| Trigger | Pipeline | Actions |
|---------|----------|---------|
| **Push to any branch** | CI | Lint → Type Check → Unit Tests → Build Check |
| **Pull Request to main** | CI | Lint → Type Check → Unit Tests → Build Check |
| **Push to main** | CI + Deploy Staging | CI pipeline + Build Images → Push → Deploy to Staging → Health Check |
| **Release published** | Deploy Production | Build Images → Push → Deploy to Production → Health Check |

---

## References

- PRD: `docs/prd.md`
- Product Brief: `docs/analysis/product-brief-classroom-manager-2026-01-19.md`

---

*Architecture document completed on 2026-01-19*
*Version 1.0 - Ready for Implementation*
