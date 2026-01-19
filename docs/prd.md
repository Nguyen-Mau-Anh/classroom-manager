---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
inputDocuments:
  - analysis/product-brief-classroom-manager-2026-01-19.md
  - analysis/brainstorming-session-2026-01-19.md
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 1
  projectDocs: 0
workflowType: 'prd'
lastStep: 11
project_name: 'classroom-manager'
user_name: 'Anhnm'
date: '2026-01-19'
status: complete
---

# Product Requirements Document - classroom-manager

**Author:** Anhnm
**Date:** 2026-01-19
**Version:** 1.0
**Status:** Complete

---

## Executive Summary

**classroom-manager** is a comprehensive classroom management system designed to eliminate scheduling chaos, administrative burden, and communication gaps in educational institutions. By unifying teachers, students, classes, subjects, and scheduling into one intelligent platform, it transforms how schools operate - from semester planning to daily class management.

The system serves three core user roles (Admin/Headmaster, Teacher, Student) with tailored dashboards that surface exactly what each user needs: headmasters get oversight and substitute management, teachers get quick schedule views and absence booking, students get smart enrollment and real-time schedule updates.

### What Makes This Special

1. **Dynamic "What Fits" Filtering** - No AI black box; users make choices, system filters noise
2. **Dual Substitute System** - Both emergency (same-day) AND proactive (planned) absence management
3. **Student-Centric Enrollment** - Smart assistant that prevents conflicts and ensures requirements met
4. **Exam Overload Prevention** - Automatically flags students with too many exams per day/week
5. **Simplicity** - 3 roles, single source of truth, auto-approve where possible

## Project Classification

| Attribute | Value |
|-----------|-------|
| **Technical Type** | Web Application (SaaS) |
| **Domain** | EdTech |
| **Complexity** | Medium |
| **Project Context** | Greenfield - new project |

**Key EdTech Considerations:**
- Student privacy compliance (FERPA considerations)
- Accessibility requirements (WCAG 2.1 AA)
- Age-appropriate design for student users
- School year / semester lifecycle alignment

---

## Success Criteria

### User Success Metrics

| User | Success Metric | Target | Measurement |
|------|----------------|--------|-------------|
| Admin | Time to confirmed substitute | < 2 minutes | From "Find Substitute" click to confirmation |
| Admin | Schedule conflicts caught pre-semester | 100% | Conflicts detected / Total potential conflicts |
| Teacher | Time to view daily schedule | < 5 seconds | First login to schedule visible |
| Teacher | Planned absence coverage confirmed | < 24 hours | Request to confirmation timestamp |
| Student | Enrollment completed without conflicts | 100% | Conflict-free schedules / Total students |
| Student | Exam overload warnings | 48+ hours advance | Warning timestamp vs exam timestamp |

### User Journey Metrics

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| First-Time Success Rate | > 85% | Users complete primary task on first attempt |
| Time to First Value | < 10 minutes | Account creation to "aha moment" |
| Task Abandonment Rate | < 10% | Users who start but don't complete key flows |
| Task Completion Rate | > 90% | Enrollment, absence booking, schedule views |

### Business Objectives

| Timeframe | Objective | Measure |
|-----------|-----------|---------|
| Day 1 | Establish baseline | Current admin time on scheduling |
| 3 months | Successful pilot | 1 school fully onboarded |
| 6 months | Efficiency gains | 50% reduction in admin scheduling time |
| 12 months | Multi-school expansion | 5+ schools on platform |
| 12 months | Growth indicator | NPS > 40 |

### Key Performance Indicators

**Operational KPIs:**
| KPI | Target |
|-----|--------|
| Substitute fill rate | 95%+ |
| Schedule conflict rate | < 1% |
| Student enrollment completion | > 90% |
| Room utilization visibility | > 70% |

**Engagement KPIs:**
| KPI | Target |
|-----|--------|
| Weekly Active Teachers | 80%+ |
| Weekly Active Students | 70%+ |
| Digital attendance adoption | 90%+ |

**Technical Health KPIs:**
| KPI | Target |
|-----|--------|
| System uptime | 99.5%+ |
| Average page load | < 2 seconds |
| Peak load (8AM rush) | < 5 seconds P95 |

---

## Target Users

### Primary User: Principal Tran (Admin/Headmaster)

**Profile:**
- School administrator managing 50 teachers, 800 students, 40 classrooms
- Responsible for semester scheduling, staff management, compliance

**Current Pain Points:**
- Hours in spreadsheet hell creating conflict-free timetables
- Panics at 7:30 AM when teachers call sick - scrambling for substitutes
- No visibility into room utilization or teacher workload
- Manually tracking student enrollment compliance

**Goals:**
- Create semester schedules with automatic conflict detection
- Find qualified substitutes in under 2 minutes
- Ensure all students meet minimum subject requirements
- Get operational insights (workload, room usage)

**Success Moment:** "A teacher called sick at 7:45 AM and I found a qualified substitute in 30 seconds."

---

### Primary User: Ms. Linh (Teacher)

**Profile:**
- Chemistry teacher, 5 years experience
- Teaches multiple classes across grade levels

**Current Pain Points:**
- Checks 3 different places to know her schedule
- When sick, calls colleagues one by one for coverage
- Paper-based attendance is tedious
- No easy workload visibility

**Goals:**
- Glance and know next class + room instantly
- Book planned absences with substitute confirmation
- Quick digital attendance
- See weekly workload at a glance

**Success Moment:** "I requested leave for tomorrow and saw 3 qualified substitutes available. Done in 2 minutes."

---

### Primary User: Minh (Student)

**Profile:**
- 16-year-old high school student
- Needs to register for 10 subjects, balancing academics with football

**Current Pain Points:**
- Enrollment confusion - doesn't know if subjects conflict
- Misses classes due to unannounced cancellations
- Exam overload surprises
- Doesn't always know which room

**Goals:**
- Register for subjects with conflict prevention
- Always know next class, room, and changes
- Exam schedule with advance warnings
- Never be surprised by cancellations

**Success Moment:** "I registered for all 10 subjects without a conflict, and the app warned me about 3 exams on one day."

---

### Secondary Users

| User | Role | Key Needs |
|------|------|-----------|
| IT Admin | System setup | Import data, manage accounts, configure settings |
| Department Head | Oversight | View teacher workloads, coordinate exams |

---

## User Stories & Requirements

### Epic 1: Entity Management (Foundation)

#### US-1.1: Teacher Management
**As an** Admin
**I want to** add, edit, and manage teacher profiles with their subject qualifications
**So that** I can assign teachers to appropriate classes and find qualified substitutes

**Acceptance Criteria:**
- [ ] AC-1.1.1: Admin can create teacher profile with name, email, contact info
- [ ] AC-1.1.2: Admin can assign multiple subject qualifications to a teacher
- [ ] AC-1.1.3: Admin can set teacher availability (days/times)
- [ ] AC-1.1.4: Admin can view teacher's current workload summary
- [ ] AC-1.1.5: Admin can deactivate (not delete) teacher profiles
- [ ] AC-1.1.6: System validates email uniqueness

#### US-1.2: Student Management
**As an** Admin or Teacher
**I want to** add, edit, and manage student profiles
**So that** students can be enrolled in classes and tracked

**Acceptance Criteria:**
- [ ] AC-1.2.1: Admin/Teacher can create student profile with required fields
- [ ] AC-1.2.2: Admin/Teacher can assign student to a class/grade level
- [ ] AC-1.2.3: System tracks student's enrolled subjects
- [ ] AC-1.2.4: System flags students below minimum subject requirement
- [ ] AC-1.2.5: Bulk import students via CSV supported

#### US-1.3: Class/Room Management
**As an** Admin
**I want to** manage classes and rooms with their capacities
**So that** scheduling can respect physical constraints

**Acceptance Criteria:**
- [ ] AC-1.3.1: Admin can create class with name, grade level, capacity
- [ ] AC-1.3.2: Admin can create rooms with capacity and type (classroom, lab, gym)
- [ ] AC-1.3.3: System prevents over-enrollment beyond capacity
- [ ] AC-1.3.4: Waitlist automatically created when class is full

#### US-1.4: Subject Management
**As an** Admin
**I want to** manage subjects with prerequisites and requirements
**So that** enrollment can validate student eligibility

**Acceptance Criteria:**
- [ ] AC-1.4.1: Admin can create subject with name, code, description
- [ ] AC-1.4.2: Admin can mark subject as mandatory or elective
- [ ] AC-1.4.3: Admin can set prerequisites for a subject
- [ ] AC-1.4.4: Admin can assign qualified teachers to a subject

---

### Epic 2: Scheduling & Time Bank

#### US-2.1: Timetable Creation
**As an** Admin
**I want to** create class schedules with automatic conflict detection
**So that** I can build valid timetables efficiently

**Acceptance Criteria:**
- [ ] AC-2.1.1: Admin can create time slots (periods) for the school
- [ ] AC-2.1.2: Admin can assign class + subject + teacher + room to a time slot
- [ ] AC-2.1.3: System validates: teacher not double-booked
- [ ] AC-2.1.4: System validates: room not double-booked
- [ ] AC-2.1.5: System validates: teacher qualified for subject
- [ ] AC-2.1.6: System shows "what fits" - available teachers/rooms for a slot
- [ ] AC-2.1.7: Conflicts displayed with clear explanation

#### US-2.2: Live Schedule Updates
**As a** User (Admin/Teacher/Student)
**I want to** see real-time schedule changes
**So that** I'm never caught off guard by cancellations or room changes

**Acceptance Criteria:**
- [ ] AC-2.2.1: Schedule changes reflect immediately (no refresh needed)
- [ ] AC-2.2.2: Cancelled classes shown with visual indicator
- [ ] AC-2.2.3: Room changes highlighted
- [ ] AC-2.2.4: Push/in-app notification for changes affecting user

#### US-2.3: Constraint Validation Engine
**As the** System
**I need to** validate all scheduling constraints
**So that** invalid schedules cannot be created

**Acceptance Criteria:**
- [ ] AC-2.3.1: No teacher double-booking
- [ ] AC-2.3.2: No room double-booking
- [ ] AC-2.3.3: No student double-booking
- [ ] AC-2.3.4: Class capacity respected
- [ ] AC-2.3.5: Teacher qualified for subject
- [ ] AC-2.3.6: Clear error messages when constraints violated

---

### Epic 3: Substitute Teacher System

#### US-3.1: Emergency Substitute Finder
**As an** Admin
**I want to** quickly find qualified substitute teachers for same-day absences
**So that** classes aren't cancelled when teachers are sick

**Acceptance Criteria:**
- [ ] AC-3.1.1: Admin can trigger "Find Substitute" for any class
- [ ] AC-3.1.2: System shows teachers who are: free during slot + qualified for subject
- [ ] AC-3.1.3: Results show each teacher's current day workload
- [ ] AC-3.1.4: Admin can assign substitute with one click
- [ ] AC-3.1.5: Substitute teacher notified immediately
- [ ] AC-3.1.6: Students notified of substitute teacher
- [ ] AC-3.1.7: Search completes in < 5 seconds

#### US-3.2: Planned Absence Booking
**As a** Teacher
**I want to** request leave for future dates and see substitute availability
**So that** I can ensure coverage before I'm absent

**Acceptance Criteria:**
- [ ] AC-3.2.1: Teacher can request leave for specific date(s)
- [ ] AC-3.2.2: System shows substitute availability before confirming
- [ ] AC-3.2.3: Teacher can prefer specific substitute or auto-assign
- [ ] AC-3.2.4: Admin notified of leave request
- [ ] AC-3.2.5: Leave request shows status (pending/approved/covered)
- [ ] AC-3.2.6: Teacher can cancel pending leave request

#### US-3.3: Substitute Assignment Tracking
**As an** Admin
**I want to** track substitute assignments for fairness
**So that** the same teachers aren't always burdened with substitutions

**Acceptance Criteria:**
- [ ] AC-3.3.1: System tracks substitution count per teacher
- [ ] AC-3.3.2: Substitute finder shows substitution history
- [ ] AC-3.3.3: Admin can view substitution distribution report
- [ ] AC-3.3.4: Teachers can set substitution preferences (willing/not willing)

---

### Epic 4: Admin Dashboard

#### US-4.1: Admin Overview Dashboard
**As an** Admin
**I want to** see key metrics and alerts at a glance
**So that** I can manage the school efficiently

**Acceptance Criteria:**
- [ ] AC-4.1.1: Dashboard shows today's absent teachers
- [ ] AC-4.1.2: Dashboard shows uncovered classes needing substitutes
- [ ] AC-4.1.3: Dashboard shows students below minimum enrollment
- [ ] AC-4.1.4: Quick action buttons for common tasks
- [ ] AC-4.1.5: Alerts for urgent issues (conflicts, uncovered classes)

#### US-4.2: Teacher Workload View
**As an** Admin
**I want to** see teacher workload distribution
**So that** I can balance assignments and prevent burnout

**Acceptance Criteria:**
- [ ] AC-4.2.1: View shows each teacher's weekly teaching hours
- [ ] AC-4.2.2: Visual indicator for workload level (light/normal/heavy)
- [ ] AC-4.2.3: Filter by department/subject
- [ ] AC-4.2.4: Highlight teachers exceeding threshold

---

### Epic 5: Teacher Dashboard

#### US-5.1: Teacher Quick-Glance View
**As a** Teacher
**I want to** immediately see my next class and today's schedule
**So that** I always know where to be

**Acceptance Criteria:**
- [ ] AC-5.1.1: "Next Class" prominently displayed with countdown
- [ ] AC-5.1.2: Shows: subject, room, time, student count
- [ ] AC-5.1.3: Today's full schedule visible below
- [ ] AC-5.1.4: Cancelled classes visually distinguished
- [ ] AC-5.1.5: Loads in < 2 seconds

#### US-5.2: Teacher Weekly Timetable
**As a** Teacher
**I want to** see my full week's schedule
**So that** I can plan ahead

**Acceptance Criteria:**
- [ ] AC-5.2.1: Week view shows all classes in grid format
- [ ] AC-5.2.2: Click class for details (room, students, subject)
- [ ] AC-5.2.3: Free periods clearly visible
- [ ] AC-5.2.4: Navigate between weeks easily

#### US-5.3: Digital Attendance
**As a** Teacher
**I want to** take attendance digitally
**So that** attendance records are accurate and automatic

**Acceptance Criteria:**
- [ ] AC-5.3.1: "Start Class" button on dashboard when class begins
- [ ] AC-5.3.2: Tapping "Start Class" logs attendance start time
- [ ] AC-5.3.3: Student list shown for manual absence marking
- [ ] AC-5.3.4: Attendance data saved automatically
- [ ] AC-5.3.5: Historical attendance viewable

---

### Epic 6: Student Dashboard & Enrollment

#### US-6.1: Student Schedule View
**As a** Student
**I want to** see my daily schedule with room information
**So that** I know where to go for each class

**Acceptance Criteria:**
- [ ] AC-6.1.1: "Next Class" prominently displayed
- [ ] AC-6.1.2: Shows: subject, teacher, room, time
- [ ] AC-6.1.3: Today's full schedule visible
- [ ] AC-6.1.4: Cancelled classes clearly marked
- [ ] AC-6.1.5: Room changes highlighted

#### US-6.2: Smart Enrollment Assistant
**As a** Student
**I want to** enroll in subjects with conflict detection and guidance
**So that** I complete enrollment without scheduling problems

**Acceptance Criteria:**
- [ ] AC-6.2.1: Student sees available subjects for their grade
- [ ] AC-6.2.2: Progress tracker shows X/10 subjects enrolled
- [ ] AC-6.2.3: System prevents enrolling in conflicting time slots
- [ ] AC-6.2.4: System warns about prerequisites not met
- [ ] AC-6.2.5: System suggests conflict-free time slots for remaining subjects
- [ ] AC-6.2.6: Shows mandatory subjects still needed
- [ ] AC-6.2.7: Enrollment confirmed with schedule summary

#### US-6.3: Exam Schedule & Overload Prevention
**As a** Student
**I want to** see my exam schedule with overload warnings
**So that** I can prepare and avoid exam pile-ups

**Acceptance Criteria:**
- [ ] AC-6.3.1: Upcoming exams displayed with countdown
- [ ] AC-6.3.2: Warning if > 2 exams on same day
- [ ] AC-6.3.3: Warning if > 5 exams in same week
- [ ] AC-6.3.4: Warnings appear 48+ hours in advance

#### US-6.4: Notifications
**As a** Student
**I want to** receive notifications about schedule changes
**So that** I never miss important updates

**Acceptance Criteria:**
- [ ] AC-6.4.1: Notification when class is cancelled
- [ ] AC-6.4.2: Notification when room changes
- [ ] AC-6.4.3: Notification when substitute teacher assigned
- [ ] AC-6.4.4: Exam reminders 48 hours and 24 hours before
- [ ] AC-6.4.5: Waitlist spot available notification

---

## Technical Requirements

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (SPA)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Admin     │  │   Teacher   │  │   Student   │         │
│  │  Dashboard  │  │  Dashboard  │  │  Dashboard  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER (REST)                       │
│  Authentication │ Scheduling │ Substitutes │ Notifications │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           CONSTRAINT VALIDATION ENGINE              │   │
│  │  • Teacher availability  • Room capacity            │   │
│  │  • Student conflicts     • Subject prerequisites    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                             │
│  PostgreSQL (relational data)  │  Redis (real-time cache)  │
└─────────────────────────────────────────────────────────────┘
```

### Data Model (Core Entities)

```
Teacher
├── id, name, email, phone
├── subject_qualifications[] (many-to-many with Subject)
├── availability_schedule
└── status (active/inactive)

Student
├── id, name, email, grade_level
├── enrolled_subjects[] (many-to-many with Subject)
├── class_id (belongs to Class)
└── status (active/inactive)

Class
├── id, name, grade_level
├── capacity, room_id
└── students[] (one-to-many)

Subject
├── id, name, code
├── is_mandatory, prerequisites[]
└── qualified_teachers[] (many-to-many)

Room
├── id, name, capacity
├── type (classroom/lab/gym)
└── facilities[]

TimeSlot
├── id, day_of_week, start_time, end_time
├── class_id, subject_id, teacher_id, room_id
└── status (scheduled/cancelled)

TeacherAbsence
├── id, teacher_id, date, reason
├── status (pending/approved/covered)
├── substitute_teacher_id
└── created_at, approved_at

Notification
├── id, user_id, user_type
├── type, message, read_status
└── created_at
```

### API Endpoints (Core)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/teachers` | GET, POST | List/create teachers |
| `/api/teachers/:id` | GET, PUT, DELETE | Get/update/delete teacher |
| `/api/teachers/:id/schedule` | GET | Get teacher's schedule |
| `/api/teachers/:id/workload` | GET | Get teacher's workload stats |
| `/api/students` | GET, POST | List/create students |
| `/api/students/:id/enroll` | POST | Enroll in subject |
| `/api/students/:id/schedule` | GET | Get student's schedule |
| `/api/classes` | GET, POST | List/create classes |
| `/api/subjects` | GET, POST | List/create subjects |
| `/api/rooms` | GET, POST | List/create rooms |
| `/api/schedule` | GET, POST | Get/create schedule entries |
| `/api/schedule/validate` | POST | Validate schedule constraints |
| `/api/schedule/find-substitute` | POST | Find available substitutes |
| `/api/absences` | GET, POST | List/create absence requests |
| `/api/absences/:id/assign-substitute` | POST | Assign substitute |
| `/api/notifications` | GET | Get user notifications |

### Technology Recommendations

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | React + TypeScript | Component-based, type safety, large ecosystem |
| UI Framework | Tailwind CSS + Headless UI | Rapid styling, accessible components |
| State Management | React Query + Zustand | Server state + client state separation |
| Backend | Node.js + Express or NestJS | JavaScript ecosystem, fast development |
| Database | PostgreSQL | Relational data, complex queries, reliability |
| Cache | Redis | Real-time updates, session storage |
| Authentication | JWT + bcrypt | Stateless auth, secure password storage |
| Real-time | WebSocket (Socket.io) | Live schedule updates |
| Hosting | AWS/GCP/Vercel | Scalable, reliable |

---

## Non-Functional Requirements

### Performance

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| Page load time | < 2 seconds | P50 dashboard load |
| Peak load performance | < 5 seconds | P95 at 500 concurrent users |
| API response time | < 200ms | P95 for CRUD operations |
| Substitute finder | < 5 seconds | Complex query with filtering |
| Real-time updates | < 1 second | Schedule change propagation |

### Scalability

| Requirement | Target |
|-------------|--------|
| Concurrent users | 500 initially, scalable to 5000 |
| Schools supported | Multi-tenant architecture for future |
| Data retention | 5 years of historical data |

### Security

| Requirement | Implementation |
|-------------|----------------|
| Authentication | JWT tokens with refresh mechanism |
| Authorization | Role-based access control (RBAC) |
| Data encryption | TLS 1.3 in transit, AES-256 at rest |
| Password policy | Min 8 chars, complexity requirements |
| Session management | 24-hour token expiry, secure logout |
| Input validation | Server-side validation on all inputs |
| FERPA compliance | Student data privacy controls |

### Availability

| Requirement | Target |
|-------------|--------|
| Uptime | 99.5% during school hours (7AM-5PM) |
| Planned maintenance | Off-hours only (weekends, nights) |
| Backup frequency | Daily automated backups |
| Recovery time | < 4 hours RTO |
| Recovery point | < 1 hour RPO |

### Accessibility

| Requirement | Standard |
|-------------|----------|
| WCAG compliance | Level AA |
| Keyboard navigation | Full support |
| Screen reader | Compatible with NVDA, VoiceOver |
| Color contrast | 4.5:1 minimum |
| Focus indicators | Visible on all interactive elements |

### Browser Support

| Browser | Versions |
|---------|----------|
| Chrome | Last 2 versions |
| Firefox | Last 2 versions |
| Safari | Last 2 versions |
| Edge | Last 2 versions |

---

## Risks & Mitigations

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Constraint engine performance at scale | Medium | High | Early load testing, query optimization, caching |
| Real-time sync reliability | Medium | Medium | WebSocket fallback, optimistic updates with reconciliation |
| Data migration complexity | Low | Medium | Incremental migration, validation scripts, rollback plan |

### Product Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| User adoption resistance | Medium | High | Teacher training, gradual rollout, champion users |
| Feature scope creep | High | Medium | Strict MVP boundaries, backlog discipline |
| Integration with existing school systems | Medium | Medium | CSV import/export first, API later |

### Business Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Pilot school churn | Medium | High | Close support, rapid issue resolution, feedback loops |
| Competitor response | Low | Medium | Focus on differentiation (substitute system) |

### Dependencies

| Dependency | Type | Risk Level |
|------------|------|------------|
| School provides accurate data | External | Medium |
| Teachers adopt digital attendance | Behavioral | Medium |
| Internet reliability at school | Infrastructure | Low |
| Email/notification delivery | External service | Low |

---

## Epic Overview

### Epic Sequencing

| Priority | Epic | Description | Dependencies |
|----------|------|-------------|--------------|
| 1 | Entity Management | Teachers, Students, Classes, Subjects, Rooms | None |
| 2 | Scheduling & Time Bank | Timetable creation, conflict detection | Epic 1 |
| 3 | Substitute Teacher System | Emergency + planned absence coverage | Epic 1, 2 |
| 4 | Admin Dashboard | Overview, workload views, alerts | Epic 1, 2, 3 |
| 5 | Teacher Dashboard | Quick-glance, timetable, attendance | Epic 1, 2 |
| 6 | Student Dashboard & Enrollment | Schedule view, smart enrollment, notifications | Epic 1, 2 |

### MVP Feature Matrix

| Epic | MVP Features | Post-MVP |
|------|--------------|----------|
| Entity Management | CRUD all entities, CSV import | Bulk operations, advanced filters |
| Scheduling | Basic timetable, conflict detection | Drag-and-drop, auto-suggest |
| Substitutes | Emergency finder, basic booking | Fairness tracking, preferences |
| Admin Dashboard | Alerts, workload view | Room utilization, analytics |
| Teacher Dashboard | Quick-glance, timetable, attendance | Absence history, reports |
| Student Dashboard | Schedule, basic enrollment, notifications | Waitlist, exam overload |

### Release Strategy

**MVP (v1.0) - Target: 12-16 weeks**
- All 6 epics at MVP level
- Single pilot school
- Web only

**v1.5 - 3-6 months post-MVP**
- Waitlist system
- Room utilization reports
- Drag-and-drop scheduling
- Subject recommendations

**v2.0 - 6-12 months**
- Mobile apps (iOS/Android)
- Exam scheduling with overload prevention
- Teacher burnout analytics
- API for third-party integrations

---

## Appendix

### Glossary

| Term | Definition |
|------|------------|
| Time Bank | The scheduling engine that manages all time slots and their assignments |
| Constraint Validation | Automatic checking of scheduling rules (no double-booking, etc.) |
| Substitute Finder | Feature to quickly locate available, qualified replacement teachers |
| Waitlist | Queue of students waiting for a spot in a full class |
| Smart Enrollment | Guided enrollment process with conflict prevention |

### References

- Product Brief: `docs/analysis/product-brief-classroom-manager-2026-01-19.md`
- Brainstorming Session: `docs/analysis/brainstorming-session-2026-01-19.md`

---

*PRD completed on 2026-01-19*
*Version 1.0 - Ready for Architecture & UX Design phases*
