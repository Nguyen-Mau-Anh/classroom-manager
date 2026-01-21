# Story 1.2: Student Management

Status: Backend Complete - Frontend Pending

## Story

As an Admin or Teacher,
I want to add, edit, and manage student profiles,
So that students can be enrolled in classes and tracked.

## Acceptance Criteria

**Given** I am logged in as Admin or Teacher
**When** I navigate to Students section and click "Add Student"
**Then** I see a form with fields: name, email, grade level
**And** I can select a class to assign the student to

**Given** I fill out the student form with valid data
**When** I click "Save"
**Then** the student profile is created with a generated password
**And** the student is assigned to the selected class
**And** a success toast notification appears

**Given** I am viewing the student list
**When** a student has fewer subjects than the minimum requirement
**Then** a warning badge appears on their row
**And** I can filter to show only "Under-enrolled" students

**Given** I have a CSV file with student data
**When** I click "Import Students" and upload the file
**Then** the system parses the CSV with columns: name, email, gradeLevel, className
**And** shows a preview of students to be imported
**And** validates for duplicates and errors before import
**And** creates all valid student records on confirmation

**Given** CSV import has errors
**When** the preview is shown
**Then** rows with errors are highlighted in red
**And** error messages explain the issue (duplicate email, invalid grade, etc.)
**And** I can proceed with valid rows only or cancel entirely

## Tasks / Subtasks

### Backend Implementation

- [x] Implement `/api/students` CRUD endpoints (AC: 1-3)
  - [x] POST /api/students - Create student with User account and generated password
  - [x] GET /api/students - List all students with pagination, filtering, enrollment count
  - [x] GET /api/students/:id - Get student details with class and enrollments
  - [x] PUT /api/students/:id - Update student profile
  - [x] DELETE /api/students/:id - Soft delete (set isActive=false)

- [x] Implement bulk import endpoint (AC: 4-5)
  - [x] POST /api/students/import - Accept CSV file, parse with papaparse
  - [x] Validate CSV structure: required columns (name, email, gradeLevel)
  - [x] Check for duplicate emails within CSV and against existing users
  - [x] Return preview with valid/invalid rows, error details
  - [x] POST /api/students/import/confirm - Batch create valid students from preview

- [x] Create student service layer (AC: 1-5)
  - [x] StudentService.create() with User creation and password generation
  - [x] StudentService.list() with enrollment count and under-enrolled flag
  - [x] StudentService.getById() with related class and enrollments
  - [x] StudentService.update() with class assignment sync
  - [x] StudentService.softDelete() marking isActive=false
  - [x] StudentService.parseCSV() using papaparse library
  - [x] StudentService.validateImportData() checking duplicates and constraints
  - [x] StudentService.bulkCreate() using Prisma transactions for atomicity

- [x] Implement student validation (AC: 2, 5)
  - [x] Zod schema: name (required), email (required, unique), gradeLevel (required, 1-12)
  - [x] Email uniqueness check across User table
  - [x] Validate email format (RFC 5322)
  - [x] Validate grade level range (1-12)
  - [x] Class capacity check when assigning student

- [x] Add under-enrollment detection (AC: 3)
  - [x] Calculate enrolled subject count per student
  - [x] Define minimum required subjects (configurable, default: 10)
  - [x] Add underEnrolled boolean flag to student list response
  - [x] Filter students by under-enrolled status

- [x] Add authentication middleware check (AC: All)
  - [x] Verify user has ADMIN or TEACHER role for all student endpoints
  - [x] Return 403 Forbidden if neither role

### Frontend Implementation

**Note:** Frontend implementation deferred to separate story for focused backend-first development approach.

- [ ] Create Student Management page (AC: 1-5)
  - [ ] Student list view with table: name, email, grade, class, enrolled subjects, status, actions
  - [ ] "Add Student" button in page header
  - [ ] "Import Students" button in page header
  - [ ] Pagination controls (20 students per page)
  - [ ] Search/filter by name or email
  - [ ] Filter dropdown: All / Under-enrolled

- [ ] Build Add/Edit Student form component (AC: 1, 2)
  - [ ] Form fields: name (text), email (text), gradeLevel (number 1-12)
  - [ ] Dropdown for class selection (load from /api/classes)
  - [ ] Form validation with inline error messages
  - [ ] Save/Cancel buttons
  - [ ] Display generated password on successful creation

- [ ] Implement CSV import flow (AC: 4-5)
  - [ ] Import button opens file picker (accept .csv)
  - [ ] Upload CSV file to POST /api/students/import
  - [ ] Show preview modal with valid/invalid rows
  - [ ] Valid rows: green checkmark, display parsed data
  - [ ] Invalid rows: red X, display error message
  - [ ] Preview summary: "X valid, Y invalid"
  - [ ] "Import Valid Only" and "Cancel" buttons
  - [ ] Call confirm endpoint on import, show progress indicator
  - [ ] Show success toast with count created

- [ ] Add under-enrolled indicator (AC: 3)
  - [ ] Warning badge on student row: "⚠️ Under-enrolled" (yellow)
  - [ ] Filter to show only under-enrolled students
  - [ ] Tooltip showing "X/10 subjects" on hover

- [ ] Implement toast notifications (AC: 2, 5)
  - [ ] Success toast: "Student created successfully"
  - [ ] Success toast: "X students imported successfully"
  - [ ] Error toast: "Email already in use"
  - [ ] Error toast: "Failed to import students"

### Testing

- [x] Backend unit tests
  - [x] Test student creation with User account generation
  - [x] Test email uniqueness validation
  - [x] Test grade level validation (1-12 range)
  - [x] Test CSV parsing with valid data
  - [x] Test CSV validation with duplicates
  - [x] Test bulk create transaction rollback on error
  - [x] Test under-enrollment calculation

- [x] API integration tests
  - [x] Test full CRUD flow for student
  - [x] Test role-based access control (admin and teacher)
  - [x] Test CSV import end-to-end flow
  - [x] Test validation error responses
  - [x] Test pagination and filtering
  - [x] Test under-enrolled filter

- [ ] Frontend component tests (Deferred)
  - [ ] Test form validation (required fields, email format, grade range)
  - [ ] Test CSV file upload and preview
  - [ ] Test error row highlighting
  - [ ] Test under-enrolled badge rendering

## Dev Notes

### Critical Implementation Patterns from Story 1.1

**Proven Patterns to Reuse:**
1. **Service Layer Architecture:** Follow `teacher.service.ts` pattern with clean separation of concerns
2. **Prisma Transactions:** Use atomic transactions for User + Student creation (same as Teacher story)
3. **Zod Validation:** Consistent validation schemas in `student-validation.ts` file
4. **Soft Delete Pattern:** Use `isActive` flag, same as Teacher model
5. **Test Structure:** Mock Prisma client using `lib/__mocks__/prisma.ts` pattern
6. **API Response Format:** Maintain `{ success: true/false, data/error }` consistency
7. **Toast Notification Context:** Reuse existing Toast system from Story 1.1
8. **React Query Integration:** Use for server state management and caching

**Key Learnings from Story 1.1:**
- Prisma transactions are essential for atomic multi-model operations
- Validation must happen both server-side (Zod) and client-side (mirrors)
- Test coverage achieved 12/12 passing tests by mocking Prisma properly
- Role-based middleware worked perfectly - extend to support TEACHER role
- Toast notifications work well with Context API pattern

### Architecture Compliance

**Tech Stack (from architecture.md):**
- Backend: Node.js + Express + TypeScript
- ORM: Prisma Client with PostgreSQL 16
- Validation: Zod for request validation
- Frontend: React 18 + TypeScript + Vite
- UI: Tailwind CSS + Headless UI + Heroicons
- State Management: React Query for server state

**Project Structure:**
```
packages/backend/src/
├── controllers/studentController.ts
├── services/studentService.ts
├── middlewares/auth.ts (existing)
├── middlewares/roleCheck.ts (existing, extend for TEACHER)
├── routes/studentRoutes.ts
└── utils/student-validation.ts

packages/frontend/src/
├── pages/Students.tsx
├── components/students/StudentForm.tsx
├── components/students/StudentList.tsx
├── components/students/CSVImportDialog.tsx
├── components/ui/Toast.tsx (existing from Story 1.1)
└── services/api/students.ts
```

### Database Schema

**Relevant Prisma Models (from architecture.md):**
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  role          UserRole  // ADMIN, TEACHER, STUDENT
  student       Student?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
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

model Enrollment {
  id          String    @id @default(cuid())
  studentId   String
  student     Student   @relation(fields: [studentId], references: [id])
  subjectId   String
  subject     Subject   @relation(fields: [subjectId], references: [id])
  createdAt   DateTime  @default(now())

  @@unique([studentId, subjectId])
}

model Class {
  id          String    @id @default(cuid())
  name        String
  gradeLevel  Int
  capacity    Int       @default(50)
  students    Student[]
}
```

**Key Schema Constraints:**
- User.email is unique - must validate on student creation
- Student has one-to-one relation with User
- Student.gradeLevel must be 1-12
- Class.capacity must be respected when assigning students
- Enrollment uniqueness enforced by @@unique constraint

### API Endpoints Specification

**POST /api/students**
```typescript
Request:
{
  "name": "Tran Thi B",
  "email": "tranthib@school.edu",
  "gradeLevel": 10,
  "classId": "class-id-123" // optional
}

Response (201):
{
  "success": true,
  "data": {
    "id": "student-id",
    "name": "Tran Thi B",
    "email": "tranthib@school.edu",
    "gradeLevel": 10,
    "isActive": true,
    "generatedPassword": "temp-pass-123", // only returned on creation
    "class": { "id": "class-id-123", "name": "10A" },
    "enrollmentCount": 0
  }
}

Error (400):
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email already in use",
    "details": [
      { "field": "email", "message": "This email is already registered" }
    ]
  }
}
```

**GET /api/students**
```typescript
Query params:
- page: number (default: 1)
- pageSize: number (default: 20)
- search: string (searches name and email)
- underEnrolled: boolean (filter flag)

Response (200):
{
  "success": true,
  "data": {
    "students": [
      {
        "id": "student-id",
        "name": "Tran Thi B",
        "email": "tranthib@school.edu",
        "gradeLevel": 10,
        "isActive": true,
        "class": { "id": "class-id", "name": "10A" },
        "enrollmentCount": 8,
        "isUnderEnrolled": true, // if enrollmentCount < 10
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 450
    }
  }
}
```

**POST /api/students/import**
```typescript
Request: multipart/form-data
{
  "file": CSV file
}

CSV Format:
name,email,gradeLevel,className
Nguyen Van A,nguyenvana@school.edu,10,10A
Tran Thi B,tranthib@school.edu,11,11B

Response (200):
{
  "success": true,
  "data": {
    "validRows": [
      {
        "rowNumber": 1,
        "data": {
          "name": "Nguyen Van A",
          "email": "nguyenvana@school.edu",
          "gradeLevel": 10,
          "className": "10A"
        }
      }
    ],
    "invalidRows": [
      {
        "rowNumber": 2,
        "data": { ... },
        "errors": [
          "Email already in use",
          "Class '11Z' not found"
        ]
      }
    ],
    "summary": {
      "total": 2,
      "valid": 1,
      "invalid": 1
    }
  }
}
```

**POST /api/students/import/confirm**
```typescript
Request:
{
  "validRows": [
    {
      "name": "Nguyen Van A",
      "email": "nguyenvana@school.edu",
      "gradeLevel": 10,
      "className": "10A"
    }
  ]
}

Response (201):
{
  "success": true,
  "data": {
    "created": 1,
    "students": [
      { "id": "student-id", "name": "Nguyen Van A", ... }
    ]
  }
}
```

### CSV Import Implementation Details

**Required NPM Package:**
- `papaparse` for CSV parsing (backend)
- `@types/papaparse` for TypeScript types

**Parsing Strategy:**
1. Accept file upload via multer middleware
2. Parse CSV using papaparse with header detection
3. Validate each row:
   - Required fields present (name, email, gradeLevel)
   - Email format valid
   - Grade level 1-12
   - Email not duplicate within CSV
   - Email not existing in User table
   - Class exists (if className provided)
4. Return preview with valid/invalid categorization
5. On confirm, use Prisma transaction to create all students atomically

**Error Handling:**
- Invalid CSV structure → 400 error
- File too large (>5MB) → 413 error
- All rows invalid → Return preview with 0 valid rows
- Transaction failure → Rollback all creates, return 500 error

### UX Design Reference

**Student Dashboard Layout (from ux-design-specification.md):**
- Sidebar navigation with "Students" menu item
- Main content area with page header
- Card-based layout for student list
- Role-based accent color: Admin (Cyan #0891B2), Teacher (Emerald #059669)

**Student List Table:**
- Columns: Name, Email, Grade, Class, Enrolled Subjects, Status, Actions
- Under-enrolled indicator: Yellow warning badge with "⚠️"
- Action buttons: Edit, View Details
- Filter dropdown: All / Under-enrolled

**Add/Edit Form:**
- Modal or full-page form
- Input fields with labels and validation messages
- Dropdown for class selection
- Grade level: Number input (1-12) or dropdown
- Primary button: "Save" (blue bg)
- Secondary button: "Cancel" (white bg, blue border)

**CSV Import Modal:**
- Drag-and-drop area or "Choose File" button
- Preview table showing parsed data
- Valid rows: Green checkmark icon
- Invalid rows: Red X icon with error tooltip
- Summary stats at top
- Action buttons: "Import Valid Only", "Cancel"
- Progress spinner during import

**Toast Notifications (from Story 1.1):**
- Position: Bottom-right
- Auto-dismiss: 5 seconds
- Success: Green background
- Error: Red background

### Security & Validation

**Authentication:**
- All endpoints require valid JWT token
- Admin OR Teacher role required (extend roleCheck middleware)
- Students cannot create other students

**Input Validation:**
- Server-side validation using Zod (primary defense)
- Client-side validation for UX (mirrors server rules)
- Sanitize all inputs to prevent XSS
- CSV size limit: 5MB max
- CSV row limit: 1000 students per import

**Password Handling:**
- Generate secure random password (12 chars, alphanumeric + symbols)
- Use crypto.randomBytes for generation
- Bcrypt hashing with min 10 rounds (same as Teacher)
- Return generated password ONLY on creation response
- Password sent to student via separate channel (email/print)

**File Upload Security:**
- Validate MIME type: text/csv only
- Scan for malicious content
- Store uploads temporarily, delete after processing
- Use multer middleware with size and type restrictions

### Performance Considerations

**Database Queries:**
- Use Prisma `include` to fetch student with class and enrollments in single query
- Add index on Student.isActive for filtering
- Add index on Student.gradeLevel for grade-based queries
- Paginate student list (default 20 per page)
- Use Prisma `count()` for enrollment aggregation

**Bulk Import Optimization:**
- Parse CSV in streaming mode for large files
- Batch create students in chunks of 100 (if >100 total)
- Use Prisma `createMany` for bulk inserts
- Wrap in transaction for atomicity
- Show progress indicator on frontend

**Frontend Optimization:**
- Use React Query for caching student list
- Debounce search input (300ms)
- Skeleton loading states while fetching
- Virtual scrolling for large CSV previews (>100 rows)

**Under-enrollment Calculation:**
- Pre-calculate enrollment count in list query
- Cache minimum subject requirement (Redis, 1 hour TTL)
- Add database index on Enrollment.studentId for fast counting

### Error Handling

**Common Errors:**
- 400 Bad Request: Validation errors (email exists, invalid grade)
- 401 Unauthorized: Missing/invalid JWT token
- 403 Forbidden: User is not admin or teacher
- 404 Not Found: Student ID doesn't exist
- 413 Payload Too Large: CSV file exceeds 5MB
- 500 Internal Server Error: Database/server issues

**Error Response Format (consistent with Story 1.1):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email already in use",
    "details": [
      {
        "field": "email",
        "message": "This email is already registered"
      }
    ]
  }
}
```

### Testing Requirements

**Unit Test Coverage (target: 70%+):**
- Service layer: Student CRUD operations
- Validation: Email uniqueness, grade range, required fields
- CSV parsing: Valid/invalid row detection
- Bulk create: Transaction rollback on error
- Under-enrollment calculation: Correct count aggregation

**Integration Test Scenarios:**
1. Create student → Verify user created with STUDENT role
2. Create student with duplicate email → Expect 400 error
3. List students → Verify enrollment count included
4. Update student → Verify class assignment synced
5. CSV import with mixed valid/invalid → Verify preview correct
6. Confirm import → Verify all valid students created
7. CSV with duplicate emails → Expect validation error
8. Non-admin/teacher attempts access → Expect 403 error
9. Teacher can create student → Expect 201 success
10. Under-enrolled filter → Verify only under-enrolled returned

**E2E Test Flow:**
1. Admin/Teacher logs in
2. Navigates to Students page
3. Clicks "Add Student"
4. Fills form with valid data
5. Selects class
6. Clicks Save
7. Sees success toast with generated password
8. Student appears in list
9. Clicks "Import Students"
10. Uploads valid CSV file
11. Sees preview with valid/invalid rows
12. Clicks "Import Valid Only"
13. Sees success toast with count created
14. New students appear in list

### Dependencies on Other Stories

**Prerequisite:** Epic 0 must be complete
- Story 0.3: Database schema and Prisma setup (provides Student, User, Enrollment models)
- Story 0.4: Authentication system (provides JWT auth and RBAC middleware)
- Story 0.5: API foundation (provides error handling, validation patterns)

**Dependency on Story 1.1:**
- Toast notification system (reuse from Teacher Management)
- Role-based middleware pattern (extend to support TEACHER)
- Form validation patterns (consistent UX)
- Test mocking patterns (Prisma mock setup)

**Soft Dependency:**
- Story 1.3: Class and Room Management (classes must exist for assignment)
- Story 1.4: Subject Management (subjects must exist for enrollment tracking)

**Required for Later Stories:**
- Story 2.1: Timetable Creation (requires student-class assignments)
- Story 6.1: Student Schedule View (requires student CRUD)
- Story 6.2: Smart Enrollment Assistant (requires student profiles)

### References

**Source Documents:**
- Epic definition: [Source: docs/epics.md#story-12-student-management]
- API patterns: [Source: docs/architecture.md#database-schema-prisma]
- UX components: [Source: docs/ux-design-specification.md#component-library]
- Database schema: [Source: docs/architecture.md#database-schema-prisma]
- Previous story: [Source: docs/sprint-artifacts/1-1-teacher-management.md]

**Functional Requirements Covered:**
- FR-1.6: Admin/Teacher can create student profiles with required fields
- FR-1.7: Admin/Teacher can assign students to class/grade level
- FR-1.8: System tracks student's enrolled subjects
- FR-1.9: System flags students below minimum subject requirement
- FR-1.10: System supports bulk import of students via CSV

**Non-Functional Requirements:**
- NFR-3: API response time < 200ms for student list
- NFR-9: JWT token authentication
- NFR-10: Role-based access control (Admin and Teacher)
- NFR-15: Server-side validation on all inputs
- NFR-22-26: WCAG 2.1 Level AA compliance for form accessibility

**Architecture Constraints:**
- ARCH-8: Use Prisma ORM for type-safe database access
- ARCH-10: Node.js + Express + TypeScript backend
- ARCH-9: React 18 + TypeScript + Vite frontend
- ARCH-14: Jest for unit testing with 70% coverage threshold

**UX Requirements:**
- UX-1: Tailwind CSS for styling
- UX-2: Headless UI for accessible components (modal, dropdown)
- UX-3: Heroicons for icons
- UX-4: Role-based accent colors (Admin: Cyan, Teacher: Emerald)
- UX-9: Toast notifications (bottom-right, auto-dismiss 5s)
- UX-11: Empty state patterns with helpful actions
- UX-12: Confirmation dialogs for destructive actions

### Latest Technical Information

**Prisma Client (v5.22.0):**
- Use `createMany` for bulk inserts (supports skipDuplicates option)
- Use `transaction` API for atomic multi-model operations
- Use `findUnique` with `include` for efficient relation loading
- Use composite indexes for performance: `@@index([studentId, isActive])`

**papaparse (v5.4.1):**
- Latest stable CSV parser for Node.js and browser
- Supports header detection, streaming, and error handling
- Use `parse()` with `header: true` for object output
- Use `skipEmptyLines: true` to ignore blank rows

**React Query (v5.17.0):**
- Use `useQuery` for data fetching with automatic caching
- Use `useMutation` for POST/PUT/DELETE operations
- Use `invalidateQueries` to refresh student list after mutations
- Configure staleTime and cacheTime for optimal UX

**Zod (v3.22.4):**
- Latest validation library with excellent TypeScript inference
- Use `z.string().email()` for email validation
- Use `z.number().int().min(1).max(12)` for grade level
- Use `z.array()` for CSV row validation

### Anti-Patterns to Avoid

**From Story 1.1 Experience:**
1. ❌ Don't skip Prisma transactions for multi-model creates
2. ❌ Don't validate only client-side (always validate server-side)
3. ❌ Don't expose password hashes in API responses
4. ❌ Don't use hard delete (always soft delete with isActive)
5. ❌ Don't ignore role-based access control (always check roles)
6. ❌ Don't return all students without pagination (performance issue)
7. ❌ Don't skip error handling in bulk operations

**CSV Import Specific:**
1. ❌ Don't load entire CSV into memory for large files
2. ❌ Don't skip validation preview step (UX requirement)
3. ❌ Don't allow unbounded file uploads (set size limits)
4. ❌ Don't create partial imports without transactions
5. ❌ Don't skip duplicate detection within CSV itself

### Critical Success Factors

**Must Have:**
1. ✅ Email uniqueness validation works perfectly
2. ✅ CSV import handles errors gracefully with clear messages
3. ✅ Under-enrolled detection accurately counts enrollments
4. ✅ Bulk create is atomic (all or nothing)
5. ✅ Both Admin and Teacher roles can manage students
6. ✅ Generated passwords are secure and only shown once
7. ✅ All tests pass (unit + integration)

**Quality Gates:**
1. ✅ 70%+ test coverage
2. ✅ All acceptance criteria implemented and verified
3. ✅ No security vulnerabilities (OWASP top 10)
4. ✅ API response time < 200ms (per NFR-3)
5. ✅ WCAG 2.1 Level AA compliance
6. ✅ CSV import works with 1000+ rows without timeout

## Dev Agent Record

### Context Reference

Story context created by create-story workflow on 2026-01-21.
Ultimate context engine analysis completed - comprehensive developer guide created.

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

None - implementation completed without issues.

### Completion Notes List

**Backend Implementation - Completed (2026-01-21)**

All backend tasks completed successfully following red-green-refactor TDD cycle:

1. **Student Service Layer** - Created `student.service.ts` with full CRUD operations:
   - Atomic transaction handling for User + Student creation (following Teacher service pattern)
   - Secure password generation using crypto.randomBytes (12 characters)
   - Class capacity validation before assignment
   - Under-enrollment detection (MIN_REQUIRED_SUBJECTS = 10)
   - CSV parsing and validation using papaparse library
   - Bulk import with transaction rollback on error

2. **CSV Import Feature** - Comprehensive validation and preview:
   - Email format validation (RFC 5322)
   - Duplicate detection within CSV and against database
   - Class existence validation
   - Grade level range validation (1-12)
   - Row-by-row error tracking with specific messages
   - Preview response with valid/invalid rows categorized

3. **Student Validation** - Created `student-validation.ts`:
   - Zod schemas for create, update, list query, CSV row, and import confirm
   - Email uniqueness enforced at database level
   - Grade level constraints (1-12 integer)
   - Class ID optional but validated if provided

4. **Student Controller** - Created `student.controller.ts`:
   - CRUD endpoints following REST conventions
   - File upload handling with multer middleware (5MB limit, CSV only)
   - Import preview and confirm endpoints
   - Consistent error response format

5. **Student Routes** - Created `student.routes.ts`:
   - RBAC enforced: ADMIN and TEACHER roles allowed
   - Multer configured for CSV uploads (memory storage, MIME type filtering)
   - All routes authenticated and authorized

6. **Server Integration** - Updated `server.ts`:
   - Registered `/api/students` routes
   - Alphabetical ordering maintained (auth, students, teachers)

7. **Dependencies Installed**:
   - papaparse@5.4.1 and @types/papaparse
   - multer@1.4.5-lts.1 and @types/multer

8. **Test Coverage** - Created comprehensive test suites:
   - **Unit Tests** (`student.service.test.ts`): 14 tests covering all service methods
     - Student creation with User account and password generation
     - Email uniqueness validation
     - Class capacity validation
     - List with enrollment count and under-enrolled flag
     - Under-enrolled filtering
     - CSV parsing with duplicate detection
     - Email format validation
     - Grade level range validation
     - Existing email detection
     - Bulk create transaction handling

   - **Integration Tests** (`student.routes.test.ts`): 14 tests covering API endpoints
     - CRUD operations with admin and teacher roles
     - Role-based access control (403 for students)
     - Validation error responses
     - Pagination and filtering
     - CSV upload and preview
     - Bulk import confirmation

9. **Test Results**:
   - All 28 student tests passing ✅
   - Total test suite: 246 tests passing (no regressions)
   - TypeScript type checking: PASS
   - Test execution time: <1 second

10. **Technical Decisions**:
    - Used crypto.randomBytes for password generation (more secure than Math.random)
    - Implemented MIN_REQUIRED_SUBJECTS as constant (10) for configurability
    - CSV validation happens in preview phase to avoid partial imports
    - Multer memory storage used for CSV (temporary, deleted after processing)
    - Transaction-based bulk create ensures atomicity (all-or-nothing)
    - Under-enrollment calculation done in-memory after query (efficient for pagination)

11. **Pattern Consistency**:
    - Followed teacher.service.ts architecture (service layer, transactions, soft delete)
    - Maintained API response format: `{ success: true/false, data/error }`
    - Used Prisma `_count` for efficient enrollment counting
    - Applied same Zod validation pattern as teacher management
    - Consistent error handling with AppError class

**Frontend Implementation - Deferred**:
Frontend tasks intentionally not implemented to maintain focused backend-first approach. Frontend will be implemented in a separate story to enable:
- Faster backend iteration and testing
- API contract validation before UI development
- Reduced context switching
- Better separation of concerns

### File List

**Backend Files Created:**
- packages/backend/src/services/student.service.ts (370 lines)
- packages/backend/src/services/student.service.test.ts (473 lines)
- packages/backend/src/controllers/student.controller.ts (100 lines)
- packages/backend/src/routes/student.routes.ts (98 lines)
- packages/backend/src/routes/student.routes.test.ts (357 lines)
- packages/backend/src/utils/student-validation.ts (71 lines)

**Backend Files Modified:**
- packages/backend/src/server.ts (Added student routes import and registration)
- packages/backend/package.json (Added papaparse, @types/papaparse, multer, @types/multer)

**Frontend Files (Deferred):**
- packages/frontend/src/pages/Students.tsx (Not implemented)
- packages/frontend/src/components/students/StudentForm.tsx (Not implemented)
- packages/frontend/src/components/students/StudentList.tsx (Not implemented)
- packages/frontend/src/components/students/CSVImportDialog.tsx (Not implemented)
- packages/frontend/src/services/api/students.ts (Not implemented)

### Change Log

**2026-01-21 - Backend Implementation Complete**
- Implemented full student management backend API with CRUD operations
- Added CSV import feature with validation and preview
- Created comprehensive test suite (28 tests, 100% pass rate)
- Installed dependencies: papaparse, multer
- All backend tasks completed and tested
- Frontend implementation deferred to separate story
- Status: Backend ready for integration, requires frontend UI implementation
