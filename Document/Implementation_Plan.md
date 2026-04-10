# Implementation Plan: Patient Management Application for General Physician

## Overview

Build a lightweight, web-based Patient Management Application that enables a general physician to digitize daily clinical workflows—replacing paper-based systems with a fast, intuitive interface for registration, appointment scheduling, consultations, and prescription generation.

This MVP prioritizes speed and simplicity: the doctor must complete a full consultation record (vitals → complaints → diagnosis → prescription) in 2–3 minutes. Success means reducing paper usage by 80% while maintaining data integrity and printing reliability.

---

## Goals & Success Criteria

### Goals
1. **Eliminate paper-based workflow** — Digitize appointment scheduling, patient records, and prescriptions
2. **Optimize consultation speed** — Enable fast data entry during live patient interactions
3. **Ensure data reliability** — Maintain accurate, accessible patient history with no data loss
4. **Provide legal/operational records** — Generate printable prescriptions that serve as clinic records and patient instructions
5. **Enable operational reporting** — Support CSV/PDF export for audits, backups, and record-keeping

### Success Criteria
- ✅ Doctor completes consultation record within **2–3 minutes**
- ✅ Patient search and history retrieval within **2–5 seconds**
- ✅ **80% reduction in paper usage** (measured by clinic record-keeping)
- ✅ **100% successful prescription generation** with zero print failures
- ✅ **100% data integrity** — no lost records, automated backups operational
- ✅ **CSV/PDF export** working for all patient and visit data
- ✅ **Minimal training required** — doctor can operate independently on day 1

---

## Architecture & Key Decisions

### Technology Stack (Inferred from Requirements)
| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | React + TypeScript | Fast, responsive UI for quick data entry; strong typing reduces errors |
| **Backend** | Node.js/Express or similar | Single-user app; lightweight, fast REST API |
| **Database** | PostgreSQL (relational) | Structured patient/appointment data; ACID compliance for data integrity |
| **Authentication** | JWT + secure session | Simple single-user auth; secure login without multi-user complexity |
| **Printing** | Browser native print API | No external service dependency; doctor controls print to local clinic printer |
| **Export** | jsPDF + CSV libraries | Client-side generation; instant availability without server latency |
| **Deployment** | Self-hosted or cloud (AWS/Azure) | Clinic owns data; no SaaS dependency critical for small clinics |

### Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Patient ID-based disambiguation** | Unique IDs prevent confusion when duplicate names exist; search still uses name/phone for UX simplicity |
| **Medicine reuse from past Rx** | Auto-suggest past medications by default dosage to reduce typing; doctor can override |
| **Last 12 months visit history** | Full history can be slow to load; last 12 months balances completeness with performance |
| **Mandatory vitals before consultation save** | Enforces data integrity; prevention > recovery |
| **Vital value range warnings** | Alert doctor to out-of-range vitals (e.g., BP 100/250) but allow override for edge cases |
| **Split-view dashboard** | Left: Today's appointment list (editable); Right: Patient consultation form. Minimizes context switching |
| **Auto-save drafts every 30 seconds** | Prevents data loss if browser crashes or network interrupts during consultation |
| **Direct prescription print** | No preview step; direct-to-printer reduces workflow friction (2–3 min constraint) |
| **Offline resilience via local cache** | If network drops during consultation, app caches data locally; syncs when network returns |
| **Appointment reschedule inline** | Doctor can drag/reorder appointments without leaving dashboard; add walk-ins via quick button |

---

## Detailed Task Breakdown

### Phase 1: Foundation & Core Setup (~1–2 weeks)

**Objective:** Set up development environment, database schema, and basic UI framework.

#### 1.1 **Project Setup & Infrastructure** (Priority: P0)
- **Deliverable:** Development environment, build pipeline, CI/CD, hosting infrastructure
- **Dependencies:** None
- **Tasks:**
  - Scaffold React + TypeScript frontend (`create-react-app` or Vite)
  - Scaffold Node.js/Express backend
  - Set up PostgreSQL database (hosted or local Docker)
  - Configure build tools (Webpack, Vite, or esbuild)
  - Set up Git branching strategy (main, develop, feature branches)
  - Configure linting (ESLint, Prettier) and pre-commit hooks
  - Deploy development environment to cloud (AWS EC2 / Azure VM / DigitalOcean)
- **Validation:** 
  - Frontend build succeeds: `npm run build` produces optimized bundle
  - Backend API responds: `curl http://localhost:5000/health` returns 200
  - Database connection verified: test query returns expected schema
- **Estimate:** 8–12 hours

#### 1.2 **Database Schema Design** (Priority: P0)
- **Deliverable:** PostgreSQL schema with tables, indexes, and seed data
- **Dependencies:** Project setup complete
- **Tables to create:**
  - `users` (doctor profile, authentication)
  - `patients` (name, DOB, gender, contact, unique_id)
  - `appointments` (patient_id, scheduled_time, status, notes)
  - `consultations` (appointment_id, temperature, bp_systolic, bp_diastolic, pulse, complaints, diagnosis)
  - `medications` (consultation_id, medicine_name, dosage, frequency, duration, instructions)
  - `prescriptions` (consultation_id, generated_at, printed_at, status)
  - `audit_log` (user_id, action, table_name, record_id, timestamp)
- **Indexes to create:**
  - `patients(name)` — for name search
  - `patients(contact_phone)` — for phone search
  - `appointments(patient_id, scheduled_time)` — for daily list
  - `consultations(appointment_id)` — for history lookup
- **Validation:**
  - Schema integrity: Foreign keys enforce referential integrity
  - Index performance: SELECT * FROM patients WHERE name ILIKE '%john%' completes in < 100ms
  - Test queries return expected results
- **Estimate:** 6–8 hours

#### 1.3 **Authentication & Session Management** (Priority: P0)
- **Deliverable:** Login endpoint, JWT token generation, secure session handling
- **Dependencies:** Database schema, backend scaffolding
- **Tasks:**
  - Implement `/auth/login` endpoint (credential validation)
  - Generate JWT token with 8-hour expiration + refresh token (24-hour)
  - Create middleware to validate JWT on protected routes
  - Implement session timeout alert (5 min before expiration)
  - Hash passwords using bcrypt (no plaintext storage)
  - Create `/auth/logout` endpoint (invalidate token)
- **Validation:**
  - Valid login returns JWT token
  - Invalid login returns 401 with clear error
  - Expired token returns 401; refresh token extends session
  - Protected routes deny access without valid token
- **Estimate:** 6–8 hours

#### 1.4 **Frontend Base Layout & Navigation** (Priority: P0)
- **Deliverable:** Responsive base layout with dashboard, navigation, and component library
- **Dependencies:** Frontend scaffolding
- **Tasks:**
  - Create base layout component (header, sidebar, main content area)
  - Design responsive grid (mobile/tablet/desktop; prioritize desktop for clinic setting)
  - Implement navigation: Home, Patients, Appointments, History, Settings
  - Create reusable component library:
    - Button, Input, Dropdown, Modal, Card, Table, Tabs
    - Vital input fields with formatting (BP: 120/80, Temp: 98.6°F)
  - Add global error handling & toast notifications
  - Implement light/dark mode toggle (optional, low priority)
- **Validation:**
  - Layout renders without layout shift or CLS issues
  - Navigation items are accessible (keyboard + screen reader)
  - Components are reusable across pages
- **Estimate:** 8–10 hours

---

### Phase 2: Patient Management (~1.5–2 weeks)

**Objective:** Implement patient registration, search, and profile management.

#### 2.1 **Patient Registration & Editing** (Priority: P0)
- **Deliverable:** Add/edit patient form with validation and duplicate detection
- **Dependencies:** Database schema, frontend components
- **Tasks:**
  - Create patient registration form:
    - Name (required, max 100 chars)
    - DOB (required, calculated age)
    - Gender (dropdown: M/F/Other)
    - Contact phone (required, validated format)
    - Email (optional)
    - Address (optional)
  - Implement client-side validation (name not empty, phone format, age >= 0)
  - Implement server-side validation (duplicate detection by phone + DOB)
  - Create "Add Patient" modal with success confirmation
  - Implement edit patient form (load existing data, update fields)
  - Generate unique patient ID (UUID or ULID) on creation
- **Validation:**
  - Form prevents submission with missing required fields
  - Duplicate phone + DOB detected with warning "Patient may already exist"
  - Edit saves changes without data loss
  - Patient ID persists correctly across sessions
- **Estimate:** 10–12 hours

#### 2.2 **Patient Search & Lookup** (Priority: P0)
- **Deliverable:** Fast patient search by name or phone with typeahead
- **Dependencies:** Database schema with indexes, patient registration
- **Tasks:**
  - Create search input with typeahead (debounced 300ms)
  - Implement `/api/patients/search?q=` endpoint:
    - Query name (case-insensitive ILIKE)
    - Query phone (exact or contains)
    - Return top 10 results with patient ID, name, age, phone
  - Implement result selection → load patient profile
  - Add "Create new patient" option if no matches
  - Cache recent searches (last 5 patients) in localStorage
- **Validation:**
  - Search for "John" returns all Johns in < 1 second
  - Search for phone "9876543210" returns exact patient
  - Typeahead appears on 3rd character typed
  - Recent patients load instantly from cache
- **Estimate:** 8–10 hours

#### 2.3 **Patient Profile View** (Priority: P0)
- **Deliverable:** Read-only patient summary with demographics and quick actions
- **Dependencies:** Patient search, patient registration
- **Tasks:**
  - Display patient card with:
    - Name, Age, Gender, Contact
    - Patient ID (for reference)
    - Account created date
  - Add action buttons:
    - "Schedule Appointment"
    - "New Consultation"
    - "View History"
    - "Edit Details"
  - Show badge: "First-time patient" or "Repeat patient"
  - Show alert if last visit > 6 months
- **Validation:**
  - All patient fields display correctly
  - Buttons route to correct pages
  - No editable fields (read-only view)
- **Estimate:** 6–8 hours

---

### Phase 3: Appointment Management (~1.5–2 weeks)

**Objective:** Implement appointment scheduling, daily list view, and status management.

#### 3.1 **Appointment Scheduling** (Priority: P0)
- **Deliverable:** Schedule new appointments with date/time selection
- **Dependencies:** Patient management, database schema
- **Tasks:**
  - Create appointment form:
    - Patient lookup (search or select from recent)
    - Date picker (calendar UI)
    - Time picker (30-min slots: 09:00, 09:30, 10:00, etc.)
    - Reason/notes (optional, free text)
  - Validate:
    - No double-booking (check existing appointments at same time)
    - Date >= today
    - Time within clinic hours (9 AM – 6 PM, configurable)
  - Save appointment to database with status = "Scheduled"
  - Return confirmation with appointment ID
- **Validation:**
  - Cannot book past dates or times
  - Prevents double-booking
  - Confirmation shows patient name + date/time
  - Appointment saved in database
- **Estimate:** 8–10 hours

#### 3.2 **Daily Appointment List** (Priority: P0)
- **Deliverable:** Dashboard displaying today's appointments with inline editing
- **Dependencies:** Appointment scheduling, patient profile
- **Tasks:**
  - Fetch today's appointments (sorted by time)
  - Display as editable list:
    - Time | Patient Name | Contact | Status | Actions
  - Implement status update (Scheduled → Completed, Cancelled, No-show)
  - Add inline buttons:
    - "Start Consultation" → load consultation form
    - "Reschedule" → date/time picker
    - "Cancel" → mark as Cancelled with optional reason
  - Quick add appointments:
    - "Add Walk-in" button → patient search + quick schedule
  - Allow drag-to-reorder appointments (resequence)
  - Show time-until-next-appointment countdown
- **Validation:**
  - Today's date auto-selected on dashboard load
  - Appointments sorted by time
  - Status changes save immediately
  - Walk-in addition works without page reload
  - Reordering updates database
- **Estimate:** 12–14 hours

#### 3.3 **Appointment History & Filtering** (Priority: P1)
- **Deliverable:** Past appointments view with date range filtering
- **Dependencies:** Appointment list, patient profile
- **Tasks:**
  - Create past appointments view (default: last 30 days)
  - Add date range picker (from/to dates)
  - Add status filter (all, completed, cancelled, no-show)
  - Display columns: Date | Time | Patient | Status | Consultation Saved (Y/N)
  - Click appointment → view associated consultation (if exists)
- **Validation:**
  - Filters work independently and in combination
  - Date range queries complete in < 1 second
  - Clicking appointment loads consultation
- **Estimate:** 6–8 hours

---

### Phase 4: Consultation Workflow (~2–3 weeks)

**Objective:** Implement the core consultation form (vitals, complaints, diagnosis, medications).

#### 4.1 **Vitals Capture Form** (Priority: P0)
- **Deliverable:** Mandatory vitals input with validation and range checking
- **Dependencies:** Appointment list, database schema
- **Tasks:**
  - Create vitals form with auto-focus sequence:
    - Temperature (°F or °C, configurable)
    - Blood Pressure (two fields: systolic / diastolic)
    - Pulse (BPM)
  - Implement input masks:
    - Temp: 95–105°F (warn if outside range)
    - BP: 0–200 systolic, 0–150 diastolic (warn if outside range)
    - Pulse: 30–200 BPM (warn if outside range)
  - Add "Range Alert" banner if values are abnormal (e.g., "BP is elevated")
  - Make vitals mandatory: consultation cannot be saved without them
  - Add "Copy from last visit" button for repeat patients (auto-fill with prior vitals)
  - Implement auto-focus (Tab moves to next field after valid input)
- **Validation:**
  - Cannot save consultation without all vitals
  - Range warnings appear but don't block save
  - Input masks enforce format (e.g., BP 120/80)
  - "Copy from last visit" pre-fills correctly
- **Estimate:** 8–10 hours

#### 4.2 **Complaints & Diagnosis Form** (Priority: P0)
- **Deliverable:** Free-text input for complaints and diagnosis with optional structure
- **Dependencies:** Vitals capture, database schema
- **Tasks:**
  - Create complaints field:
    - Text area (multi-line, up to 500 chars)
    - Character counter
    - Placeholder: "Enter patient symptoms, e.g., fever, cough, body aches"
  - Create diagnosis field:
    - Text area (multi-line, up to 500 chars)
    - Character counter
    - Placeholder: "Enter diagnosis, e.g., Acute bronchitis"
  - Optional: Add symptom/diagnosis checklist (popup reference, not required)
  - Store as free text (no predefined list enforcement)
  - Add "Copy from last visit" for both (optional)
- **Validation:**
  - Fields are optional (not mandatory, unlike vitals)
  - Character limits enforced
  - Text saved correctly
- **Estimate:** 4–6 hours

#### 4.3 **Medication Entry & Management** (Priority: P0)
- **Deliverable:** Add/edit/remove medications with dosage, frequency, duration
- **Dependencies:** Database schema, consultation form
- **Tasks:**
  - Create medication add form:
    - Medicine name (text input with autocomplete from past Rx)
    - Dosage (e.g., "500mg", "10ml", "1 tablet")
    - Frequency (dropdown: OD, BD, TID, QID, etc.)
    - Duration (e.g., "5 days", "2 weeks")
    - Instructions (optional, e.g., "Take with food")
  - Implement autocomplete from past medications (suggest by name + default dosage)
  - Add medication to list (not yet saved):
    - Display: Medicine | Dosage | Frequency | Duration | [Remove]
  - Allow edit/remove before saving consultation
  - Validate:
    - At least 1 medicine (for prescription generation)
    - Dosage not empty
    - Duration sensible (1–365 days)
- **Validation:**
  - Autocomplete suggests past medicines
  - Medications added to preview list
  - Edit/remove work before save
  - At least 1 medicine required for prescription
- **Estimate:** 10–12 hours

#### 4.4 **Consultation Form Integration** (Priority: P0)
- **Deliverable:** Full consultation form combining vitals, complaints, diagnosis, medications
- **Dependencies:** All above sub-tasks
- **Tasks:**
  - Combine all fields into single scrollable form
  - Auto-save draft every 30 seconds (save to browser session storage + database)
  - Save button (saves all fields to database)
  - Cancel button (discard draft, optional confirm)
  - Show patient name & ID at top (fixed header)
  - Show appointment time for reference
  - Show "Saving..." spinner during save
  - Display success notification: "Consultation saved"
  - If network drops during save, queue locally and retry when online
  - Implement "Incomplete" status if consultation not fully saved
- **Validation:**
  - All fields save correctly
  - Auto-save works without losing data
  - Network failure doesn't lose data (queued locally)
  - Success notification appears after save
  - Form resets after save (ready for next patient)
- **Estimate:** 10–12 hours

---

### Phase 5: Prescription & History (~1.5–2 weeks)

**Objective:** Generate printable prescriptions and display consultation history.

#### 5.1 **Prescription Generation & Template** (Priority: P0)
- **Deliverable:** Generate prescription PDF/print layout with all consultation data
- **Dependencies:** Consultation form, medications entry
- **Tasks:**
  - Design prescription template (HTML/CSS):
    - **Header:** Clinic name, doctor name, contact, timestamp
    - **Patient section:** Name, Age, Gender, Contact
    - **Vitals section:** Temperature, BP, Pulse
    - **Diagnosis section:** Diagnosis text
    - **Medications section:** Table (Medicine | Dosage | Frequency | Duration | Instructions)
    - **Footer:** Date, signature line (for handwritten signature), clinic stamp area
  - Implement print view (optimized for A4 paper, minimal margins)
  - Generate PDF option (using jsPDF or similar)
  - Implement print button on prescription (direct to browser print dialog)
  - Handle print failure gracefully (error message, retry button, save as PDF)
  - Track prescription status: Generated, Printed, Failed
- **Validation:**
  - Prescription renders correctly on A4 paper
  - All consultation data appears in prescription
  - Print button opens browser print dialog
  - PDF generation works without errors
  - Print failure doesn't lose consultation data
- **Estimate:** 10–12 hours

#### 5.2 **Print Workflow & Error Handling** (Priority: P0)
- **Deliverable:** Robust print handling with fallback options
- **Dependencies:** Prescription generation
- **Tasks:**
  - Implement print button in consultation form
  - Detect printer availability (basic check)
  - If printer offline:
    - Show warning: "Printer not detected. Save as PDF?"
    - Offer "Save PDF" or "Retry Print" options
  - Log print success/failure in audit log
  - Auto-open PDF in new tab for offline clinics
  - Persist printed state (timestamp, status)
- **Validation:**
  - Print works when printer is available
  - Offline fallback to PDF works
  - Audit log records print attempts
  - User can retry without data loss
- **Estimate:** 6–8 hours

#### 5.3 **Patient Visit History View** (Priority: P0)
- **Deliverable:** Display all past consultations with filtering and drill-down
- **Dependencies:** Consultation form, prescription generation
- **Tasks:**
  - Create history page:
    - Load patient's consultations (last 12 months by default)
    - Display table: Date | Time | Vitals | Diagnosis | Medications | Actions
  - Add date range filter (from/to dates)
  - Click row → expand or drill into consultation details
  - Implement pagination (load 10 visits at a time, "Load More" button)
  - Show "No consultations" if patient is new
  - Add action buttons:
    - "View Prescription" → display prescription
    - "Reuse Medications" → copy medicines to new consultation
    - "Print" → print prescription
- **Validation:**
  - History loads in < 2 seconds
  - Filtering works
  - Drill-down shows all details
  - Pagination doesn't require reload
- **Estimate:** 10–12 hours

---

### Phase 6: Data Export & Reporting (~1–1.5 weeks)

**Objective:** Enable CSV/PDF export for data backup and audits.

#### 6.1 **CSV Export** (Priority: P1)
- **Deliverable:** Export patients or consultations to CSV format
- **Dependencies:** Patient management, consultation data
- **Tasks:**
  - Implement export scenarios:
    - **All patients:** Name, Age, Gender, Contact, Patient ID, Created Date
    - **Patient consultations:** Date, Vitals, Diagnosis, Medications (comma-separated)
    - **All consultations (last N days):** Same as above
  - Add date range filter for export
  - Generate CSV client-side (fast, no server latency)
  - Implement file download with filename: `patients_export_YYYYMMDD.csv`
  - Add success notification with file size
- **Validation:**
  - CSV generated without errors
  - Data formats correctly (proper escaping for commas/quotes)
  - File downloads with correct filename
  - Doctor can open in Excel/Google Sheets
- **Estimate:** 6–8 hours

#### 6.2 **PDF Export (Comprehensive Report)** (Priority: P1)
- **Deliverable:** Generate multi-page PDF report of patient consultations
- **Dependencies:** CSV export, prescription template
- **Tasks:**
  - Create PDF report layout:
    - Title page (clinic info, export date)
    - Patient summary (name, contact, total visits)
    - Consultations table (date, vitals, diagnosis)
    - Prescriptions appended (one per patient)
  - Implement using jsPDF or React-PDF
  - Add header/footer (page numbers, clinic name)
  - Allow filtering by date range
  - Generate and download with filename: `patient_report_YYYYMMDD.pdf`
- **Validation:**
  - PDF renders without layout errors
  - All pages readable on screen and in print
  - File downloads correctly
- **Estimate:** 8–10 hours

#### 6.3 **Data Backup & Recovery** (Priority: P1)
- **Deliverable:** Manual export + indicator of last backup
- **Dependencies:** CSV/PDF export
- **Tasks:**
  - Display backup status banner (Last backup: [date/time])
  - Add "Trigger Manual Backup" button → exports full data to CSV
  - Store backup logs (when exports occurred)
  - For phase 2: Implement automated daily backups (server-side)
  - For phase 2: Implement recovery from backup
- **Validation:**
  - Backup status displays correctly
  - Manual backup creates file
  - Doctor can access backup logs
- **Estimate:** 4–6 hours

---

### Phase 7: Testing & QA (~2–3 weeks)

**Objective:** Comprehensive testing across all features.

#### 7.1 **Unit Testing** (Priority: P0)
- **Deliverable:** Unit tests for core logic functions
- **Scope:**
  - Utility functions (date formatting, vital validation, dosage parsing)
  - Patient search logic (fuzzy matching, exact match)
  - Vital range checking (warn vs. allow)
  - Appointment conflict detection
  - CSV generation logic
- **Tools:** Jest, React Testing Library
- **Target:** ≥80% code coverage for backend utilities
- **Estimate:** 12–16 hours

#### 7.2 **Integration Testing** (Priority: P0)
- **Deliverable:** API & database integration tests
- **Scope:**
  - Authentication flow (login → token → protected routes)
  - Patient CRUD operations (create, read, update, delete)
  - Appointment scheduling (conflict detection, status updates)
  - Consultation save + retrieval
  - Medication auto-complete from past Rx
- **Tools:** Jest, Supertest (for API testing)
- **Target:** ≥70% coverage for critical API routes
- **Estimate:** 16–20 hours

#### 7.3 **End-to-End Testing** (Priority: P0)
- **Deliverable:** Full workflow testing covering happy path + edge cases
- **Scope:**
  - **Happy path:** Login → Schedule appointment → Start consultation → Enter vitals/complaints/diagnosis → Add medication → Generate prescription → Print
  - **Edge cases:**
    - Duplicate patient detection
    - Network drop during consultation (auto-save + recovery)
    - Printer offline → fallback to PDF
    - Appointment reschedule mid-workflow
    - Session timeout → re-login without data loss
    - Incomplete consultation → save as draft → resume
- **Tools:** Cypress or Playwright
- **Target:** 100% happy path coverage + 50+ edge case tests
- **Estimate:** 20–24 hours

#### 7.4 **Performance Testing** (Priority: P1)
- **Deliverable:** Validate success criteria for speed
- **Tests:**
  - Patient search: < 2 seconds (1,000+ patients)
  - History load: < 2 seconds (50+ visits)
  - Consultation save: < 1 second
  - Page load: < 2 seconds
  - Prescription generation: < 500ms
- **Tools:** Lighthouse, WebPageTest, k6 (load testing)
- **Target:** Meet all success criteria
- **Estimate:** 12–16 hours

#### 7.5 **Security Testing** (Priority: P0)
- **Deliverable:** Basic security validation
- **Scope:**
  - Password hashing (bcrypt validation)
  - JWT token security (expiration, refresh)
  - SQL injection prevention (parameterized queries)
  - HTTPS enforcement
  - Session timeout + idle logout
  - Data encryption (at rest + in transit)
- **Tools:** Manual testing + OWASP guidelines
- **Estimate:** 10–12 hours

#### 7.6 **User Acceptance Testing (UAT)** (Priority: P0)
- **Deliverable:** Doctor feedback on usability and workflow
- **Scope:**
  - Doctor observes 5–10 live consultations with app in parallel mode
  - Doctor times each consultation (data entry time, print time)
  - Collect feedback on:
    - UI clarity and ease of navigation
    - Form field order and labeling
    - Print quality and prescription completeness
    - Search speed and accuracy
    - Any missing features or pain points
- **Target:** All success criteria met; doctor reports ≥8/10 usability
- **Estimate:** 8–12 hours

---

### Phase 8: Deployment & Launch (~1 week)

**Objective:** Prepare for production deployment and go-live.

#### 8.1 **Production Infrastructure Setup** (Priority: P0)
- **Deliverable:** Production server, database, SSL/HTTPS, backups
- **Tasks:**
  - Provision production server (AWS EC2, Azure VM, or similar)
  - Set up production database (PostgreSQL with replication/backup)
  - Configure SSL/HTTPS certificate (Let's Encrypt or purchased)
  - Set up automated daily backups (to S3 or external storage)
  - Configure firewall and security groups (restrict access to clinic network or VPN)
  - Set up monitoring & alerts (uptime checks, error logging)
  - Configure DNS for clinic domain (if applicable)
- **Validation:**
  - SSL certificate valid and auto-renews
  - Backups run daily and can be restored
  - Monitoring alerts trigger on failures
- **Estimate:** 8–12 hours

#### 8.2 **Documentation & Training** (Priority: P0)
- **Deliverable:** User guide, admin manual, troubleshooting guide
- **Documents to create:**
  - **User Guide** (5–10 pages): Quick start, daily workflow, FAQ
  - **Admin Manual**: Backup/recovery, user management, data import/export
  - **Troubleshooting Guide**: Common issues (printer offline, network drop, login failure)
  - **API Documentation** (for future integrations or Phase 2)
  - **Setup & Maintenance Checklist**: Monthly backup verification, password reset, etc.
- **Training:** 1-hour live walkthrough with doctor covering:
  - Login and daily startup
  - Patient search and registration
  - Appointment scheduling
  - Consultation workflow (vitals → prescription)
  - Print and export
  - Troubleshooting and support contact
- **Estimate:** 12–16 hours

#### 8.3 **Go-Live & Support** (Priority: P0)
- **Deliverable:** Production deployment, cutover, and 2-week post-launch support
- **Tasks:**
  - Backup existing paper records (scan or digitize key patient data if available)
  - Perform final production test (login, schedule appointment, full consultation, print)
  - Deploy to production (during off-hours or scheduled maintenance)
  - Verify all features working on production
  - Provide 24/7 support hotline/email for first 2 weeks
  - Monitor production logs for errors
  - Collect doctor feedback and log enhancement requests for Phase 2
- **Estimate:** 20–24 hours (spread over 2 weeks)

---

## Testing & Validation Strategy

### Unit Testing
**Scope:** Core utilities and business logic  
**Coverage Target:** ≥80%  
**Key Areas:**
- Vital validation (range checking)
- Patient search logic
- Appointment conflict detection
- CSV data formatting
- Date/time calculations

### Integration Testing
**Scope:** API endpoints and database interactions  
**Coverage Target:** ≥70%  
**Critical Paths:**
- Authentication (login/logout/session)
- Patient CRUD
- Appointment scheduling
- Consultation save/retrieve
- Medication queries

### End-to-End Testing
**Scope:** Complete workflows from user perspective  
**Scenarios:**
- **Happy Path:** Full consultation workflow with print
- **Repeat Patient:** Load history, reuse medications, quick entry
- **Appointment Changes:** Reschedule, walk-in, cancel
- **Network Resilience:** Network drop → queue → recovery
- **Error Cases:** Printer offline, empty vitals, duplicate patient

### Performance Testing
**Goals:** Meet all success criteria  
**Metrics:**
- Patient search: < 2s (1,000 patient dataset)
- History load: < 2s (50 visits)
- Consultation save: < 1s
- Page load: < 2s
- Prescription generation: < 500ms

### Security Testing
**Scope:** Authentication, authorization, data protection  
**Checklist:**
- ✅ Passwords hashed (bcrypt)
- ✅ JWT tokens validated
- ✅ SQL injection prevention
- ✅ HTTPS/SSL enforced
- ✅ Session timeout after 30 min inactivity
- ✅ Data encrypted at rest + in transit

### User Acceptance Testing
**Participants:** Doctor + clinic staff (optional)  
**Duration:** 1–2 weeks parallel mode (app running alongside current workflow)  
**Success Criteria:**
- Consultation completes in 2–3 minutes
- Usability rating ≥8/10
- No critical bugs found
- Doctor confident to go live

### Edge Cases to Cover
| Scenario | Test Case |
|----------|-----------|
| **Duplicate patient** | Search for "John Smith" (multiple exist); confirm UI allows disambiguation by patient ID |
| **Incomplete consultation** | Save without diagnosis; confirm app allows save, marks as "Incomplete", allows resume |
| **Network drop** | Disable WiFi mid-consultation → data queued locally → reconnect → verify sync |
| **Printer offline** | Attempt print without printer → fallback to PDF → verify PDF saves |
| **Appointment reschedule** | Reschedule patient → verify new slot free → old slot cleared → notification sent |
| **Vital out of range** | Enter BP 100/250 → warning banner shows → confirm doctor can override and save |
| **Session timeout** | Let session idle 30 min → attempt action → redirect to login → re-login → verify no data loss |
| **Oversized export** | Export 5,000 consultations to CSV → verify file downloads without timing out |

---

## File Structure & Targets

```
doc-patient/
├── .github/
│   ├── agents/
│   │   └── planning.agent.md           # Planning agent definition
│   ├── workflows/
│   │   ├── ci.yml                      # GitHub Actions CI/CD
│   │   └── deploy.yml                  # Deployment automation
│   └── CODEOWNERS
├── frontend/                           # React + TypeScript
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── manifest.json
│   ├── src/
│   │   ├── index.tsx
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── components/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx           # Home + daily appointments
│   │   │   ├── PatientSearch.tsx       # Patient lookup
│   │   │   ├── PatientProfile.tsx      # Patient details
│   │   │   ├── AppointmentForm.tsx     # Schedule appointment
│   │   │   ├── ConsultationForm.tsx    # Vitals + complaints + diagnosis + meds
│   │   │   ├── PrescriptionView.tsx    # Print/PDF
│   │   │   ├── PatientHistory.tsx      # Past visits
│   │   │   ├── Export.tsx              # CSV/PDF export
│   │   │   └── LoginPage.tsx           # Authentication
│   │   ├── hooks/
│   │   │   ├── useAuth.ts              # Auth context
│   │   │   ├── usePatient.ts           # Patient data fetching
│   │   │   ├── useConsultation.ts      # Consultation state
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── api.ts                  # API client (fetch wrapper)
│   │   │   ├── auth.ts                 # Auth service
│   │   │   ├── patient.ts              # Patient service
│   │   │   ├── appointment.ts          # Appointment service
│   │   │   ├── consultation.ts         # Consultation service
│   │   │   ├── export.ts               # CSV/PDF generation
│   │   │   └── ...
│   │   ├── types/
│   │   │   ├── index.ts                # TypeScript interfaces
│   │   │   ├── patient.ts
│   │   │   ├── appointment.ts
│   │   │   ├── consultation.ts
│   │   │   └── ...
│   │   ├── utils/
│   │   │   ├── validation.ts           # Form validation
│   │   │   ├── formatters.ts           # Date/time formatting
│   │   │   ├── vitals.ts               # Vital range checking
│   │   │   └── ...
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   ├── NotificationContext.tsx
│   │   │   └── ...
│   │   ├── styles/
│   │   │   ├── index.css
│   │   │   ├── variables.css
│   │   │   └── ...
│   │   └── __tests__/                  # Unit tests (mirror src/)
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   └── README.md
├── backend/                            # Node.js + Express
│   ├── src/
│   │   ├── index.ts                    # Entry point
│   │   ├── server.ts                   # Express app setup
│   │   ├── config/
│   │   │   ├── database.ts             # PostgreSQL connection
│   │   │   ├── env.ts                  # Environment variables
│   │   │   └── ...
│   │   ├── middleware/
│   │   │   ├── auth.ts                 # JWT validation
│   │   │   ├── errorHandler.ts         # Error handling
│   │   │   ├── logger.ts               # Logging
│   │   │   └── ...
│   │   ├── routes/
│   │   │   ├── auth.ts                 # /auth/login, /auth/logout
│   │   │   ├── patients.ts             # /patients CRUD + search
│   │   │   ├── appointments.ts         # /appointments CRUD
│   │   │   ├── consultations.ts        # /consultations CRUD
│   │   │   ├── medications.ts          # /medications (autocomplete)
│   │   │   ├── exports.ts              # /exports (CSV/PDF)
│   │   │   └── health.ts               # /health (monitoring)
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── patientController.ts
│   │   │   ├── appointmentController.ts
│   │   │   ├── consultationController.ts
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── patientService.ts       # Business logic
│   │   │   ├── appointmentService.ts
│   │   │   ├── consultationService.ts
│   │   │   ├── authService.ts
│   │   │   └── ...
│   │   ├── models/
│   │   │   ├── User.ts                 # DB models
│   │   │   ├── Patient.ts
│   │   │   ├── Appointment.ts
│   │   │   ├── Consultation.ts
│   │   │   └── ...
│   │   ├── migrations/
│   │   │   ├── 001_init_schema.sql
│   │   │   ├── 002_add_indexes.sql
│   │   │   └── ...
│   │   ├── utils/
│   │   │   ├── validators.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── ...
│   │   └── __tests__/                  # Unit + integration tests
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   └── README.md
├── docs/
│   ├── USER_GUIDE.md                   # User documentation
│   ├── ADMIN_MANUAL.md                 # Admin/setup guide
│   ├── API_DOCS.md                     # API reference
│   ├── TROUBLESHOOTING.md              # FAQ
│   ├── ARCHITECTURE.md                 # System design
│   └── SETUP.md                        # Development setup
├── docker/
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   └── docker-compose.yml
├── scripts/
│   ├── setup.sh                        # Setup script
│   ├── backup.sh                       # Backup automation
│   ├── deploy.sh                       # Deployment script
│   └── seed-data.ts                    # Test data generation
├── .gitignore
├── .env.example
├── README.md
└── CONTRIBUTING.md
```

---

## Dependencies & Blockers

### External Dependencies
| Dependency | Purpose | Risk | Mitigation |
|------------|---------|------|-----------|
| **PostgreSQL** | Relational database | Setup delays, version incompatibility | Use Docker or managed cloud DB (RDS, Azure DB) |
| **Node.js / npm** | Backend runtime & package manager | Version conflicts | Lock to Node 18 LTS in package.json |
| **React 18+** | Frontend framework | Breaking changes between versions | Pin React version; test upgrades on branch first |
| **jsPDF / PDF-embed** | PDF generation | Library bugs, file size bloat | Test with real prescriptions early; consider alternative if issues |
| **Browser print API** | Printing | Printer config varies by clinic | Manual testing with clinic's actual printer |
| **Email/SMS (Phase 2)** | Notifications | Requires third-party service (Twilio, SendGrid) | Out-of-scope for Phase 1 |

### Internal Dependencies (Task Ordering)
| Phase | Depends On | Rationale |
|-------|-----------|-----------|
| **Phase 2 (Patient Mgmt)** | Phase 1 (Setup) | Need database schema and API framework first |
| **Phase 3 (Appointments)** | Phase 1, 2 | Appointments link to patients |
| **Phase 4 (Consultation)** | Phase 1, 2, 3 | Consultations link to appointments |
| **Phase 5 (Prescription)** | Phase 4 | Prescriptions generated from consultations |
| **Phase 6 (Export)** | Phase 2, 4 | Export patient and consultation data |
| **Phase 7 (Testing)** | All above | Cannot test until features exist |
| **Phase 8 (Deploy)** | Phase 7 | Ship only after QA passes |

### Blocking Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| **Printer compatibility issues** | Medium | Cannot print → consultation workflow broken | Document supported printers; test early with clinic printer |
| **Network reliability at clinic** | Medium | Network drop during consultation → data loss | Implement offline caching + local queue early |
| **Database performance at scale** | Low (initially) | Search slow with large patient DB | Add indexes; test with 5,000+ patients; optimize queries |
| **Browser compatibility** | Low | Print fails on unsupported browser | Target Chrome/Edge/Safari; test on all three |
| **Doctor availability for UAT** | Medium | Cannot validate 2–3 min success criterion | Schedule UAT early; respect clinic hours |
| **Scope creep (billing, reminders)** | Medium | Project delays, increased complexity | Enforce Phase 1 scope; document Phase 2 features |
| **Security audit concerns** | Low-Medium | Deployment blocked for security issues | Plan security testing early; use OWASP guidelines |

### Assumptions to Validate

1. **Doctor works alone** ← Confirmed in BRD (no receptionist Phase 1)
2. **2–3 min consultation includes app time** ← Needs validation in UAT
3. **Web-only, no mobile** ← Confirmed (responsive web for desktop/tablet)
4. **Free text complaints preferred** ← Assume yes; validate in UAT
5. **Direct print preferred over preview** ← Assume yes; conflicts with 2–3 min criterion
6. **Clinic has stable internet** ← High risk if false; plan offline resilience
7. **Doctor can use basic auth (username/password)** ← Assume yes

---

## Timeline & Milestones

### Estimated Duration
- **Total Project Duration:** 12–16 weeks (~3–4 months)
- **Full-time team:** 2–3 developers, 1 QA, 1 product manager

### Milestone Overview

#### **Milestone 1: Foundation & Core Setup** (End of Week 2)
- ✅ Dev environment ready
- ✅ Database schema created and tested
- ✅ Authentication implemented
- ✅ Frontend base layout + components library ready
- **Deliverable:** Docker setup, working backend API, basic UI shell
- **Success:** `npm run dev` starts app locally; API responds to requests

---

#### **Milestone 2: Patient Management & Appointments** (End of Week 6)
- ✅ Patient registration, search, profile working
- ✅ Appointment scheduling, daily list, status updates working
- **Deliverable:** Doctor can manage patients and schedule appointments
- **Success:** End-to-end workflow: Search patient → Schedule appointment → View daily list

---

#### **Milestone 3: Consultation Workflow** (End of Week 10)
- ✅ Vitals, complaints, diagnosis, medications entry working
- ✅ Prescription generation + print working
- ✅ Patient history view working
- **Deliverable:** Core consultation workflow complete
- **Success:** Doctor completes full consultation in 2–3 minutes (measured in UAT)

---

#### **Milestone 4: Export & Reporting** (End of Week 11)
- ✅ CSV/PDF export working
- ✅ Data backup status visible to doctor
- **Deliverable:** Doctor can export patient data for audits/backups
- **Success:** All data exports correctly; PDF opens in viewer without errors

---

#### **Milestone 5: Testing & QA Completion** (End of Week 14)
- ✅ Unit tests passing (≥80% coverage)
- ✅ Integration tests passing (≥70% coverage)
- ✅ E2E tests passing (100% happy path + edge cases)
- ✅ Performance targets met (search < 2s, etc.)
- ✅ Security tests passing
- ✅ UAT completed with doctor feedback
- **Deliverable:** Production-ready build
- **Success:** Zero blocker bugs; doctor confirms usability ≥8/10

---

#### **Milestone 6: Production Deployment & Launch** (End of Week 16)
- ✅ Production infrastructure ready
- ✅ Documentation & training completed
- ✅ Go-live successful
- ✅ 2-week post-launch support
- **Deliverable:** Live production system with doctor actively using
- **Success:** Doctor clinic operating on digital system; no critical issues in first week

---

### Phase Timeline (Detailed)

| Phase | Duration | Start | End | Key Deliverables |
|-------|----------|-------|-----|------------------|
| Phase 1: Foundation | 1–2 wks | Wk 1 | Wk 2 | Infrastructure, DB schema, auth, base UI |
| Phase 2: Patient Mgmt | 1.5–2 wks | Wk 2 | Wk 4 | Patient CRUD, search, profile |
| Phase 3: Appointments | 1.5–2 wks | Wk 4 | Wk 6 | Scheduling, daily list, status |
| Phase 4: Consultation | 2–3 wks | Wk 6 | Wk 10 | Vitals, complaints, diagnosis, meds, Rx |
| Phase 5: Export | 1–1.5 wks | Wk 10 | Wk 11 | CSV/PDF export, backup status |
| Phase 6: Testing & QA | 2–3 wks | Wk 11 | Wk 14 | Unit, integration, E2E, security, UAT |
| Phase 7: Deployment | 1 wk | Wk 14 | Wk 15 | Infrastructure, docs, training |
| Phase 8: Launch & Support | 1 wk | Wk 15 | Wk 16 | Go-live, 2-week support |
| **Total** | **12–16 wks** | | | |

---

## Approach & Methodology

### Development Approach
- **Agile + Kanban:** 1–2 week sprints with daily standups
- **Branch-based workflow:** Each task gets feature branch; PR review + CI before merge
- **Continuous Integration:** Automated tests on every PR, linting, build checks
- **Continuous Deployment:** Auto-deploy to staging on merge to `develop`; manual promotion to production

### Communication & Feedback
- **Weekly stakeholder sync:** 30 min check-in with doctor/product owner
- **Mid-project demo:** Week 6 (after Milestone 2); doctor validates appointment workflow in parallel mode
- **UAT period (Week 11–12):** Doctor uses app while in parallel mode (current system still running)
- **Post-launch support:** 2-week on-call support; collect feedback for Phase 2 roadmap

### Risk Management
- **Track blockers bi-weekly:** Identify new risks; adjust timeline if needed
- **Version control backups:** All code in Git; production DB backed up daily
- **Fallback plans:** If printer integration fails, fallback to PDF for Phase 1
- **Scope management:** Document any requested changes for Phase 2 backlog

---

## Notes & Follow-up

### Assumptions to Validate with Doctor
1. **Time budget:** Confirm that 2–3 min includes *all* consultation data entry (vitals → diagnosis → prescription)
2. **Frequency:** How often are medications reused from past Rx? (Justifies autocomplete feature)
3. **Vitals frequency:** Are vitals recorded the same way every time (e.g., always BP before pulse)?
4. **Printer:** What printer will clinic use? Network, USB, or mobile? (Affects print integration)
5. **History depth:** Do doctors typically review > 12 months of history? (Affects pagination strategy)

### Phase 2 Opportunities
- **Receptionist access:** Appointment scheduling, patient intake handling
- **Patient portal:** Self-service appointment booking, visit history access
- **Billing integration:** Invoice generation, payment tracking
- **Follow-up reminders:** SMS/email notifications to patients for follow-up visits
- **Lab integration:** Lab test ordering and result tracking
- **Analytics dashboard:** Weekly/monthly reporting on consultations, common diagnoses
- **Multi-clinic support:** Expand for multiple doctors/clinics
- **Offline mode:** Work without internet; sync when online
- **Mobile app:** Native iOS/Android apps for on-the-go access

### Success Metrics to Track Post-Launch
- **Adoption:** Doctor uses app for ≥90% of consultations within first month
- **Efficiency:** Avg. consultation time = 2–3 min (measured via logs)
- **Data integrity:** Zero lost or corrupted records over 3 months
- **Uptime:** ≥99.5% system availability
- **Doctor satisfaction:** Quarterly NPS score ≥ 8/10

---

## Document Controls

| Item | Value |
|------|-------|
| **Document Version** | 1.0 |
| **Created** | April 10, 2026 |
| **Author** | Planning Agent |
| **Next Review** | End of Week 2 (after Phase 1 + Milestone 1 completion) |
| **Approval** | Pending stakeholder review |
| **Classification** | Internal / Project Planning |
