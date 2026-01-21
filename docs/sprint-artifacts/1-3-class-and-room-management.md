# Story 1.3: Class and Room Management

Status: ready-for-dev

## Story

As an Admin,
I want to manage classes and rooms with their capacities,
So that scheduling can respect physical constraints.

## Acceptance Criteria

**Given** I am logged in as Admin
**When** I navigate to Classes section and click "Add Class"
**Then** I see a form with fields: name, grade level, capacity
**And** I can optionally assign a default room

**Given** I create a class
**When** enrollment reaches capacity
**Then** new enrollment attempts show "Class Full" message
**And** a waitlist is automatically created for the class
**And** students can join the waitlist

**Given** I am logged in as Admin
**When** I navigate to Rooms section and click "Add Room"
**Then** I see a form with fields: name, capacity, type
**And** type is a dropdown with options: classroom, lab, gym

**Given** a room is assigned to a time slot
**When** another class tries to book the same room at the same time
**Then** the scheduling interface shows "Room Unavailable"
**And** suggests alternative available rooms

**Given** I view the Rooms list
**When** I click on a room
**Then** I see its weekly schedule showing all time slots using that room

## Tasks / Subtasks

### Backend Implementation

- [x] Add Waitlist model to Prisma schema (AC: 2)
  - [x] Define Waitlist model with fields: id, classId, studentId, position, createdAt
  - [x] Add unique constraint on classId + studentId
  - [x] Add index on classId + position for performance
  - [x] Create migration file

- [x] Implement `/api/classes` CRUD endpoints (AC: 1, 2)
  - [x] POST /api/classes - Create class with validation
  - [x] GET /api/classes - List classes with pagination, filtering
  - [x] GET /api/classes/:id - Get class details with students and enrollment count
  - [x] PUT /api/classes/:id - Update class
  - [x] DELETE /api/classes/:id - Soft delete (if isActive field added)
  - [x] GET /api/classes/:id/waitlist - Get waitlist for class

- [x] Implement `/api/rooms` CRUD endpoints (AC: 3, 5)
  - [x] POST /api/rooms - Create room with type validation
  - [x] GET /api/rooms - List rooms with pagination and type filtering
  - [x] GET /api/rooms/:id - Get room details
  - [x] PUT /api/rooms/:id - Update room
  - [x] DELETE /api/rooms/:id - Soft delete (if isActive field added)
  - [x] GET /api/rooms/:id/schedule - Get room's weekly schedule

- [x] Create ClassService layer (AC: 1, 2)
  - [x] ClassService.create() - Validate and create class
  - [x] ClassService.list() - Paginated list with enrollment count
  - [x] ClassService.getById() - Fetch with students and waitlist
  - [x] ClassService.update() - Update class details
  - [x] ClassService.isClassFull() - Check if enrollment reached capacity
  - [x] ClassService.addToWaitlist() - Auto-create waitlist entry when full
  - [x] ClassService.getWaitlist() - Get ordered waitlist

- [x] Create RoomService layer (AC: 3, 5)
  - [x] RoomService.create() - Validate type and create room
  - [x] RoomService.list() - Paginated list with utilization stats
  - [x] RoomService.getById() - Fetch room details
  - [x] RoomService.update() - Update room details
  - [x] RoomService.getRoomSchedule() - Calculate weekly schedule
  - [x] RoomService.validateRoomCapacity() - Ensure room capacity ≥ class capacity

- [x] Implement validation schemas (AC: 1, 3)
  - [x] CreateClassSchema (name, gradeLevel 1-12, capacity, roomId optional)
  - [x] CreateRoomSchema (name, capacity, type enum: classroom/lab/gym)
  - [x] UpdateClassSchema
  - [x] UpdateRoomSchema
  - [x] Query validation for pagination and filtering

- [x] Add authentication and authorization middleware (AC: All)
  - [x] Verify user has ADMIN role for all class/room endpoints
  - [x] Return 403 Forbidden if not admin

### Frontend Implementation

- [ ] Create Classes Management page (AC: 1, 2)
  - [ ] Classes list view with table: name, grade, capacity, enrolled, waitlist, actions
  - [ ] "Add Class" button in page header (cyan admin accent)
  - [ ] Pagination controls
  - [ ] Filter by grade level
  - [ ] Search by class name

- [ ] Build Add/Edit Class form component (AC: 1, 2)
  - [ ] Modal-based form (500px width)
  - [ ] Form fields: name, gradeLevel (dropdown 1-12), capacity (number input)
  - [ ] Optional room assignment dropdown
  - [ ] Form validation with inline error messages
  - [ ] Save/Cancel buttons
  - [ ] Display "Class Full" badge when enrollment = capacity
  - [ ] Show waitlist count if exists

- [ ] Create Rooms Management page (AC: 3, 5)
  - [ ] Rooms list view with table: name, type, capacity, booked slots, actions
  - [ ] "Add Room" button in page header
  - [ ] Pagination controls
  - [ ] Filter by room type
  - [ ] Search by room name

- [ ] Build Add/Edit Room form component (AC: 3)
  - [ ] Modal-based form (500px width)
  - [ ] Form fields: name, capacity (number input), type (radio buttons or dropdown)
  - [ ] Room type options: Classroom (blue), Lab (purple), Gym (green)
  - [ ] Form validation with inline error messages
  - [ ] Save/Cancel buttons

- [ ] Implement Room Schedule view (AC: 5)
  - [ ] Weekly grid showing time slots
  - [ ] Days as columns, time slots as rows
  - [ ] Booked slots show: class name, subject, teacher
  - [ ] Free slots shown as empty or "Available"
  - [ ] Week navigation (prev/next arrows + today button)

- [ ] Add capacity and booking indicators (AC: 2, 4)
  - [ ] Class capacity status badges: Available (green), Limited (yellow), Full (red)
  - [ ] Waitlist indicator with student count
  - [ ] Room utilization progress bars (percentage booked per day/week)
  - [ ] Conflict warning messages for room double-booking

- [ ] Implement toast notifications (AC: All)
  - [ ] Success toast: "Class created successfully"
  - [ ] Success toast: "Room created successfully"
  - [ ] Error toast: "Room capacity insufficient for class"
  - [ ] Error toast: "Room already booked at this time"

### Testing

- [x] Backend unit tests
  - [x] Test class creation with valid data
  - [x] Test class capacity validation (1-500 range)
  - [x] Test grade level validation (1-12 range)
  - [x] Test room type validation (classroom/lab/gym only)
  - [x] Test isClassFull() logic
  - [x] Test waitlist auto-creation when class is full
  - [x] Test room capacity validation (room ≥ class capacity)
  - [x] Test room schedule calculation

- [ ] API integration tests
  - [ ] Test full CRUD flow for classes
  - [ ] Test full CRUD flow for rooms
  - [ ] Test role-based access control (admin only)
  - [ ] Test pagination and filtering
  - [ ] Test waitlist endpoint returns ordered list
  - [ ] Test room schedule endpoint returns correct time slots

- [ ] Frontend component tests
  - [ ] Test form validation (required fields, range checks)
  - [ ] Test capacity indicator renders correctly
  - [ ] Test waitlist display when class is full
  - [ ] Test room type badges with correct colors
  - [ ] Test weekly schedule grid rendering

## Dev Notes

### Critical Implementation Patterns from Previous Stories

**Proven Patterns to Reuse:**
1. **Service Layer Architecture:** Follow teacher.service.ts and student.service.ts patterns
2. **Prisma Transactions:** Use atomic transactions when creating related entities
3. **Zod Validation:** Consistent validation schemas in separate validation files
4. **API Response Format:** Maintain `{ success: true/false, data/error }` consistency
5. **Toast Notification Context:** Reuse existing Toast system
6. **React Query Integration:** Use for server state management and caching
7. **Modal Pattern:** Use Headless UI Dialog component from previous stories

**Key Learnings from Stories 1.1 and 1.2:**
- Pagination is essential for large lists (default 20 per page)
- Soft delete pattern works well (isActive flag)
- Role-based middleware must be applied to all admin routes
- Test coverage target: 70%+ with comprehensive unit and integration tests
- Client-side validation mirrors server-side rules for better UX
- Enumeration fields (like room type) must be validated with Zod enums

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
├── controllers/classController.ts (new)
├── controllers/roomController.ts (new)
├── services/classService.ts (new)
├── services/roomService.ts (new)
├── middlewares/auth.ts (existing)
├── middlewares/roleCheck.ts (existing)
├── routes/classRoutes.ts (new)
├── routes/roomRoutes.ts (new)
└── utils/class-validation.ts (new)
└── utils/room-validation.ts (new)

packages/frontend/src/
├── pages/Classes.tsx (new)
├── pages/Rooms.tsx (new)
├── components/classes/ClassForm.tsx (new)
├── components/classes/ClassList.tsx (new)
├── components/rooms/RoomForm.tsx (new)
├── components/rooms/RoomList.tsx (new)
├── components/rooms/RoomSchedule.tsx (new)
└── services/api/classes.ts (new)
└── services/api/rooms.ts (new)
```

### Database Schema

**CRITICAL: Waitlist Model Required**

The architecture document does NOT include a Waitlist model, but AC-2 requires waitlist functionality. Add this to Prisma schema:

```prisma
model Waitlist {
  id          String    @id @default(cuid())
  classId     String
  class       Class     @relation(fields: [classId], references: [id])
  studentId   String
  student     Student   @relation(fields: [studentId], references: [id])
  position    Int       // Queue position
  createdAt   DateTime  @default(now())

  @@unique([classId, studentId])
  @@index([classId, position])
}
```

**Existing Models (from architecture.md):**

```prisma
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
  waitlists   Waitlist[] // Add this relation
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
```

**Database Indexes (Required for Performance):**
- Classes: Index on gradeLevel, roomId
- Rooms: Index on type
- Waitlist: Composite index on classId + position

### API Endpoints Specification

**POST /api/classes**
```typescript
Request:
{
  "name": "10A Biology",
  "gradeLevel": 10,
  "capacity": 35,
  "roomId": "room-id-123" // optional
}

Response (201):
{
  "success": true,
  "data": {
    "id": "class-xyz",
    "name": "10A Biology",
    "gradeLevel": 10,
    "capacity": 35,
    "roomId": "room-id-123",
    "createdAt": "2026-01-22T10:00:00Z"
  }
}

Errors:
- 400: Invalid grade level (must be 1-12)
- 400: Capacity out of range (must be 1-500)
- 404: Room not found
- 409: Class name already exists for this grade
```

**GET /api/classes**
```typescript
Query params:
- page: number (default: 1)
- pageSize: number (default: 20)
- gradeLevel: number (optional filter)
- search: string (optional, searches name)

Response (200):
{
  "success": true,
  "data": {
    "classes": [
      {
        "id": "class-xyz",
        "name": "10A Biology",
        "gradeLevel": 10,
        "capacity": 35,
        "enrollmentCount": 28,
        "enrollmentPercentage": 80,
        "waitlistCount": 0,
        "room": { "id": "room-123", "name": "Lab 2" }
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 150
    }
  }
}
```

**GET /api/classes/:id/waitlist**
```typescript
Response (200):
{
  "success": true,
  "data": {
    "classId": "class-xyz",
    "isFull": true,
    "capacity": 35,
    "enrolled": 35,
    "waitlistCount": 5,
    "waitlist": [
      {
        "position": 1,
        "studentId": "student-101",
        "studentName": "Tran Thi B",
        "joinedAt": "2026-01-20T14:30:00Z"
      }
    ]
  }
}
```

**POST /api/rooms**
```typescript
Request:
{
  "name": "Biology Lab 2",
  "capacity": 40,
  "type": "lab"  // MUST be one of: "classroom", "lab", "gym"
}

Response (201):
{
  "success": true,
  "data": {
    "id": "room-123",
    "name": "Biology Lab 2",
    "capacity": 40,
    "type": "lab",
    "createdAt": "2026-01-22T10:00:00Z"
  }
}

Errors:
- 400: Invalid type (must be classroom, lab, or gym)
- 400: Capacity out of range (must be 1-1000)
```

**GET /api/rooms/:id/schedule**
```typescript
Query params:
- week: ISO date string (optional, defaults to current week)

Response (200):
{
  "success": true,
  "data": {
    "roomId": "room-123",
    "roomName": "Lab 2",
    "week": "2026-01-20",
    "schedule": [
      {
        "dayOfWeek": 1,
        "dayName": "Monday",
        "slots": [
          {
            "startTime": "08:00",
            "endTime": "09:30",
            "class": "10A Biology",
            "subject": "Biology",
            "teacher": "Mr. Tuan",
            "status": "SCHEDULED"
          }
        ]
      }
    ]
  }
}
```

### Business Logic: Waitlist Implementation

**Automatic Waitlist Creation Logic:**

```typescript
async function addStudentToClass(classId: string, studentId: string) {
  const classData = await prisma.class.findUnique({
    where: { id: classId },
    include: { students: true }
  });

  // Check if class is full
  if (classData.students.length >= classData.capacity) {
    // Get next waitlist position
    const maxPosition = await prisma.waitlist.findFirst({
      where: { classId },
      orderBy: { position: 'desc' },
      select: { position: true }
    });

    // Create waitlist entry
    await prisma.waitlist.create({
      data: {
        classId,
        studentId,
        position: (maxPosition?.position ?? 0) + 1
      }
    });

    return {
      success: false,
      message: 'Class full, added to waitlist',
      waitlistPosition: (maxPosition?.position ?? 0) + 1
    };
  }

  // Normal enrollment
  await prisma.enrollment.create({
    data: { classId, studentId }
  });

  return { success: true };
}
```

### UX Design Reference

**Admin Accent Color:** Cyan #0891B2
- Use for admin-specific buttons, active menu items, primary actions

**Classes List Layout:**
- Table columns: Name, Grade, Capacity, Enrolled, Waitlist, Actions
- Action buttons: Edit, Delete, View Schedule, View Waitlist
- Capacity indicator colors:
  - Green (<80%): "Places Available"
  - Yellow (80-100%): "Spaces Limited"
  - Red (100%): "Class Full"
- Waitlist badge: Yellow #CA8A04 with count

**Rooms List Layout:**
- Table columns: Name, Type, Capacity, Booked Slots, Actions
- Room type badges with colors:
  - Classroom: Blue #2563EB
  - Lab: Purple #7C3AED
  - Gym: Green #16A34A
- Utilization bars showing weekly booking percentage

**Form Modal Specifications:**
- Modal width: 500px (desktop), full-screen (mobile)
- Animation: Fade + slide up (200ms)
- Close: ESC key, backdrop click, or X button
- Focus trap: Tab navigation stays within modal
- Required fields marked with asterisk (*)
- Validation errors shown in red below field

**Room Schedule Weekly Grid:**
- Days as columns, time slots as rows
- Booked slots show class name, subject, teacher
- Free slots shown as "Available" with green background
- Week navigation with prev/next arrows
- "Today" button returns to current week

### Validation Rules

**Class Validation:**
- name: string, min 1, max 100 characters
- gradeLevel: integer, range 1-12
- capacity: integer, range 1-500
- roomId: optional string (if provided, room must exist)

**Room Validation:**
- name: string, min 1, max 100 characters
- capacity: integer, range 1-1000
- type: enum, exactly one of: "classroom", "lab", "gym"

**Room Capacity Constraint:**
- When assigning room to class: room.capacity must be ≥ class.capacity
- Error message: "Room capacity (40) insufficient for class enrollment (45)"

### Security & Performance

**Authentication:**
- All endpoints require valid JWT token
- ADMIN role required for all create/update/delete operations
- Students and Teachers can view class lists (read-only)

**Performance Requirements:**
- API response time < 200ms (per NFR-3)
- Implement database indexes on frequently queried fields
- Paginate class/room lists (default 20 per page)
- Cache room schedule calculations (Redis, 5-minute TTL)

**Input Sanitization:**
- Validate all inputs with Zod (server-side primary defense)
- Client-side validation for UX (mirrors server rules)
- Sanitize inputs to prevent XSS attacks
- Use Prisma parameterized queries only (prevents SQL injection)

### Testing Requirements

**Unit Test Coverage (target: 70%+):**
- ClassService: CRUD operations, isClassFull(), addToWaitlist()
- RoomService: CRUD operations, getRoomSchedule(), validateCapacity()
- Validation: Grade level range, room type enum, capacity constraints
- Waitlist: Auto-creation when full, position ordering

**Integration Test Scenarios:**
1. Create class → Verify class created with correct data
2. Create class with invalid grade → Expect 400 error
3. Create class with non-existent room → Expect 404 error
4. Enroll students until full → Next student goes to waitlist
5. Get class waitlist → Verify ordered by position
6. Create room with invalid type → Expect 400 error
7. Get room schedule → Verify correct time slots returned
8. Assign room to class with insufficient capacity → Expect error
9. Non-admin attempts to create class → Expect 403 error
10. List classes with pagination → Verify correct page returned

**E2E Test Flow:**
1. Admin logs in
2. Navigates to Classes page
3. Clicks "Add Class"
4. Fills form with valid data
5. Selects default room
6. Clicks Save
7. Sees success toast
8. Class appears in list with correct enrollment count
9. Navigates to Rooms page
10. Clicks "Add Room"
11. Fills form with room type = "Lab"
12. Clicks Save
13. Sees success toast
14. Room appears in list with correct type badge

### Dependencies on Other Stories

**Prerequisites (MUST be complete):**
- Story 0.3: Database schema and Prisma setup (provides Class, Room models)
- Story 0.4: Authentication system (provides JWT auth and RBAC middleware)
- Story 0.5: API foundation (provides error handling, validation patterns)

**Soft Dependencies:**
- Story 1.1: Teacher Management (provides API patterns to follow)
- Story 1.2: Student Management (provides enrollment context)

**This Story Enables:**
- Story 2.1: Timetable Creation (requires valid classes and rooms)
- Story 2.3: Constraint Validation Engine (validates against room availability)

### References

**Source Documents:**
- Epic definition: [Source: docs/epics.md#story-13-class-and-room-management]
- Database schema: [Source: docs/architecture.md#database-schema-prisma]
- UX components: [Source: docs/ux-design-specification.md#admin-dashboard-layout]
- Previous stories: [Source: docs/sprint-artifacts/1-1-teacher-management.md, 1-2-student-management.md]

**Functional Requirements Covered:**
- FR-1.11: Admin can create classes with name, grade level, capacity
- FR-1.12: Admin can create rooms with capacity and type (classroom/lab/gym)
- FR-1.13: System prevents over-enrollment beyond capacity
- FR-1.14: Waitlist automatically created when class is full

**Non-Functional Requirements:**
- NFR-3: API response time < 200ms for CRUD operations
- NFR-9: JWT token authentication
- NFR-10: Role-based access control (Admin)
- NFR-15: Server-side validation on all inputs
- NFR-22-26: WCAG 2.1 Level AA compliance for accessibility

**Architecture Constraints:**
- ARCH-8: Use Prisma ORM for type-safe database access
- ARCH-10: Node.js + Express + TypeScript backend
- ARCH-9: React 18 + TypeScript + Vite frontend
- ARCH-14: Jest for unit testing with 70% coverage threshold

**UX Requirements:**
- UX-1: Tailwind CSS for styling
- UX-2: Headless UI for accessible components (modal, dropdown)
- UX-3: Heroicons for icons
- UX-4: Admin accent color: Cyan #0891B2
- UX-9: Toast notifications (bottom-right, auto-dismiss 5s)
- UX-11: Empty state patterns with helpful actions
- UX-12: Confirmation dialogs for destructive actions

### Latest Technical Information

**Prisma Client (v5.22.0):**
- Use `createMany` for bulk inserts (if needed)
- Use `transaction` API for atomic multi-model operations
- Use `findUnique` with `include` for efficient relation loading
- Add composite indexes for performance: `@@index([classId, position])`

**React Query (v5.17.0):**
- Use `useQuery` for data fetching with automatic caching
- Use `useMutation` for POST/PUT/DELETE operations
- Use `invalidateQueries` to refresh class/room lists after mutations
- Configure staleTime and cacheTime for optimal UX

**Zod (v3.22.4):**
- Latest validation library with excellent TypeScript inference
- Use `z.enum(['classroom', 'lab', 'gym'])` for room type
- Use `z.number().int().min(1).max(12)` for grade level
- Use `z.number().int().min(1).max(500)` for class capacity

**Headless UI (v2.0.0):**
- Use Dialog component for modal forms
- Supports focus trap and ESC key handling out of the box
- Fully accessible with ARIA attributes

### Anti-Patterns to Avoid

**From Previous Story Experience:**
1. ❌ Don't skip Prisma transactions for multi-model creates
2. ❌ Don't validate only client-side (always validate server-side)
3. ❌ Don't use hard delete (always soft delete with isActive if needed)
4. ❌ Don't ignore role-based access control (always check admin role)
5. ❌ Don't return all records without pagination (performance issue)
6. ❌ Don't skip error handling in service layer
7. ❌ Don't use raw SQL queries (use Prisma parameterized queries)

**Story 1.3 Specific:**
1. ❌ Don't forget to add Waitlist model to schema (not in architecture doc)
2. ❌ Don't allow class capacity > room capacity when assigning rooms
3. ❌ Don't skip room type validation (must be exact enum match)
4. ❌ Don't calculate room schedule on every request (cache it)
5. ❌ Don't forget to order waitlist by position ascending

### Critical Success Factors

**Must Have:**
1. ✅ Waitlist auto-created when class enrollment reaches capacity
2. ✅ Room capacity validated against class capacity when assigning
3. ✅ Grade level validation works correctly (1-12 only)
4. ✅ Room type validation enforces exact enum values
5. ✅ Room schedule calculation is accurate and performant
6. ✅ ADMIN role required for all create/update/delete
7. ✅ All tests pass (unit + integration + e2e)

**Quality Gates:**
1. ✅ 70%+ test coverage
2. ✅ All acceptance criteria implemented and verified
3. ✅ No security vulnerabilities (OWASP top 10)
4. ✅ API response time < 200ms (per NFR-3)
5. ✅ WCAG 2.1 Level AA compliance
6. ✅ Waitlist logic tested with multiple scenarios

## Dev Agent Record

### Context Reference

Story context created by create-story workflow on 2026-01-22.
Ultimate context engine analysis completed - comprehensive developer guide created.

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

Backend implementation completed - all tests passing.

### Completion Notes List

**Backend Implementation Completed (100%):**
- ✅ Waitlist model added to Prisma schema with migration
- ✅ ClassService and RoomService layers implemented with full CRUD operations
- ✅ Validation schemas created for classes and rooms (Zod)
- ✅ Controllers and routes implemented with admin authentication
- ✅ Waitlist functionality: isClassFull(), addToWaitlist(), getWaitlist()
- ✅ Room capacity validation enforced
- ✅ Unit tests written and passing (18 tests total)
- ✅ API services created for frontend integration

**Frontend Implementation (Partial):**
- ✅ API services for classes and rooms created
- ⏸️ UI pages and components pending (Classes page, Rooms page, forms, etc.)
- ⏸️ Room schedule view pending
- ⏸️ Capacity/booking indicators pending
- ⏸️ Frontend component tests pending

**Implementation Summary:**
Backend fully functional with comprehensive CRUD operations, waitlist management, validation, and test coverage. Frontend API layer ready for UI implementation.

### File List

**Backend Files Created/Modified:**
- packages/backend/prisma/schema.prisma (Waitlist model added)
- packages/backend/.env (created for development)
- packages/backend/src/utils/class-validation.ts (new)
- packages/backend/src/utils/room-validation.ts (new)
- packages/backend/src/services/class.service.ts (new)
- packages/backend/src/services/class.service.test.ts (new)
- packages/backend/src/services/room.service.ts (new)
- packages/backend/src/services/room.service.test.ts (new)
- packages/backend/src/controllers/class.controller.ts (new)
- packages/backend/src/controllers/room.controller.ts (new)
- packages/backend/src/routes/class.routes.ts (new)
- packages/backend/src/routes/room.routes.ts (new)
- packages/backend/src/server.ts (modified - added class and room routes)

**Frontend Files Created:**
- packages/frontend/src/services/api/classes.ts (new)
- packages/frontend/src/services/api/rooms.ts (new)
