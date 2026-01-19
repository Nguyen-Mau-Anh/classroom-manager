---
stepsCompleted: [1, 2, 3, 4, 5, 6]
status: complete
inputDocuments: ['brainstorming-session-2026-01-19.md']
workflowType: 'product-brief'
lastStep: 2
project_name: 'classroom-manager'
user_name: 'Anhnm'
date: '2026-01-19'
---

# Product Brief: classroom-manager

**Date:** 2026-01-19
**Author:** Anhnm

---

## Executive Summary

**classroom-manager** is a comprehensive classroom management system designed to eliminate the scheduling chaos, administrative burden, and communication gaps that plague educational institutions. By unifying teachers, students, classes, subjects, and scheduling into one intelligent platform, it transforms how schools operate - from semester planning to daily class management.

The system serves three core user roles (Admin/Headmaster, Teacher, Student) with tailored dashboards that surface exactly what each user needs: headmasters get oversight and substitute management, teachers get quick schedule views and absence booking, students get smart enrollment and real-time schedule updates.

---

## Core Vision

### Problem Statement

Educational institutions struggle with fragmented, manual processes for managing the complex relationships between teachers, students, classes, subjects, and schedules. Headmasters spend hours in spreadsheet hell trying to create conflict-free timetables. Teachers can't easily see their daily schedules or arrange coverage when sick. Students face enrollment confusion, schedule conflicts, and lack visibility into cancellations or exam dates.

### Problem Impact

- **Headmasters:** Hours wasted on manual scheduling, last-minute scrambles for substitute teachers, no visibility into room utilization or teacher workload
- **Teachers:** No quick way to see next class, can't proactively book coverage for planned absences, attendance tracking is manual and tedious
- **Students:** Enrollment is confusing with no conflict detection, miss classes due to unannounced cancellations, exam overload goes undetected until it's too late

### Why Existing Solutions Fall Short

Current solutions are either:
- **Too complex:** Enterprise systems designed for universities, not K-12 schools
- **Too fragmented:** Separate tools for scheduling, attendance, enrollment that don't talk to each other
- **Too manual:** Spreadsheets and paper-based systems that can't handle real-time changes
- **No intelligence:** Don't suggest optimal times, don't prevent conflicts, don't balance workloads

### Proposed Solution

A unified classroom management platform with:
- **Smart Time Bank:** Constraint-aware scheduling that shows "what fits" dynamically
- **Substitute Teacher System:** Both emergency (same-day) and proactive (planned) absence coverage
- **Role-Based Dashboards:** Quick-glance views tailored to Admin, Teacher, and Student needs
- **Intelligent Enrollment:** Guides students through subject registration with conflict prevention
- **Live Schedule:** Real-time updates for cancellations, room changes, and exam alerts
- **Workload Intelligence:** Teacher capacity meters, student exam overload prevention, room utilization reports

### Key Differentiators

1. **Dynamic "What Fits" Filtering:** No AI black box - users make choices, system filters noise
2. **Dual Substitute System:** Both emergency AND proactive absence management
3. **Student-Centric Enrollment:** Smart assistant that prevents conflicts and ensures requirements met
4. **Exam Overload Prevention:** Automatically flags students with too many exams per day/week
5. **Simplicity:** 3 roles, single source of truth, auto-approve where possible

---

## Target Users

### Primary Users

#### 1. Principal Tran (Admin/Headmaster)
**Role:** School Administrator / Headmaster
**Context:** Manages a school with 50 teachers, 800 students, 40 classrooms

**Current Pain:**
- Drowning in spreadsheets every semester trying to build conflict-free timetables
- Panics at 7:30 AM when teachers call in sick - scrambling to find substitutes
- No visibility into which rooms are underutilized or which teachers are overloaded
- Manually tracking if every student meets minimum subject requirements

**Goals:**
- Create semester schedules efficiently with constraint validation
- Handle teacher absences gracefully with smart substitute matching
- Ensure compliance (all students enrolled in minimum subjects)
- Get operational insights (room usage, workload distribution)

**Success Moment:** "It's Monday morning, a teacher just called sick, and I found a qualified substitute in 30 seconds instead of 30 minutes."

---

#### 2. Ms. Linh (Teacher)
**Role:** Chemistry Teacher, 5 years experience
**Context:** Teaches multiple classes across different grade levels

**Current Pain:**
- Checks 3 different places to know her schedule
- When sick, has to call colleagues one by one to find coverage
- Attendance is paper-based and tedious
- No easy way to see her workload for the week

**Goals:**
- Glance at phone/computer and instantly know next class + room
- Book planned absences and see substitute availability upfront
- Quick digital attendance (tap to start class)
- See weekly workload at a glance

**Success Moment:** "I'm feeling unwell, I open the app, request leave for tomorrow, and it shows me 3 qualified substitutes available. Done in 2 minutes."

---

#### 3. Minh (Student)
**Role:** 16-year-old high school student
**Context:** Needs to register for 10 subjects this semester, balancing academics with football practice

**Current Pain:**
- Enrollment is confusing - doesn't know if subjects conflict until it's too late
- Misses classes because cancellations aren't communicated quickly
- Exam schedule surprises him - finds out too late he has 4 exams on one day
- Doesn't always know which room to go to

**Goals:**
- Register for subjects with smart conflict detection
- Always know next class, room, and any changes
- Get ahead of exam schedule with reminders
- Never be surprised by a cancelled class

**Success Moment:** "I registered for all 10 subjects without a single conflict, and the app warned me that I almost had 3 exams on Thursday - so I swapped one to Friday."

---

### Secondary Users

| User | Role | Key Interaction |
|------|------|-----------------|
| **IT Admin** | System setup | Configure school structure, import teacher/student data, manage accounts |
| **Department Head** | Oversight | View teacher workloads, approve subject assignments, coordinate exams |

---

### User Journey

| Stage | Principal Tran | Ms. Linh | Minh |
|-------|----------------|----------|------|
| **Discovery** | Hears about system at education conference | Introduced by headmaster at staff meeting | Told to use it for enrollment |
| **Onboarding** | Imports teacher/student data, sets up rooms & subjects | Logs in, sets subject qualifications | Logs in, sees available subjects |
| **First Value** | Creates first conflict-free schedule in hours, not days | Sees clean daily timetable on first login | Registers for 3 subjects with conflict warnings |
| **Aha! Moment** | First substitute found in 30 seconds | First planned absence booked with coverage confirmed | Exam overload prevented automatically |
| **Daily Use** | Dashboard with alerts, substitute requests, reports | Quick-glance schedule, tap attendance | Check schedule, exam reminders, notifications |

---

## Success Metrics

### User Success Metrics

| User | Success Metric | Target | Measurement |
|------|----------------|--------|-------------|
| **Principal Tran** | Time to confirmed substitute | < 2 minutes | Clock starts at "Find Substitute" click, ends at substitute confirmation |
| **Principal Tran** | Schedule conflicts caught pre-semester | 100% | Conflicts detected / Total potential conflicts |
| **Ms. Linh** | Time to view daily schedule | < 5 seconds | First login to schedule visible |
| **Ms. Linh** | Planned absence coverage confirmed | < 24 hours | Request timestamp to confirmation timestamp |
| **Minh** | Enrollment completed without conflicts | 100% | Students with conflict-free schedules / Total students |
| **Minh** | Exam overload warnings | 48+ hours advance | Warning timestamp vs exam timestamp |

### User Journey Metrics (Party Mode Addition)

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| **First-Time Success Rate** | > 85% | Users complete primary task on first attempt |
| **Time to First Value** | < 10 minutes | Account creation to "aha moment" |
| **Task Abandonment Rate** | < 10% | Users who start but don't complete key flows |
| **Task Completion Rate** | > 90% | Enrollment, absence booking, schedule views completed |

---

### Business Objectives

| Timeframe | Objective | Measure | Baseline Required |
|-----------|-----------|---------|-------------------|
| **Day 1** | Establish baseline | Current admin time on scheduling | Yes - measure before launch |
| **3 months** | Successful pilot | 1 school fully onboarded, all users trained | - |
| **6 months** | Efficiency gains | 50% reduction in admin scheduling time | Compare to Day 1 baseline |
| **12 months** | Multi-school expansion | 5+ schools on platform | - |
| **12 months** | Growth indicator | NPS > 40 (promoter territory) | Track quarterly |

---

### Key Performance Indicators

**Operational KPIs:**

| KPI | Target | Measurement | Notes |
|-----|--------|-------------|-------|
| Substitute fill rate | 95%+ | Confirmed acceptances / Total absence requests | "Filled" = substitute accepted AND confirmed |
| Schedule conflict rate | < 1% | Post-launch conflicts / Total scheduled slots | - |
| Student enrollment completion | > 90% | Students with all required subjects / Total students | - |
| Room utilization | > 70% | Logged occupied hours / Available hours | Requires tap-to-start attendance logging |

**Engagement KPIs:**

| KPI | Target | Measurement | Notes |
|-----|--------|-------------|-------|
| Weekly Active Teachers | 80%+ | Teachers with 1+ login per week | More realistic than daily |
| Peak-Day Teacher Usage | 50%+ | Teachers active on busiest day | Monday mornings expected peak |
| Weekly Active Students | 70%+ | Students checking schedule weekly | - |
| Digital attendance adoption | 90%+ | Classes using tap-to-start | - |
| Notification response rate | > 60% | Acknowledged alerts / Total alerts sent | - |

**Technical Health KPIs:**

| KPI | Target | Measurement | Notes |
|-----|--------|-------------|-------|
| System uptime | 99.5%+ | Availability during school hours (7AM-5PM) | - |
| Average page load | < 2 seconds | P50 dashboard load time | - |
| Peak load performance | < 5 seconds | P95 load at 8AM rush | 800 concurrent users stress test |
| Teacher burnout flags actioned | < 1 week | Time from flag to admin action | - |

---

## MVP Scope

### Core Features (Must Have for Launch)

**Entity Management:**
| Feature | Why Essential |
|---------|---------------|
| Teacher profiles with subject qualifications | Foundation for all scheduling |
| Student profiles with class enrollment | Foundation for all scheduling |
| Class/Room management with capacity | Foundation for all scheduling |
| Subject catalog with prerequisites | Foundation for enrollment |

**Admin/Headmaster MVP:**
| Feature | Why Essential |
|---------|---------------|
| Add/edit teachers, students, classes, subjects | Core data management |
| Basic timetable creation with conflict detection | Solves main pain point |
| Emergency substitute finder | The "killer feature" - aha moment |
| View teacher workload summary | Prevents burnout, informs decisions |

**Teacher MVP:**
| Feature | Why Essential |
|---------|---------------|
| Quick-glance dashboard (next class + room) | Immediate daily value |
| Full day/week timetable view | Core need |
| Digital attendance (tap to start) | Replaces paper, enables data |
| Request planned absence + see substitute availability | Proactive coverage |

**Student MVP:**
| Feature | Why Essential |
|---------|---------------|
| Subject enrollment with conflict detection | Prevents scheduling nightmares |
| Progress tracker (X/10 subjects registered) | Guides completion |
| Daily schedule view with room info | Core daily need |
| Cancelled class notifications | Prevents wasted trips |

---

### Out of Scope for MVP

| Feature | Why Deferred | Target Release |
|---------|--------------|----------------|
| Netflix-style subject recommendations | Nice-to-have, not essential | v1.5 |
| Drag-and-drop schedule editing | Complex UX, basic works first | v1.5 |
| Exam scheduling with overload prevention | Requires exam module first | v2.0 |
| Room utilization reports | Analytics can wait | v1.5 |
| Teacher burnout detection | Needs usage data first | v2.0 |
| Waitlist system | Edge case for MVP | v1.5 |
| Substitution fairness tracking | Nice-to-have analytics | v2.0 |
| Student attendance patterns | Analytics can wait | v2.0 |
| Parent portal | Separate user type | v3.0 |
| Mobile app | Web-first, mobile later | v2.0 |

---

### MVP Success Criteria

**Launch Gates (Before Public Release):**
- [ ] All 3 dashboards functional (Admin, Teacher, Student)
- [ ] Conflict detection catches 100% of double-bookings
- [ ] Substitute finder returns results in < 5 seconds
- [ ] System handles 500 concurrent users without degradation

**30-Day Success (Pilot School):**
| Metric | Target | Go/No-Go |
|--------|--------|----------|
| Teacher adoption | 70%+ weekly active | Must hit to proceed |
| Student enrollment completion | 85%+ | Must hit to proceed |
| Substitute fill rate | 80%+ | Must hit to proceed |
| Critical bugs | < 3 open P1s | Must hit to proceed |
| NPS (early signal) | > 20 | Signal for expansion |

**Decision Point:** If 30-day targets met → proceed to multi-school expansion. If not → iterate on core before scaling.

---

### Future Vision

**v1.5 (3-6 months post-launch):**
- Waitlist system for full classes
- Drag-and-drop schedule editing
- Room utilization reports
- Subject recommendations based on past enrollment

**v2.0 (6-12 months):**
- Exam scheduling module with overload prevention
- Mobile apps (iOS/Android)
- Teacher burnout analytics
- Student attendance pattern insights
- API for third-party integrations (SIS systems)

**v3.0+ (12+ months):**
- Multi-school district management
- Parent portal with visibility into child's schedule
- Predictive analytics (enrollment trends, resource planning)
- Integration with learning management systems (LMS)

**Long-Term Vision:** The operating system for K-12 school operations - from scheduling to resource management to predictive planning.
