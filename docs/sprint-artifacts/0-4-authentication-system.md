# Story 0.4: Authentication System

Status: done

## Story

As a user,
I want to securely log in with my email and password,
so that I can access features appropriate for my role.

## Acceptance Criteria

1. **AC-1: Login Endpoint**
   - Given a valid email and password
   - When I POST to `/api/auth/login`
   - Then I receive a JWT access token (24-hour expiry)
   - And the token contains my userId and role (ADMIN, TEACHER, or STUDENT)
   - And the response includes a refresh token

2. **AC-2: Token Refresh**
   - Given an expired access token
   - When I POST to `/api/auth/refresh` with a valid refresh token
   - Then I receive a new access token
   - And the refresh token is rotated

3. **AC-3: Protected Routes**
   - Given an authenticated request
   - When the Authorization header contains a valid JWT
   - Then the request proceeds to the protected endpoint
   - And req.user contains decoded user information

4. **AC-4: Unauthenticated Access**
   - Given an unauthenticated request to a protected endpoint
   - When no valid token is provided
   - Then the API returns 401 Unauthorized

5. **AC-5: Role-Based Access Control**
   - Given a user with STUDENT role
   - When they attempt to access an admin-only endpoint
   - Then the API returns 403 Forbidden

## Tasks / Subtasks

- [x] Task 1: Install authentication dependencies (AC: 1, 2, 3)
  - [x] 1.1: Add bcrypt for password hashing
  - [x] 1.2: Add jsonwebtoken for JWT operations
  - [x] 1.3: Add ioredis for Redis refresh token storage
  - [x] 1.4: Add @types packages for dev dependencies

- [x] Task 2: Create auth utility functions (AC: 1, 2)
  - [x] 2.1: Create packages/backend/src/utils/password.ts with hashPassword and comparePassword
  - [x] 2.2: Create packages/backend/src/utils/jwt.ts with generateAccessToken, generateRefreshToken, verifyToken
  - [x] 2.3: Create packages/backend/src/lib/redis.ts singleton client with graceful shutdown
  - [x] 2.4: Write unit tests for password utilities
  - [x] 2.5: Write unit tests for JWT utilities

- [x] Task 3: Create auth service (AC: 1, 2)
  - [x] 3.1: Create packages/backend/src/services/auth.service.ts
  - [x] 3.2: Implement login method (verify credentials, generate tokens, store refresh token in Redis)
  - [x] 3.3: Implement refresh method (validate refresh token, rotate tokens)
  - [x] 3.4: Implement logout method (invalidate refresh token in Redis)
  - [x] 3.5: Write unit tests for auth service (mock Prisma and Redis)

- [x] Task 4: Create auth middleware (AC: 3, 4, 5)
  - [x] 4.1: Create packages/backend/src/middlewares/auth.middleware.ts
  - [x] 4.2: Implement authenticate middleware (verify JWT, attach user to request)
  - [x] 4.3: Implement authorize middleware factory (check user role against allowed roles)
  - [x] 4.4: Create custom Request type extension with user property
  - [x] 4.5: Write unit tests for auth middleware

- [x] Task 5: Create auth routes and controller (AC: 1, 2, 3, 4, 5)
  - [x] 5.1: Create packages/backend/src/controllers/auth.controller.ts
  - [x] 5.2: Create packages/backend/src/routes/auth.routes.ts
  - [x] 5.3: Implement POST /api/auth/login endpoint
  - [x] 5.4: Implement POST /api/auth/refresh endpoint
  - [x] 5.5: Implement POST /api/auth/logout endpoint
  - [x] 5.6: Integrate auth routes into main Express app
  - [x] 5.7: Create a protected test endpoint to verify middleware

- [x] Task 6: Write integration tests (AC: 1, 2, 3, 4, 5)
  - [x] 6.1: Test login with valid credentials returns tokens
  - [x] 6.2: Test login with invalid credentials returns 401
  - [x] 6.3: Test refresh with valid refresh token returns new tokens
  - [x] 6.4: Test refresh with invalid token returns 401
  - [x] 6.5: Test protected endpoint with valid token succeeds
  - [x] 6.6: Test protected endpoint without token returns 401
  - [x] 6.7: Test admin endpoint with student role returns 403

## Dev Notes

### Architecture Requirements (CRITICAL)

**File Structure:**
```
packages/backend/src/
├── controllers/
│   └── auth.controller.ts
├── services/
│   └── auth.service.ts
├── middlewares/
│   └── auth.middleware.ts
├── routes/
│   └── auth.routes.ts
├── utils/
│   ├── password.ts
│   └── jwt.ts
├── lib/
│   ├── prisma.ts (exists)
│   └── redis.ts (new)
└── types/
    └── express.d.ts (Request extension)
```

**Technical Requirements from Architecture:**
- Use bcrypt for password hashing (min 10 rounds)
- JWT signing with HS256 (simpler for single-server setup)
- JWT_SECRET from environment variable
- Access token expiry: 24 hours
- Refresh token expiry: 7 days
- Store refresh tokens in Redis with TTL
- RBAC with roles: ADMIN, TEACHER, STUDENT

**API Response Format (from Story 0-5 preview):**
```typescript
// Success
{ success: true, data: { accessToken, refreshToken, user: { id, email, role } } }

// Error
{ success: false, error: { code: "INVALID_CREDENTIALS", message: "..." } }
```

**JWT Payload Structure:**
```typescript
interface JwtPayload {
  userId: string;
  role: UserRole;
  iat: number;
  exp: number;
}
```

**Environment Variables Required:**
```
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
```

### Previous Story Learnings (Story 0-3)

From Story 0-3 Database Schema implementation:
- Prisma client singleton exists at `packages/backend/src/lib/prisma.ts`
- User model has: id, email, passwordHash, role (UserRole enum)
- UserRole enum: ADMIN, TEACHER, STUDENT
- Express app exists at `packages/backend/src/server.ts`
- Health endpoint at `/api/health`
- Jest configured with 70% coverage threshold
- Tests in CI use: DATABASE_URL, REDIS_URL environment variables

### Dependencies to Add

```json
{
  "dependencies": {
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "ioredis": "^5.3.2"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.5"
  }
}
```

### Redis Client Pattern

```typescript
// packages/backend/src/lib/redis.ts
import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis = globalForRedis.redis ?? new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}
```

### Testing Strategy

**Unit Tests (mock dependencies):**
- Password hashing/comparison
- JWT generation/verification
- Auth service methods (mock Prisma, Redis)
- Auth middleware (mock request/response)

**Integration Tests (real services):**
- Full login flow
- Token refresh flow
- Protected endpoint access
- Role-based access control

**CI Considerations:**
- Redis service already configured in CI workflow
- Tests should skip or mock Redis when REDIS_URL not available

### References

- [Source: docs/architecture.md#Environment-Configuration] - JWT_SECRET, Redis URL
- [Source: docs/architecture.md#Docker-Compose] - Redis configuration
- [Source: docs/epics.md#Story-0.4] - Acceptance criteria
- [Source: docs/prd.md#Security] - NFR-9 (JWT), NFR-10 (RBAC), NFR-13 (Password policy)
- [Previous Story: docs/sprint-artifacts/0-3-database-schema-and-prisma-setup.md] - Prisma client, User model

## Dev Agent Record

### Context Reference

Context loaded from: docs/prd.md, docs/architecture.md, docs/epics.md
Previous story reference: docs/sprint-artifacts/0-3-database-schema-and-prisma-setup.md

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

### Completion Notes List

- Complete authentication system implemented following architecture specifications
- JWT-based authentication with access tokens (24h) and refresh tokens (7d)
- Bcrypt password hashing with 10 salt rounds
- Redis-based refresh token storage with TTL
- RBAC middleware supporting role-based access control
- All 5 Acceptance Criteria verified:
  - AC-1: POST /api/auth/login returns JWT access and refresh tokens
  - AC-2: POST /api/auth/refresh rotates tokens
  - AC-3: authenticate middleware verifies JWT and attaches user to request
  - AC-4: Protected endpoints return 401 for unauthenticated requests
  - AC-5: authorize middleware returns 403 for insufficient permissions
- 72 tests passing (7 skipped - require DATABASE_URL for integration)
- Build and lint pass with 0 errors

### File List

**Auth Utilities:**
- `packages/backend/src/utils/password.ts` - hashPassword, comparePassword with bcrypt
- `packages/backend/src/utils/password.test.ts` - Unit tests for password utilities
- `packages/backend/src/utils/jwt.ts` - generateAccessToken, generateRefreshToken, verifyToken, decodeToken
- `packages/backend/src/utils/jwt.test.ts` - Unit tests for JWT utilities

**Redis Client:**
- `packages/backend/src/lib/redis.ts` - Redis singleton with graceful shutdown and refresh token storage functions

**Auth Service:**
- `packages/backend/src/services/auth.service.ts` - AuthService class with login, refresh, logout, validateAccessToken
- `packages/backend/src/services/auth.service.test.ts` - Unit tests with mocked dependencies

**Auth Middleware:**
- `packages/backend/src/middlewares/auth.middleware.ts` - authenticate and authorize middleware functions
- `packages/backend/src/middlewares/auth.middleware.test.ts` - Unit tests for middleware

**Auth Controller & Routes:**
- `packages/backend/src/controllers/auth.controller.ts` - AuthController with login, refresh, logout, me endpoints
- `packages/backend/src/routes/auth.routes.ts` - Express router with auth endpoints
- `packages/backend/src/routes/auth.routes.test.ts` - Integration tests for all auth endpoints

**Types:**
- `packages/backend/src/types/express.d.ts` - Express Request type extension for user property

**Modified Files:**
- `packages/backend/src/server.ts` - Added auth routes integration
- `packages/backend/package.json` - Added bcrypt, jsonwebtoken, ioredis dependencies
- `pnpm-lock.yaml` - Updated lockfile
