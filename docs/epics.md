---
stepsCompleted: [1]
inputDocuments:
  - prd.md
  - architecture.md
  - ux-design-specification.md
workflowType: 'epics-stories'
lastStep: 1
project_name: 'classroom-manager'
user_name: 'Anhnm'
date: '2026-01-20'
status: in_progress
---

# classroom-manager - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for classroom-manager, decomposing the requirements from the PRD, Architecture, and UX Design into implementable stories. The system is a classroom management platform serving Admin/Headmaster, Teacher, and Student roles with scheduling, substitute management, and enrollment features.

---

## Requirements Inventory

### Functional Requirements

**Epic 1: Entity Management (Foundation)**
- FR-1.1: Admin can create, edit, and deactivate teacher profiles with name, email, contact info
- FR-1.2: Admin can assign multiple subject qualifications to teachers
- FR-1.3: Admin can set teacher availability (days/times)
- FR-1.4: Admin can view teacher's current workload summary
- FR-1.5: System validates email uniqueness for teachers
- FR-1.6: Admin/Teacher can create student profiles with required fields
- FR-1.7: Admin/Teacher can assign students to class/grade level
- FR-1.8: System tracks student's enrolled subjects
- FR-1.9: System flags students below minimum subject requirement
- FR-1.10: System supports bulk import of students via CSV
- FR-1.11: Admin can create classes with name, grade level, capacity
- FR-1.12: Admin can create rooms with capacity and type (classroom/lab/gym)
- FR-1.13: System prevents over-enrollment beyond capacity
- FR-1.14: Waitlist automatically created when class is full
- FR-1.15: Admin can create subjects with name, code, description
- FR-1.16: Admin can mark subjects as mandatory or elective
- FR-1.17: Admin can set prerequisites for subjects
- FR-1.18: Admin can assign qualified teachers to subjects

**Epic 2: Scheduling & Time Bank**
- FR-2.1: Admin can create time slots (periods) for the school
- FR-2.2: Admin can assign class + subject + teacher + room to a time slot
- FR-2.3: System validates teacher not double-booked
- FR-2.4: System validates room not double-booked
- FR-2.5: System validates teacher qualified for subject
- FR-2.6: System shows "what fits" - available teachers/rooms for a slot
- FR-2.7: Conflicts displayed with clear explanation
- FR-2.8: Schedule changes reflect immediately (real-time, no refresh needed)
- FR-2.9: Cancelled classes shown with visual indicator
- FR-2.10: Room changes highlighted
- FR-2.11: Push/in-app notification for changes affecting user
- FR-2.12: No student double-booking validation
- FR-2.13: Class capacity respected in scheduling

**Epic 3: Substitute Teacher System**
- FR-3.1: Admin can trigger "Find Substitute" for any class
- FR-3.2: System shows teachers who are free during slot AND qualified for subject
- FR-3.3: Results show each teacher's current day workload
- FR-3.4: Admin can assign substitute with one click
- FR-3.5: Substitute teacher notified immediately
- FR-3.6: Students notified of substitute teacher
- FR-3.7: Substitute search completes in < 5 seconds
- FR-3.8: Teacher can request leave for specific date(s)
- FR-3.9: System shows substitute availability before confirming leave
- FR-3.10: Teacher can prefer specific substitute or auto-assign
- FR-3.11: Admin notified of leave request
- FR-3.12: Leave request shows status (pending/approved/covered)
- FR-3.13: Teacher can cancel pending leave request
- FR-3.14: System tracks substitution count per teacher
- FR-3.15: Substitute finder shows substitution history
- FR-3.16: Admin can view substitution distribution report
- FR-3.17: Teachers can set substitution preferences (willing/not willing)

**Epic 4: Admin Dashboard**
- FR-4.1: Dashboard shows today's absent teachers
- FR-4.2: Dashboard shows uncovered classes needing substitutes
- FR-4.3: Dashboard shows students below minimum enrollment
- FR-4.4: Quick action buttons for common tasks
- FR-4.5: Alerts for urgent issues (conflicts, uncovered classes)
- FR-4.6: View shows each teacher's weekly teaching hours
- FR-4.7: Visual indicator for workload level (light/normal/heavy)
- FR-4.8: Filter workload view by department/subject
- FR-4.9: Highlight teachers exceeding workload threshold

**Epic 5: Teacher Dashboard**
- FR-5.1: "Next Class" prominently displayed with countdown
- FR-5.2: Shows: subject, room, time, student count
- FR-5.3: Today's full schedule visible below
- FR-5.4: Cancelled classes visually distinguished
- FR-5.5: Dashboard loads in < 2 seconds
- FR-5.6: Week view shows all classes in grid format
- FR-5.7: Click class for details (room, students, subject)
- FR-5.8: Free periods clearly visible
- FR-5.9: Navigate between weeks easily
- FR-5.10: "Start Class" button on dashboard when class begins
- FR-5.11: Tapping "Start Class" logs attendance start time
- FR-5.12: Student list shown for manual absence marking
- FR-5.13: Attendance data saved automatically
- FR-5.14: Historical attendance viewable

**Epic 6: Student Dashboard & Enrollment**
- FR-6.1: "Next Class" prominently displayed for students
- FR-6.2: Shows: subject, teacher, room, time
- FR-6.3: Today's full schedule visible for students
- FR-6.4: Cancelled classes clearly marked for students
- FR-6.5: Room changes highlighted for students
- FR-6.6: Student sees available subjects for their grade
- FR-6.7: Progress tracker shows X/10 subjects enrolled
- FR-6.8: System prevents enrolling in conflicting time slots
- FR-6.9: System warns about prerequisites not met
- FR-6.10: System suggests conflict-free time slots for remaining subjects
- FR-6.11: Shows mandatory subjects still needed
- FR-6.12: Enrollment confirmed with schedule summary
- FR-6.13: Upcoming exams displayed with countdown
- FR-6.14: Warning if > 2 exams on same day
- FR-6.15: Warning if > 5 exams in same week
- FR-6.16: Exam warnings appear 48+ hours in advance
- FR-6.17: Notification when class is cancelled
- FR-6.18: Notification when room changes
- FR-6.19: Notification when substitute teacher assigned
- FR-6.20: Exam reminders 48 hours and 24 hours before
- FR-6.21: Waitlist spot available notification

### Non-Functional Requirements

**Performance**
- NFR-1: Page load time < 2 seconds (P50 dashboard load)
- NFR-2: Peak load performance < 5 seconds (P95 at 500 concurrent users)
- NFR-3: API response time < 200ms (P95 for CRUD operations)
- NFR-4: Substitute finder search < 5 seconds
- NFR-5: Real-time schedule updates < 1 second propagation

**Scalability**
- NFR-6: Support 500 concurrent users initially, scalable to 5000
- NFR-7: Multi-tenant architecture for future school expansion
- NFR-8: 5 years of historical data retention

**Security**
- NFR-9: JWT token authentication with refresh mechanism
- NFR-10: Role-based access control (RBAC) - Admin, Teacher, Student
- NFR-11: TLS 1.3 encryption in transit
- NFR-12: AES-256 encryption at rest
- NFR-13: Password policy: Min 8 chars, complexity requirements
- NFR-14: 24-hour token expiry with secure logout
- NFR-15: Server-side validation on all inputs
- NFR-16: FERPA compliance for student data privacy

**Availability**
- NFR-17: 99.5% uptime during school hours (7AM-5PM)
- NFR-18: Planned maintenance off-hours only (weekends, nights)
- NFR-19: Daily automated backups
- NFR-20: Recovery Time Objective (RTO) < 4 hours
- NFR-21: Recovery Point Objective (RPO) < 1 hour

**Accessibility**
- NFR-22: WCAG 2.1 Level AA compliance
- NFR-23: Full keyboard navigation support
- NFR-24: Screen reader compatible (NVDA, VoiceOver)
- NFR-25: Color contrast 4.5:1 minimum
- NFR-26: Visible focus indicators on all interactive elements

**Browser Support**
- NFR-27: Chrome last 2 versions
- NFR-28: Firefox last 2 versions
- NFR-29: Safari last 2 versions
- NFR-30: Edge last 2 versions

### Additional Requirements

**From Architecture Document:**
- ARCH-1: Monorepo structure with pnpm workspaces (packages/frontend, backend, shared)
- ARCH-2: GitHub Actions CI pipeline (lint, typecheck, test, build) on every push/PR
- ARCH-3: GitHub Actions deploy-staging.yml on push to main
- ARCH-4: GitHub Actions deploy-production.yml on release published
- ARCH-5: Docker multi-stage builds for frontend and backend
- ARCH-6: PostgreSQL 16 as primary database
- ARCH-7: Redis 7 for caching and real-time pub/sub
- ARCH-8: Prisma ORM for type-safe database access
- ARCH-9: React 18 + TypeScript + Vite for frontend
- ARCH-10: Node.js + Express + TypeScript for backend
- ARCH-11: Prisma schema with 11 models (User, Teacher, Student, Subject, Class, Room, TimeSlot, Enrollment, TeacherAbsence, TeacherQualification, Notification)
- ARCH-12: WebSocket (Socket.io) for real-time schedule updates
- ARCH-13: Environment configuration via .env files
- ARCH-14: Jest for unit testing with 70% coverage threshold

**From UX Design Document:**
- UX-1: Tailwind CSS for utility-first styling
- UX-2: Headless UI for accessible components
- UX-3: Heroicons for icon system
- UX-4: Role-based accent colors (Admin: Cyan, Teacher: Emerald, Student: Violet)
- UX-5: Inter font family for typography
- UX-6: Responsive breakpoints: sm(640px), md(768px), lg(1024px), xl(1280px)
- UX-7: Sidebar navigation for desktop (240px, collapsible to 64px)
- UX-8: Bottom navigation for mobile students
- UX-9: Toast notifications (bottom-right, auto-dismiss 5s)
- UX-10: Skeleton loading states for content placeholders
- UX-11: Empty state patterns with helpful actions
- UX-12: Confirmation dialogs for destructive actions
- UX-13: Status badges: Scheduled (blue), Cancelled (red), Substitute (yellow), Free (green)
- UX-14: Glanceable design principle - key info in < 5 seconds
- UX-15: Touch-friendly targets (min 44px) for mobile

---

### FR Coverage Map

| FR ID | Epic | Story | Status |
|-------|------|-------|--------|
| FR-1.1 - FR-1.6 | Epic 1 | Story 1.1 (Teacher Management) | Planned |
| FR-1.6 - FR-1.10 | Epic 1 | Story 1.2 (Student Management) | Planned |
| FR-1.11 - FR-1.14 | Epic 1 | Story 1.3 (Class/Room Management) | Planned |
| FR-1.15 - FR-1.18 | Epic 1 | Story 1.4 (Subject Management) | Planned |
| FR-2.1 - FR-2.7 | Epic 2 | Story 2.1 (Timetable Creation) | Planned |
| FR-2.8 - FR-2.11 | Epic 2 | Story 2.2 (Live Schedule Updates) | Planned |
| FR-2.3, FR-2.4, FR-2.12, FR-2.13 | Epic 2 | Story 2.3 (Constraint Validation) | Planned |
| FR-3.1 - FR-3.7 | Epic 3 | Story 3.1 (Emergency Substitute Finder) | Planned |
| FR-3.8 - FR-3.13 | Epic 3 | Story 3.2 (Planned Absence Booking) | Planned |
| FR-3.14 - FR-3.17 | Epic 3 | Story 3.3 (Substitution Tracking) | Planned |
| FR-4.1 - FR-4.5 | Epic 4 | Story 4.1 (Admin Overview Dashboard) | Planned |
| FR-4.6 - FR-4.9 | Epic 4 | Story 4.2 (Teacher Workload View) | Planned |
| FR-5.1 - FR-5.5 | Epic 5 | Story 5.1 (Quick-Glance View) | Planned |
| FR-5.6 - FR-5.9 | Epic 5 | Story 5.2 (Weekly Timetable) | Planned |
| FR-5.10 - FR-5.14 | Epic 5 | Story 5.3 (Digital Attendance) | Planned |
| FR-6.1 - FR-6.5 | Epic 6 | Story 6.1 (Student Schedule View) | Planned |
| FR-6.6 - FR-6.12 | Epic 6 | Story 6.2 (Smart Enrollment Assistant) | Planned |
| FR-6.13 - FR-6.16 | Epic 6 | Story 6.3 (Exam Schedule & Overload) | Planned |
| FR-6.17 - FR-6.21 | Epic 6 | Story 6.4 (Notifications) | Planned |

---

## Epic List

| Epic # | Title | Description | Dependencies | Priority |
|--------|-------|-------------|--------------|----------|
| 0 | Project Foundation & Infrastructure | CI/CD, Docker, Database, Authentication setup | None | P0 |
| 1 | Entity Management | CRUD for Teachers, Students, Classes, Subjects, Rooms | Epic 0 | P1 |
| 2 | Scheduling & Time Bank | Timetable creation, conflict detection, live updates | Epic 1 | P1 |
| 3 | Substitute Teacher System | Emergency + planned absence coverage | Epic 1, 2 | P1 |
| 4 | Admin Dashboard | Overview, alerts, workload views | Epic 1, 2, 3 | P2 |
| 5 | Teacher Dashboard | Quick-glance, timetable, attendance | Epic 1, 2 | P2 |
| 6 | Student Dashboard & Enrollment | Schedule view, smart enrollment, notifications | Epic 1, 2 | P2 |

---

## Epic 0: Project Foundation & Infrastructure

**Goal:** Establish the technical foundation with CI/CD pipelines, Docker configuration, database schema, and authentication system before any feature development begins.

**Rationale:** This epic ensures all developers can work in a consistent environment with automated quality gates, and provides the authentication/authorization foundation required by all other features.

---

### Story 0.1: Repository Structure and CI Pipeline

**As a** developer,
**I want** a properly configured monorepo with automated CI checks,
**So that** code quality is enforced and the team can collaborate effectively.

**Acceptance Criteria:**

**Given** a fresh checkout of the repository
**When** I run `pnpm install`
**Then** all workspace dependencies are installed correctly
**And** packages/frontend, packages/backend, and packages/shared exist

**Given** any push to any branch
**When** GitHub Actions CI workflow runs
**Then** ESLint runs on all packages and fails build on errors
**And** Prettier check runs and fails build on formatting issues
**And** TypeScript type checking passes for all packages
**And** Unit tests run with Jest and achieve 70% coverage threshold
**And** Build step succeeds for all packages

**Given** CI workflow completion
**When** all checks pass
**Then** the commit/PR is marked as passing
**And** code coverage report is uploaded to codecov

**Technical Notes:**
- Use pnpm-workspace.yaml configuration from architecture.md
- Implement ci.yml workflow from architecture.md
- Configure ESLint with @typescript-eslint plugins
- Configure Prettier with semi, trailing comma, single quotes
- Set up Jest with projects configuration for monorepo

---

### Story 0.2: Docker Development Environment

**As a** developer,
**I want** Docker Compose configuration for local development,
**So that** I can run the entire stack locally with all dependencies.

**Acceptance Criteria:**

**Given** Docker and Docker Compose installed
**When** I run `docker compose -f docker/docker-compose.yml up`
**Then** PostgreSQL 16 container starts on port 5432
**And** Redis 7 container starts on port 6379
**And** Backend container starts on port 4000
**And** Frontend container starts on port 3000
**And** all services pass health checks

**Given** the development environment is running
**When** I make code changes
**Then** hot reload is enabled for frontend (Vite HMR)
**And** backend can restart to pick up changes

**Given** database containers are running
**When** I run `pnpm db:migrate`
**Then** Prisma migrations are applied to PostgreSQL
**And** the database schema matches prisma/schema.prisma

**Technical Notes:**
- Implement Dockerfile.frontend and Dockerfile.backend from architecture.md
- Use docker-compose.yml configuration from architecture.md
- Configure volume mounts for database persistence
- Set up healthchecks for postgres and redis

---

### Story 0.3: Database Schema and Prisma Setup

**As a** developer,
**I want** the complete database schema implemented with Prisma,
**So that** I can perform type-safe database operations.

**Acceptance Criteria:**

**Given** the Prisma schema is defined
**When** I run `pnpm --filter backend prisma generate`
**Then** Prisma Client is generated with TypeScript types
**And** all 11 models are available (User, Teacher, Student, Subject, Class, Room, TimeSlot, Enrollment, TeacherAbsence, TeacherQualification, Notification)

**Given** a fresh database
**When** I run `pnpm db:migrate`
**Then** all tables are created with correct relationships
**And** indexes are created for frequently queried fields
**And** enums are created (UserRole, AbsenceStatus, TimeSlotStatus)

**Given** the schema is complete
**When** I query a Teacher with their qualifications
**Then** I can access related Subject records via TeacherQualification
**And** I can access related TimeSlot records
**And** I can access related TeacherAbsence records

**Technical Notes:**
- Implement schema.prisma from architecture.md
- Add seed script for development data
- Create migration files with descriptive names
- Set up Prisma Studio for database inspection (`pnpm db:studio`)

---

### Story 0.4: Authentication System

**As a** user,
**I want** to securely log in with my email and password,
**So that** I can access features appropriate for my role.

**Acceptance Criteria:**

**Given** a valid email and password
**When** I POST to `/api/auth/login`
**Then** I receive a JWT access token (24-hour expiry)
**And** the token contains my userId and role (ADMIN, TEACHER, or STUDENT)
**And** the response includes a refresh token

**Given** an expired access token
**When** I POST to `/api/auth/refresh` with a valid refresh token
**Then** I receive a new access token
**And** the refresh token is rotated

**Given** an authenticated request
**When** the Authorization header contains a valid JWT
**Then** the request proceeds to the protected endpoint
**And** req.user contains decoded user information

**Given** an unauthenticated request to a protected endpoint
**When** no valid token is provided
**Then** the API returns 401 Unauthorized

**Given** a user with STUDENT role
**When** they attempt to access an admin-only endpoint
**Then** the API returns 403 Forbidden

**Technical Notes:**
- Use bcrypt for password hashing (min 10 rounds)
- Implement JWT signing with RS256 or HS256
- Create auth middleware for route protection
- Implement RBAC middleware for role checks
- Store refresh tokens in Redis with TTL

---

### Story 0.5: API Foundation and Error Handling

**As a** developer,
**I want** a consistent API structure with proper error handling,
**So that** all endpoints follow the same patterns and return predictable responses.

**Acceptance Criteria:**

**Given** any successful API request
**When** the response is returned
**Then** it follows the format: `{ success: true, data: {...} }`
**And** appropriate HTTP status codes are used (200, 201, 204)

**Given** a request with validation errors
**When** the validation fails
**Then** the response is: `{ success: false, error: { code: "VALIDATION_ERROR", message: "...", details: [...] } }`
**And** HTTP status 400 is returned

**Given** an unexpected server error
**When** the error is caught
**Then** the response is: `{ success: false, error: { code: "INTERNAL_ERROR", message: "..." } }`
**And** HTTP status 500 is returned
**And** the error is logged with stack trace (not exposed to client)

**Given** any API request
**When** the request is processed
**Then** CORS headers are set correctly
**And** request body is validated against Zod schemas
**And** response time is logged

**Technical Notes:**
- Create global error handler middleware
- Implement Zod for request validation
- Set up structured logging (Winston or Pino)
- Configure CORS for frontend origin
- Add request ID tracking for debugging

---

### Story 0.6: Deployment Pipeline (Staging)

**As a** team,
**I want** automatic deployment to staging on main branch pushes,
**So that** new features are continuously tested in a production-like environment.

**Acceptance Criteria:**

**Given** a push to the main branch
**When** CI checks pass
**Then** Docker images are built for frontend and backend
**And** images are pushed to GitHub Container Registry with `staging-{sha}` tag
**And** SSH deployment to staging server is triggered
**And** docker compose pull and up is executed on staging
**And** health check confirms deployment success

**Given** deployment completes
**When** health check at `/api/health` is called
**Then** it returns 200 OK within 30 seconds
**And** deployment is marked as successful

**Given** health check fails
**When** 30 seconds elapse without 200 response
**Then** deployment is marked as failed
**And** team is notified

**Technical Notes:**
- Implement deploy-staging.yml from architecture.md
- Configure GitHub environment secrets for staging
- Set up health check endpoint in backend
- Configure container registry authentication

---

## Epic 1: Entity Management (Foundation)

**Goal:** Enable administrators and teachers to manage the core entities (Teachers, Students, Classes, Rooms, Subjects) that form the foundation for all scheduling and enrollment features.

**Rationale:** All other features depend on having teachers, students, classes, and subjects in the system. This epic must be completed before scheduling can begin.

---

### Story 1.1: Teacher Management

**As an** Admin,
**I want to** add, edit, and manage teacher profiles with their subject qualifications,
**So that** I can assign teachers to appropriate classes and find qualified substitutes.

**Acceptance Criteria:**

**Given** I am logged in as Admin
**When** I navigate to Teachers section and click "Add Teacher"
**Then** I see a form with fields: name, email, phone
**And** I can search and select multiple subject qualifications

**Given** I fill out the teacher form with valid data
**When** I click "Save"
**Then** the teacher profile is created
**And** I see a success toast notification
**And** the teacher appears in the teacher list

**Given** I enter an email that already exists
**When** I try to save
**Then** I see validation error "Email already in use"
**And** the form is not submitted

**Given** I am viewing a teacher profile
**When** I click "Edit"
**Then** I can modify name, phone, and qualifications
**And** I cannot change the email (immutable after creation)

**Given** I am viewing a teacher profile
**When** I click "Deactivate"
**Then** a confirmation dialog appears
**And** upon confirmation, the teacher is marked inactive
**And** inactive teachers are hidden from substitute finder

**Given** I am viewing the teacher list
**When** I view a teacher's row
**Then** I see their current weekly teaching hours (workload summary)
**And** visual indicator shows light/normal/heavy workload

**Technical Notes:**
- Implement `/api/teachers` CRUD endpoints
- Add TeacherQualification junction table operations
- Soft delete via `isActive` flag
- Calculate workload from TimeSlot aggregation
- Use Admin role check middleware

**API Endpoints:**
- `GET /api/teachers` - List all teachers (with pagination, filtering)
- `POST /api/teachers` - Create teacher
- `GET /api/teachers/:id` - Get teacher details with qualifications
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Soft delete (set isActive=false)
- `GET /api/teachers/:id/workload` - Get workload stats

---

### Story 1.2: Student Management

**As an** Admin or Teacher,
**I want to** add, edit, and manage student profiles,
**So that** students can be enrolled in classes and tracked.

**Acceptance Criteria:**

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

**Technical Notes:**
- Implement `/api/students` CRUD endpoints
- Add bulk import endpoint with CSV parsing (papaparse)
- Track enrollment count per student
- Calculate under-enrolled flag based on mandatory subjects
- Both Admin and Teacher roles can manage students

**API Endpoints:**
- `GET /api/students` - List students (with pagination, filtering)
- `POST /api/students` - Create student
- `POST /api/students/import` - Bulk import from CSV
- `GET /api/students/:id` - Get student details with enrollments
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Soft delete

---

### Story 1.3: Class and Room Management

**As an** Admin,
**I want to** manage classes and rooms with their capacities,
**So that** scheduling can respect physical constraints.

**Acceptance Criteria:**

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

**Technical Notes:**
- Implement `/api/classes` and `/api/rooms` CRUD endpoints
- Add waitlist functionality (Waitlist model may need to be added)
- Room type affects scheduling suggestions (labs for science subjects)
- Calculate room utilization statistics

**API Endpoints:**
- `GET /api/classes` - List classes
- `POST /api/classes` - Create class
- `GET /api/classes/:id` - Get class with students
- `PUT /api/classes/:id` - Update class
- `GET /api/classes/:id/waitlist` - Get waitlist for class
- `GET /api/rooms` - List rooms
- `POST /api/rooms` - Create room
- `GET /api/rooms/:id` - Get room details
- `GET /api/rooms/:id/schedule` - Get room's weekly schedule
- `PUT /api/rooms/:id` - Update room

---

### Story 1.4: Subject Management

**As an** Admin,
**I want to** manage subjects with prerequisites and requirements,
**So that** enrollment can validate student eligibility.

**Acceptance Criteria:**

**Given** I am logged in as Admin
**When** I navigate to Subjects section and click "Add Subject"
**Then** I see a form with fields: name, code, description
**And** a toggle for "Mandatory" (required for all students)
**And** a multi-select for prerequisites (other subjects)
**And** a multi-select for qualified teachers

**Given** I create a subject with prerequisites
**When** a student without those prerequisites tries to enroll
**Then** they see a warning: "Prerequisites not met: [subject names]"
**And** enrollment is blocked unless admin overrides

**Given** I view the Subjects list
**When** I click on a subject
**Then** I see: qualified teachers, prerequisite chain, enrolled student count

**Given** I assign teachers to a subject
**When** scheduling that subject
**Then** only those qualified teachers appear in "available teachers" dropdown

**Technical Notes:**
- Implement `/api/subjects` CRUD endpoints
- Self-referential relationship for prerequisites (Subject → Subject)
- TeacherQualification table links teachers to subjects
- Prerequisite validation in enrollment flow

**API Endpoints:**
- `GET /api/subjects` - List subjects
- `POST /api/subjects` - Create subject
- `GET /api/subjects/:id` - Get subject with prerequisites and teachers
- `PUT /api/subjects/:id` - Update subject (including prerequisites)
- `GET /api/subjects/:id/teachers` - Get qualified teachers
- `PUT /api/subjects/:id/teachers` - Update qualified teachers list

---

## Epic 2: Scheduling & Time Bank

**Goal:** Enable administrators to create conflict-free timetables with automatic validation and real-time updates for all users.

**Rationale:** The scheduling engine is the core of the system. It must prevent conflicts and provide live updates to avoid confusion about class locations and times.

---

### Story 2.1: Timetable Creation

**As an** Admin,
**I want to** create class schedules with automatic conflict detection,
**So that** I can build valid timetables efficiently.

**Acceptance Criteria:**

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

**Technical Notes:**
- Implement "what fits" algorithm for available resources
- Add constraint validation service
- Store time slots with day_of_week (0-6), startTime, endTime
- Create composite indexes for fast conflict checking

**API Endpoints:**
- `GET /api/schedule` - Get schedule (filterable by class, teacher, room, date range)
- `POST /api/schedule` - Create time slot (with validation)
- `PUT /api/schedule/:id` - Update time slot
- `DELETE /api/schedule/:id` - Delete time slot
- `POST /api/schedule/validate` - Validate constraints without saving
- `GET /api/schedule/available-teachers` - Get available teachers for slot
- `GET /api/schedule/available-rooms` - Get available rooms for slot

---

### Story 2.2: Live Schedule Updates

**As a** User (Admin/Teacher/Student),
**I want to** see real-time schedule changes,
**So that** I'm never caught off guard by cancellations or room changes.

**Acceptance Criteria:**

**Given** I am viewing my schedule
**When** a class is cancelled by admin
**Then** the class immediately shows as cancelled (red strikethrough)
**And** I do not need to refresh the page
**And** I receive a notification about the cancellation

**Given** I am viewing my schedule
**When** a room is changed for my class
**Then** the room name updates immediately
**And** the change is visually highlighted (e.g., yellow background for 10 seconds)
**And** I receive a notification about the room change

**Given** I am viewing my schedule
**When** a substitute teacher is assigned to my class
**Then** the teacher name updates immediately
**And** a "Substitute" badge appears on that slot
**And** I receive a notification about the substitute

**Given** real-time connection is lost
**When** I detect disconnection
**Then** a banner appears: "Connection lost. Reconnecting..."
**And** upon reconnection, schedule syncs automatically
**And** any missed updates are applied

**Technical Notes:**
- Implement WebSocket (Socket.io) for real-time updates
- Create schedule update events: `schedule:cancelled`, `schedule:room_changed`, `schedule:substitute_assigned`
- Users subscribe to rooms based on their role (teachers to their classes, students to their enrollments)
- Implement reconnection with exponential backoff

**API Endpoints:**
- WebSocket namespace: `/schedule`
- Events: `schedule:updated`, `schedule:cancelled`, `schedule:room_changed`
- Redis pub/sub for multi-server support

---

### Story 2.3: Constraint Validation Engine

**As the** System,
**I need to** validate all scheduling constraints,
**So that** invalid schedules cannot be created.

**Acceptance Criteria:**

**Given** a new time slot is being created
**When** the teacher is already teaching at that time
**Then** validation fails with error: "TEACHER_DOUBLE_BOOKED"
**And** the conflicting slot details are included in the error

**Given** a new time slot is being created
**When** the room is already booked at that time
**Then** validation fails with error: "ROOM_DOUBLE_BOOKED"
**And** the conflicting slot details are included

**Given** a new time slot is being created
**When** a student in the class has another class at that time
**Then** validation fails with error: "STUDENT_CONFLICT"
**And** the list of affected students is included (up to 10)

**Given** a new time slot is being created
**When** enrollment would exceed room capacity
**Then** validation warns: "CAPACITY_WARNING: Room fits [X] but class has [Y] students"
**And** admin can proceed with acknowledgment

**Given** a teacher is being assigned to a subject
**When** they are not in the subject's qualified teachers list
**Then** validation fails with error: "TEACHER_NOT_QUALIFIED"

**Given** constraints are violated
**When** error is returned
**Then** error includes: code, message, conflicting_entity, suggested_alternatives

**Technical Notes:**
- Create ConstraintValidator service with pluggable rules
- Each constraint type is a separate validation function
- Run all validations and return all errors (not just first)
- Cache teacher schedules and room bookings for fast lookups

---

## Epic 3: Substitute Teacher System

**Goal:** Enable quick finding of qualified substitute teachers for both emergency (same-day) and planned absences, ensuring classes are never uncovered.

**Rationale:** This is the "killer feature" identified in the product brief. Finding a substitute in 30 seconds instead of 30 minutes is the key aha moment for administrators.

---

### Story 3.1: Emergency Substitute Finder

**As an** Admin,
**I want to** quickly find qualified substitute teachers for same-day absences,
**So that** classes aren't cancelled when teachers are sick.

**Acceptance Criteria:**

**Given** a teacher is absent and a class needs coverage
**When** I click "Find Substitute" on the uncovered class
**Then** I see a modal with: Class, Subject, Time, Absent Teacher info
**And** a list of available substitutes loads within 5 seconds

**Given** the substitute finder is open
**When** I view the available teachers list
**Then** each teacher shows: name, qualification match, current day workload, substitution count this month
**And** teachers are sorted by: lowest workload first

**Given** teachers are available
**When** I click "Assign" next to a teacher
**Then** confirmation dialog shows: teacher name, class, time, notification preview
**And** upon confirmation, the teacher is assigned as substitute
**And** the substitute teacher receives immediate notification
**And** all students in the class receive notification
**And** the original teacher is notified their class is covered

**Given** no qualified teachers are available
**When** I open the substitute finder
**Then** I see "No Available Substitutes" message
**And** I see a list of "Qualified but Busy" teachers with their conflicts
**And** I have option to "Cancel Class" instead

**Given** I assign a substitute
**When** the assignment is saved
**Then** the schedule updates in real-time for all users
**And** the class shows a "Substitute" badge
**And** the substitute's name replaces the original teacher

**Technical Notes:**
- Create substitute finder algorithm:
  1. Get all teachers qualified for the subject
  2. Filter to those free at the time slot
  3. Sort by: lowest current day load, then lowest monthly substitutions
- Cache teacher availability for performance
- Send notifications via notification service

**API Endpoints:**
- `POST /api/schedule/find-substitute` - Find available substitutes
- `POST /api/absences/:id/assign-substitute` - Assign substitute to absence

---

### Story 3.2: Planned Absence Booking

**As a** Teacher,
**I want to** request leave for future dates and see substitute availability,
**So that** I can ensure coverage before I'm absent.

**Acceptance Criteria:**

**Given** I am logged in as Teacher
**When** I navigate to "Request Absence" on my dashboard
**Then** I see a date picker for selecting absence date(s)
**And** I see an optional reason field
**And** I see my schedule for selected date(s)

**Given** I select a future date for absence
**When** I see my classes for that day
**Then** each class shows substitute availability count
**And** I can click to see available substitutes list
**And** I can optionally pre-select a preferred substitute

**Given** I submit an absence request
**When** the request is created
**Then** status shows as "Pending"
**And** admin receives notification of the request
**And** I can see the request in my "Absence History"

**Given** I have a pending absence request
**When** I view it
**Then** I see current status (Pending/Approved/Covered)
**And** I see assigned substitute (if any)
**And** I can cancel the request if still pending

**Given** admin approves and assigns substitutes
**When** all my classes are covered
**Then** status changes to "Covered"
**And** I receive notification with substitute details
**And** my schedule shows substitutes for that day

**Technical Notes:**
- Create TeacherAbsence model operations
- Status flow: PENDING → APPROVED → COVERED (or CANCELLED)
- Show substitute availability without committing assignment
- Admin approval workflow

**API Endpoints:**
- `GET /api/absences` - List absences (teacher's own or all for admin)
- `POST /api/absences` - Create absence request
- `GET /api/absences/:id` - Get absence details
- `PUT /api/absences/:id` - Update absence (cancel, approve)
- `GET /api/absences/:id/available-substitutes` - Preview available subs

---

### Story 3.3: Substitute Assignment Tracking

**As an** Admin,
**I want to** track substitute assignments for fairness,
**So that** the same teachers aren't always burdened with substitutions.

**Acceptance Criteria:**

**Given** I am logged in as Admin
**When** I navigate to Reports > Substitution Distribution
**Then** I see a table of teachers with columns: Name, Substitutions This Month, Substitutions This Semester
**And** I can filter by department or date range

**Given** I am viewing substitution history
**When** I click on a teacher's name
**Then** I see detailed substitution log: date, class covered, original teacher, subject

**Given** I am using the substitute finder
**When** I view available teachers
**Then** substitution count is shown next to each name
**And** teachers with high substitution counts have a warning indicator

**Given** teachers have substitution preferences
**When** they are matched for substitution
**Then** teachers marked "Not Willing" are filtered out by default
**And** admin can override and see all teachers if needed

**Given** I am a teacher
**When** I navigate to Settings > Substitution Preferences
**Then** I can toggle "Willing to Substitute" on/off
**And** this preference is saved to my profile

**Technical Notes:**
- Aggregate substitution counts from TeacherAbsence records
- Add substitutionPreference field to Teacher model
- Create reports service for distribution analytics
- Include fairness score in substitute suggestions

**API Endpoints:**
- `GET /api/reports/substitutions` - Substitution distribution report
- `GET /api/teachers/:id/substitution-history` - Teacher's substitution log
- `PUT /api/teachers/:id/preferences` - Update teacher preferences

---

## Epic 4: Admin Dashboard

**Goal:** Provide administrators with a comprehensive overview of school operations, alerts for urgent issues, and quick access to common actions.

**Rationale:** The admin dashboard is the control center. It must surface the most important information immediately and reduce time spent navigating to different sections.

---

### Story 4.1: Admin Overview Dashboard

**As an** Admin,
**I want to** see key metrics and alerts at a glance,
**So that** I can manage the school efficiently.

**Acceptance Criteria:**

**Given** I am logged in as Admin
**When** I navigate to the Dashboard
**Then** I see a greeting with my name and current date
**And** I see notification bell with unread count
**And** the page loads within 2 seconds

**Given** there are teachers absent today
**When** I view the Alerts section
**Then** I see count of absent teachers
**And** I see count of uncovered classes (needing substitutes)
**And** each alert is clickable to take action

**Given** there are students below minimum enrollment
**When** I view the Alerts section
**Then** I see "X students need more subjects"
**And** clicking opens filtered student list

**Given** there are uncovered classes
**When** I view "Today's Absences" card
**Then** I see list of absent teachers with their classes
**And** covered classes show green checkmark with substitute name
**And** uncovered classes show "Find Substitute" button

**Given** I view Quick Actions section
**When** I see the buttons
**Then** I have: "Add Teacher", "Add Student", "View Schedule"
**And** each button navigates to the appropriate section

**Given** urgent alerts exist
**When** I view the dashboard
**Then** alert card has red border and is at top
**And** alert count badge shows on sidebar menu item

**Technical Notes:**
- Create dashboard aggregation service
- Cache frequently accessed counts with short TTL
- Real-time update of absence/coverage status
- Implement UX layout from ux-design-specification.md

**API Endpoints:**
- `GET /api/dashboard/admin` - Get all dashboard data in single request
- `GET /api/dashboard/admin/alerts` - Get urgent alerts only

---

### Story 4.2: Teacher Workload View

**As an** Admin,
**I want to** see teacher workload distribution,
**So that** I can balance assignments and prevent burnout.

**Acceptance Criteria:**

**Given** I am logged in as Admin
**When** I navigate to Teachers > Workload
**Then** I see all teachers with their weekly teaching hours
**And** visual bar indicator shows workload level
**And** light (< 15 hrs): green, normal (15-25 hrs): yellow, heavy (> 25 hrs): red

**Given** I view the workload list
**When** teachers exceed the heavy threshold
**Then** they are highlighted with warning icon
**And** I see a summary: "X teachers have heavy workload"

**Given** I want to filter workload view
**When** I use the filters
**Then** I can filter by department (based on subject qualifications)
**And** I can filter by subject
**And** I can sort by: name, hours ascending, hours descending

**Given** I click on a teacher in the workload view
**When** the detail opens
**Then** I see their complete weekly schedule
**And** I see breakdown by subject
**And** I see substitution count for the period

**Technical Notes:**
- Aggregate TimeSlot duration per teacher per week
- Calculate workload thresholds (configurable in settings)
- Department derivation from subject qualifications
- Cache workload calculations

**API Endpoints:**
- `GET /api/teachers/workload` - Get all teachers with workload stats
- `GET /api/teachers/:id/workload` - Get detailed workload for one teacher

---

## Epic 5: Teacher Dashboard

**Goal:** Provide teachers with instant visibility into their schedule, next class, and simple tools for attendance and absence management.

**Rationale:** Teachers need glanceable information. The "Next Class" card with countdown is the primary value proposition - knowing exactly where to be and when.

---

### Story 5.1: Teacher Quick-Glance View

**As a** Teacher,
**I want to** immediately see my next class and today's schedule,
**So that** I always know where to be.

**Acceptance Criteria:**

**Given** I am logged in as Teacher
**When** I navigate to Dashboard
**Then** I see a prominent "Next Class" card at the top
**And** the card shows: countdown timer, subject name, class name, room, student count
**And** the page loads within 2 seconds

**Given** my next class is within 30 minutes
**When** I view the Next Class card
**Then** the countdown is prominently displayed in large font
**And** the card has a "Start Class" button

**Given** I have no more classes today
**When** I view the Next Class card
**Then** it shows "No more classes today"
**And** tomorrow's first class is shown below (if any)

**Given** I view my today's schedule
**When** I look at the schedule list
**Then** I see all classes for today in chronological order
**And** each shows: time, subject, class, room
**And** the current/next class is highlighted
**And** cancelled classes show red strikethrough with "Cancelled" badge

**Given** I am teaching a class that has a substitute
**When** I view that class
**Then** it shows the substitute teacher's name
**And** badge shows "Substitute Assigned"

**Technical Notes:**
- Real-time countdown using client-side timer
- Calculate "next class" from current time
- WebSocket subscription for schedule updates
- Implement Teacher dashboard layout from UX spec

**API Endpoints:**
- `GET /api/dashboard/teacher` - Get teacher's dashboard data
- `GET /api/teachers/:id/next-class` - Get next class info
- `GET /api/teachers/:id/today-schedule` - Get today's schedule

---

### Story 5.2: Teacher Weekly Timetable

**As a** Teacher,
**I want to** see my full week's schedule,
**So that** I can plan ahead.

**Acceptance Criteria:**

**Given** I am logged in as Teacher
**When** I navigate to Schedule
**Then** I see a weekly grid view with days as columns and time slots as rows
**And** my classes are shown as blocks in the grid
**And** current day is highlighted

**Given** I view the weekly timetable
**When** I click on a class block
**Then** a detail popover shows: subject, class name, room, student count, student list link

**Given** I view the weekly timetable
**When** I look at empty time slots
**Then** they are clearly marked as "Free" with green color
**And** I can see my free periods at a glance

**Given** I want to see a different week
**When** I click navigation arrows
**Then** I can navigate to previous or next weeks
**And** a "Today" button returns to current week

**Given** a class is cancelled or has substitute
**When** I view that slot
**Then** cancelled shows with red strikethrough
**And** substitute shows with yellow badge and substitute teacher name

**Technical Notes:**
- Calendar grid component with responsive design
- Cache weekly schedule data
- Highlight today, show visual diff for past vs future
- Handle timezone correctly for display

**API Endpoints:**
- `GET /api/teachers/:id/schedule?week=2026-01-20` - Get weekly schedule

---

### Story 5.3: Digital Attendance

**As a** Teacher,
**I want to** take attendance digitally,
**So that** attendance records are accurate and automatic.

**Acceptance Criteria:**

**Given** it is time for my class to start
**When** I view the Next Class card
**Then** I see a "Start Class" button

**Given** I click "Start Class"
**When** the class session begins
**Then** the attendance start time is logged
**And** I see the student roster for the class
**And** all students default to "Present"

**Given** the student roster is displayed
**When** I tap on a student's name
**Then** I can toggle their status: Present / Absent / Late
**And** changes are saved automatically

**Given** I am taking attendance
**When** I finish
**Then** I click "End Attendance"
**And** the attendance record is finalized with timestamp
**And** I see summary: X present, Y absent, Z late

**Given** I want to view past attendance
**When** I navigate to a past class
**Then** I can see the attendance record for that session
**And** I cannot modify past attendance (read-only)

**Given** a class was not manually started
**When** the class time ends
**Then** attendance is marked as "Not Taken"
**And** admin can view classes with missing attendance

**Technical Notes:**
- Create Attendance model (classSessionId, studentId, status, timestamp)
- ClassSession model tracks start/end times per TimeSlot instance
- Default all students to Present to minimize tapping
- Batch save attendance records

**API Endpoints:**
- `POST /api/attendance/start` - Start class session
- `PUT /api/attendance/:sessionId` - Update attendance records
- `POST /api/attendance/:sessionId/end` - End class session
- `GET /api/attendance/history?teacherId=X` - Get attendance history

---

## Epic 6: Student Dashboard & Enrollment

**Goal:** Provide students with clear visibility into their schedule, smart enrollment assistance with conflict prevention, and proactive notifications about changes and exams.

**Rationale:** Students are the largest user group. Their experience must be mobile-first, simple, and proactive in preventing scheduling problems.

---

### Story 6.1: Student Schedule View

**As a** Student,
**I want to** see my daily schedule with room information,
**So that** I know where to go for each class.

**Acceptance Criteria:**

**Given** I am logged in as Student
**When** I open the app/website
**Then** I see a "Next Class" card prominently displayed
**And** it shows: subject, teacher name, room, time, countdown

**Given** I view my today's schedule
**When** I look at the schedule list
**Then** I see all my classes for today in chronological order
**And** each shows: time, subject, teacher, room
**And** current/next class is highlighted with arrow indicator

**Given** a class is cancelled
**When** I view that class in my schedule
**Then** it shows with red strikethrough and "CANCELLED" badge
**And** reason is shown if provided (e.g., "Mr. Tuan absent")

**Given** a room has changed
**When** I view the affected class
**Then** the room name is highlighted (e.g., yellow background)
**And** I see "Room changed from [old] to [new]"

**Given** there is a substitute teacher
**When** I view the affected class
**Then** I see the substitute teacher's name
**And** "Substitute" badge is shown

**Technical Notes:**
- Student dashboard is mobile-first (bottom navigation)
- Next class countdown updates in real-time
- WebSocket subscription for schedule changes
- Implement Student dashboard layout from UX spec

**API Endpoints:**
- `GET /api/dashboard/student` - Get student's dashboard data
- `GET /api/students/:id/schedule` - Get student's schedule

---

### Story 6.2: Smart Enrollment Assistant

**As a** Student,
**I want to** enroll in subjects with conflict detection and guidance,
**So that** I complete enrollment without scheduling problems.

**Acceptance Criteria:**

**Given** I am logged in as Student during enrollment period
**When** I navigate to Enrollment
**Then** I see my enrollment progress: "X/10 subjects enrolled"
**And** I see a progress bar visualization
**And** I see list of enrolled subjects with their times

**Given** I view available subjects
**When** I see the subject list
**Then** subjects are categorized: Recommended (no conflicts), Available, Conflicts
**And** mandatory subjects have a "Required" badge

**Given** I select a subject to enroll
**When** there are no conflicts
**Then** available time slots are shown
**And** a green checkmark indicates "Fits your schedule"
**And** I can click "Enroll" to add to my schedule

**Given** I select a subject to enroll
**When** it conflicts with an existing enrollment
**Then** I see: "Conflicts with [Subject] at [time]"
**And** alternative time slots are suggested if available
**And** I cannot enroll in the conflicting slot

**Given** I select a subject with prerequisites
**When** I haven't completed the prerequisites
**Then** I see: "Prerequisite required: [Subject name]"
**And** enrollment is blocked unless admin overrides

**Given** I have mandatory subjects remaining
**When** I view the enrollment screen
**Then** "Required" section shows: "You still need: English, PE"
**And** these are prioritized in recommendations

**Given** I complete enrollment
**When** I have 10 subjects enrolled
**Then** I see "Enrollment Complete!" confirmation
**And** my full weekly schedule is displayed
**And** I can download/print my schedule

**Technical Notes:**
- Conflict detection algorithm checks student's existing enrollments
- Recommendation engine suggests subjects that fit
- Track enrollment period dates (configurable)
- Generate schedule summary PDF

**API Endpoints:**
- `GET /api/students/:id/enrollment` - Get enrollment status
- `GET /api/students/:id/available-subjects` - Get subjects with conflict info
- `POST /api/students/:id/enroll` - Enroll in subject
- `DELETE /api/students/:id/enroll/:subjectId` - Drop enrollment
- `GET /api/students/:id/schedule/pdf` - Generate schedule PDF

---

### Story 6.3: Exam Schedule & Overload Prevention

**As a** Student,
**I want to** see my exam schedule with overload warnings,
**So that** I can prepare and avoid exam pile-ups.

**Acceptance Criteria:**

**Given** I have upcoming exams
**When** I view my dashboard
**Then** I see "Upcoming Exams" card with countdown to nearest exam
**And** I see list of exams for the next 2 weeks

**Given** I have more than 2 exams on the same day
**When** I view my exam schedule
**Then** I see a red warning: "Exam Overload: 3 exams on Jan 25"
**And** the warning appears 48+ hours in advance
**And** suggestion shown: "Contact admin about rescheduling"

**Given** I have more than 5 exams in the same week
**When** I view my exam schedule
**Then** I see a yellow warning: "Heavy exam week: 6 exams Jan 20-24"
**And** the warning appears at least 1 week in advance

**Given** I view the Exams page
**When** I see my exam list
**Then** each exam shows: subject, date, time, room
**And** exams are sorted by date ascending
**And** past exams are shown in a separate "Completed" section

**Technical Notes:**
- Exam model needed (may extend TimeSlot with isExam flag)
- Overload detection runs on enrollment and exam creation
- Warning thresholds: >2/day (red), >5/week (yellow)
- Notification scheduled 48h and 24h before each exam

**API Endpoints:**
- `GET /api/students/:id/exams` - Get exam schedule
- `GET /api/students/:id/exam-warnings` - Get overload warnings

---

### Story 6.4: Student Notifications

**As a** Student,
**I want to** receive notifications about schedule changes,
**So that** I never miss important updates.

**Acceptance Criteria:**

**Given** my class is cancelled
**When** the cancellation is made
**Then** I receive a push notification: "[Subject] class cancelled today"
**And** I see it in my notification center
**And** the notification links to my schedule

**Given** my class room changes
**When** the change is made
**Then** I receive a notification: "[Subject] room changed to [Room]"
**And** the affected class in my schedule is highlighted

**Given** a substitute teacher is assigned to my class
**When** the assignment is made
**Then** I receive a notification: "Substitute teacher for [Subject]: [Teacher name]"

**Given** I have an exam coming up
**When** it is 48 hours before the exam
**Then** I receive a notification: "Reminder: [Subject] exam in 2 days"
**When** it is 24 hours before the exam
**Then** I receive a notification: "Reminder: [Subject] exam tomorrow"

**Given** I am on a waitlist and a spot opens
**When** someone drops the class
**Then** I receive a notification: "Spot available in [Class]! Enroll now"
**And** the notification has a direct "Enroll" action

**Given** I view my notification center
**When** I click the bell icon
**Then** I see all my notifications, newest first
**And** unread notifications are highlighted
**And** I can mark all as read

**Technical Notes:**
- Notification model with types: CANCELLED, ROOM_CHANGE, SUBSTITUTE, EXAM_REMINDER, WAITLIST
- Push notification integration (Web Push API)
- In-app notification center with real-time updates
- Scheduled job for exam reminders

**API Endpoints:**
- `GET /api/notifications` - Get user's notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read
- `GET /api/notifications/unread-count` - Get unread count

---

## Implementation Notes

### Epic Sequencing

1. **Epic 0** (Foundation) must be completed first - CI/CD, Docker, Database, Auth
2. **Epic 1** (Entities) can begin once Epic 0 is complete - foundation for all features
3. **Epic 2** (Scheduling) depends on Epic 1 entities being available
4. **Epic 3** (Substitutes) depends on Epic 1 + 2 (need teachers, subjects, and schedules)
5. **Epic 4, 5, 6** (Dashboards) can run in parallel after Epic 1 + 2

### Technical Dependencies

- All UI stories depend on frontend components being built (buttons, cards, forms from UX spec)
- Real-time features depend on WebSocket infrastructure (Story 2.2)
- Notification features depend on notification service (Story 6.4 can inform earlier stories)
- PDF generation needed for enrollment summary (can be deferred)

### Testing Strategy

- Unit tests for constraint validation engine (Epic 2)
- Integration tests for API endpoints
- E2E tests for critical user flows: enrollment, substitute finder
- Performance tests for substitute finder (<5s requirement)

---

## References

- PRD: `docs/prd.md`
- Architecture: `docs/architecture.md`
- UX Design: `docs/ux-design-specification.md`
- Product Brief: `docs/analysis/product-brief-classroom-manager-2026-01-19.md`

---

*Epics and Stories document created on 2026-01-20*
*Ready for sprint planning and implementation*
