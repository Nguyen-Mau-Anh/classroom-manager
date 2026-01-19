---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: []
session_topic: 'Classroom Management System with role-based administration and intelligent timetabling'
session_goals: 'Feature exploration and system design - defining core features, user workflows, and entity relationships'
selected_approach: 'AI-Recommended Techniques'
techniques_used: ['Role Playing', 'SCAMPER Method', 'Morphological Analysis']
ideas_generated: [35]
context_file: '.bmad/bmm/data/project-context-template.md'
session_complete: true
---

# Brainstorming Session Results

**Facilitator:** Anhnm
**Date:** 2026-01-19

## Session Overview

**Topic:** Classroom Management System with role-based administration and intelligent timetabling

**Goals:** Feature exploration and system design - defining core features, user workflows, and entity relationships

### Context Guidance

_Software/product development focus: user problems, feature ideas, technical approaches, UX, business model, and success metrics._

### Session Setup

**Core Entities Identified:**
- Classes (rooms/groups)
- Teachers
- Students
- Subjects
- Time Bank (scheduling/timetabling)

**Role-Based Permissions:**
| Role | Permissions |
|------|-------------|
| Admin/Headmaster | Add teachers, Add classes, Add students, Assign students → classes, Assign subjects → students, Assign subjects → teachers |
| Teacher | Add classes, Add students, Assign students → classes, Assign subjects → students |
| Student | TBD |

**Key Relationships:**
- Teacher ↔ Subject (teaching assignments)
- Student ↔ Subject (learning requirements)
- Student ↔ Class (enrollment)
- Class ↔ Time Bank (scheduling)

---

## Technique Selection

**Approach:** AI-Recommended Techniques
**Analysis Context:** Classroom Management System with focus on feature exploration and system design

**Recommended Techniques:**

1. **Role Playing** (collaborative): Generate solutions from multiple stakeholder perspectives (Admin/Headmaster, Teacher, Student) to ensure comprehensive feature coverage and empathy-driven design.

2. **SCAMPER Method** (structured): Systematic creativity through seven lenses (Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, Reverse) applied to each core entity for thorough feature exploration.

3. **Morphological Analysis** (deep): Map all scheduling parameters and constraints to explore valid combinations for the Time Bank timetabling engine.

**AI Rationale:** This sequence moves from understanding users → generating features → handling constraints, ensuring a well-rounded system design that serves all stakeholders while tackling the complex scheduling logic.

---

## Technique 1: Role Playing Results

### Headmaster Perspective
**Pain Points & Needs:**
- Add teachers to classes easily
- Teachers pick subjects they're qualified for
- Students enroll in suitable subjects
- Class capacity limits (50 max)
- Minimum 1 subject per student per semester compliance
- **Substitute Teacher Finder:** Smart system showing free teachers, filtering by subject qualification, displaying workload, auto-suggesting best match, notifying available teachers, tracking substitution fairness

### Teacher Perspective (Ms. Linh)
**Dashboard Needs:**
- Quick glance: see next class immediately
- Full day timetable view with rooms and student counts
- **Proactive Absence Booking:** Request leave for future dates, see substitute availability before confirming, pick preferred substitute or auto-assign

### Student Perspective (Minh)
**Enrollment Needs:**
- Smart enrollment assistant tracking progress (e.g., 2/10 subjects)
- Conflict-free time slot suggestions
- Shows mandatory subjects still missing
- Warns about schedule clashes
- Guides to fulfill all requirements

**Daily Experience Needs:**
- Next class at a glance with room info
- Full day schedule
- Cancelled/skipped class alerts
- Upcoming exams countdown
- Notifications for changes

---

## Technique 2: SCAMPER Results

| Lens | Features Generated |
|------|-------------------|
| **S - Substitute** | Dynamic "what fits" filtering (user chooses, system filters) |
| **C - Combine** | Teacher+qualifications view, Enrollment+exams linked, Class+room+time unified |
| **A - Adapt** | Netflix-style subject recommendations, Google Calendar drag-and-drop, Uber-style real-time notifications |
| **M - Modify** | Waitlist system when class full, Teacher workload meter (% capacity) |
| **P - Put to Uses** | Room utilization reports, Teacher burnout detection (substitute frequency), Student attendance patterns, Smart exam scheduling with overload prevention |
| **E - Eliminate** | Auto-approve enrollment, Digital attendance (tap to start), Single source of truth, Simple 3-role system |
| **R - Reverse** | Live real-time schedule (instant updates for cancellations/room swaps) |

---

## Technique 3: Morphological Analysis Results

### Scheduling Constraint Parameters

| Parameter | Options/Values |
|-----------|----------------|
| Time Slots | Morning (8-12), Afternoon (13-17), configurable periods |
| Days | Mon-Fri default, Sat optional, exclude holidays |
| Rooms | Regular classroom, Lab, Gym, capacity per room |
| Teacher Availability | Available, On leave, Substituting, Max hours/day & week |
| Student Conflicts | No double-booking, Max classes/day, Break between classes |
| Subject Requirements | Min 1/semester, Prerequisites, Mandatory vs Elective |
| Class Capacity | Hard limit (e.g., 50), Waitlist at 100% |
| Exam Constraints | Max 2 exams/day, Max 5 exams/week per student |

### Constraint Validation Rules

**Class Scheduling Validation:**
- Room available at time slot
- Teacher available and qualified
- No student double-booked
- Class capacity not exceeded
- If all pass → Allow, else → Show conflicts

**Exam Scheduling Validation:**
- All enrolled students free at slot
- Student exam load within limits
- Room fits all students
- If overload → Suggest alternatives

### Edge Cases Handled

| Scenario | System Response |
|----------|-----------------|
| Same-day teacher absence | Trigger substitute finder, notify students |
| Planned teacher leave | Show substitute availability before approving |
| Class full | Add to waitlist, notify when spot opens |
| Student schedule conflict | Block enrollment, suggest alternatives |
| Room double-booked | Alert admin, show available rooms |
| Exam overload | Warn scheduler, suggest reschedule |
| Below minimum subjects | Flag student, block semester start |

---

## Session Summary

### Core System Architecture

**5 Entities:**
1. **Teachers** - Profile, qualifications, availability, workload tracking
2. **Students** - Profile, enrollment, schedule, exam tracking
3. **Classes** - Capacity, room assignment, enrolled students
4. **Subjects** - Prerequisites, mandatory/elective, teacher assignments
5. **Time Bank** - Scheduling engine with constraint validation

**3 Roles:**
1. **Admin/Headmaster** - Full control, teacher management, system oversight
2. **Teacher** - Class management, student assignment, absence booking
3. **Student** - Enrollment, schedule view, exam tracking

### Feature Inventory (35 Features)

**Scheduling & Time Bank:**
- [ ] Dynamic "what fits" scheduling suggestions
- [ ] Drag-and-drop schedule editing (Google Calendar style)
- [ ] Live real-time schedule updates
- [ ] Constraint validation engine
- [ ] Smart exam scheduling with overload prevention

**Substitute Teacher System:**
- [ ] Emergency substitute finder (same-day)
- [ ] Proactive absence booking (future dates)
- [ ] Filter by qualification + availability
- [ ] Auto-suggest best match
- [ ] Notify available teachers
- [ ] Track substitution fairness

**Teacher Features:**
- [ ] Quick-glance dashboard (next class)
- [ ] Full day timetable view
- [ ] Workload meter (% capacity)
- [ ] Subject qualification management
- [ ] Digital attendance (tap to start)

**Student Features:**
- [ ] Smart enrollment assistant
- [ ] Progress tracking (X/10 subjects)
- [ ] Conflict-free time slot suggestions
- [ ] Mandatory subject alerts
- [ ] Daily dashboard with next class
- [ ] Upcoming exams countdown
- [ ] Cancelled class notifications
- [ ] Waitlist enrollment + notifications

**Admin Features:**
- [ ] Room utilization reports
- [ ] Teacher burnout detection
- [ ] Student attendance patterns
- [ ] Class capacity management
- [ ] Auto-approve enrollment (if criteria met)
- [ ] Single source of truth (no duplicate data)

**Notifications:**
- [ ] Real-time class notifications (Uber-style)
- [ ] Schedule change alerts
- [ ] Waitlist spot available
- [ ] Exam reminders

### Recommended Next Steps

1. **Create Product Brief** - Formalize vision and target users
2. **Create PRD** - Detail requirements with acceptance criteria
3. **Design UX Wireframes** - Map out the 3 dashboards (Admin, Teacher, Student)
4. **Technical Architecture** - Design database schema for 5 entities + relationships
5. **MVP Scope** - Prioritize features for first release

---

*Brainstorming session completed on 2026-01-19*
*Techniques used: Role Playing, SCAMPER, Morphological Analysis*
*Total ideas generated: 35 features*
