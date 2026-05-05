# Planning Document: Patient Management Application

**Document Version:** 1.0  
**Date Created:** May 5, 2026  
**Status:** APPROVED FOR EXECUTION  
**Planning Method:** Agile with structured phases  

---

## Executive Summary

This planning document transforms the Business Requirements Document (BRD) into a strategic execution plan for the Patient Management Application. It defines the phased approach, key decisions, resource allocation, and success validation criteria needed to deliver a working product that meets all BRD objectives within 12–16 weeks.

**Core Goal:** Build a lightweight, web-based application that reduces clinic paperwork by 80%, enables doctors to complete consultations in 2–3 minutes, and maintains reliable patient records with zero data loss.

**Scope:** Phase 1 only — core features (patients, appointments, consultations, prescriptions, data export). Multi-user, billing, and mobile deferred to Phase 2.

---

## 1. Project Overview & Vision

### Problem to Solve
Small clinic doctors face three critical inefficiencies:
1. **Time Loss:** Manual paper records slow patient lookup and history tracking (currently ~5–10 min per patient)
2. **Data Risk:** Paper-based systems risk lost, incomplete, or illegible records; no audit trail
3. **Workflow Friction:** Multiple manual steps (write → file → search → retrieve) break consultation flow

### Solution Vision
A single-doctor, web-based application that:
- **Speeds patient access:** Find any patient in < 2 seconds
- **Streamlines consultations:** Complete vitals → diagnosis → prescription in 2–3 minutes
- **Ensures data integrity:** Digital records with automatic backups, audit logs, and print capability
- **Reduces paper:** 80%+ elimination of manual forms and filing

### Success Threshold
✅ Doctor operates independently after 1-hour training  
✅ Consultation completes in 2–3 minutes (measured in UAT)  
✅ Search and history load in < 2 seconds  
✅ Prescriptions print without failure  
✅ Data exports work in all formats (CSV/PDF)  
✅ Zero data loss or corruption incidents  

---

## 2. Strategic Approach & Key Decisions

### Approach Philosophy: "Simple, Fast, Reliable"

**Simplicity First:** One-user app with minimal features reduces complexity, speeds delivery, enables fast day-1 training.

**Speed Priority:** Focus on consultation workflow (vitals → diagnosis → medication → print). Defer secondary features to Phase 2.

**Reliability Obsession:** Mandatory data validation, auto-save drafts, offline resilience, encrypted storage, automated backups.

### Key Technology Decisions

| Decision | Choice | Rationale | Risk |
|----------|--------|-----------|------|
| **Frontend** | React + TypeScript | Fast, responsive UI; strong typing reduces bugs | Learning curve if team unfamiliar |
| **Backend** | Node.js + Express | Lightweight, fast REST API; good ecosystem | Single-threaded (mitigate with async/await) |
| **Database** | PostgreSQL | Relational for structured patient/appointment data; ACID compliance for data integrity | Setup complexity (mitigate with Docker) |
| **Authentication** | JWT + secure session | Single-user auth, simple to implement | No built-in roles (future-proof with design) |
| **Deployment** | Docker + cloud VM (AWS/Azure) | Containerized, easy to scale; clinic owns data | Requires DevOps knowledge |
| **Printing** | Browser native API | No external service dependency; doctor controls clinic printer | Printer compatibility varies (test early) |

### Key Design Decisions

| Decision | Rationale | Impact |
|----------|-----------|--------|
| **Mandatory vitals before save** | Enforces data quality; no incomplete records | +10% form complexity; prevents data gaps |
| **Auto-save drafts every 30s** | Network drop protection; prevents data loss | +15% backend complexity; +slight UI latency |
| **No preview step for print** | Reduce consultation time (2–3 min constraint) | -Quality assurance risk; mitigate with UAT testing |
| **Patient ID-based lookup** | Handles duplicate names without friction | +minimal UI complexity; +unique ID generation |
| **Offline-first caching** | Resilience to clinic network drops | +30% frontend complexity; +sync logic |
| **Last 12 months history default** | Balance completeness vs. performance | -Full history availability; mitigate with "load older" button |

---

## 3. Goals & Success Criteria

### Goals (SMART Format)

**Goal 1: Eliminate Paper Workflow**  
Digitize 100% of patient records, appointments, consultations, and prescriptions within 16 weeks. Measure: Paper usage audit before vs. after go-live.

**Goal 2: Optimize Consultation Speed**  
Enable doctor to record vitals, complaints, diagnosis, and medication in 2–3 minutes. Measure: Timed E2E test during UAT.

**Goal 3: Ensure Data Reliability**  
Zero data loss, 100% successful prescription printing, automated daily backups. Measure: Incident logs, print success rate, backup verification.

**Goal 4: Enable Self-Sufficiency**  
Doctor operates independently after 1-hour training, with minimal support calls. Measure: Support ticket volume first week, usability survey.

**Goal 5: Achieve High Adoption**  
Doctor uses system for 100% of daily consultations within 2 weeks of go-live. Measure: Usage analytics, feature adoption tracking.

### Success Criteria (Acceptance Gates)

| Criterion | Target | Validation Method |
|-----------|--------|-------------------|
| **Usability** | Consultation completes in 2–3 minutes | Timed E2E test with doctor; measure 10+ consultations |
| **Performance** | Search < 2s, history < 2s, page load < 2s | Load testing (1,000+ patient dataset); Lighthouse audit |
| **Reliability** | 100% data persistence, zero unplanned downtime first month | Incident tracking, backup verification, uptime monitoring |
| **Security** | Passwords encrypted, JWT enforced, HTTPS enforced, session timeout | Security audit checklist; pen testing optional |
| **Data Integrity** | All vitals saved, prescriptions complete, no corruption | Data validation tests; audit log verification |
| **Quality** | Code coverage ≥85% backend, ≥80% frontend, zero critical bugs | Test reports, code coverage dashboard |
| **Training** | Doctor confident after 1-hour session | Post-training survey (target 9/10 confidence) |
| **Support** | ≤5 support tickets first week; ≥80% resolved same-day | Support ticket system; resolution SLA tracking |

---

## 4. Detailed Task Breakdown by Phase

### Phase 1: Foundation & Infrastructure (Weeks 1–2)
**Objective:** Establish development environment, database, authentication, and UI framework.

#### 1.1 Environment & Project Setup
**Tasks:**
- [ ] Create GitHub repository with branch protection rules
- [ ] Scaffold React frontend (TypeScript + Vite)
- [ ] Scaffold Node.js backend (TypeScript + Express)
- [ ] Configure ESLint, Prettier, pre-commit hooks
- [ ] Set up PostgreSQL (Docker or managed)
- [ ] Configure build pipeline (GitHub Actions CI/CD)
- [ ] Provision development server (AWS EC2 / Azure VM)

**Deliverables:** Working dev environment; both frontend and backend boot without errors.

**Dependencies:** None

**Acceptance Criteria:**
- ✅ `npm install` completes without errors
- ✅ `npm run dev` starts frontend on http://localhost:3000
- ✅ `npm run dev` starts backend on http://localhost:5000
- ✅ `npm test` runs tests successfully
- ✅ GitHub Actions CI runs on every push

**Estimate:** 8–12 hours

---

#### 1.2 Database Schema & Migrations
**Tasks:**
- [ ] Design PostgreSQL schema (normalized, ACID-compliant)
- [ ] Create tables: users, patients, appointments, consultations, medications, prescriptions, audit_log
- [ ] Add primary/foreign keys and constraints
- [ ] Create indexes for performance (patient name/phone, appointment date, consultation lookup)
- [ ] Write migration scripts
- [ ] Create seed data script for testing

**Deliverables:** SQL schema file; migration scripts; seed data script.

**Dependencies:** PostgreSQL environment ready

**Acceptance Criteria:**
- ✅ Schema normalizes data (no redundancy)
- ✅ Foreign keys enforce data integrity
- ✅ Indexes present for search-critical fields
- ✅ `npm run db:migrate` runs without errors
- ✅ Seed data loads 100+ test patients without issues

**Estimate:** 8–10 hours

---

#### 1.3 Authentication & Session Management
**Tasks:**
- [ ] Implement POST /auth/login endpoint
- [ ] Generate JWT tokens (8-hour expiration)
- [ ] Implement refresh token (24-hour expiration)
- [ ] Add JWT validation middleware
- [ ] Hash passwords using bcrypt
- [ ] Implement POST /auth/logout endpoint
- [ ] Add session timeout (30 min inactivity)
- [ ] Create auth context (React frontend)

**Deliverables:** Working auth flow; login page; protected route middleware.

**Dependencies:** Database schema, backend setup

**Acceptance Criteria:**
- ✅ Valid login returns JWT token
- ✅ Invalid login returns 401 error
- ✅ Protected routes deny access without token
- ✅ Token expiration triggers refresh flow
- ✅ Session timeout logs out user after 30 min inactivity
- ✅ Passwords never stored as plaintext

**Estimate:** 8–10 hours

---

#### 1.4 Frontend Base Layout & Component Library
**Tasks:**
- [ ] Create base layout (header, sidebar, main content area)
- [ ] Build responsive grid system (desktop-first)
- [ ] Create reusable component library:
  - Button, Input, Dropdown, Modal, Card, Table, Toast
  - Vital input components (temp, BP, pulse with formatting)
- [ ] Add global error handling & notifications
- [ ] Implement navigation routing
- [ ] Add dark/light mode support (optional)

**Deliverables:** Reusable component library; base layout template; navigation structure.

**Dependencies:** Frontend scaffold, authentication

**Acceptance Criteria:**
- ✅ Components are reusable across pages
- ✅ Layout is responsive (mobile/tablet/desktop)
- ✅ Navigation routes work without errors
- ✅ Error messages display clearly
- ✅ No layout shift (CLS < 0.1)

**Estimate:** 10–12 hours

---

### Phase 2: Patient Management (Weeks 2–4)
**Objective:** Enable patient registration, search, and profile management.

#### 2.1 Patient Registration & Editing
**Tasks:**
- [ ] Create POST /api/patients endpoint
- [ ] Implement patient form (name, DOB, gender, contact, email, address)
- [ ] Add client-side validation (name, phone format, age >= 0)
- [ ] Add server-side validation (duplicate detection by phone + DOB)
- [ ] Create PUT /api/patients/:id endpoint for edits
- [ ] Generate unique patient ID (UUID or ULID)
- [ ] Implement "Add Patient" modal UI
- [ ] Show success confirmation

**Deliverables:** Patient CRUD endpoints; registration form; edit form.

**Dependencies:** Database schema, authentication

**Acceptance Criteria:**
- ✅ Form prevents submission with missing required fields
- ✅ Duplicate phone + DOB detected (warning shown)
- ✅ Patient saved to database with unique ID
- ✅ Edits update database without data loss
- ✅ UI shows success message after save

**Estimate:** 10–12 hours

---

#### 2.2 Patient Search & Typeahead
**Tasks:**
- [ ] Implement GET /api/patients/search?q= endpoint
- [ ] Add name search (case-insensitive ILIKE)
- [ ] Add phone search (exact or contains)
- [ ] Return top 10 results with ID, name, age, phone
- [ ] Implement typeahead UI (debounced 300ms)
- [ ] Cache recent searches in localStorage
- [ ] Add "Create new patient" option if no matches

**Deliverables:** Search API; search UI with typeahead; result selection logic.

**Dependencies:** Patient registration, database indexes

**Acceptance Criteria:**
- ✅ Search for "John" returns all Johns in < 1 second
- ✅ Phone search returns exact patient
- ✅ Typeahead appears on 3rd character
- ✅ Recent patients load instantly from cache
- ✅ Clicking result loads patient profile

**Estimate:** 8–10 hours

---

#### 2.3 Patient Profile & Quick Actions
**Tasks:**
- [ ] Create patient profile view (read-only summary)
- [ ] Display demographics (name, age, gender, contact, ID)
- [ ] Add action buttons:
  - "Schedule Appointment"
  - "New Consultation"
  - "View History"
  - "Edit Details"
- [ ] Show badge: "First-time" or "Repeat patient"
- [ ] Alert if last visit > 6 months
- [ ] Link to appointment scheduling

**Deliverables:** Patient profile page; action button routing.

**Dependencies:** Patient search, appointment module (phase 3)

**Acceptance Criteria:**
- ✅ All patient fields display correctly
- ✅ Buttons route to correct workflows
- ✅ Profile loads in < 1 second
- ✅ No editable fields in read-only view

**Estimate:** 6–8 hours

---

### Phase 3: Appointment Management (Weeks 4–6)
**Objective:** Enable appointment scheduling, daily tracking, and status management.

#### 3.1 Appointment Scheduling
**Tasks:**
- [ ] Implement POST /api/appointments endpoint
- [ ] Create appointment form (patient search, date picker, time slots, reason)
- [ ] Implement conflict detection (no double-booking)
- [ ] Validate date >= today, time within clinic hours (9 AM–6 PM)
- [ ] Save appointment with status = "Scheduled"
- [ ] Return confirmation with appointment ID
- [ ] Display appointment in daily list

**Deliverables:** Appointment API; scheduling form; conflict detection logic.

**Dependencies:** Patient management, database schema

**Acceptance Criteria:**
- ✅ Cannot book past dates/times
- ✅ Double-booking prevented with clear warning
- ✅ Confirmation shows patient name + date/time
- ✅ Appointment persists in database
- ✅ Appointment appears in daily list

**Estimate:** 8–10 hours

---

#### 3.2 Daily Appointment Dashboard
**Tasks:**
- [ ] Implement GET /api/appointments?date= endpoint (today's appointments)
- [ ] Create dashboard displaying appointments sorted by time
- [ ] Add appointment list columns: Time | Patient | Contact | Status | Actions
- [ ] Implement inline status updates (Scheduled → Completed, Cancelled, No-show)
- [ ] Add "Start Consultation" button → loads consultation form
- [ ] Add "Reschedule" button → date/time picker
- [ ] Add "Cancel" button → mark as Cancelled with reason
- [ ] Implement "Add Walk-in" quick button
- [ ] Allow drag-to-reorder appointments

**Deliverables:** Dashboard page; appointment list view; status update logic.

**Dependencies:** Appointment scheduling, consultation workflow (phase 4)

**Acceptance Criteria:**
- ✅ Today's date auto-selected on load
- ✅ Appointments sorted by time
- ✅ Status changes save immediately
- ✅ Walk-in addition works without reload
- ✅ Reordering updates database
- ✅ "Start Consultation" loads form with appointment context

**Estimate:** 12–14 hours

---

#### 3.3 Appointment History & Filtering
**Tasks:**
- [ ] Create past appointments view
- [ ] Add date range picker (from/to dates)
- [ ] Add status filter (all, completed, cancelled, no-show)
- [ ] Display columns: Date | Time | Patient | Status | Consultation (Y/N)
- [ ] Click appointment → view associated consultation
- [ ] Support pagination (last 30 days default)

**Deliverables:** Appointment history page; filtering logic.

**Dependencies:** Appointment data, consultation module

**Acceptance Criteria:**
- ✅ Filters work independently and in combination
- ✅ Date range queries complete in < 1 second
- ✅ Clicking appointment loads consultation details
- ✅ Pagination works smoothly

**Estimate:** 6–8 hours

---

### Phase 4: Consultation Workflow (Weeks 6–10)
**Objective:** Implement core consultation form (vitals, complaints, diagnosis, medications).

#### 4.1 Vitals Capture Form
**Tasks:**
- [ ] Create vitals input form with three fields:
  - Temperature (°F or °C)
  - Blood Pressure (systolic/diastolic)
  - Pulse (BPM)
- [ ] Implement input masks (enforce format)
- [ ] Add range validation:
  - Temp: 95–105°F (warn if outside)
  - BP: 0–200 systolic, 0–150 diastolic (warn if outside)
  - Pulse: 30–200 BPM (warn if outside)
- [ ] Show range alert banner if abnormal
- [ ] Make vitals mandatory (cannot save consultation without them)
- [ ] Add "Copy from last visit" button (pre-fill for repeat patients)
- [ ] Implement auto-focus (Tab moves to next field)

**Deliverables:** Vitals form component; validation logic; copy-from-history feature.

**Dependencies:** Patient profile, appointment selection

**Acceptance Criteria:**
- ✅ Cannot save consultation without all vitals
- ✅ Range warnings appear but don't block save
- ✅ Input masks enforce correct format
- ✅ "Copy from last visit" pre-fills correctly
- ✅ Auto-focus works smoothly

**Estimate:** 8–10 hours

---

#### 4.2 Complaints & Diagnosis Form
**Tasks:**
- [ ] Create complaints textarea (free text, max 500 chars)
- [ ] Create diagnosis textarea (free text, max 500 chars)
- [ ] Add character counters
- [ ] Make both optional (unlike vitals)
- [ ] Add "Copy from last visit" option (optional)
- [ ] Implement placeholder text (e.g., "Enter symptoms")

**Deliverables:** Complaints/diagnosis form components.

**Dependencies:** Vitals form, patient profile

**Acceptance Criteria:**
- ✅ Fields are optional
- ✅ Character limits enforced
- ✅ Text saves correctly to database
- ✅ Copy-from-history works

**Estimate:** 4–6 hours

---

#### 4.3 Medication Entry & Management
**Tasks:**
- [ ] Create medication add form:
  - Medicine name (text + autocomplete from past Rx)
  - Dosage (e.g., "500mg")
  - Frequency (dropdown: OD, BD, TID, QID, etc.)
  - Duration (e.g., "5 days")
  - Instructions (optional)
- [ ] Implement autocomplete from past medications
- [ ] Display medication list (editable before save)
- [ ] Allow edit/remove medications
- [ ] Validate: At least 1 medicine required

**Deliverables:** Medication entry form; autocomplete logic; medication list UI.

**Dependencies:** Consultation data schema, past medication lookup

**Acceptance Criteria:**
- ✅ Autocomplete suggests past medicines
- ✅ Medications added to preview list
- ✅ Edit/remove work before final save
- ✅ At least 1 medicine required for prescription
- ✅ Dosage, frequency, duration validated

**Estimate:** 10–12 hours

---

#### 4.4 Consultation Form Integration & Auto-Save
**Tasks:**
- [ ] Combine vitals, complaints, diagnosis, medications into single form
- [ ] Implement POST /api/consultations endpoint
- [ ] Add auto-save every 30 seconds (browser session storage + database)
- [ ] Implement "Save" button (save all fields)
- [ ] Add "Cancel" button (discard draft)
- [ ] Display patient name & ID in fixed header
- [ ] Show "Saving..." spinner during save
- [ ] Display success notification ("Consultation saved")
- [ ] Handle network drops (queue locally, retry when online)
- [ ] Reset form after save (ready for next patient)

**Deliverables:** Full consultation form; auto-save logic; network resilience.

**Dependencies:** All above form components, database schema

**Acceptance Criteria:**
- ✅ All fields save correctly
- ✅ Auto-save works every 30 seconds
- ✅ Network drop doesn't lose data (queued locally)
- ✅ Form resets after save
- ✅ Success notification appears
- ✅ Consultation appears in patient history

**Estimate:** 10–12 hours

---

### Phase 5: Prescription & History (Weeks 10–12)
**Objective:** Generate printable prescriptions and display consultation history.

#### 5.1 Prescription Generation & Template
**Tasks:**
- [ ] Design prescription HTML/CSS template with sections:
  - Header (clinic name, doctor, contact, timestamp)
  - Patient (name, age, gender, contact)
  - Vitals (temp, BP, pulse)
  - Diagnosis
  - Medications (table: name | dosage | frequency | duration | instructions)
  - Footer (signature line, clinic stamp area)
- [ ] Optimize for A4 paper printing
- [ ] Implement print view (CSS media queries)
- [ ] Implement PDF generation (jsPDF or similar)
- [ ] Create GET /api/prescriptions/:id endpoint
- [ ] Track prescription status (Generated, Printed, Failed)

**Deliverables:** Prescription template; print/PDF logic; prescription API.

**Dependencies:** Consultation form, medications entry

**Acceptance Criteria:**
- ✅ Prescription renders correctly on A4
- ✅ All consultation data appears
- ✅ Print button opens browser print dialog
- ✅ PDF generation works without errors
- ✅ Printed state tracked in database

**Estimate:** 10–12 hours

---

#### 5.2 Print Workflow & Error Handling
**Tasks:**
- [ ] Implement print button in consultation form
- [ ] Detect printer availability (basic check)
- [ ] If printer offline:
  - Show warning: "Printer not detected. Save as PDF?"
  - Offer "Save PDF" or "Retry Print" options
- [ ] Log print success/failure in audit log
- [ ] Auto-open PDF in new tab if print unavailable
- [ ] Allow retry without data loss

**Deliverables:** Print workflow logic; error handling; audit logging.

**Dependencies:** Prescription generation

**Acceptance Criteria:**
- ✅ Print works when printer available
- ✅ Offline fallback to PDF works
- ✅ Audit log records print attempts
- ✅ User can retry without data loss

**Estimate:** 6–8 hours

---

#### 5.3 Patient Visit History View
**Tasks:**
- [ ] Create history page (GET /api/patients/:id/consultations)
- [ ] Display table: Date | Vitals | Diagnosis | Medications | Actions
- [ ] Load last 12 months of consultations (default)
- [ ] Add date range filter
- [ ] Click row → expand or drill into consultation details
- [ ] Implement pagination (load 10 at a time, "Load More")
- [ ] Add action buttons:
  - "View Prescription" → display prescription
  - "Reuse Medications" → copy to new consultation
  - "Print" → print prescription

**Deliverables:** History page; filtering/pagination logic; action buttons.

**Dependencies:** Consultation data, prescription generation

**Acceptance Criteria:**
- ✅ History loads in < 2 seconds
- ✅ Filtering works
- ✅ Pagination works smoothly
- ✅ All consultation details display correctly

**Estimate:** 10–12 hours

---

### Phase 6: Data Export & Reporting (Weeks 12–13)
**Objective:** Enable CSV/PDF export for backups and audits.

#### 6.1 CSV Export
**Tasks:**
- [ ] Implement GET /api/exports/patients?format=csv endpoint
- [ ] Implement GET /api/exports/consultations?format=csv endpoint
- [ ] Export patients: Name, Age, Gender, Contact, ID, Created Date
- [ ] Export consultations: Date, Vitals, Diagnosis, Medications
- [ ] Add date range filter for exports
- [ ] Generate CSV client-side (fast, no latency)
- [ ] Download with filename: patients_export_YYYYMMDD.csv

**Deliverables:** Export endpoints; CSV generation logic; download UI.

**Dependencies:** Patient and consultation data

**Acceptance Criteria:**
- ✅ CSV generated without errors
- ✅ Data formats correctly (proper escaping)
- ✅ File downloads with correct name
- ✅ CSV opens in Excel/Sheets without corruption

**Estimate:** 6–8 hours

---

#### 6.2 PDF Export (Comprehensive Report)
**Tasks:**
- [ ] Create PDF report layout:
  - Title page (clinic, export date)
  - Patient summary (total visits)
  - Consultations table
  - Prescriptions appended
- [ ] Implement using jsPDF
- [ ] Add header/footer (page numbers)
- [ ] Allow date range filtering
- [ ] Download with filename: patient_report_YYYYMMDD.pdf

**Deliverables:** PDF report generation; export UI.

**Dependencies:** CSV export, prescription template

**Acceptance Criteria:**
- ✅ PDF renders without layout errors
- ✅ All pages readable and printable
- ✅ File downloads correctly

**Estimate:** 8–10 hours

---

#### 6.3 Data Backup Status & Manual Backup
**Tasks:**
- [ ] Add backup status banner (Last backup: [date/time])
- [ ] Implement "Trigger Manual Backup" button
- [ ] Export full data to CSV on backup
- [ ] Store backup logs
- [ ] Plan for automated daily backups (Phase 2)

**Deliverables:** Backup UI; manual export logic; backup status display.

**Dependencies:** Export endpoints

**Acceptance Criteria:**
- ✅ Backup status displays correctly
- ✅ Manual backup creates file
- ✅ Doctor can view backup logs

**Estimate:** 4–6 hours

---

### Phase 7: Testing & QA (Weeks 13–15)
**Objective:** Comprehensive testing, validation, and UAT.

#### 7.1 Unit Testing (Backend & Frontend)
**Tasks:**
- [ ] Write unit tests for:
  - Vital validation logic (range checking)
  - Patient search algorithm
  - Appointment conflict detection
  - CSV data formatting
  - Date calculations
- [ ] Target ≥80% code coverage (backend), ≥80% (frontend)
- [ ] Use Jest + React Testing Library

**Deliverables:** Test suite with ≥80% coverage; test report.

**Dependencies:** All functional code complete

**Acceptance Criteria:**
- ✅ ≥80% code coverage achieved
- ✅ All tests pass
- ✅ No critical bugs in test results

**Estimate:** 16–20 hours

---

#### 7.2 Integration Testing
**Tasks:**
- [ ] Test complete workflows:
  - Login → search patient → schedule appointment → start consultation → save → print
  - Patient registration → duplicate detection → profile load
  - Appointment reschedule → status update
  - Medication autocomplete → prescription generation
- [ ] Test API integration with database
- [ ] Test error handling (invalid input, network errors)
- [ ] Use Supertest for API testing

**Deliverables:** Integration test suite; test report.

**Dependencies:** All APIs complete, database schema finalized

**Acceptance Criteria:**
- ✅ All critical workflows tested
- ✅ ≥70% API route coverage
- ✅ Error handling verified

**Estimate:** 16–20 hours

---

#### 7.3 End-to-End Testing (Manual & Automated)
**Tasks:**
- [ ] Test complete happy path:
  - Doctor login → view daily appointments → start consultation → enter vitals → add diagnosis → add medication → generate prescription → print
- [ ] Test edge cases:
  - Duplicate patient detection
  - Network drop → data queued → recovery
  - Printer offline → PDF fallback
  - Appointment reschedule mid-workflow
  - Session timeout → re-login without data loss
  - Incomplete consultation → save as draft → resume
- [ ] Record timed E2E tests (target: 2–3 min for consultation)
- [ ] Use Cypress or Playwright

**Deliverables:** E2E test suite; timing report; edge case test results.

**Dependencies:** All features complete; UAT date scheduled

**Acceptance Criteria:**
- ✅ 100% happy path tested
- ✅ 50+ edge cases tested
- ✅ Consultation completes in 2–3 minutes (average)
- ✅ All tests pass without critical failures

**Estimate:** 20–24 hours

---

#### 7.4 Performance & Security Testing
**Tasks:**
- [ ] Performance tests:
  - Load test with 1,000+ patients (search time)
  - Load test history view (50+ consultations)
  - Measure page load, API response times
  - Run Lighthouse audit (target scores)
- [ ] Security tests:
  - Password hashing verification (bcrypt)
  - JWT token security
  - SQL injection prevention (parameterized queries)
  - HTTPS enforcement
  - Session timeout behavior
  - Data encryption (at rest + in transit)

**Deliverables:** Performance report; security audit checklist.

**Dependencies:** All features, production environment ready

**Acceptance Criteria:**
- ✅ Search < 2 seconds (1,000 patients)
- ✅ Page load < 2 seconds
- ✅ API response < 500ms
- ✅ All security checks pass

**Estimate:** 12–16 hours

---

#### 7.5 User Acceptance Testing (UAT) with Doctor
**Tasks:**
- [ ] Schedule 1–2 week parallel mode (app running alongside current workflow)
- [ ] Doctor observes 10+ live consultations with app
- [ ] Measure consultation time (data entry + print)
- [ ] Collect feedback on:
  - UI clarity and navigation
  - Form field order
  - Print quality
  - Search speed
  - Any missing features or pain points
- [ ] Doctor rates usability (target: ≥8/10)
- [ ] Document all feedback and bugs

**Deliverables:** UAT report; usability survey; bug log.

**Dependencies:** All features complete; testing complete; doctor availability

**Acceptance Criteria:**
- ✅ Consultation completes in 2–3 minutes (measured)
- ✅ Usability rating ≥8/10
- ✅ No critical bugs found
- ✅ Doctor confident to go live

**Estimate:** 12–16 hours

---

### Phase 8: Deployment & Launch (Weeks 15–16)
**Objective:** Prepare for production and go-live.

#### 8.1 Production Infrastructure Setup
**Tasks:**
- [ ] Provision production server (AWS EC2, Azure VM, or DigitalOcean)
- [ ] Set up production database (PostgreSQL with backups)
- [ ] Configure SSL/HTTPS (Let's Encrypt certificate)
- [ ] Set up automated daily backups (to S3 or external storage)
- [ ] Configure firewall and security groups
- [ ] Set up monitoring & alerts (uptime, errors, performance)
- [ ] Configure DNS (if clinic domain available)

**Deliverables:** Production infrastructure; monitoring dashboard; backup automation.

**Dependencies:** All code tested and ready; DevOps team available

**Acceptance Criteria:**
- ✅ SSL certificate valid and auto-renews
- ✅ Backups run daily and can be restored
- ✅ Monitoring alerts trigger on failures
- ✅ Server scales for load (optional)

**Estimate:** 8–12 hours

---

#### 8.2 Documentation & Training
**Tasks:**
- [ ] Write user guide (5–10 pages, quick start + FAQ)
- [ ] Write admin manual (backup/recovery, user management)
- [ ] Write troubleshooting guide (common issues, support contact)
- [ ] Write API documentation (for future integrations)
- [ ] Create setup & maintenance checklist
- [ ] Conduct 1-hour live training with doctor:
  - Login and daily startup
  - Patient search and registration
  - Appointment scheduling
  - Consultation workflow
  - Print and export
  - Troubleshooting

**Deliverables:** User guide, admin manual, troubleshooting guide, training session.

**Dependencies:** All features finalized, UAT feedback incorporated

**Acceptance Criteria:**
- ✅ Documentation is clear and complete
- ✅ Doctor feels confident after training
- ✅ Support contact info documented

**Estimate:** 12–16 hours

---

#### 8.3 Go-Live & 2-Week Support
**Tasks:**
- [ ] Perform final production verification (login, workflows, print)
- [ ] Deploy during off-hours (2–4 AM or scheduled maintenance)
- [ ] Monitor production logs first 4 hours
- [ ] Verify all features working
- [ ] Provide 24/7 support hotline first 2 weeks
- [ ] Monitor error rates and performance
- [ ] Collect doctor feedback and log enhancement requests

**Deliverables:** Production deployment; support logs; feedback summary.

**Dependencies:** All prior phases complete; doctor availability

**Acceptance Criteria:**
- ✅ Deployment successful
- ✅ All features working in production
- ✅ Error rates < 0.1%
- ✅ Zero data loss or corruption
- ✅ Support tickets resolved < 2 hours

**Estimate:** 16–20 hours (spread over 2 weeks)

---

## 5. Dependencies & Critical Path

### Internal Dependencies (Sequencing)

```
Phase 1 (Foundation)
    ↓
Phase 2 (Patient Mgmt) + Phase 3 (Appointments) [can run in parallel]
    ↓
Phase 4 (Consultation)
    ↓
Phase 5 (Prescriptions & History)
    ↓
Phase 6 (Export)
    ↓
Phase 7 (Testing & QA) [includes parallel security, performance, UAT]
    ↓
Phase 8 (Deployment & Launch)
```

### Critical Dependencies (Must-Have Before Next Phase)

| Phase | Must Complete Before | Reason |
|-------|---------------------|--------|
| Phase 2 | Phase 1 | Need database, auth, base UI |
| Phase 3 | Phase 2 | Appointments link to patients |
| Phase 4 | Phase 3 | Consultations link to appointments |
| Phase 5 | Phase 4 | Prescriptions depend on consultations |
| Phase 6 | Phase 2, 4 | Export patient and consultation data |
| Phase 7 | All features (Phases 1–6) | Cannot test until features built |
| Phase 8 | Phase 7 + UAT | Deploy only after QA passes |

### Parallelization Opportunities

**Can run in parallel (independent):**
- Phase 2 (Patient Mgmt) + Phase 3 (Appointments) → Frontend can build patient pages while backend builds appointment API
- Phase 7 unit tests + Phase 7 integration tests → Different teams can work simultaneously
- Phase 7 performance testing + Phase 7 security testing → Independent test focus areas

**Cannot parallelize:**
- Phase 1 → Phase 2 (need foundation first)
- Phase 4 → Phase 5 (prescriptions depend on consultations)

### Blocking Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Printer incompatibility** | Cannot print → workflow broken | Test with clinic printer Week 2 |
| **Network unreliability** | Data loss during consultation | Implement offline cache + queue (Phase 4) |
| **Database performance** | Search slow with 1,000+ patients | Load test Week 3; optimize indexes |
| **Doctor unavailable for UAT** | Cannot validate 2–3 min criterion | Schedule UAT Week 13; respect clinic hours |
| **Scope creep (billing, multi-user)** | Delays release | Enforce Phase 1 scope; document Phase 2 |

---

## 6. Resource & Team Plan

### Team Structure (Recommended)

```
Project Manager (1)
    ├─ Backend Lead (1)
    │   └─ Responsibilities: Database design, API development, optimization
    ├─ Frontend Lead (1)
    │   └─ Responsibilities: UI/UX, forms, workflows
    ├─ Full-Stack Developer (1)
    │   └─ Responsibilities: Feature implementation, testing support
    ├─ QA Engineer (1)
    │   └─ Responsibilities: Testing, UAT, bug tracking
    ├─ Tech Lead (1)
    │   └─ Responsibilities: Architecture, code review, decisions
    └─ DevOps Engineer (0.5)
        └─ Responsibilities: Database, deployment, monitoring
```

### Time Allocation

| Role | Hours/Week | Total (16 weeks) |
|------|-----------|------------------|
| Backend Lead | 40 | 640 |
| Frontend Lead | 40 | 640 |
| Full-Stack Dev | 40 | 640 |
| QA Engineer | 20–30 | 320–480 |
| Tech Lead | 20 | 320 |
| DevOps (0.5) | 15 | 240 |
| PM | 10–15 | 160–240 |
| **Total** | **~185–195** | **~3,040–3,160 person-hours** |

### Skills Required

| Role | Required Skills |
|------|-----------------|
| **Backend** | Node.js, Express, TypeScript, PostgreSQL, REST APIs, testing |
| **Frontend** | React, TypeScript, CSS/SCSS, form handling, responsive design |
| **QA** | Test automation, performance testing, security basics |
| **DevOps** | Docker, PostgreSQL, Linux, AWS/Azure, monitoring |
| **Tech Lead** | Full-stack expertise, architecture design, communication |

---

## 7. Risk Management

### Risk Register

| ID | Risk | Prob | Impact | Severity | Mitigation |
|----|----|------|--------|----------|-----------|
| **R1** | Printer incompatible | Med | High | 🔴 | Test Week 2; implement PDF fallback |
| **R2** | Database slow (1,000+ patients) | Low | Med | 🟡 | Index early; load test Week 3 |
| **R3** | Network drops during consultation | Med | High | 🔴 | Offline cache + queue (Phase 4) |
| **R4** | Scope creep (billing, multi-user) | High | Med | 🟡 | Enforce Phase 1 scope; Phase 2 roadmap |
| **R5** | Doctor unavailable UAT | Med | Med | 🟡 | Schedule 2 weeks ahead; flexible times |
| **R6** | Security audit delays go-live | Low | High | 🟡 | Plan security testing Week 10–11 |
| **R7** | Browser compatibility (print) | Low | Med | 🟡 | Test Chrome, Safari, Edge early |
| **R8** | Key person unavailable | Low | High | 🟡 | Cross-train; document processes |

### Contingency Plans

**If R1 (Printer fails):**  
Pivot to PDF-only mode; verify with clinic IT; implement network printer detection.

**If R2 (Database slow):**  
Add Redis caching layer; optimize queries; consider read replicas.

**If R3 (Network unreliable):**  
Strengthen offline-first architecture; add sync conflict resolution; test with actual clinic network Week 6.

**If R4 (Scope creep):**  
PM decision to defer to Phase 2; freeze Phase 1 scope; communicate impact on timeline.

**If R5 (Doctor unavailable):**  
Extend UAT duration; offer flexible times; record video walkthrough for async feedback.

---

## 8. Validation & Success Measurement

### Acceptance Criteria Traceability

**BRD Requirement → Implementation → Validation**

| BRD Requirement | Implementation Task | Validation Method | Success Criteria |
|-----------------|-------------------|------------------|-----------------|
| Patient registration | Phase 2.1 (Patient Registration) | Unit + E2E test | Form saves patient to DB; ID unique |
| Patient search | Phase 2.2 (Patient Search) | Performance test | Search returns results in < 2s |
| Appointment scheduling | Phase 3.1 (Appointment Scheduling) | E2E test | Conflict prevented; appointment saved |
| Vitals capture (mandatory) | Phase 4.1 (Vitals Capture) | Unit + form test | Cannot save consultation without vitals |
| Diagnosis documentation | Phase 4.2 (Complaints & Diagnosis) | Unit test | Free text saved correctly |
| Medication management | Phase 4.3 (Medication Entry) | E2E test | At least 1 medicine required; autocomplete works |
| Prescription generation | Phase 5.1 (Prescription Generation) | E2E + manual test | Prescription renders with all data; prints without error |
| Patient history | Phase 5.3 (Visit History) | E2E test | History loads in < 2s; filtering works |
| Data export (CSV/PDF) | Phase 6 (Export) | Manual test | Files download correctly; data complete |
| Usability (2–3 min consultation) | Phase 7.5 (UAT) | Timed E2E with doctor | Average consultation time 2–3 minutes |
| Security (authentication) | Phase 1.3 (Auth) | Security test | Passwords hashed; JWT enforced; HTTPS |

### Success Metrics & KPIs

**Development Metrics**
- Code coverage: ≥85% backend, ≥80% frontend
- Test pass rate: 100%
- Build time: < 5 minutes
- Code review time: < 24 hours

**Performance Metrics**
- Patient search: < 2 seconds
- Page load: < 2 seconds
- API response: < 500ms
- Consultation save: < 1 second

**Business Metrics**
- Consultation time: 2–3 minutes (UAT measured)
- Doctor usability: ≥8/10 (post-training survey)
- Support calls first week: ≤5
- System uptime: ≥99.5%
- Paper reduction: ≥80%

---

## 9. Timeline & Milestones

### Phase Timeline

| Phase | Duration | Weeks | Key Deliverable | Exit Criteria |
|-------|----------|-------|-----------------|---------------|
| **Phase 1** | 1–2 weeks | 1–2 | Foundation + auth | Dev env working; DB created; auth API done |
| **Phase 2** | 1.5–2 weeks | 2–4 | Patient management | CRUD working; search < 2s; profile page live |
| **Phase 3** | 1.5–2 weeks | 4–6 | Appointments | Scheduling working; daily list live; status updates |
| **Phase 4** | 2–3 weeks | 6–10 | Consultation | Vitals + meds + diagnosis form; auto-save working |
| **Phase 5** | 1.5–2 weeks | 10–12 | Prescriptions & history | Print working; history filtering; export CSV/PDF |
| **Phase 6** | 1–1.5 weeks | 12–13 | Export & reporting | CSV/PDF export done; backup status visible |
| **Phase 7** | 2–3 weeks | 13–15 | Testing & UAT | 85%+ coverage; UAT passed; no critical bugs |
| **Phase 8** | 1 week + 2-wk support | 15–16 | Production launch | Live; monitored; doctor trained |
| **Total** | **12–16 weeks** | | | |

### Milestone Dates (Starting May 5, 2026)

- **Milestone 1 (End of Week 2):** Foundation complete → Dev environment ready; database working; auth implemented
- **Milestone 2 (End of Week 6):** Patient & appointment features done → Doctor can schedule appointments
- **Milestone 3 (End of Week 10):** Consultation workflow complete → Doctor can complete consultation in 2–3 minutes (estimated)
- **Milestone 4 (End of Week 12):** Export & reporting complete → Doctor can export data and backups
- **Milestone 5 (End of Week 15):** Testing & UAT complete → Zero critical bugs; UAT signed off
- **Milestone 6 (End of Week 16):** Production launch → Live; doctor using; 2-week support active

### Critical Path (Longest Sequence)

Phase 1 (2 wks) → Phase 2 (2 wks) → Phase 3 (2 wks) → Phase 4 (3 wks) → Phase 5 (2 wks) → Phase 7 (3 wks) → Phase 8 (1 wk) = **15 weeks minimum**

Parallelization can reduce to **12–13 weeks** if Phase 2 & 3 overlap and Phase 7 testing starts during Phase 6.

---

## 10. Communication & Escalation Plan

### Standups & Syncs

| Meeting | Frequency | Duration | Attendees | Notes |
|---------|-----------|----------|-----------|-------|
| **Daily Standup** | Every day, 9:00 AM | 15 min | Full team | What done, what planned, blockers |
| **Weekly Sync** | Friday, 10:00 AM | 1 hour | Team + stakeholders | Progress, demos, risks, decisions |
| **Bi-weekly UAT Prep** | Week 12 onwards | 30 min | PM + QA + doctor | UAT scheduling, feedback |

### Escalation Path

| Level | Issue Type | Owner | Response Time |
|-------|-----------|-------|----------------|
| **L1** | Code blocker (bug, unclear requirement) | Team lead | 2–4 hours |
| **L2** | Design decision, architectural concern | Tech lead | 4–8 hours |
| **L3** | Timeline/scope impact | PM | 1 day |
| **L4** | Budget or strategic issue | Sponsor | 1–2 days |

---

## 11. Next Steps (Immediate Actions)

### This Week (Week 1)

- [ ] Confirm team assignments and availability
- [ ] Create GitHub repository with branch protection
- [ ] Set up development environment (Node, PostgreSQL, Docker)
- [ ] Schedule daily standup (9:00 AM) and weekly sync (Friday 10:00 AM)
- [ ] Create shared documentation folder
- [ ] Provision development/staging servers
- [ ] Conduct team kickoff meeting (architecture walkthrough)

### Week 1–2 (Phase 1 Kickoff)

- [ ] Backend: Design DB schema; create migration scripts
- [ ] Backend: Implement auth (JWT, login/logout)
- [ ] Frontend: Set up React project; create base layout and component library
- [ ] DevOps: Set up CI/CD pipeline (GitHub Actions)

### Week 2–3 (Phase 2 Kickoff)

- [ ] Backend: Implement patient CRUD API
- [ ] Frontend: Build patient search and registration UI
- [ ] QA: Begin writing unit tests

---

## 12. Appendices

### A. Assumptions & Constraints

**Assumptions to Validate:**
- Doctor works alone (no multi-user) ✅ [Confirmed in BRD]
- 2–3 min consultation time is feasible ← [Needs UAT validation]
- Web-only, no mobile ✅ [Confirmed in BRD]
- Free text complaints preferred ← [Validate in UAT]
- Clinic has stable internet ← [High risk if false; plan offline resilience]
- Doctor comfortable with basic auth ← [Assume yes]

**Constraints:**
- Single-user only (multi-user in Phase 2)
- Phase 1 scope fixed (no billing, no multi-clinic)
- Receptionist features deferred to Phase 2
- No offline functionality (but offline resilience planned)

### B. Phase 2 Roadmap (Future)

**Out of Scope for Phase 1, Planned for Phase 2:**
- Receptionist login and appointment booking
- Billing and invoice generation
- Appointment reminders (SMS/Email)
- Advanced analytics and reporting
- Lab integration
- Multi-doctor support
- Mobile app

**Estimated Phase 2 Timeline:** 8–12 weeks after Phase 1 launch

### C. Document Control

| Version | Date | Author | Status |
|---------|------|--------|--------|
| 1.0 | May 5, 2026 | Planning Team | **APPROVED FOR EXECUTION** |

---

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **Project Manager** | [Name] | __________ | ____/____/____ |
| **Tech Lead** | [Name] | __________ | ____/____/____ |
| **Development Lead** | [Name] | __________ | ____/____/____ |
| **Sponsor/Doctor** | [Name] | __________ | ____/____/____ |

---

**Status:** Ready for team kickoff  
**Next Step:** Conduct kickoff meeting to begin Phase 1
