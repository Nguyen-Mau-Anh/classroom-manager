# Story 0.5: API Foundation and Error Handling

Status: completed

## Story

As a developer,
I want a consistent API structure with proper error handling,
so that all endpoints follow the same patterns and return predictable responses.

## Acceptance Criteria

1. **AC-1: Successful Response Format**
   - Given any successful API request
   - When the response is returned
   - Then it follows the format: `{ success: true, data: {...} }`
   - And appropriate HTTP status codes are used (200, 201, 204)

2. **AC-2: Validation Error Response**
   - Given a request with validation errors
   - When the validation fails
   - Then the response is: `{ success: false, error: { code: "VALIDATION_ERROR", message: "...", details: [...] } }`
   - And HTTP status 400 is returned

3. **AC-3: Server Error Handling**
   - Given an unexpected server error
   - When the error is caught
   - Then the response is: `{ success: false, error: { code: "INTERNAL_ERROR", message: "..." } }`
   - And HTTP status 500 is returned
   - And the error is logged with stack trace (not exposed to client)

4. **AC-4: Request Processing**
   - Given any API request
   - When the request is processed
   - Then CORS headers are set correctly
   - And request body is validated against Zod schemas
   - And response time is logged

## Tasks / Subtasks

- [x] Task 1: Create API response helpers (AC: 1, 2, 3)
  - [x] 1.1: Create `packages/backend/src/utils/api-response.ts` with success(), error(), validationError() helpers
  - [x] 1.2: Define ApiResponse, ApiError, ValidationError types in `packages/backend/src/types/api.ts`
  - [x] 1.3: Write unit tests for response helpers

- [x] Task 2: Implement global error handler middleware (AC: 2, 3)
  - [x] 2.1: Create `packages/backend/src/middlewares/error-handler.middleware.ts`
  - [x] 2.2: Implement error classification (validation, auth, not found, internal)
  - [x] 2.3: Create custom AppError class with code, statusCode, details properties
  - [x] 2.4: Add async handler wrapper to catch Promise rejections
  - [x] 2.5: Write unit tests for error handler middleware

- [x] Task 3: Set up Zod validation middleware (AC: 2, 4)
  - [x] 3.1: Install zod package
  - [x] 3.2: Create `packages/backend/src/middlewares/validate.middleware.ts` for request validation
  - [x] 3.3: Create validation middleware factory: validate(schema) for body, query, params
  - [x] 3.4: Map Zod errors to ValidationError format with field-level details
  - [x] 3.5: Write unit tests for validation middleware

- [x] Task 4: Set up structured logging (AC: 3, 4)
  - [x] 4.1: Install pino and pino-http packages
  - [x] 4.2: Create `packages/backend/src/lib/logger.ts` with configured Pino instance
  - [x] 4.3: Configure log levels (error, warn, info, debug) based on NODE_ENV
  - [x] 4.4: Add request ID generation and tracking
  - [x] 4.5: Create request logging middleware with response time tracking
  - [x] 4.6: Write unit tests for logger configuration

- [x] Task 5: Configure CORS middleware (AC: 4)
  - [x] 5.1: Install cors package
  - [x] 5.2: Create `packages/backend/src/config/cors.ts` with environment-based configuration
  - [x] 5.3: Configure allowed origins (localhost:3000 for dev, production URL for prod)
  - [x] 5.4: Configure allowed methods and headers
  - [x] 5.5: Write integration tests for CORS headers

- [x] Task 6: Integrate all middleware into Express app (AC: 1, 2, 3, 4)
  - [x] 6.1: Update `packages/backend/src/server.ts` with middleware order:
    - CORS → Request logging → JSON body parser → Routes → Error handler
  - [x] 6.2: Update existing auth routes to use new response format
  - [x] 6.3: Update health endpoint to use new response format
  - [x] 6.4: Add not-found handler for undefined routes (404)

- [x] Task 7: Write integration tests (AC: 1, 2, 3, 4)
  - [x] 7.1: Test successful response format on existing endpoints
  - [x] 7.2: Test validation error response with invalid request body
  - [x] 7.3: Test internal error response (mock server error)
  - [x] 7.4: Test CORS headers on preflight and actual requests
  - [x] 7.5: Test 404 response for undefined routes
  - [x] 7.6: Test request ID tracking through request/response cycle

## Dev Notes

### Architecture Requirements (CRITICAL)

**File Structure:**
```
packages/backend/src/
├── config/
│   └── cors.ts              # CORS configuration
├── lib/
│   ├── prisma.ts            # Existing
│   ├── redis.ts             # Existing
│   └── logger.ts            # NEW - Pino logger setup
├── middlewares/
│   ├── auth.middleware.ts   # Existing
│   ├── error-handler.middleware.ts  # NEW
│   └── validate.middleware.ts       # NEW
├── types/
│   ├── express.d.ts         # Existing
│   └── api.ts               # NEW - API response types
├── utils/
│   ├── password.ts          # Existing
│   ├── jwt.ts               # Existing
│   └── api-response.ts      # NEW - Response helpers
└── errors/
    └── app-error.ts         # NEW - Custom error class
```

**API Response Types:**
```typescript
// packages/backend/src/types/api.ts
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ValidationDetail[];
    requestId?: string;
  };
}

interface ValidationDetail {
  field: string;
  message: string;
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
```

**Error Codes (standardized):**
```typescript
enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',  // From auth
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',              // From auth
}
```

**AppError Class:**
```typescript
// packages/backend/src/errors/app-error.ts
class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: ValidationDetail[]
  ) {
    super(message);
    this.name = 'AppError';
  }

  static validation(message: string, details: ValidationDetail[]) {
    return new AppError('VALIDATION_ERROR', message, 400, details);
  }

  static notFound(resource: string) {
    return new AppError('NOT_FOUND', `${resource} not found`, 404);
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError('UNAUTHORIZED', message, 401);
  }

  static forbidden(message = 'Forbidden') {
    return new AppError('FORBIDDEN', message, 403);
  }
}
```

**Middleware Order in server.ts:**
```typescript
// 1. CORS (must be first)
app.use(cors(corsConfig));

// 2. Request ID generation
app.use(requestIdMiddleware);

// 3. Request logging (pino-http)
app.use(requestLogger);

// 4. Body parsing
app.use(express.json({ limit: '10kb' }));

// 5. Routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
// ... other routes

// 6. 404 handler (after all routes)
app.use(notFoundHandler);

// 7. Global error handler (must be last)
app.use(errorHandler);
```

**Zod Validation Example:**
```typescript
// packages/backend/src/middlewares/validate.middleware.ts
import { z, ZodSchema } from 'zod';
import { RequestHandler } from 'express';
import { AppError } from '../errors/app-error';

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export const validate = (schemas: ValidationSchemas): RequestHandler => {
  return (req, res, next) => {
    const errors: ValidationDetail[] = [];

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        errors.push(...mapZodErrors(result.error, 'body'));
      }
    }

    // Similar for query and params

    if (errors.length > 0) {
      throw AppError.validation('Validation failed', errors);
    }

    next();
  };
};
```

**Logger Configuration:**
```typescript
// packages/backend/src/lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty' }
    : undefined,
  redact: ['req.headers.authorization', 'password', 'passwordHash'],
});
```

**CORS Configuration:**
```typescript
// packages/backend/src/config/cors.ts
import { CorsOptions } from 'cors';

const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
  'http://localhost:3000',
  'http://localhost:5173',  // Vite dev server
];

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID'],
};
```

### Previous Story Learnings (Story 0-4)

From Story 0-4 Authentication System implementation:
- Auth controller already returns responses but not in standardized format
- Auth service throws errors that need to be caught by global handler
- Existing error codes: INVALID_CREDENTIALS, TOKEN_EXPIRED
- Express app at `packages/backend/src/server.ts` needs middleware updates
- Auth middleware already handles 401/403 responses - needs format update
- Test coverage: 72 tests passing, 70% threshold enforced

**Files to Update for Response Format:**
- `packages/backend/src/controllers/auth.controller.ts` - Use apiResponse helpers
- `packages/backend/src/middlewares/auth.middleware.ts` - Use AppError
- `packages/backend/src/routes/auth.routes.ts` - May need validation schemas
- `packages/backend/src/health.ts` - Use apiResponse format

### Dependencies to Add

```json
{
  "dependencies": {
    "zod": "^3.22.4",
    "cors": "^2.8.5",
    "pino": "^8.17.2",
    "pino-http": "^9.0.0",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/uuid": "^9.0.7",
    "pino-pretty": "^10.3.1"
  }
}
```

### Environment Variables

```
# Logging
LOG_LEVEL=debug  # debug, info, warn, error

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

### Testing Strategy

**Unit Tests:**
- api-response.ts helpers return correct format
- AppError class creates proper error objects
- validate middleware catches Zod errors and formats them
- error-handler middleware handles different error types
- logger redacts sensitive fields

**Integration Tests:**
- Full request cycle with success response
- Validation error response format
- Internal error response (no stack trace in response)
- CORS preflight requests
- 404 for unknown routes
- Request ID in response headers

**Test Data:**
```typescript
// Validation test schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Test cases
const validBody = { email: 'test@example.com', password: 'password123' };
const invalidBody = { email: 'not-an-email', password: 'short' };
```

### References

- [Source: docs/architecture.md#Code-Quality-Configuration] - ESLint, Prettier config
- [Source: docs/architecture.md#Package.json-Scripts] - Test commands
- [Source: docs/epics.md#Story-0.5] - Acceptance criteria
- [Source: docs/prd.md#Technical-Health-KPIs] - Performance targets
- [Previous Story: docs/sprint-artifacts/0-4-authentication-system.md] - Auth patterns, existing middleware

## Dev Agent Record

### Context Reference

Context loaded from: docs/prd.md, docs/architecture.md, docs/epics.md
Previous story reference: docs/sprint-artifacts/0-4-authentication-system.md

### Agent Model Used

claude-opus-4-5-20251101

### Debug Log References

N/A - All tests passing.

### Completion Notes List

- All 7 tasks completed following red-green-refactor cycle
- 162 tests passing (7 skipped legacy tests)
- TypeScript compiles without errors
- API response format standardized: `{ success: true, data: {...} }` for success, `{ success: false, error: {...} }` for errors
- Global error handler catches AppError, ZodError, and unknown errors
- Request ID tracking implemented with X-Request-ID header
- CORS configured with environment-based origins
- Pino logger with redaction of sensitive fields
- All existing auth endpoints updated to use new response format

### File List

#### New Files Created
- `packages/backend/src/types/api.ts` - API response types and error codes
- `packages/backend/src/utils/api-response.ts` - Response helper functions
- `packages/backend/src/utils/api-response.test.ts` - Unit tests for response helpers
- `packages/backend/src/errors/app-error.ts` - Custom AppError class
- `packages/backend/src/errors/app-error.test.ts` - Unit tests for AppError
- `packages/backend/src/middlewares/error-handler.middleware.ts` - Global error handler and asyncHandler
- `packages/backend/src/middlewares/error-handler.middleware.test.ts` - Unit tests for error handler
- `packages/backend/src/middlewares/validate.middleware.ts` - Zod validation middleware
- `packages/backend/src/middlewares/validate.middleware.test.ts` - Unit tests for validation middleware
- `packages/backend/src/middlewares/request-id.middleware.ts` - Request ID generation
- `packages/backend/src/middlewares/request-logger.middleware.ts` - HTTP request logging
- `packages/backend/src/lib/logger.ts` - Pino logger configuration
- `packages/backend/src/lib/logger.test.ts` - Unit tests for logger
- `packages/backend/src/config/cors.ts` - CORS configuration
- `packages/backend/src/config/cors.test.ts` - Unit tests for CORS config

#### Modified Files
- `packages/backend/package.json` - Added zod, cors, pino, pino-http, uuid dependencies
- `packages/backend/src/server.ts` - Integrated middleware in correct order
- `packages/backend/src/server.test.ts` - Integration tests for server endpoints
- `packages/backend/src/controllers/auth.controller.ts` - Uses new response format
- `packages/backend/src/routes/auth.routes.ts` - Uses asyncHandler wrapper
- `packages/backend/src/routes/auth.routes.test.ts` - Updated for new response format
- `packages/backend/src/middlewares/auth.middleware.ts` - Uses AppError
- `packages/backend/src/middlewares/auth.middleware.test.ts` - Tests AppError handling
- `packages/backend/src/types/express.d.ts` - Added request.id type

