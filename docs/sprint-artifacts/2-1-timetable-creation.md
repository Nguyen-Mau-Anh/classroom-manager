# Story 2.1: Timetable Creation

Status: ready-for-dev

## Story

As an Admin,
I want to create class schedules with automatic conflict detection,
So that I can build valid timetables efficiently.

## Acceptance Criteria

**Given** I am logged in as Admin
**When** I navigate to Schedule section
**Then** I see a weekly grid view with time slots on rows and days on columns
**And** I can filter by class, teacher, or room

**Given** I click on an empty time slot
**When** the slot creation modal opens
**Then** I see dropdowns for: Class, Subject, Teacher, Room
**And** the "Teacher" dropdown only shows teachers qualified for selected subject
**And** the "Room" dropdown only shows rooms available at that time

**Given** I select a teacher already teaching at that time
**When** I try to save
**Then** I see error: "Teacher [name] is already assigned to [class] at this time"
**And** the conflicting slot is highlighted

**Given** I select a room already booked at that time
**When** I try to save
**Then** I see error: "Room [name] is already booked for [class] at this time"
**And** alternative available rooms are suggested

**Given** I am creating a time slot
**When** I click "Show Available"
**Then** I see a filtered list of teachers who are: qualified + free at this time
**And** I see a filtered list of rooms that are: available + appropriate capacity

**Given** I successfully create a time slot
**When** I click Save
**Then** the slot appears in the grid with class name, subject, teacher, room
**And** success toast notification appears

## Tasks / Subtasks

### Backend Implementation

- [x] Update TimeSlot model schema if needed (AC: All)
  - [x] Verify TimeSlot model has all required fields (dayOfWeek, startTime, endTime, classId, subjectId, teacherId, roomId, status)
  - [x] Add composite indexes for conflict detection queries
  - [x] Create migration if schema changes required

- [x] Implement `/api/schedule` CRUD endpoints (AC: 1, 2, 6)
  - [x] GET /api/schedule - List time slots with filters (class, teacher, room, date range)
  - [x] POST /api/schedule - Create time slot with validation
  - [x] GET /api/schedule/:id - Get time slot details
  - [x] PUT /api/schedule/:id - Update time slot
  - [x] DELETE /api/schedule/:id - Delete time slot
  - [x] POST /api/schedule/validate - Validate constraints without saving
  - [x] GET /api/schedule/available-teachers - Get available qualified teachers for slot
  - [x] GET /api/schedule/available-rooms - Get available rooms for slot

- [ ] Create ScheduleService layer (AC: 2, 3, 4, 5, 6)
  - [ ] ScheduleService.create() - Create time slot with constraint validation
  - [ ] ScheduleService.list() - Paginated list with filters (class, teacher, room)
  - [ ] ScheduleService.getById() - Fetch time slot with all relations
  - [ ] ScheduleService.update() - Update time slot with constraint validation
  - [ ] ScheduleService.delete() - Delete time slot
  - [ ] ScheduleService.validateConstraints() - Check all scheduling constraints
  - [ ] ScheduleService.getAvailableTeachers() - Find qualified + free teachers
  - [ ] ScheduleService.getAvailableRooms() - Find available rooms
  - [ ] ScheduleService.checkTeacherConflict() - Detect teacher double-booking
  - [ ] ScheduleService.checkRoomConflict() - Detect room double-booking
  - [ ] ScheduleService.checkTeacherQualification() - Verify teacher qualified for subject

- [ ] Implement "what fits" algorithm (AC: 5)
  - [ ] Create AvailabilityService.getAvailableTeachers() - Find teachers who are: qualified for subject AND not teaching at this time
  - [ ] Create AvailabilityService.getAvailableRooms() - Find rooms that are: not booked at this time AND have appropriate capacity
  - [ ] Sort available teachers by workload (lowest first)
  - [ ] Sort available rooms by capacity match
  - [ ] Return alternative suggestions when conflicts detected

- [ ] Implement constraint validation service (AC: 3, 4)
  - [ ] Create ConstraintValidator.validateTeacher() - Check teacher not double-booked
  - [ ] Create ConstraintValidator.validateRoom() - Check room not double-booked
  - [ ] Create ConstraintValidator.validateQualification() - Check teacher qualified for subject
  - [ ] Create ConstraintValidator.validateCapacity() - Check room capacity vs class size
  - [ ] Return detailed error with conflicting entity info
  - [ ] Suggest alternatives when constraint violated

- [ ] Implement validation schemas (AC: All)
  - [ ] CreateTimeSlotSchema (dayOfWeek 0-6, startTime, endTime, classId, subjectId, teacherId, roomId)
  - [ ] UpdateTimeSlotSchema (allow partial updates)
  - [ ] ScheduleQuerySchema (filters: class, teacher, room, dateRange, pagination)
  - [ ] ValidateConstraintsSchema (same as CreateTimeSlotSchema)
  - [ ] GetAvailableSchema (dayOfWeek, startTime, endTime, subjectId optional for teachers)

- [ ] Add authentication and authorization middleware (AC: All)
  - [ ] Verify user has ADMIN role for all create/update/delete endpoints
  - [ ] Allow Teachers/Students to view schedules (read-only)
  - [ ] Return 403 Forbidden if not admin for write operations

### Frontend Implementation

- [ ] Create Schedule Management page (AC: 1)
  - [ ] Weekly grid view component with days as columns, time slots as rows
  - [ ] Filter controls: Class dropdown, Teacher dropdown, Room dropdown
  - [ ] "Add Time Slot" button in page header (cyan admin accent)
  - [ ] Display existing time slots in grid with: class name, subject, teacher, room
  - [ ] Empty slot cells clickable to create new time slot
  - [ ] Current day highlighted in grid

- [ ] Build Time Slot creation/edit modal (AC: 2, 5)
  - [ ] Modal-based form (600px width)
  - [ ] Dropdowns: Class, Subject, Teacher, Room
  - [ ] Day of week selector (Monday-Sunday)
  - [ ] Start time and end time pickers (HH:MM format)
  - [ ] "Show Available" button to filter qualified/free teachers and available rooms
  - [ ] Form validation with inline error messages
  - [ ] Save/Cancel buttons
  - [ ] Disable fields when isLoading

- [ ] Implement conflict detection UI (AC: 3, 4)
  - [ ] Display error messages from backend in modal
  - [ ] Highlight conflicting time slot in grid with red border
  - [ ] Show conflicting entity details (teacher name, class, time)
  - [ ] Display alternative suggestions in dropdown or list
  - [ ] Prevent form submission when conflicts exist
  - [ ] Clear error messages when user fixes conflict

- [ ] Create "what fits" filtering component (AC: 5)
  - [ ] AvailableTeachersPanel - Shows filtered list of qualified + free teachers
  - [ ] AvailableRoomsPanel - Shows filtered list of available rooms
  - [ ] Display teacher info: name, current day workload, qualification status
  - [ ] Display room info: name, capacity, type, current availability
  - [ ] Sort teachers by lowest workload first
  - [ ] Sort rooms by capacity match
  - [ ] Show empty state when no available teachers/rooms

- [ ] Implement schedule grid component (AC: 1, 6)
  - [ ] WeeklyScheduleGrid - 7 columns (days) x N rows (time slots)
  - [ ] TimeSlotCell - Individual cell displaying: class, subject, teacher, room
  - [ ] Click on cell to edit existing time slot
  - [ ] Click on empty cell to create new time slot
  - [ ] Color-code cells by subject or class
  - [ ] Show status badge (Scheduled, Cancelled)
  - [ ] Responsive design: switch to list view on mobile

- [ ] Add toast notifications (AC: All)
  - [ ] Success toast: "Time slot created successfully"
  - [ ] Success toast: "Time slot updated successfully"
  - [ ] Error toast: "Teacher [name] is already assigned at this time"
  - [ ] Error toast: "Room [name] is already booked at this time"
  - [ ] Error toast: "Teacher not qualified for this subject"
  - [ ] Info toast: "No available teachers found for this slot"

### Testing

- [ ] Backend unit tests
  - [ ] Test time slot creation with valid data
  - [ ] Test teacher double-booking detection (same dayOfWeek + time overlap)
  - [ ] Test room double-booking detection (same dayOfWeek + time overlap)
  - [ ] Test teacher qualification validation (teacher must be qualified for subject)
  - [ ] Test "what fits" algorithm (available teachers and rooms)
  - [ ] Test conflict detection with detailed error messages
  - [ ] Test alternative suggestions when conflicts exist
  - [ ] Test time overlap detection (same start/end time, start during existing, end during existing)

- [ ] API integration tests
  - [ ] Test full CRUD flow for time slots
  - [ ] Test constraint validation prevents invalid schedules
  - [ ] Test role-based access control (admin vs teacher/student)
  - [ ] Test pagination and filtering (by class, teacher, room)
  - [ ] Test available teachers endpoint returns only qualified + free teachers
  - [ ] Test available rooms endpoint returns only free rooms with appropriate capacity
  - [ ] Test conflict error includes conflicting entity details
  - [ ] Test alternative suggestions in conflict response

- [ ] Frontend component tests
  - [ ] Test weekly grid rendering with correct days and time slots
  - [ ] Test time slot cell click opens edit modal
  - [ ] Test empty cell click opens create modal
  - [ ] Test form validation (all required fields)
  - [ ] Test "Show Available" button filters teacher/room lists
  - [ ] Test conflict error display in modal
  - [ ] Test alternative suggestions display
  - [ ] Test toast notifications for success/error cases

## Dev Notes

### Critical Implementation Patterns from Previous Stories

**Proven Patterns to Reuse:**
1. **Service Layer Architecture:** Follow teacher.service.ts, student.service.ts, subject.service.ts patterns
2. **Prisma Transactions:** Use atomic transactions for time slot operations
3. **Zod Validation:** Consistent validation schemas in separate validation files
4. **API Response Format:** Maintain `{ success: true/false, data/error }` consistency
5. **Toast Notification Context:** Reuse existing Toast system
6. **React Query Integration:** Use for server state management and caching
7. **Modal Pattern:** Use Headless UI Dialog component from previous stories
8. **Multi-select/Dropdown Components:** Leverage existing patterns from subject management

**Key Learnings from Epic 1 Stories:**
- Pagination is essential for large lists (default 20 per page)
- Soft delete pattern works well (isActive flag) - use for time slot cancellation
- Role-based middleware must be applied to all admin routes
- Test coverage target: 70%+ with comprehensive unit and integration tests
- Client-side validation mirrors server-side rules for better UX
- Complex queries need database indexes for performance
- Constraint validation must be thorough and return detailed errors

### Architecture Compliance

**Tech Stack (from architecture.md):**
- Backend: Node.js + Express + TypeScript
- ORM: Prisma Client with PostgreSQL 16
- Validation: Zod for request validation
- Frontend: React 18 + TypeScript + Vite
- UI: Tailwind CSS + Headless UI + Heroicons
- State Management: React Query for server state
- Real-time: WebSocket (Socket.io) for live updates (Story 2.2)

**Project Structure:**
```
packages/backend/src/
├── controllers/scheduleController.ts (new)
├── services/scheduleService.ts (new)
├── services/availabilityService.ts (new)
├── services/constraintValidator.ts (new)
├── middlewares/auth.ts (existing)
├── middlewares/roleCheck.ts (existing)
├── routes/scheduleRoutes.ts (new)
└── utils/schedule-validation.ts (new)

packages/frontend/src/
├── pages/Schedule.tsx (new)
├── components/schedule/WeeklyScheduleGrid.tsx (new)
├── components/schedule/TimeSlotForm.tsx (new)
├── components/schedule/TimeSlotCell.tsx (new)
├── components/schedule/AvailableTeachersPanel.tsx (new)
├── components/schedule/AvailableRoomsPanel.tsx (new)
└── services/api/schedule.ts (new)
```

### Database Schema

**TimeSlot Model (from architecture.md):**

```prisma
model TimeSlot {
  id          String          @id @default(cuid())
  dayOfWeek   Int             // 0=Sunday, 1=Monday, ..., 6=Saturday
  startTime   String          // "08:00" format (HH:MM)
  endTime     String          // "09:30" format (HH:MM)
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
  @@index([classId])
  @@index([subjectId])
}

enum TimeSlotStatus {
  SCHEDULED
  CANCELLED
}
```

**Database Indexes (Critical for Performance):**
- TimeSlot: Composite indexes on (dayOfWeek, startTime) for conflict detection
- TimeSlot: Index on (teacherId, dayOfWeek) for teacher schedule queries
- TimeSlot: Index on (roomId, dayOfWeek) for room schedule queries
- TimeSlot: Index on classId for class schedule queries
- TimeSlot: Index on subjectId for subject schedule queries

**Important Notes:**
- dayOfWeek uses integer 0-6 (0=Sunday, 6=Saturday) for easy calculation
- startTime and endTime stored as strings in "HH:MM" format for simplicity
- Conflict detection requires checking time overlap: (startTime < existingEndTime) AND (endTime > existingStartTime)
- Status enum allows for CANCELLED status (Story 2.2 will use this for live updates)

### API Endpoints Specification

**GET /api/schedule**
```typescript
Query params:
- page: number (default: 1)
- pageSize: number (default: 100) // Show full week schedule by default
- classId: string (optional filter)
- teacherId: string (optional filter)
- roomId: string (optional filter)
- dayOfWeek: number (optional filter: 0-6)

Response (200):
{
  "success": true,
  "data": {
    "timeSlots": [
      {
        "id": "timeslot-123",
        "dayOfWeek": 1, // Monday
        "startTime": "08:00",
        "endTime": "09:30",
        "status": "SCHEDULED",
        "class": { "id": "class-1", "name": "Grade 10A" },
        "subject": { "id": "subject-1", "code": "MATH101", "name": "Mathematics I" },
        "teacher": { "id": "teacher-1", "name": "Ms. Linh Pham" },
        "room": { "id": "room-1", "name": "Room 201", "capacity": 40 }
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 100,
      "total": 45
    }
  }
}
```

**POST /api/schedule**
```typescript
Request:
{
  "dayOfWeek": 1, // Monday
  "startTime": "08:00",
  "endTime": "09:30",
  "classId": "class-1",
  "subjectId": "subject-1",
  "teacherId": "teacher-1",
  "roomId": "room-1"
}

Response (201):
{
  "success": true,
  "data": {
    "id": "timeslot-xyz",
    "dayOfWeek": 1,
    "startTime": "08:00",
    "endTime": "09:30",
    "status": "SCHEDULED",
    "class": { "id": "class-1", "name": "Grade 10A" },
    "subject": { "id": "subject-1", "code": "MATH101", "name": "Mathematics I" },
    "teacher": { "id": "teacher-1", "name": "Ms. Linh Pham" },
    "room": { "id": "room-1", "name": "Room 201" },
    "createdAt": "2026-01-27T10:00:00Z"
  }
}

Errors:
- 400: Teacher already teaching at this time (TEACHER_DOUBLE_BOOKED)
- 400: Room already booked at this time (ROOM_DOUBLE_BOOKED)
- 400: Teacher not qualified for subject (TEACHER_NOT_QUALIFIED)
- 400: Invalid time range (endTime must be after startTime)
- 400: Invalid dayOfWeek (must be 0-6)
```

**POST /api/schedule/validate**
```typescript
Request: (Same as POST /api/schedule)

Response (200) - Valid:
{
  "success": true,
  "data": {
    "valid": true,
    "message": "Schedule is valid"
  }
}

Response (200) - Invalid:
{
  "success": false,
  "error": {
    "code": "TEACHER_DOUBLE_BOOKED",
    "message": "Teacher Ms. Linh Pham is already assigned to Grade 9B at this time",
    "conflictingEntity": {
      "id": "timeslot-456",
      "dayOfWeek": 1,
      "startTime": "08:00",
      "endTime": "09:30",
      "class": { "name": "Grade 9B" },
      "subject": { "name": "Physics" }
    },
    "alternatives": {
      "teachers": [
        {
          "id": "teacher-2",
          "name": "Mr. Hai Tran",
          "qualified": true,
          "currentDayWorkload": 4
        }
      ]
    }
  }
}
```

**GET /api/schedule/available-teachers**
```typescript
Query params:
- dayOfWeek: number (required: 0-6)
- startTime: string (required: "HH:MM")
- endTime: string (required: "HH:MM")
- subjectId: string (required) // Only show qualified teachers

Response (200):
{
  "success": true,
  "data": {
    "teachers": [
      {
        "id": "teacher-1",
        "name": "Ms. Linh Pham",
        "qualified": true,
        "currentDayWorkload": 3, // Number of classes on this day
        "qualificationDate": "2026-01-15T00:00:00Z"
      },
      {
        "id": "teacher-2",
        "name": "Mr. Hai Tran",
        "qualified": true,
        "currentDayWorkload": 2,
        "qualificationDate": "2026-01-10T00:00:00Z"
      }
    ]
  }
}
```

**GET /api/schedule/available-rooms**
```typescript
Query params:
- dayOfWeek: number (required: 0-6)
- startTime: string (required: "HH:MM")
- endTime: string (required: "HH:MM")
- classId: string (optional) // For capacity matching

Response (200):
{
  "success": true,
  "data": {
    "rooms": [
      {
        "id": "room-1",
        "name": "Room 201",
        "capacity": 40,
        "type": "classroom",
        "available": true
      },
      {
        "id": "room-2",
        "name": "Lab 1",
        "capacity": 30,
        "type": "lab",
        "available": true
      }
    ]
  }
}
```

### Business Logic: Constraint Validation

**Conflict Detection Algorithm:**

```typescript
async function checkTimeOverlap(
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  teacherId?: string,
  roomId?: string,
  excludeId?: string // For updates, exclude current time slot
): Promise<boolean> {
  // Find time slots on same day that overlap
  const overlappingSlots = await prisma.timeSlot.findMany({
    where: {
      id: excludeId ? { not: excludeId } : undefined,
      dayOfWeek,
      status: 'SCHEDULED',
      OR: [
        {
          // Case 1: Existing slot starts during new slot
          startTime: { gte: startTime, lt: endTime }
        },
        {
          // Case 2: Existing slot ends during new slot
          endTime: { gt: startTime, lte: endTime }
        },
        {
          // Case 3: Existing slot completely contains new slot
          AND: [
            { startTime: { lte: startTime } },
            { endTime: { gte: endTime } }
          ]
        },
        {
          // Case 4: New slot completely contains existing slot
          AND: [
            { startTime: { gte: startTime } },
            { endTime: { lte: endTime } }
          ]
        }
      ],
      ...(teacherId && { teacherId }),
      ...(roomId && { roomId })
    }
  });

  return overlappingSlots.length > 0;
}
```

**Teacher Double-Booking Detection:**

```typescript
async function checkTeacherConflict(
  teacherId: string,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  excludeId?: string
): Promise<{ conflict: boolean; conflictingSlot?: TimeSlot }> {
  const hasOverlap = await checkTimeOverlap(
    dayOfWeek,
    startTime,
    endTime,
    teacherId,
    undefined,
    excludeId
  );

  if (hasOverlap) {
    const conflictingSlot = await prisma.timeSlot.findFirst({
      where: {
        id: excludeId ? { not: excludeId } : undefined,
        teacherId,
        dayOfWeek,
        status: 'SCHEDULED',
        // ... time overlap conditions
      },
      include: {
        class: true,
        subject: true,
        teacher: true
      }
    });

    return { conflict: true, conflictingSlot };
  }

  return { conflict: false };
}
```

**Teacher Qualification Check:**

```typescript
async function checkTeacherQualification(
  teacherId: string,
  subjectId: string
): Promise<{ qualified: boolean; error?: string }> {
  const qualification = await prisma.teacherQualification.findUnique({
    where: {
      teacherId_subjectId: {
        teacherId,
        subjectId
      }
    }
  });

  if (!qualification) {
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      select: { name: true }
    });
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: { name: true }
    });

    return {
      qualified: false,
      error: `Teacher ${teacher.name} is not qualified to teach ${subject.name}`
    };
  }

  return { qualified: true };
}
```

**"What Fits" Algorithm:**

```typescript
async function getAvailableTeachers(
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  subjectId: string
): Promise<Teacher[]> {
  // 1. Get all teachers qualified for this subject
  const qualifiedTeachers = await prisma.teacher.findMany({
    where: {
      isActive: true,
      qualifications: {
        some: { subjectId }
      }
    },
    include: {
      timeSlots: {
        where: {
          dayOfWeek,
          status: 'SCHEDULED'
        }
      }
    }
  });

  // 2. Filter out teachers who have conflicting time slots
  const availableTeachers = qualifiedTeachers.filter(teacher => {
    return !teacher.timeSlots.some(slot => {
      return timeRangesOverlap(
        startTime,
        endTime,
        slot.startTime,
        slot.endTime
      );
    });
  });

  // 3. Calculate current day workload for each teacher
  const teachersWithWorkload = availableTeachers.map(teacher => ({
    ...teacher,
    currentDayWorkload: teacher.timeSlots.length
  }));

  // 4. Sort by lowest workload first
  return teachersWithWorkload.sort(
    (a, b) => a.currentDayWorkload - b.currentDayWorkload
  );
}
```

### UX Design Reference

**Admin Accent Color:** Cyan #0891B2
- Use for admin-specific buttons, active menu items, primary actions

**Weekly Schedule Grid Layout:**
- Grid: 7 columns (days) x 10-15 rows (time slots)
- Column headers: Monday, Tuesday, ..., Sunday
- Row headers: Time ranges (08:00-09:30, 09:30-11:00, etc.)
- Cell content: Class name, Subject code, Teacher initials, Room number
- Color coding: Use different pastel colors per subject or class
- Empty cells: Light gray background with dashed border
- Filled cells: White background with border, hover effect

**Time Slot Form Modal:**
- Modal width: 600px (desktop), full-screen (mobile)
- Two-column layout for space efficiency
- Left column: Day of week, Start time, End time, Class, Subject
- Right column: Teacher, Room, Status
- "Show Available" button: Expands available teachers/rooms sections below form
- Validation errors shown in red below each field
- Save button: Cyan (admin color), disabled until valid
- Conflict error: Red banner at top of modal with clear message

**Time Slot Cell Design:**
- Cell height: 60px minimum for readability
- Cell width: Flexible, min 120px
- Class name: Bold, larger font (text-sm font-semibold)
- Subject: Regular font, gray (text-gray-600)
- Teacher: Small font, initials only (text-xs)
- Room: Small font, right-aligned (text-xs)
- Hover: Shadow effect, cursor pointer
- Status badges:
  - Scheduled: Blue border (border-blue-500)
  - Cancelled: Red background with strikethrough (bg-red-100)

**Conflict Indication:**
- Conflicting cell: Red border (border-red-500), red background (bg-red-50)
- Conflict icon: Exclamation triangle in top-right corner
- Tooltip on hover: Shows conflict details

**Available Teachers/Rooms Panel:**
- Expandable section below main form
- List view with cards for each teacher/room
- Teacher card: Avatar, name, qualification badge, workload count
- Room card: Icon, name, capacity, type badge
- Empty state: "No available teachers/rooms found for this time slot"
- Sort indicators: Lowest workload first (for teachers), capacity match (for rooms)

### Validation Rules

**Time Slot Validation:**
- dayOfWeek: integer, 0-6 (0=Sunday, 6=Saturday)
- startTime: string, format "HH:MM", range 06:00-22:00
- endTime: string, format "HH:MM", range 06:00-22:00, must be > startTime
- classId: valid class ID, class must be active
- subjectId: valid subject ID, subject must be active
- teacherId: valid teacher ID, teacher must be active
- roomId: valid room ID, room must be active
- Minimum slot duration: 30 minutes
- Maximum slot duration: 4 hours

**Conflict Constraints:**
- Teacher cannot be double-booked (same day, overlapping time)
- Room cannot be double-booked (same day, overlapping time)
- Teacher must be qualified for subject (TeacherQualification record exists)
- Room capacity should be >= class student count (warning, not error)

**Time Range Overlap Detection:**
```typescript
function timeRangesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  return start1 < end2 && end1 > start2;
}
```

### Security & Performance

**Authentication:**
- All endpoints require valid JWT token
- ADMIN role required for create/update/delete operations
- Teachers can view schedules (read-only)
- Students can view schedules (read-only)

**Performance Requirements:**
- API response time < 200ms (per NFR-3) for list/get endpoints
- Conflict detection < 100ms using database indexes
- Available teachers/rooms query < 150ms
- Weekly schedule grid load < 500ms (all time slots for week)
- Implement database indexes on (dayOfWeek, startTime), (teacherId, dayOfWeek), (roomId, dayOfWeek)
- Cache teacher qualifications (Redis, 10-minute TTL) to avoid repeated queries
- Paginate very large schedules (use pageSize: 100 for weekly view)

**Input Sanitization:**
- Validate all inputs with Zod (server-side primary defense)
- Client-side validation for UX (mirrors server rules)
- Use Prisma parameterized queries only (prevents SQL injection)
- Validate dayOfWeek is 0-6, startTime/endTime format is "HH:MM"
- Validate time ranges are logical (endTime > startTime)

**Conflict Prevention:**
- Run all constraint checks before saving (service layer)
- Use Prisma transaction for time slot creation with validation
- Return clear error message with conflicting entity details
- Suggest alternatives when conflicts detected

### Testing Requirements

**Unit Test Coverage (target: 70%+):**
- ScheduleService: CRUD operations, validateConstraints(), checkTimeOverlap()
- ConstraintValidator: checkTeacherConflict(), checkRoomConflict(), checkTeacherQualification()
- AvailabilityService: getAvailableTeachers(), getAvailableRooms()
- Time overlap detection logic with various scenarios

**Integration Test Scenarios:**
1. Create time slot → Verify time slot created with all relations
2. Create time slot with teacher conflict → Expect 400 error with conflicting slot details
3. Create time slot with room conflict → Expect 400 error with alternative rooms suggested
4. Create time slot with unqualified teacher → Expect 400 error
5. Create time slot with invalid time range → Expect 400 error
6. Update time slot → Verify atomic update
7. Delete time slot → Verify deletion
8. Get schedule with filters → Verify correct time slots returned
9. Get available teachers → Verify only qualified + free teachers returned
10. Get available rooms → Verify only free rooms returned
11. Non-admin attempts to create time slot → Expect 403 error
12. List schedules with pagination → Verify correct page returned

**E2E Test Flow:**
1. Admin logs in
2. Navigates to Schedule page
3. Sees weekly grid view with existing time slots
4. Clicks on empty cell for Monday 08:00-09:30
5. Modal opens with time slot form
6. Selects: Class "Grade 10A", Subject "Mathematics", Teacher "Ms. Linh", Room "Room 201"
7. Clicks "Show Available" → Sees 3 available teachers, 5 available rooms
8. Clicks Save
9. Sees success toast
10. Time slot appears in grid at Monday 08:00-09:30
11. Attempts to create overlapping slot with same teacher
12. Sees error: "Teacher Ms. Linh is already assigned at this time"
13. Conflicting slot highlighted in grid
14. Sees alternative teacher suggestions

### Dependencies on Other Stories

**Prerequisites (MUST be complete):**
- Story 0.3: Database schema and Prisma setup (provides TimeSlot, Teacher, Subject, Class, Room models)
- Story 0.4: Authentication system (provides JWT auth and RBAC middleware)
- Story 0.5: API foundation (provides error handling, validation patterns)
- Story 1.1: Teacher Management (provides Teacher model and qualifications)
- Story 1.2: Student Management (provides Student model for class size calculation)
- Story 1.3: Class and Room Management (provides Class and Room models)
- Story 1.4: Subject Management (provides Subject model and teacher qualifications)

**Soft Dependencies:**
- None - this story is the foundation for scheduling features

**This Story Enables:**
- Story 2.2: Live Schedule Updates (requires time slots to update in real-time)
- Story 2.3: Constraint Validation Engine (enhances validation logic)
- Story 3.1: Emergency Substitute Finder (requires time slots to find substitutes)
- Story 5.1-5.2: Teacher Dashboard (requires teacher schedules to display)
- Story 6.1: Student Schedule View (requires student class schedules to display)

### References

**Source Documents:**
- Epic definition: [Source: docs/epics.md#story-21-timetable-creation]
- Database schema: [Source: docs/architecture.md#database-schema-prisma]
- UX components: [Source: docs/ux-design-specification.md#admin-dashboard-layout]
- PRD requirements: [Source: docs/prd.md#epic-2-scheduling-time-bank]
- Previous stories: [Source: docs/sprint-artifacts/1-*.md]

**Functional Requirements Covered:**
- FR-2.1: Admin can create time slots (periods) for the school
- FR-2.2: Admin can assign class + subject + teacher + room to a time slot
- FR-2.3: System validates teacher not double-booked
- FR-2.4: System validates room not double-booked
- FR-2.5: System validates teacher qualified for subject
- FR-2.6: System shows "what fits" - available teachers/rooms for a slot
- FR-2.7: Conflicts displayed with clear explanation

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
- UX-2: Headless UI for accessible components (modal, dropdowns)
- UX-3: Heroicons for icons
- UX-4: Admin accent color: Cyan #0891B2
- UX-9: Toast notifications (bottom-right, auto-dismiss 5s)
- UX-11: Empty state patterns with helpful actions
- UX-12: Confirmation dialogs for destructive actions
- UX-13: Status badges: Scheduled (blue), Cancelled (red)

### Latest Technical Information

**Prisma Client (v5.22.0):**
- Use `include` for loading all relations: class, subject, teacher, room
- Composite indexes required for conflict detection performance
- Use Prisma transactions for atomic time slot creation with validation
- Time overlap queries use OR conditions with multiple cases

**React Query (v5.17.0):**
- Use `useQuery` for schedule fetching with automatic caching
- Use `useMutation` for POST/PUT/DELETE operations
- Use `invalidateQueries(['schedule'])` to refresh after mutations
- Configure staleTime for schedule data (1 minute for frequently changing data)

**Zod (v3.22.4):**
- Use `z.coerce.number().int().min(0).max(6)` for dayOfWeek validation
- Use `z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)` for time format validation
- Custom refinement for time range validation: `refine((data) => data.endTime > data.startTime)`
- Use `z.string().cuid()` for ID validations

**Headless UI (v2.0.0):**
- Use Combobox component for searchable dropdowns (teacher, room selection)
- Use Listbox for single-select dropdowns (class, subject, day of week)
- Use Dialog component for time slot form modal

**Time Handling:**
- Store as strings in "HH:MM" format for simplicity
- Use JavaScript Date for time comparisons and calculations
- Consider using date-fns or dayjs for time manipulation
- Timezone handling: Store in UTC, convert to local time in frontend

### Anti-Patterns to Avoid

**From Previous Story Experience:**
1. ❌ Don't skip Prisma transactions for time slot creation (conflicts can occur during transaction)
2. ❌ Don't validate only client-side (always validate server-side)
3. ❌ Don't use hard delete (use status: CANCELLED for cancelled time slots)
4. ❌ Don't ignore role-based access control (always check admin role)
5. ❌ Don't return all time slots without pagination (performance issue for large schools)
6. ❌ Don't skip error handling in service layer
7. ❌ Don't use raw SQL queries unless absolutely necessary (use Prisma first)

**Story 2.1 Specific:**
1. ❌ Don't allow overlapping time slots (teacher or room conflicts)
2. ❌ Don't skip teacher qualification validation
3. ❌ Don't forget to check time slot conflicts during updates (not just creates)
4. ❌ Don't cache time slots indefinitely (1-minute TTL max for schedules)
5. ❌ Don't load entire weekly schedule without pagination for very large schools
6. ❌ Don't forget to provide alternative suggestions when conflicts detected
7. ❌ Don't allow invalid time ranges (endTime must be > startTime)
8. ❌ Don't forget database indexes for conflict detection queries (critical for performance)

### Critical Success Factors

**Must Have:**
1. ✅ Conflict detection prevents teacher double-booking
2. ✅ Conflict detection prevents room double-booking
3. ✅ Teacher qualification validation works correctly
4. ✅ "What fits" algorithm returns only available teachers/rooms
5. ✅ Detailed conflict error messages with entity details
6. ✅ Alternative suggestions provided when conflicts exist
7. ✅ All tests pass (unit + integration + e2e)

**Quality Gates:**
1. ✅ 70%+ test coverage
2. ✅ All acceptance criteria implemented and verified
3. ✅ No security vulnerabilities (OWASP top 10)
4. ✅ API response time < 200ms (per NFR-3)
5. ✅ Conflict detection queries < 100ms (with indexes)
6. ✅ WCAG 2.1 Level AA compliance
7. ✅ Weekly schedule grid loads < 500ms

### Previous Story Intelligence

**Key Learnings from Story 1.4 (Subject Management):**
1. **Comprehensive Testing:** Story 1.4 had 103 backend tests + 75 frontend tests - follow this thoroughness
2. **Constraint Validation Patterns:** Subject prerequisite validation patterns applicable to scheduling constraints
3. **"Available" Filtering:** Similar to "qualified teachers" filtering in subjects - apply to "available teachers" in scheduling
4. **Detailed Error Messages:** Return conflicting entity details, not just error codes
5. **Alternative Suggestions:** Subject prerequisite suggestions pattern - apply to alternative teacher/room suggestions
6. **Multi-Select Components:** Reuse multi-select patterns from subject form for teacher/room selection
7. **Service Layer Business Logic:** All constraint logic in service layer, not controllers
8. **Atomic Transactions:** Use for time slot creation to prevent race conditions

**Implementation Time Estimate (Based on Story 1.4):**
- Backend implementation: ~6-8 hours (more complex than subjects due to constraint logic)
- Frontend implementation: ~8-10 hours (weekly grid is complex UI)
- Testing: ~4-5 hours
- Total: ~18-23 hours for full implementation

### Git Intelligence Analysis

**Recent Commit Patterns:**
1. **Docker Build Context:** Recent commits fixed Docker build issues (nginx.conf, lowercase image names)
2. **Orchestrate Workflow Enhancements:** Task tracking and spawner improvements
3. **Code Review Focus:** Emphasis on adversarial code review and validation stages
4. **Test Coverage:** Lint error fixes in test files - maintain test quality

**Actionable Insights for Story 2.1:**
1. Ensure Docker build works with new schedule routes
2. Follow task-by-task execution pattern for large story
3. Prepare for thorough code review with comprehensive tests
4. Maintain clean code and proper file handling

### Critical Development Rules

**Must Follow:**
1. **Backend First:** Implement and test backend completely before frontend
2. **Service Layer Business Logic:** All constraint logic in services, not controllers
3. **Atomic Transactions:** Use Prisma transactions for time slot operations
4. **Comprehensive Testing:** 70%+ coverage, unit + integration tests
5. **Zod Validation:** Server-side validation is mandatory, client-side mirrors it
6. **Status Pattern:** Use status: CANCELLED instead of hard delete
7. **Role-Based Access Control:** Apply to ALL admin endpoints
8. **API Response Format:** Consistent `{ success, data/error }` format
9. **Pagination Default:** Always paginate lists (default 100 for weekly view)
10. **Error Handling:** Catch all errors in service layer, return meaningful messages with conflicting entity details

### Project Context

**Project:** classroom-manager - Classroom management system with scheduling and substitute teacher management

**Current Sprint Focus:** Epic 2 (Scheduling & Time Bank) - Building core scheduling engine after entity foundation

**Story Sequence Context:**
- Epic 0 (Project Foundation): ✅ Completed - CI/CD, Docker, Auth, API foundation
- Epic 1 (Entity Management): ✅ Completed - Teachers, Students, Classes, Subjects, Rooms
- **Story 2.1 (Timetable Creation): ← CURRENT STORY**
- Story 2.2 (Live Schedule Updates): ⏳ Next - Real-time WebSocket updates
- Story 2.3 (Constraint Validation Engine): ⏳ Next - Enhanced constraint engine

**Why This Story Matters:**
- **CORE SCHEDULING ENGINE** - The heart of the entire system
- Enables administrators to build conflict-free timetables efficiently
- Foundation for substitute teacher system (Epic 3)
- Required for all dashboard features (Epics 4, 5, 6)
- "What fits" filtering is the killer feature that saves hours of manual work

**Blocker Risks:**
- Time overlap detection logic complexity (must handle all edge cases)
- Performance of conflict detection queries (requires proper indexes)
- "What fits" algorithm performance (must be < 150ms)
- Race conditions during concurrent time slot creation (use Prisma transactions)

## Dev Agent Record

### Context Reference

Story context created by create-story workflow on 2026-01-27 in autonomous mode.
Ultimate context engine analysis completed - comprehensive developer guide created.

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

Story 2.1 created in autonomous mode from sprint-status.yaml and epics.md analysis.

### Completion Notes List

**Story Creation Summary:**
- ✅ Analyzed sprint-status.yaml to identify next backlog story: 2-1-timetable-creation
- ✅ Updated epic-2 status to "in-progress" (first story in Epic 2)
- ✅ Extracted requirements from epics.md (Story 2.1 section: lines 700-753)
- ✅ Loaded architecture.md for technical constraints and database schema (TimeSlot model: lines 972-992)
- ✅ Loaded prd.md for product context and success criteria
- ✅ Analyzed previous completed story (1.4 Subject Management) for patterns and learnings
- ✅ Analyzed recent git commits for code patterns and development rules
- ✅ Created comprehensive story file with all context for flawless implementation
- ✅ Status set to ready-for-dev

**Key Context Extracted:**
- **TimeSlot Model:** Already defined in architecture with all required fields and indexes
- **Conflict Detection:** Teacher and room double-booking validation required
- **"What Fits" Algorithm:** Filter available teachers (qualified + free) and rooms (available)
- **Constraint Validation:** Teacher qualification, time overlap, capacity checks
- **UX Pattern:** Weekly grid view with days as columns, time slots as rows
- **Previous Story Patterns:** Service layer architecture, Zod validation, modal forms, toast notifications

**Epic 2 Context:**
- First story in Epic 2 (Scheduling & Time Bank)
- Epic 2 status updated from "backlog" to "in-progress"
- Core scheduling engine that enables all subsequent scheduling features
- Depends on Epic 1 (Entity Management) being complete ✅
- Enables Epic 3 (Substitute Teacher System) and dashboard features (Epics 4-6)

**Next Steps:**
1. Review this story file thoroughly
2. Optional: Run SM's validation workflow to verify completeness
3. Run dev agent's dev-story workflow to implement
4. Run code-review workflow when implementation complete

### File List

**Files Created (Task #1):**
- packages/backend/src/models/timeslot.model.test.ts
- packages/backend/prisma/migrations/20260126171829_add_timeslot_indexes/migration.sql

**Files Modified (Task #1):**
- packages/backend/prisma/schema.prisma (added classId and subjectId indexes)

**Files Created (Task #2):**
- packages/backend/src/services/scheduleService.ts
- packages/backend/src/controllers/scheduleController.ts
- packages/backend/src/routes/scheduleRoutes.ts
- packages/backend/src/routes/schedule.integration.test.ts
- packages/backend/src/utils/schedule-validation.ts
- packages/backend/src/utils/schedule-validation.test.ts

**Files Modified (Task #2):**
- packages/backend/src/server.ts (registered schedule routes)

**Files to be Created:**
- packages/backend/src/services/scheduleService.test.ts
- packages/backend/src/services/availabilityService.ts
- packages/backend/src/services/availabilityService.test.ts
- packages/backend/src/services/constraintValidator.ts
- packages/backend/src/services/constraintValidator.test.ts
- packages/frontend/src/services/api/schedule.ts
- packages/frontend/src/pages/Schedule.tsx
- packages/frontend/src/components/schedule/WeeklyScheduleGrid.tsx
- packages/frontend/src/components/schedule/WeeklyScheduleGrid.test.tsx
- packages/frontend/src/components/schedule/TimeSlotForm.tsx
- packages/frontend/src/components/schedule/TimeSlotForm.test.tsx
- packages/frontend/src/components/schedule/TimeSlotCell.tsx
- packages/frontend/src/components/schedule/TimeSlotCell.test.tsx
- packages/frontend/src/components/schedule/AvailableTeachersPanel.tsx
- packages/frontend/src/components/schedule/AvailableTeachersPanel.test.tsx
- packages/frontend/src/components/schedule/AvailableRoomsPanel.tsx
- packages/frontend/src/components/schedule/AvailableRoomsPanel.test.tsx

**Files to be Modified:**
- packages/backend/src/server.ts (register schedule routes)

## Change Log

### 2026-01-27 - Task #1: Update TimeSlot Model Schema

**Changes Made:**
- ✅ Verified TimeSlot model has all required fields (dayOfWeek, startTime, endTime, classId, subjectId, teacherId, roomId, status)
- ✅ Added missing indexes to TimeSlot model:
  - Added `@@index([classId])` for class schedule queries
  - Added `@@index([subjectId])` for subject schedule queries
- ✅ Created Prisma migration `20260126171829_add_timeslot_indexes` to add the new indexes
- ✅ Applied migration successfully to database
- ✅ Created comprehensive test suite `timeslot.model.test.ts` with 8 test cases covering:
  - All required fields validation
  - Querying by classId index
  - Querying by subjectId index
  - Querying by teacherId + dayOfWeek composite index
  - Querying by roomId + dayOfWeek composite index
  - Querying by dayOfWeek + startTime composite index
  - TimeSlotStatus enum values (SCHEDULED, CANCELLED)
  - All required relations (class, subject, teacher, room)

**Test Results:**
- ✅ All 8 tests passed
- Test execution time: 0.249s
- Test file: packages/backend/src/models/timeslot.model.test.ts

**Files Changed:**
1. `packages/backend/prisma/schema.prisma` - Added 2 new indexes (classId, subjectId)
2. `packages/backend/prisma/migrations/20260126171829_add_timeslot_indexes/migration.sql` - Migration file
3. `packages/backend/src/models/timeslot.model.test.ts` - New test file (8 tests)

**Summary:**
Task #1 complete. The TimeSlot model now has all required fields and optimized indexes for conflict detection and schedule queries. The schema is ready for implementing the ScheduleService layer in the next tasks.

### 2026-01-27 - Task #2: Implement `/api/schedule` CRUD Endpoints

**Changes Made:**
- ✅ Created comprehensive Zod validation schemas in `schedule-validation.ts`:
  - `createTimeSlotSchema` - Validates time slot creation with time range validation
  - `updateTimeSlotSchema` - Validates partial updates including status changes
  - `scheduleListQuerySchema` - Validates list queries with filters (class, teacher, room, dayOfWeek)
  - `getAvailableTeachersSchema` - Validates available teachers query
  - `getAvailableRoomsSchema` - Validates available rooms query
- ✅ Created `scheduleService.ts` with full CRUD operations:
  - `create()` - Create time slot with entity validation and constraint checking
  - `list()` - Paginated list with filters (default pageSize: 100)
  - `getById()` - Fetch time slot with all relations
  - `update()` - Update time slot with constraint validation
  - `delete()` - Delete time slot
  - `validateOnly()` - Validate constraints without saving
  - `getAvailableTeachers()` - Find qualified + free teachers sorted by workload
  - `getAvailableRooms()` - Find available rooms sorted by capacity match
  - Private helper methods for entity validation, constraint validation, and conflict detection
- ✅ Created `scheduleController.ts` with 8 endpoints:
  - POST /api/schedule - Create time slot (Admin only)
  - GET /api/schedule - List time slots (All authenticated)
  - GET /api/schedule/:id - Get time slot details (All authenticated)
  - PUT /api/schedule/:id - Update time slot (Admin only)
  - DELETE /api/schedule/:id - Delete time slot (Admin only)
  - POST /api/schedule/validate - Validate constraints (All authenticated)
  - GET /api/schedule/available-teachers - Get available teachers (All authenticated)
  - GET /api/schedule/available-rooms - Get available rooms (All authenticated)
- ✅ Created `scheduleRoutes.ts` with full authentication and authorization:
  - All routes require authentication
  - Create/update/delete operations require ADMIN role
  - Read operations allow all authenticated users (Teacher, Student)
  - Proper route ordering (specific routes before parameterized routes)
- ✅ Registered schedule routes in `server.ts`
- ✅ Created comprehensive integration tests (31 tests covering):
  - Full CRUD flow for time slots
  - Constraint validation (teacher double-booking, room conflicts, qualifications)
  - "What fits" algorithm (available teachers and rooms)
  - Pagination and filtering (by class, teacher, room, dayOfWeek)
  - Authentication and authorization (admin vs teacher/student access)
- ✅ Created validation schema tests (22 tests covering):
  - Time format validation (HH:MM format)
  - Day of week validation (0-6 range)
  - Time range validation (endTime > startTime)
  - Required field validation
  - Partial update validation
  - Query parameter coercion and defaults

**Test Results:**
- ✅ All 31 integration tests passed
- ✅ All 22 validation tests passed
- ✅ Total: 53 tests passed
- Test execution time: 0.506s
- Test files: `schedule.integration.test.ts`, `schedule-validation.test.ts`

**Files Changed:**
1. `packages/backend/src/utils/schedule-validation.ts` - New validation schemas
2. `packages/backend/src/services/scheduleService.ts` - New service with CRUD + constraint validation
3. `packages/backend/src/controllers/scheduleController.ts` - New controller with 8 endpoints
4. `packages/backend/src/routes/scheduleRoutes.ts` - New routes with auth/authz
5. `packages/backend/src/routes/schedule.integration.test.ts` - New integration tests (31 tests)
6. `packages/backend/src/utils/schedule-validation.test.ts` - New validation tests (22 tests)
7. `packages/backend/src/server.ts` - Registered schedule routes

**Implementation Highlights:**
- **Constraint Validation:** Teacher qualification, teacher double-booking, room conflicts checked on create/update
- **Time Overlap Detection:** Handles all 4 overlap cases (start during, end during, contains, contained)
- **"What Fits" Algorithm:** Returns available teachers sorted by workload, available rooms sorted by capacity match
- **Role-Based Access Control:** Admin-only create/update/delete, all authenticated users can read
- **Comprehensive Testing:** 53 tests covering all endpoints, validations, and edge cases
- **API Response Format:** Consistent `{ success: true/false, data/error }` format
- **Pagination:** Default pageSize of 100 for weekly schedule view

**Summary:**
Task #2 complete. All 8 `/api/schedule` CRUD endpoints implemented with full constraint validation, authentication/authorization, and comprehensive test coverage (53 tests passed). The API is ready for frontend integration and supports all acceptance criteria for time slot management, conflict detection, and "what fits" filtering.
