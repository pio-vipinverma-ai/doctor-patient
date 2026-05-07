# Implementation Checklist & Step-by-Step Prompts

**Document Version:** 1.0  
**Date Created:** May 7, 2026  
**Status:** READY FOR IMPLEMENTATION  
**Purpose:** Break down implementation into small, verifiable chunks with specific prompts

---

## Implementation Phases Overview

```
Phase 1: Project Setup (Days 1-2)
  ├─ Backend Infrastructure
  ├─ Frontend Infrastructure
  └─ Database Setup

Phase 2: Core Authentication (Days 3-4)
  ├─ Backend Auth API
  ├─ Frontend Auth UI
  └─ JWT Integration

Phase 3: Patient Management (Days 5-7)
  ├─ Patient API (CRUD)
  ├─ Patient UI (Search, Profile, Forms)
  └─ Patient Validation

Phase 4: Appointment Management (Days 8-9)
  ├─ Appointment API
  ├─ Appointment UI (List, Schedule, Status)
  └─ Availability Logic

Phase 5: Consultation Module (Days 10-13)
  ├─ Vitals Capture & Validation
  ├─ Consultation Form & Storage
  ├─ Medication Management
  └─ Prescription Generation

Phase 6: Search & History (Days 14-15)
  ├─ Patient Search with Typeahead
  ├─ Patient History View
  └─ Filters & Pagination

Phase 7: Export & Reporting (Days 16)
  ├─ CSV Export
  ├─ PDF Export
  └─ Report Generation

Phase 8: UI Polish & Testing (Days 17-19)
  ├─ Component Refinement
  ├─ Responsive Design
  ├─ Accessibility Audit
  └─ Performance Optimization

Phase 9: Testing & QA (Days 20-21)
  ├─ Unit Tests
  ├─ Integration Tests
  ├─ E2E Tests
  └─ Security Audit

Phase 10: Deployment (Day 22)
  ├─ Docker Setup
  ├─ Environment Configuration
  ├─ Database Migrations
  └─ Production Deployment
```

---

# PHASE 1: PROJECT SETUP (Days 1-2)

## Step 1.1: Backend Infrastructure Setup

**What to Build:**
- Node.js + Express.js server with TypeScript
- Basic project structure
- Environment configuration
- Health check endpoint

**Prompt for Your Team:**

```
Backend Infrastructure Setup

Goals:
1. Initialize Node.js project with TypeScript
2. Set up Express.js server
3. Configure environment variables
4. Create basic middleware structure
5. Implement health check endpoint

Deliverables:
✓ backend/ folder with src/ structure
✓ package.json with dependencies
✓ tsconfig.json configured
✓ .env.example with required variables
✓ Server running on http://localhost:5000
✓ GET /health returns { status: "ok", timestamp }

Files to Create:
- backend/src/index.ts (entry point)
- backend/src/server.ts (Express app)
- backend/src/config/env.ts (env variables)
- backend/src/middleware/requestLogger.ts
- backend/src/middleware/errorHandler.ts
- backend/.env.example
- backend/package.json
- backend/tsconfig.json

Verification:
- npm start runs without errors
- curl http://localhost:5000/health returns JSON response
- Logs show "Server running on port 5000"

Time Estimate: 1-2 hours
```

**Specific Tasks:**

1. Install dependencies:
   ```bash
   npm init -y
   npm install express dotenv cors
   npm install -D typescript @types/express @types/node nodemon ts-node
   ```

2. Create `backend/src/server.ts` with basic Express app
3. Add middleware: CORS, request logging, error handling
4. Create health check route: `GET /health`
5. Test with `npm start` and curl

**Verification Checklist:**
- [ ] Server starts without errors
- [ ] Health endpoint returns correct response
- [ ] Environment variables loaded from .env
- [ ] Request logging visible in console

---

## Step 1.2: Frontend Infrastructure Setup

**What to Build:**
- React 18 + TypeScript project with Vite
- Basic component structure
- Routing setup
- SCSS styling system

**Prompt for Your Team:**

```
Frontend Infrastructure Setup

Goals:
1. Initialize React project with Vite and TypeScript
2. Set up routing with React Router
3. Create base layout components (Header, Sidebar, Footer)
4. Configure SCSS styling system
5. Set up Context API for authentication

Deliverables:
✓ frontend/ folder with src/ structure
✓ React app running on http://localhost:5173
✓ Basic layout components created
✓ SCSS variables and mixins configured
✓ Routing structure established
✓ App renders without errors

Files to Create:
- frontend/src/main.tsx (entry point)
- frontend/src/App.tsx (root component)
- frontend/src/components/layout/Header.tsx
- frontend/src/components/layout/Sidebar.tsx
- frontend/src/components/layout/Layout.tsx
- frontend/src/context/AuthContext.tsx
- frontend/src/pages/LoginPage.tsx
- frontend/src/pages/DashboardPage.tsx
- frontend/src/styles/variables.scss
- frontend/src/styles/index.scss
- frontend/package.json
- frontend/vite.config.ts
- frontend/tsconfig.json

Verification:
- npm run dev starts dev server
- Page loads at http://localhost:5173
- Layout components render correctly
- React Router navigation works

Time Estimate: 2-3 hours
```

**Specific Tasks:**

1. Create Vite project: `npm create vite@latest frontend -- --template react-ts`
2. Install additional dependencies:
   ```bash
   npm install react-router-dom axios
   npm install -D scss
   ```
3. Create layout structure (Header, Sidebar, Footer)
4. Set up SCSS variables for colors and spacing
5. Create basic pages (Login, Dashboard)
6. Set up React Router with protected routes

**Verification Checklist:**
- [ ] Frontend app runs without errors
- [ ] Layout components render
- [ ] Navigation between pages works
- [ ] Responsive layout on different screen sizes
- [ ] SCSS compilation works

---

## Step 1.3: Database Setup

**What to Build:**
- PostgreSQL database
- Initial schema with tables
- Database migrations setup
- Connection pooling

**Prompt for Your Team:**

```
Database Setup

Goals:
1. Create PostgreSQL database
2. Define and create all tables (Users, Patients, Appointments, Consultations, Medications, Prescriptions, AuditLog)
3. Add indexes for performance
4. Set up connection pooling

Deliverables:
✓ PostgreSQL database created locally/cloud
✓ All tables created with correct schema
✓ Indexes added for search performance
✓ Foreign key relationships established
✓ Sample user created for testing
✓ Connection pool configured

Database Tables:
- users (id, username, email, password_hash, name, created_at, updated_at)
- patients (id, name, dob, gender, phone, email, address, created_at, updated_at)
- appointments (id, patient_id, scheduled_time, status, reason, created_at, updated_at)
- consultations (id, patient_id, appointment_id, temperature, bp_systolic, bp_diastolic, pulse, complaints, diagnosis, created_at, updated_at)
- medications (id, consultation_id, name, dosage, frequency, duration, instructions, created_at)
- prescriptions (id, consultation_id, status, generated_at, printed_at, updated_at)
- audit_log (id, user_id, action, table_name, record_id, changes, timestamp)

Indexes Created:
- users(email), users(username)
- patients(name), patients(phone), patients(created_at)
- appointments(patient_id), appointments(scheduled_time), appointments(status)
- consultations(patient_id), consultations(created_at)
- medications(consultation_id)
- audit_log(user_id), audit_log(timestamp)

Verification:
- psql can connect to database
- All 7 tables exist with correct columns
- Indexes created
- Sample data can be inserted

Time Estimate: 1-2 hours
```

**Specific Tasks:**

1. Create PostgreSQL database:
   ```bash
   createdb doc_patient_db
   ```

2. Create migration file with all table definitions
3. Add indexes for performance optimization
4. Create sample user for testing:
   ```sql
   INSERT INTO users (username, email, password_hash, name)
   VALUES ('doctor', 'doctor@clinic.com', 'hashed_password', 'Dr. Admin');
   ```

5. Set up connection pooling in backend

**Verification Checklist:**
- [x] Database created and accessible
- [x] All 7 tables exist
- [x] Foreign key constraints working
- [x] Indexes created
- [x] Sample data inserted successfully
- [x] Backend can connect to database

---

# PHASE 2: CORE AUTHENTICATION (Days 3-4)

## Step 2.1: Backend Authentication API

**What to Build:**
- JWT token generation and verification
- Login endpoint with validation
- Logout endpoint
- Password hashing with bcrypt
- Auth middleware

**Prompt for Your Team:**

```
Backend Authentication API

Goals:
1. Implement secure login with username/password
2. Generate JWT tokens (access + refresh)
3. Verify tokens in protected routes
4. Handle password hashing and validation
5. Implement logout functionality

Deliverables:
✓ POST /api/auth/login returns JWT tokens
✓ POST /api/auth/logout clears sessions
✓ Auth middleware protects routes
✓ Passwords hashed with bcrypt
✓ JWT refresh token logic implemented
✓ Error handling for invalid credentials

Files to Create:
- backend/src/routes/auth.ts (route definitions)
- backend/src/controllers/authController.ts (business logic)
- backend/src/services/authService.ts (database operations)
- backend/src/middleware/auth.ts (JWT verification)
- backend/src/utils/jwt.ts (token generation)
- backend/src/utils/crypto.ts (password hashing)

API Endpoints:
POST /api/auth/login
  Request: { username: string, password: string }
  Response: { success: true, token: string, refreshToken: string, user: {} }

POST /api/auth/logout
  Headers: Authorization: Bearer <token>
  Response: { success: true, message: "Logged out" }

GET /api/auth/profile (protected)
  Headers: Authorization: Bearer <token>
  Response: { success: true, user: {} }

Verification:
- Login with correct credentials returns tokens
- Login with wrong credentials returns 401
- Protected routes require valid token
- Tokens expire correctly
- Refresh token works

Time Estimate: 3-4 hours
```

**Specific Tasks:**

1. Install dependencies:
   ```bash
   npm install jsonwebtoken bcryptjs
   npm install -D @types/jsonwebtoken
   ```

2. Create JWT utility functions
3. Implement password hashing with bcrypt
4. Create auth middleware for route protection
5. Build login/logout endpoints
6. Add validation for username and password

**Verification Checklist:**
- [x] Login returns tokens for valid credentials
- [x] Invalid credentials return 401 error
- [x] Protected routes blocked without token
- [x] Protected routes allowed with valid token
- [x] Passwords stored as hashes (not plain text)
- [x] Token expiration works correctly

---

## Step 2.2: Frontend Authentication UI & Context

**Status:** ✅ COMPLETED (2026-05-07)  
**Completion Document:** See `Document/Step_2_2_FRONTEND_AUTH_COMPLETE.md`

**What to Build:**
- Login page component
- AuthContext for global auth state
- Protected routes
- Login form with validation
- Logout functionality

**Prompt for Your Team:**

```
Frontend Authentication UI & Context

Goals:
1. Create login page with form validation
2. Implement AuthContext for state management
3. Set up protected routes
4. Add logout button to header
5. Store JWT tokens securely (HttpOnly cookies or localStorage)

Deliverables:
✓ Login page renders correctly
✓ Form validation and error display
✓ AuthContext manages login/logout state
✓ Protected routes redirect unauthenticated users
✓ Logout clears auth state
✓ Header shows user name and logout button

Files to Create:
- frontend/src/context/AuthContext.tsx (auth state)
- frontend/src/hooks/useAuth.ts (auth hook)
- frontend/src/pages/LoginPage.tsx (login form)
- frontend/src/components/ProtectedRoute.tsx (route protection)
- frontend/src/services/authService.ts (API calls)

Components:
- LoginPage: username input, password input, login button, error display
- Header: user profile dropdown, logout button
- ProtectedRoute: redirects to login if not authenticated

Verification:
- Login page displays form
- Form submission calls API
- Success redirects to dashboard
- Error displays alert
- Logout clears tokens and redirects to login
- Refresh page maintains logged-in state (tokens still valid)

Time Estimate: 2-3 hours
```

**Specific Tasks:**

1. Create AuthContext with login/logout methods
2. Build Login page with form fields
3. Implement form validation
4. Add API service for login
5. Create protected route wrapper
6. Add logout button to header
7. Store tokens (with expiration check)

**Verification Checklist:**
- [x] Login form appears on page
- [x] Form validation works (required fields)
- [x] API call succeeds with correct credentials
- [x] Dashboard shows after successful login
- [x] Logout button appears in header
- [x] Logout clears tokens and redirects to login
- [x] Page refresh maintains login state

---

# PHASE 3: PATIENT MANAGEMENT (Days 5-7)

## Step 3.1: Backend Patient API (CRUD + Search)

**Status:** ✅ COMPLETED (2026-05-07)  
**Completion Document:** See `Document/Step_3_1_PATIENT_API_COMPLETE.md`

**What to Build:**
- Create patient endpoint with validation
- Read patient endpoint
- Update patient endpoint
- Search patients by name or phone
- List all patients with pagination

**Prompt for Your Team:**

```
Backend Patient API (CRUD + Search)

Goals:
1. Create POST endpoint for new patient registration
2. Create GET endpoints for patient retrieval (single, list, search)
3. Create PUT endpoint for patient updates
4. Implement search with name/phone query
5. Add database validation and error handling

Deliverables:
✓ POST /api/patients creates new patient
✓ GET /api/patients/:id retrieves patient
✓ GET /api/patients/search?q=name returns matching patients
✓ PUT /api/patients/:id updates patient
✓ Validation prevents duplicate phone numbers
✓ Search returns results < 100ms

API Endpoints:

POST /api/patients
  Headers: Authorization: Bearer <token>
  Request: { name, dob, gender, phone, email?, address? }
  Response: { success: true, patient: { id, name, ... } }

GET /api/patients/:id
  Headers: Authorization: Bearer <token>
  Response: { success: true, patient: { ... } }

GET /api/patients/search?q=john&limit=10
  Headers: Authorization: Bearer <token>
  Response: { success: true, patients: [ { id, name, age, phone, lastVisit }, ... ] }

PUT /api/patients/:id
  Headers: Authorization: Bearer <token>
  Request: { name?, phone?, email?, address? }
  Response: { success: true, patient: { ... } }

Database Indexes:
- CREATE INDEX idx_patients_name ON patients(name)
- CREATE INDEX idx_patients_phone ON patients(phone)

Validation Rules:
- Name: Required, max 100 chars, letters/spaces
- DOB: Required, valid date, age >= 0
- Phone: Required, unique, format validation
- Gender: M, F, or Other

Error Responses:
- 400: Invalid data
- 409: Duplicate phone number
- 404: Patient not found
- 401: Unauthorized

Time Estimate: 3-4 hours
```

**Specific Tasks:**

1. Create patient routes in `backend/src/routes/patients.ts`
2. Build patient controller with CRUD operations
3. Create patient service with database queries
4. Add input validation with Joi or similar
5. Implement search query with LIKE on name and phone
6. Add pagination to list endpoint
7. Create error responses for validation failures

**Verification Checklist:**
- [x] Create patient with valid data succeeds
- [x] Create patient without required fields fails (400)
- [x] Duplicate phone returns 409 error
- [x] Get patient by ID returns correct data
- [x] Search returns results matching query
- [x] Search returns < 10 items by default
- [x] Update patient updates all fields correctly
- [x] Unauthorized requests return 401

---

## Step 3.2: Frontend Patient Management UI

**What to Build:**
- Patient search page with typeahead
- Patient profile page
- Patient registration form
- Patient edit form
- Patient list display

**Prompt for Your Team:**

```
Frontend Patient Management UI

Goals:
1. Create patient search page with real-time typeahead
2. Build patient profile page with tabs
3. Create patient registration modal/form
4. Implement patient edit functionality
5. Display patient list with actions

Deliverables:
✓ Search page renders with typeahead
✓ Search returns results < 100ms
✓ Patient profile page displays all info
✓ Edit patient form works
✓ Patient registration form validates input
✓ Actions (Edit, Schedule, Consult) visible on profile

Pages/Components:
- PatientSearchPage: search bar, results list, actions
- PatientProfilePage: patient info, tabs (Profile, Appointments, History), action buttons
- PatientForm: name, dob, gender, phone, email, address fields
- PatientCard: compact patient display with quick actions

Features:
- Typeahead search (debounced 300ms)
- Form validation on blur/submit
- Error messages for invalid fields
- Loading states during API calls
- Toast notifications for success/error
- Responsive design (mobile: stacked, desktop: 2-column)

Verification:
- Search page loads and focuses on input
- Typing triggers typeahead (< 200ms response)
- Search results clickable
- Patient profile shows correct info
- Edit form pre-populates with current data
- Update saves and redirects
- Registration form validates before submit

Time Estimate: 4-5 hours
```

**Specific Tasks:**

1. Create PatientSearchPage component
2. Implement search typeahead with debounce
3. Create PatientForm component with validation
4. Build PatientProfilePage with tabs
5. Add patient service for API calls
6. Implement form error handling
7. Add loading and success states

**Verification Checklist:**
- [ ] Search page displays search input
- [ ] Typeahead returns results while typing
- [ ] Results clickable (navigates to profile)
- [ ] Profile page shows patient information
- [ ] Edit button opens form with current data
- [ ] Form validation shows errors
- [ ] Save button updates patient
- [ ] Registration form creates new patient
- [ ] Success toast appears after save

---

# PHASE 4: APPOINTMENT MANAGEMENT (Days 8-9)

## Step 4.1: Backend Appointment API

**What to Build:**
- Schedule new appointment endpoint
- Get appointments for date
- Update appointment status
- Check availability logic
- Prevent double-booking

**Prompt for Your Team:**

```
Backend Appointment API

Goals:
1. Create endpoint to schedule new appointments
2. Get daily appointments list
3. Update appointment status (Scheduled, Completed, Cancelled, No-show)
4. Prevent double-booking for same patient
5. Implement availability checking

Deliverables:
✓ POST /api/appointments schedules appointment
✓ GET /api/appointments?date=YYYY-MM-DD gets daily list
✓ PUT /api/appointments/:id updates status
✓ No double-booking allowed
✓ Appointments sorted by time
✓ Response includes patient details

API Endpoints:

POST /api/appointments
  Headers: Authorization: Bearer <token>
  Request: { patientId, scheduledTime, reason }
  Response: { success: true, appointment: { id, patientId, scheduledTime, status, reason } }

GET /api/appointments?date=2026-05-10&status=Scheduled
  Headers: Authorization: Bearer <token>
  Response: { success: true, appointments: [ { id, patientId, patientName, phone, scheduledTime, status, reason, consultationSaved }, ... ] }

PUT /api/appointments/:id
  Headers: Authorization: Bearer <token>
  Request: { status, reason? }
  Response: { success: true, appointment: { ... } }

Validation:
- appointmentId: valid UUID, exists
- scheduledTime: >= now, within clinic hours (9 AM - 6 PM)
- patientId: valid UUID, patient exists
- status: Scheduled, Completed, Cancelled, No-show
- No double-booking: Check for existing appointment same time

Double-Booking Prevention:
SELECT * FROM appointments 
WHERE patient_id = ? AND DATE(scheduled_time) = ? AND status != 'Cancelled'

Indexes:
- CREATE INDEX idx_appointments_patient_id ON appointments(patient_id)
- CREATE INDEX idx_appointments_scheduled_time ON appointments(scheduled_time DESC)
- CREATE UNIQUE INDEX idx_no_double_booking ON appointments(patient_id, scheduled_time) WHERE status != 'Cancelled'

Time Estimate: 2-3 hours
```

**Specific Tasks:**

1. Create appointment routes
2. Build appointment controller
3. Create appointment service with database queries
4. Implement double-booking check
5. Add validation for date/time
6. Implement status update logic
7. Add appointments list query

**Verification Checklist:**
- [ ] Create appointment succeeds with valid data
- [ ] Double-booking prevented (409 error)
- [ ] List appointments for date
- [ ] Update status changes correctly
- [ ] Cancelled appointments excluded from availability
- [ ] Past appointments cannot be created
- [ ] Invalid patient ID returns 404

---

## Step 4.2: Frontend Appointment Management UI

**What to Build:**
- Dashboard with today's appointments
- Appointment scheduling form
- Appointment status update
- Appointment list display
- Inline action buttons

**Prompt for Your Team:**

```
Frontend Appointment Management UI

Goals:
1. Display today's appointments on dashboard
2. Create appointment scheduling modal/form
3. Show appointment details with patient info
4. Implement status update buttons
5. Add quick action buttons (View, Consult, Cancel)

Deliverables:
✓ Dashboard shows today's appointments
✓ Appointment list sorted by time
✓ Schedule appointment form validates date/time
✓ Status update works inline
✓ Patient info visible in appointment row
✓ Quick action buttons functional

Components:
- DashboardPage: today's schedule, stats, quick actions
- AppointmentList: table with appointments, inline actions
- ScheduleAppointmentForm: date/time picker, patient search, reason
- AppointmentItem: single appointment row with actions

Features:
- Date/time picker (prevent past dates)
- Patient search (typeahead)
- Status buttons (Mark Complete, Cancel, No-show)
- Show consultation saved indicator
- Loading states for actions
- Confirmation dialog for cancel/no-show
- Responsive table (scroll on mobile)

Verification:
- Dashboard loads and shows today's appointments
- Appointments sorted by time
- Schedule button opens form
- Form validates date (no past dates)
- Save creates appointment and refreshes list
- Status buttons update appointment
- Refresh shows updated status

Time Estimate: 3-4 hours
```

**Specific Tasks:**

1. Create DashboardPage component
2. Build AppointmentList with inline actions
3. Create ScheduleAppointmentForm
4. Implement date/time picker
5. Add appointment service methods
6. Create confirmation dialogs for actions
7. Add loading states for async operations

**Verification Checklist:**
- [ ] Dashboard displays appointments
- [ ] Appointments sorted by time
- [ ] Schedule appointment button works
- [ ] Form validates date and time
- [ ] Patient search works in form
- [ ] Save creates new appointment
- [ ] Status buttons update appointment
- [ ] Confirmation dialog appears for delete/cancel

---

# PHASE 5: CONSULTATION MODULE (Days 10-13)

## Step 5.1: Backend Consultation API (Vitals + Form)

**What to Build:**
- Create consultation endpoint with vitals, complaints, diagnosis
- Add medication entries
- Generate prescription
- Validate vitals ranges
- Store consultation record

**Prompt for Your Team:**

```
Backend Consultation API (Vitals + Form)

Goals:
1. Create POST endpoint for new consultation
2. Record vitals (temperature, BP, pulse) with validation
3. Store complaints, diagnosis, medications
4. Validate vitals within acceptable ranges (warnings allowed)
5. Automatically generate prescription record
6. Get consultation history for patient

Deliverables:
✓ POST /api/consultations creates full consultation record
✓ Vitals validated and stored
✓ Medications added to consultation
✓ Prescription auto-generated
✓ GET /api/patients/:id/consultations returns history
✓ Vitals outside range trigger warning (not blocking)

API Endpoints:

POST /api/consultations
  Headers: Authorization: Bearer <token>
  Request: {
    patientId,
    appointmentId?,
    temperature: 101.5,
    bpSystolic: 130,
    bpDiastolic: 85,
    pulse: 92,
    complaints: "...",
    diagnosis: "...",
    medications: [
      { name, dosage, frequency, duration, instructions },
      ...
    ]
  }
  Response: { success: true, consultation: { id, patientId, vitals, medications, prescription: { id } } }

GET /api/patients/:id/consultations?limit=10&offset=0
  Headers: Authorization: Bearer <token>
  Response: { success: true, consultations: [ { id, date, vitals, diagnosis, medicationCount, prescriptionId }, ... ], total }

Vitals Validation (Warnings):
- Temperature: 95-105°F normal, alert if outside
- BP Systolic: 90-180 mmHg normal
- BP Diastolic: 60-120 mmHg normal
- Pulse: 40-150 BPM normal

Database Model:
consultations: id, patient_id, appointment_id, temperature, bp_systolic, bp_diastolic, pulse, complaints, diagnosis, created_at, updated_at
medications: id, consultation_id, name, dosage, frequency, duration, instructions, created_at
prescriptions: id, consultation_id, status (Generated), generated_at, printed_at, updated_at

Time Estimate: 3-4 hours
```

**Specific Tasks:**

1. Create consultation routes
2. Build consultation controller
3. Create consultation service with database operations
4. Implement vitals validation logic
5. Create medication insertion logic
6. Auto-generate prescription record
7. Build consultation history query

**Verification Checklist:**
- [ ] Create consultation with vitals succeeds
- [ ] Vitals stored correctly
- [ ] Medications added to consultation
- [ ] Prescription auto-generated
- [ ] Get consultation history returns list
- [ ] Vitals outside range return warning in response
- [ ] At least 1 medication required (validate on submission)

---

## Step 5.2: Frontend Consultation Form

**What to Build:**
- Multi-section consultation form
- Vitals input with validation
- Complaints textarea
- Diagnosis textarea
- Medications add/remove
- Medication list preview
- Save and generate prescription flow

**Prompt for Your Team:**

```
Frontend Consultation Form

Goals:
1. Create multi-step consultation form
2. Implement vitals capture with large input fields (48px)
3. Add complaints and diagnosis text areas
4. Build medication add/remove interface
5. Show medication preview before save
6. Validate form and show errors
7. Auto-generate prescription after save

Deliverables:
✓ Consultation form renders all 5 sections
✓ Vitals fields large and easy to input
✓ Vitals outside range show warning (not blocking)
✓ Add/remove medications work
✓ Medication list shows preview
✓ Form validates before submit
✓ Save redirects to prescription view

Components:
- ConsultationPage: main form container
- VitalsForm: 4 input fields (Temp, BP Systolic, BP Diastolic, Pulse)
- ComplaintsForm: textarea for symptoms
- DiagnosisForm: textarea for diagnosis
- MedicationForm: add medication input
- MedicationList: preview of added medications
- VitalAlert: warning if vital outside range

Features:
- Autocomplete for medication names (from common list)
- At least 1 medication required
- Debounced vital validation (show warning in real-time)
- Keyboard shortcuts (Tab to next field, Enter to add medication)
- Loading state while saving
- Toast notifications for success/error
- Fixed patient header showing current patient info

Verification:
- All form sections render
- Vitals input accepts decimal values
- Warning shows for abnormal vitals
- Medications can be added and removed
- Medication list updates in real-time
- Save button triggers validation
- Required fields show error if empty
- Prescription page shows after successful save

Time Estimate: 5-6 hours
```

**Specific Tasks:**

1. Create ConsultationPage component
2. Build VitalsForm with large input fields
3. Create ComplaintsForm textarea
4. Create DiagnosisForm textarea
5. Build MedicationForm with add/remove
6. Create medication autocomplete
7. Implement form validation
8. Add vital range warning logic
9. Create consultation service call

**Verification Checklist:**
- [ ] Consultation form displays all sections
- [ ] Vitals input fields large (48px height)
- [ ] Vital values can be entered
- [ ] Warning appears for abnormal vitals
- [ ] Add medication button works
- [ ] Medications list updates
- [ ] Remove medication works
- [ ] Save validates all fields
- [ ] Submit succeeds with all fields filled
- [ ] Redirects to prescription page

---

## Step 5.3: Backend Prescription Generation

**What to Build:**
- Prescription template data structure
- PDF generation endpoint
- HTML template for printing
- Print tracking (marked as printed)

**Prompt for Your Team:**

```
Backend Prescription Generation

Goals:
1. Create endpoint to get prescription details
2. Generate prescription PDF
3. Generate HTML for browser printing
4. Track when prescription was printed
5. Include all consultation data in prescription

Deliverables:
✓ GET /api/prescriptions/:id returns prescription data
✓ GET /api/prescriptions/:id/print?format=pdf returns PDF
✓ GET /api/prescriptions/:id/print?format=html returns HTML
✓ PUT /api/prescriptions/:id/mark-printed updates printed_at
✓ PDF includes all required fields

API Endpoints:

GET /api/prescriptions/:id
  Headers: Authorization: Bearer <token>
  Response: {
    success: true,
    prescription: {
      id,
      patientName, patientAge, patientDOB,
      date,
      vitals: { temperature, bp, pulse },
      diagnosis,
      medications: [ { name, dosage, frequency, duration, instructions }, ... ],
      clinicHeader: { logo, name, address, phone }
    }
  }

GET /api/prescriptions/:id/print?format=pdf
  Headers: Authorization: Bearer <token>
  Response: PDF file (Content-Type: application/pdf)
  Header: Content-Disposition: attachment; filename="prescription_20260510.pdf"

GET /api/prescriptions/:id/print?format=html
  Headers: Authorization: Bearer <token>
  Response: HTML string (Content-Type: text/html)

PUT /api/prescriptions/:id/mark-printed
  Headers: Authorization: Bearer <token>
  Response: { success: true, prescription: { id, printed_at } }

PDF Generation Libraries:
- Use puppeteer or pdfkit for PDF generation
- Use HTML template to generate PDF

Prescription Template Fields:
- Clinic Header (Logo, Name, Address, Phone)
- Patient: Name, DOB, Age
- Date: Consultation date
- Vitals: Temperature, BP, Pulse
- Diagnosis
- Medications (numbered list with dosage, frequency, duration, instructions)
- Footer: Doctor signature area, clinic seal

Time Estimate: 3-4 hours
```

**Specific Tasks:**

1. Install PDF generation library (puppeteer or pdfkit)
2. Create prescription controller
3. Build HTML template for prescription
4. Implement PDF generation logic
5. Create mark-printed endpoint
6. Add prescription queries to service
7. Integrate with consultation data

**Verification Checklist:**
- [ ] Get prescription returns correct data
- [ ] PDF generation succeeds
- [ ] HTML template renders correctly
- [ ] PDF has all required fields
- [ ] Mark printed updates timestamp
- [ ] Download triggers file download (not inline)

---

## Step 5.4: Frontend Prescription Display & Print

**What to Build:**
- Prescription view page
- Print formatting
- Download PDF button
- Email prescription
- Print button integration

**Prompt for Your Team:**

```
Frontend Prescription Display & Print

Goals:
1. Create prescription view page
2. Display prescription in print-friendly format
3. Add print button (browser print)
4. Add PDF download button
5. Show prescription history in patient profile

Deliverables:
✓ Prescription page displays all fields
✓ Print formatting (no sidebar, optimized layout)
✓ Print button works (browser print dialog)
✓ Download PDF button works
✓ Prescription accessible from consultation save
✓ Prescription accessible from patient history

Components:
- PrescriptionPage: full prescription display
- PrescriptionTemplate: print-optimized template
- PrescriptionActions: print, download, email buttons

Features:
- Print media query for printer-friendly output
- Large fonts for readability
- Proper page breaks for multi-page prescriptions
- Include clinic letterhead
- Signature space
- Date and doctor name
- Patient details section
- Vitals section
- Diagnosis section
- Medications list (numbered)

Verification:
- Prescription page loads after consultation save
- All patient and consultation data displays
- Print button opens print dialog
- Print preview shows correct layout
- Download button downloads PDF
- PDF opens in browser or downloads
- Prescription accessible from patient history

Time Estimate: 2-3 hours
```

**Specific Tasks:**

1. Create PrescriptionPage component
2. Create prescription template with print styling
3. Add print button functionality
4. Add download PDF button
5. Create prescription service
6. Add CSS media query for print layout
7. Update patient history to show prescriptions

**Verification Checklist:**
- [ ] Prescription page displays after consultation save
- [ ] All fields populated correctly
- [ ] Print button opens print dialog
- [ ] Download button works
- [ ] PDF downloads or opens in new tab
- [ ] Print preview looks correct
- [ ] No sidebar/header in print view

---

# PHASE 6: SEARCH & HISTORY (Days 14-15)

## Step 6.1: Backend Patient Search & History

**What to Build:**
- Typeahead search API with performance optimization
- Patient history endpoint with filters
- Pagination support
- Date range filtering

**Prompt for Your Team:**

```
Backend Patient Search & History

Goals:
1. Optimize search query for < 100ms response
2. Implement date range filtering for history
3. Add pagination to consultation history
4. Return only necessary fields from database
5. Cache common search results (optional)

Deliverables:
✓ Search returns < 100ms
✓ History filtered by date range
✓ Pagination works (limit, offset)
✓ Results limited to 10 by default
✓ Responses optimized (minimal fields)

API Endpoints Already Created - Enhanced:

GET /api/patients/search?q=john&limit=10
  Enhanced: Add caching, optimize query
  Response: { patients: [ { id, name, age, phone, lastVisit, gender } ], total }

GET /api/patients/:id/consultations?limit=10&offset=0&from=2026-01-01&to=2026-05-31
  Headers: Authorization: Bearer <token>
  Response: {
    success: true,
    consultations: [
      {
        id,
        date,
        temperature,
        bp: "130/85",
        pulse,
        diagnosis: "Viral fever...",
        medicationCount,
        prescriptionId
      },
      ...
    ],
    total,
    pages
  }

Database Optimization:
- Index: patients(name), patients(phone)
- Index: consultations(patient_id, created_at DESC)
- Select only needed fields: id, name, age, phone, lastVisit

Time Estimate: 1-2 hours
```

**Specific Tasks:**

1. Optimize search query with indexes
2. Add date range filter to history endpoint
3. Implement pagination logic
4. Select only required fields
5. Add limit defaults
6. Test performance (< 100ms target)

**Verification Checklist:**
- [ ] Search returns results < 100ms
- [ ] Search returns limited results (max 10)
- [ ] History filters by date range
- [ ] Pagination works with limit/offset
- [ ] Results show correct fields
- [ ] No N+1 query issues

---

## Step 6.2: Frontend Patient History Page

**What to Build:**
- Patient history page with consultation list
- Date range filter
- Expandable consultation details
- Print prescription from history
- Reuse diagnosis option

**Prompt for Your Team:**

```
Frontend Patient History Page

Goals:
1. Create patient history page
2. Display consultation list with date, vitals, diagnosis
3. Add date range filter
4. Expandable rows for full details
5. Quick actions (View, Print, Reuse)

Deliverables:
✓ History page displays all consultations
✓ Date filter works
✓ Expandable rows show details
✓ Print prescription button works
✓ Reuse diagnosis suggestion works
✓ Responsive table (scroll on mobile)

Components:
- PatientHistoryPage: main container
- DateRangeFilter: from/to date pickers
- ConsultationTable: table with expandable rows
- ConsultationDetail: expanded view with full details

Features:
- Default date range: last 90 days
- Sortable table (date, vitals, diagnosis)
- Expandable rows
- Quick action buttons
- Print icon for prescription
- Copy diagnosis button
- Pagination (10 items per page)
- Loading state during filter

Verification:
- History page shows consultations
- Date filter updates list
- Expandable rows show details
- Print button works
- Reuse diagnosis pre-fills form
- Pagination works

Time Estimate: 3-4 hours
```

**Specific Tasks:**

1. Create PatientHistoryPage component
2. Build DateRangeFilter
3. Create ConsultationTable with data
4. Implement expandable rows
5. Add print button integration
6. Create reuse diagnosis functionality
7. Add pagination

**Verification Checklist:**
- [ ] History page loads with consultations
- [ ] Date filter changes displayed consultations
- [ ] Expandable rows work
- [ ] Print button opens prescription
- [ ] Reuse diagnosis suggestion appears
- [ ] Pagination navigates between pages

---

# PHASE 7: EXPORT & REPORTING (Day 16)

## Step 7.1: Backend Export API (CSV & PDF)

**What to Build:**
- Patient list export to CSV
- Consultation export to CSV
- Consultation export to PDF report
- Date range filtering for exports

**Prompt for Your Team:**

```
Backend Export API (CSV & PDF)

Goals:
1. Create CSV export for patients
2. Create CSV export for consultations
3. Create PDF report for consultations
4. Include date range filtering
5. Generate files on-the-fly

Deliverables:
✓ GET /api/exports/patients?format=csv returns CSV file
✓ GET /api/exports/consultations?format=csv returns CSV file
✓ GET /api/exports/consultations?format=pdf returns PDF report
✓ Date filtering works for consultations
✓ Files downloadable

API Endpoints:

GET /api/exports/patients?format=csv&from=2026-01-01&to=2026-05-31
  Headers: Authorization: Bearer <token>
  Response: CSV file with columns: Name, Age, Gender, Phone, Email, Address, Created Date
  Header: Content-Disposition: attachment; filename="patients_20260510.csv"

GET /api/exports/consultations?format=csv&from=2026-01-01&to=2026-05-31
  Headers: Authorization: Bearer <token>
  Response: CSV file with columns: Date, Patient, Age, Temperature, BP, Pulse, Diagnosis, Medications
  Header: Content-Disposition: attachment; filename="consultations_20260510.csv"

GET /api/exports/consultations?format=pdf&from=2026-01-01&to=2026-05-31
  Headers: Authorization: Bearer <token>
  Response: PDF report file
  Header: Content-Disposition: attachment; filename="consultations_report_20260510.pdf"

CSV Format:
- BOM for Excel compatibility (UTF-8 with BOM)
- Comma-separated, quoted strings
- Include headers

PDF Format:
- Title: "Consultations Report"
- Date range shown
- Summary statistics
- Table of consultations
- Page numbers

Time Estimate: 2-3 hours
```

**Specific Tasks:**

1. Install CSV generation library (csv-parser or papaparse)
2. Create export routes
3. Implement CSV generation logic
4. Implement PDF report generation
5. Add date range queries
6. Set proper content-disposition headers

**Verification Checklist:**
- [ ] CSV export downloads file
- [ ] CSV has correct headers and data
- [ ] CSV opens in Excel correctly
- [ ] PDF export generates file
- [ ] PDF includes all data
- [ ] Date filtering works
- [ ] Files have proper names

---

## Step 7.2: Frontend Export Page

**What to Build:**
- Export page with type selection
- Format selection (CSV/PDF)
- Date range filter
- Export button
- Recently exported files list

**Prompt for Your Team:**

```
Frontend Export Page

Goals:
1. Create export page with options
2. Allow selection of export type (Patients, Consultations)
3. Allow format selection (CSV, PDF)
4. Add date range filter
5. Show export progress/success message

Deliverables:
✓ Export page with all options
✓ Format selection works
✓ Date range filter appears
✓ Export button triggers download
✓ Success notification shown
✓ Recently exported list shown

Components:
- ExportPage: main container
- ExportTypeSelector: radio buttons (Patients, Consultations)
- FormatSelector: radio buttons (CSV, PDF)
- DateRangeFilter: from/to date pickers
- ExportButton: triggers download
- ExportHistory: recently exported files

Features:
- Default format: CSV
- Default type: Consultations
- Date range pre-filled (90 days back to today)
- Loading state during export
- Success/error toast
- File name shows in download

Verification:
- Export page displays all options
- Export type selection works
- Format selection works
- Date filter visible
- Export button downloads file
- Success message appears
- Downloaded file has correct name

Time Estimate: 2-3 hours
```

**Specific Tasks:**

1. Create ExportPage component
2. Build export type selector
3. Build format selector
4. Create date range picker
5. Add export button with loading state
6. Implement export API call
7. Add success/error notifications

**Verification Checklist:**
- [ ] Export page displays all options
- [ ] Export type selection works
- [ ] Format selection changes preview
- [ ] Date range selector works
- [ ] Export button downloads file
- [ ] File downloaded with correct name
- [ ] Success message shows after download

---

# PHASE 8: UI POLISH & RESPONSIVENESS (Days 17-19)

## Step 8.1: Responsive Design Implementation

**What to Build:**
- Mobile-first design
- Tablet optimization
- Desktop optimization
- Touch-friendly buttons and inputs
- Responsive tables and layouts

**Prompt for Your Team:**

```
Responsive Design Implementation

Goals:
1. Implement mobile-first responsive layout
2. Optimize for tablet (768px - 1023px)
3. Maintain desktop experience (≥1024px)
4. Ensure 48px minimum touch targets
5. Test on various screen sizes

Deliverables:
✓ Mobile layout: stacked, full-width, hamburger menu
✓ Tablet layout: optimized spacing, collapsible sidebar
✓ Desktop layout: full sidebar, multi-column
✓ All touch targets ≥48px
✓ Forms fully responsive
✓ Tables scrollable on mobile

Breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1023px
- Desktop: ≥ 1024px

Changes per Breakpoint:

Mobile (< 768px):
- Hide sidebar (hamburger menu)
- Full-width content
- Stacked form fields
- Single-column tables (card layout)
- Larger buttons (48px height)
- Bottom sheet modals
- Full-width dialogs

Tablet (768px - 1023px):
- Collapsible sidebar (show on toggle)
- 2-column forms where appropriate
- Horizontal scrolling tables
- Optimized spacing
- Medium buttons (40px height)

Desktop (≥ 1024px):
- Visible sidebar (240px fixed)
- Multi-column layouts
- Standard buttons (40px height)
- Full tables visible

Time Estimate: 2-3 hours
```

**Specific Tasks:**

1. Add media queries to SCSS
2. Update Layout component for mobile
3. Create hamburger menu for mobile
4. Update form layouts for mobile
5. Make tables responsive (scroll or card layout)
6. Test on actual mobile devices
7. Verify touch target sizes

**Verification Checklist:**
- [ ] Mobile layout stacked correctly
- [ ] Hamburger menu works
- [ ] Buttons/inputs ≥48px on mobile
- [ ] Tables scrollable on mobile
- [ ] Tablet layout optimized
- [ ] Desktop layout unchanged
- [ ] All pages responsive

---

## Step 8.2: Accessibility Audit & Fixes

**What to Build:**
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Color contrast fixes
- Semantic HTML

**Prompt for Your Team:**

```
Accessibility Audit & WCAG AA Compliance

Goals:
1. Ensure 4.5:1 color contrast (normal text)
2. All interactive elements keyboard accessible
3. Proper heading hierarchy
4. Form labels associated with inputs
5. ARIA labels where needed

Deliverables:
✓ Color contrast fixed (4.5:1 minimum)
✓ Tab order logical
✓ Skip links to main content
✓ Focus indicators visible
✓ Form labels properly associated
✓ Semantic HTML used
✓ Images have alt text
✓ ARIA live regions for notifications

Accessibility Checklist:

Color Contrast:
- Body text vs background: 4.5:1 minimum
- Large text (18px+) vs background: 3:1 minimum
- Buttons vs background: 3:1 minimum
- Check with contrast checker tools

Keyboard Navigation:
- Tab through all interactive elements
- Logical tab order (left-to-right, top-to-bottom)
- Escape closes modals/dropdowns
- Enter submits forms
- Focus visible (outline or background change)

Semantic HTML:
- Use <h1>, <h2>, <h3> for headings
- Use <button> for buttons (not <div> or <a>)
- Use <label> for form labels
- Use <table> with <thead> for tables
- Use <nav> for navigation

Screen Reader Support:
- Form inputs have associated labels
- Buttons have descriptive text
- Icon buttons have ARIA labels
- Live regions for dynamic content (aria-live="polite")
- Use semantic HTML for structure

Time Estimate: 2 hours
```

**Specific Tasks:**

1. Run accessibility audit tools (axe, Lighthouse)
2. Fix color contrast issues
3. Fix heading hierarchy
4. Associate form labels with inputs
5. Add ARIA labels to icon buttons
6. Test keyboard navigation
7. Test with screen reader

**Verification Checklist:**
- [ ] Color contrast meets 4.5:1
- [ ] All interactive elements in tab order
- [ ] Tab order is logical
- [ ] Focus indicators visible
- [ ] Form labels associated with inputs
- [ ] Icon buttons have ARIA labels
- [ ] Semantic HTML used throughout
- [ ] Lighthouse accessibility score ≥90

---

## Step 8.3: Performance Optimization

**What to Build:**
- Code splitting and lazy loading
- Image optimization
- CSS/JS minification
- Caching strategy
- Bundle size reduction

**Prompt for Your Team:**

```
Performance Optimization

Goals:
1. Achieve < 2 second page load
2. First Contentful Paint < 1.5s
3. Largest Contentful Paint < 2.5s
4. Cumulative Layout Shift < 0.1
5. Time to Interactive < 3.5s

Deliverables:
✓ Lighthouse Performance score ≥85
✓ Page load < 2 seconds
✓ FCP < 1.5 seconds
✓ LCP < 2.5 seconds
✓ CLS < 0.1
✓ TTI < 3.5 seconds

Performance Optimizations:

Frontend:
- Code splitting (React.lazy for pages)
- Lazy load images
- CSS minification
- JS minification
- Remove unused CSS
- Tree-shake unused dependencies
- Preload critical assets
- Service worker for caching

Backend:
- Database query optimization (indexes)
- API response caching
- Gzip compression
- CDN for static assets
- Connection pooling

Metrics to Track:
- Lighthouse score (≥85)
- Page load time (< 2s)
- First Contentful Paint (< 1.5s)
- Largest Contentful Paint (< 2.5s)
- Cumulative Layout Shift (< 0.1)
- Time to Interactive (< 3.5s)

Time Estimate: 2-3 hours
```

**Specific Tasks:**

1. Run Lighthouse audit
2. Implement code splitting for routes
3. Lazy load images
4. Optimize bundle size
5. Add service worker for caching
6. Optimize database queries
7. Add API response caching
8. Enable gzip compression

**Verification Checklist:**
- [ ] Lighthouse Performance score ≥85
- [ ] Page load < 2 seconds
- [ ] FCP < 1.5s
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] TTI < 3.5s
- [ ] Search < 100ms

---

# PHASE 9: TESTING & QA (Days 20-21)

## Step 9.1: Unit & Integration Tests

**What to Build:**
- Unit tests for services
- Integration tests for API routes
- Frontend component tests
- Test coverage ≥80%

**Prompt for Your Team:**

```
Unit & Integration Testing

Goals:
1. Write unit tests for services and utilities
2. Write integration tests for API routes
3. Write component tests for React components
4. Achieve ≥80% code coverage
5. Run tests in CI/CD pipeline

Deliverables:
✓ Unit tests for all services
✓ Integration tests for all routes
✓ Component tests for key components
✓ Code coverage ≥80%
✓ All tests passing
✓ Test suite runs < 5 minutes

Backend Tests (Jest + Supertest):

Unit Tests:
- authService.login()
- patientService.createPatient()
- appointmentService.scheduleAppointment()
- consultationService.createConsultation()
- Validation functions

Integration Tests:
- POST /api/auth/login (success, failure)
- POST /api/patients (success, validation errors)
- GET /api/patients/search (typeahead)
- POST /api/appointments (success, double-booking)
- POST /api/consultations (success, validation)

Frontend Tests (Jest + React Testing Library):

Component Tests:
- LoginForm (renders, validation, submission)
- PatientSearchPage (search, results display)
- ConsultationForm (all sections render, validation)
- PrescriptionTemplate (all fields display)

Hook Tests:
- useAuth (login, logout, refresh)
- useFetch (loading, error, success states)

Service Tests:
- API service (interceptors, error handling)
- Patient service (API calls)

Target Coverage:
- Services: 90%+
- Controllers: 80%+
- Components: 80%+
- Utilities: 90%+

Time Estimate: 3-4 hours
```

**Specific Tasks:**

1. Set up Jest and testing libraries
2. Write backend unit tests for services
3. Write backend integration tests for routes
4. Write frontend component tests
5. Run coverage report
6. Fix failing tests
7. Aim for ≥80% coverage

**Verification Checklist:**
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] All component tests passing
- [ ] Coverage ≥80%
- [ ] Test suite runs < 5 minutes
- [ ] CI/CD runs tests automatically

---

## Step 9.2: End-to-End Testing

**What to Build:**
- E2E tests for critical user flows
- Test data setup
- Test environment configuration

**Prompt for Your Team:**

```
End-to-End Testing (Cypress/Playwright)

Goals:
1. Test critical user flows
2. Test across multiple browsers
3. Test responsive design
4. Verify no broken links/API calls
5. Performance testing

Deliverables:
✓ E2E tests for all major flows
✓ Tests pass on Chrome, Firefox, Safari
✓ Test data setup automated
✓ All tests passing
✓ E2E suite runs < 15 minutes

Critical User Flows to Test:

1. Login Flow:
   - Login page loads
   - Enter credentials
   - Submit form
   - Verify redirect to dashboard
   - Verify user name in header

2. Patient Management:
   - Search for patient
   - View patient profile
   - Edit patient
   - Create new patient

3. Appointment Scheduling:
   - View dashboard appointments
   - Schedule new appointment
   - Update appointment status
   - Verify appointment appears in list

4. Consultation:
   - Start consultation from appointment
   - Enter all vitals
   - Add diagnosis and complaints
   - Add medications
   - Save consultation
   - Verify prescription generated

5. Prescription:
   - View prescription
   - Print prescription
   - Download PDF

6. Patient History:
   - View patient history
   - Filter by date range
   - Expand consultation details

7. Export:
   - Export patients to CSV
   - Export consultations to PDF
   - Verify files download

E2E Test Setup (Cypress):
- Test environment with test database
- Test user account
- Seeded test data
- Database reset between tests
- Screenshots on failure

Time Estimate: 3-4 hours
```

**Specific Tasks:**

1. Set up Cypress or Playwright
2. Create test data seeds
3. Write E2E tests for critical flows
4. Run tests on multiple browsers
5. Add screenshots on failure
6. Test responsive design
7. Verify performance metrics

**Verification Checklist:**
- [ ] Login flow passes
- [ ] Patient search and create passes
- [ ] Appointment scheduling passes
- [ ] Consultation complete passes
- [ ] Prescription generation passes
- [ ] Export functionality passes
- [ ] All tests pass on Chrome, Firefox, Safari

---

## Step 9.3: Security Audit

**What to Build:**
- OWASP Top 10 checks
- SQL injection prevention
- XSS prevention
- CSRF protection
- Authentication/authorization verification

**Prompt for Your Team:**

```
Security Audit & Hardening

Goals:
1. Check OWASP Top 10 vulnerabilities
2. Verify SQL injection prevention
3. Verify XSS prevention
4. Verify CSRF protection
5. Test authentication/authorization
6. Verify data encryption

Deliverables:
✓ No SQL injection vulnerabilities
✓ No XSS vulnerabilities
✓ CSRF tokens implemented (if applicable)
✓ Authentication enforced on all protected routes
✓ Authorization (user can only access own data)
✓ Sensitive data encrypted (passwords, tokens)
✓ HTTPS enforced
✓ Security headers set

OWASP Top 10 Checks:

1. Broken Authentication:
   - [ ] Password hashed with bcrypt
   - [ ] JWT tokens properly validated
   - [ ] Session timeout implemented
   - [ ] No hardcoded credentials

2. Sensitive Data Exposure:
   - [ ] HTTPS enforced
   - [ ] Passwords hashed
   - [ ] Tokens in HttpOnly cookies
   - [ ] PII not logged

3. SQL Injection:
   - [ ] Parameterized queries used
   - [ ] No string concatenation in SQL
   - [ ] Input validation on all endpoints
   - [ ] Test with SQL injection payloads

4. Cross-Site Scripting (XSS):
   - [ ] User input sanitized
   - [ ] React escapes by default
   - [ ] No dangerouslySetInnerHTML
   - [ ] Headers set (Content-Security-Policy)

5. Cross-Site Request Forgery (CSRF):
   - [ ] CORS configured properly
   - [ ] SameSite cookie attribute set
   - [ ] Tokens validated

6. Access Control:
   - [ ] Authentication required on protected routes
   - [ ] Users can only access own data
   - [ ] Role-based access control (if applicable)
   - [ ] Test unauthorized access scenarios

Security Tests:
- Attempt SQL injection (SELECT * FROM users; --)
- Test unauthorized access (modify user ID in request)
- Test XSS (enter script tag in form)
- Test CSRF (cross-origin request)
- Test session expiration
- Test password reset flow

Time Estimate: 2-3 hours
```

**Specific Tasks:**

1. Review code for SQL injection vulnerabilities
2. Verify parameterized queries used
3. Check for XSS vulnerabilities
4. Test CSRF protection
5. Verify authentication on all protected routes
6. Test authorization (can't access other user's data)
7. Verify password hashing
8. Check security headers

**Verification Checklist:**
- [ ] No SQL injection found
- [ ] No XSS found
- [ ] Authentication required on protected routes
- [ ] Authorization enforced (users can't access others' data)
- [ ] Passwords hashed (not stored plain text)
- [ ] HTTPS configured
- [ ] Security headers set
- [ ] CORS configured properly

---

# PHASE 10: DEPLOYMENT (Day 22)

## Step 10.1: Docker & Environment Setup

**What to Build:**
- Dockerfile for backend
- Dockerfile for frontend
- docker-compose.yml
- Environment configuration for staging/production

**Prompt for Your Team:**

```
Docker & Environment Configuration

Goals:
1. Create Dockerfile for backend
2. Create Dockerfile for frontend
3. Create docker-compose for local development
4. Set up environment variables for different stages
5. Prepare for cloud deployment

Deliverables:
✓ Docker images build successfully
✓ docker-compose runs entire stack
✓ Environment variables configured
✓ Health checks configured
✓ Volumes set up for data persistence
✓ Network configured for service communication

Files to Create:
- docker/Dockerfile.backend
- docker/Dockerfile.frontend
- docker-compose.yml
- .env.staging
- .env.production
- docker/.dockerignore

Dockerfile.backend:
- Base image: node:18-alpine
- Working directory: /app
- Copy package files
- npm ci (clean install)
- Copy source code
- Build TypeScript
- Expose port 5000
- Health check
- CMD: node dist/index.js

Dockerfile.frontend:
- Build stage: Build React app with Vite
- Serve stage: Serve with Nginx
- Copy built files to Nginx
- Expose port 3000
- Health check
- COPY nginx.conf

docker-compose.yml:
- backend service (Node.js)
- frontend service (Nginx)
- postgres service (Database)
- Networking between services
- Volume for database data
- Environment variables

Environment Variables:
Development: localhost URLs
Staging: staging domain
Production: production domain

Time Estimate: 2 hours
```

**Specific Tasks:**

1. Create Dockerfile for backend
2. Create Dockerfile for frontend
3. Create docker-compose.yml
4. Create environment files
5. Build and test images locally
6. Verify services communicate
7. Test health checks

**Verification Checklist:**
- [ ] Backend image builds
- [ ] Frontend image builds
- [ ] docker-compose up works
- [ ] Services communicate
- [ ] Health checks pass
- [ ] Database persists data
- [ ] Ports correctly mapped

---

## Step 10.2: Database Migrations & Seeding

**What to Build:**
- Migration scripts
- Database schema initialization
- Seed scripts for test data
- Backup strategy

**Prompt for Your Team:**

```
Database Migrations & Seeding

Goals:
1. Create migration script for schema
2. Create seeding script for test data
3. Set up backup automation
4. Test migration on fresh database

Deliverables:
✓ Migration script creates all tables
✓ Seed script creates test data
✓ Backup script automated
✓ Schema version tracking
✓ Rollback capability (if needed)

Deliverables:
- migrations/001_init_schema.sql (all tables, indexes, constraints)
- seeds/seed.ts (test user, patients, appointments, consultations)
- backup.sh (daily backup automation)
- .gitkeep in migrations folder

Migration Script Contents:
- Create all 7 tables with correct schema
- Create all indexes
- Create foreign key relationships
- Add constraints (unique, check)
- Insert enum values if needed

Seed Script:
- Create 1 test user (doctor)
- Create 10 test patients
- Create 20 test appointments (past and future)
- Create 5 test consultations with medications
- Create 5 test prescriptions

Backup Strategy:
- Daily backup of database
- Backup retention: 30 days
- Backup location: Separate storage
- Verify backup integrity

Time Estimate: 1-2 hours
```

**Specific Tasks:**

1. Create migration SQL file with complete schema
2. Create seed script with test data
3. Create backup script
4. Test migration on fresh database
5. Test seeding process
6. Verify data integrity after restore

**Verification Checklist:**
- [ ] Migration creates all tables
- [ ] All indexes created
- [ ] Foreign keys work
- [ ] Seed script creates test data
- [ ] Backup script runs
- [ ] Backup file created
- [ ] Data can be restored from backup

---

## Step 10.3: Deployment Process

**What to Build:**
- Deployment to cloud (AWS/Azure)
- CI/CD pipeline
- Monitoring and logging
- Rollback plan

**Prompt for Your Team:**

```
Deployment to Production

Goals:
1. Deploy to cloud platform (AWS/Azure)
2. Set up CI/CD pipeline
3. Configure monitoring and logging
4. Document rollback procedure
5. Verify production health

Deliverables:
✓ App deployed to cloud
✓ CI/CD pipeline configured
✓ Monitoring alerts set up
✓ Logging configured
✓ Rollback procedure documented
✓ Health checks passing

Deployment Steps:

Pre-Deployment (48 hours before):
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code reviewed and approved
- [ ] Security audit passed
- [ ] Database backup taken
- [ ] Migration tested on staging
- [ ] Performance load test passed
- [ ] Rollback plan documented
- [ ] Team on-call scheduled

Deployment Day:
- [ ] Scheduled during low-traffic hours (2-4 AM)
- [ ] Create pre-deployment backup
- [ ] Deploy backend (zero-downtime deployment)
- [ ] Run database migrations
- [ ] Deploy frontend
- [ ] Run smoke tests
- [ ] Verify health checks
- [ ] Monitor error logs
- [ ] Team on standby

Post-Deployment (24 hours):
- [ ] Monitor error rates and performance
- [ ] Check user feedback
- [ ] Monitor database performance
- [ ] Verify backups running
- [ ] Document lessons learned

CI/CD Pipeline (GitHub Actions / GitLab CI):
- Trigger on push to main branch
- Run linting and format checks
- Run unit/integration tests
- Run E2E tests
- Build Docker images
- Push to container registry
- Deploy to staging environment
- Run smoke tests on staging
- Wait for manual approval
- Deploy to production

Monitoring & Logging:
- Application logs (all errors, warnings)
- Database performance logs
- API response time monitoring
- Error rate alerting
- Uptime monitoring
- Daily health checks

Rollback Procedure:
- If critical error in production
- Revert to previous Docker image
- Run migrations rollback (if needed)
- Restore from backup (if needed)
- Verify health checks
- Clear caches
- Monitor for recovery

Time Estimate: 2-3 hours (plus ongoing monitoring)
```

**Specific Tasks:**

1. Set up cloud account (AWS/Azure)
2. Create deployment pipeline
3. Deploy backend service
4. Deploy frontend service
5. Configure database backups
6. Set up monitoring and alerting
7. Document rollback procedure
8. Test rollback process

**Verification Checklist:**
- [ ] App deployed to cloud
- [ ] Health checks passing
- [ ] API endpoints responding
- [ ] Frontend loading
- [ ] Database connected
- [ ] Monitoring alerts active
- [ ] Logging working
- [ ] Backups running

---

# VERIFICATION & SIGN-OFF CHECKLIST

## Phase 1: Project Setup
- [ ] Backend infrastructure running
- [ ] Frontend infrastructure running
- [ ] Database created and connected
- [ ] Health check endpoint working
- [ ] All initial tests passing

## Phase 2: Authentication
- [ ] Login API working
- [ ] Login UI working
- [ ] JWT tokens generated and validated
- [ ] Protected routes working
- [ ] Logout working

## Phase 3: Patient Management
- [ ] Patient CRUD API working
- [ ] Patient search working (< 100ms)
- [ ] Patient UI working
- [ ] Form validation working

## Phase 4: Appointment Management
- [ ] Appointment scheduling API working
- [ ] Double-booking prevention working
- [ ] Appointment UI working
- [ ] Status updates working

## Phase 5: Consultation Module
- [ ] Consultation form rendering
- [ ] Vitals capture working
- [ ] Medication management working
- [ ] Prescription generation working
- [ ] Prescription display and print working

## Phase 6: Search & History
- [ ] Patient search < 100ms
- [ ] Patient history displaying
- [ ] Date filtering working
- [ ] Expandable rows working

## Phase 7: Export & Reporting
- [ ] CSV export working
- [ ] PDF export working
- [ ] Export page UI working

## Phase 8: UI Polish
- [ ] Responsive design working on mobile, tablet, desktop
- [ ] Accessibility audit passed (WCAG AA)
- [ ] Performance targets met (< 2s page load)

## Phase 9: Testing & QA
- [ ] Unit tests ≥80% coverage
- [ ] Integration tests passing
- [ ] E2E tests passing on all browsers
- [ ] Security audit passed

## Phase 10: Deployment
- [ ] Docker images building
- [ ] docker-compose running
- [ ] Database migrations working
- [ ] Deployed to production
- [ ] Health checks passing
- [ ] Monitoring and logging active

---

## Final Implementation Summary

**Total Timeline:** 22 days  
**Total Hours:** ~200 hours

**By Phase:**
- Phase 1: 8 hours (Setup)
- Phase 2: 8-10 hours (Authentication)
- Phase 3: 15-18 hours (Patient Management)
- Phase 4: 10-12 hours (Appointments)
- Phase 5: 25-30 hours (Consultation Module)
- Phase 6: 10-12 hours (Search & History)
- Phase 7: 8-10 hours (Export)
- Phase 8: 15-18 hours (UI Polish)
- Phase 9: 15-18 hours (Testing)
- Phase 10: 8-10 hours (Deployment)

**Success Criteria:**
✓ All features implemented per BRD  
✓ Test coverage ≥80%  
✓ Page load < 2 seconds  
✓ Search < 100ms  
✓ Consultation completed < 3 minutes  
✓ WCAG AA compliant  
✓ All tests passing  
✓ Deployed to production  
✓ Monitoring and logging active  
✓ Documentation complete

---

**Document Version:** 1.0  
**Last Updated:** May 7, 2026  
**Status:** READY FOR IMPLEMENTATION
