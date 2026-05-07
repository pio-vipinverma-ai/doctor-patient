# Execution Prompts - Step-by-Step Implementation

**Document Version:** 1.0  
**Date Created:** May 7, 2026  
**Purpose:** Ready-to-execute prompts for each phase and step  
**Usage:** Copy each prompt, share with team, execute, verify, move to next step

---

## TABLE OF CONTENTS

- [PHASE 1: PROJECT SETUP (Days 1-2)](#phase-1-project-setup)
  - [Step 1.1: Backend Infrastructure Setup](#step-11-backend-infrastructure-setup)
  - [Step 1.2: Frontend Infrastructure Setup](#step-12-frontend-infrastructure-setup)
  - [Step 1.3: Database Setup](#step-13-database-setup)
- [PHASE 2: CORE AUTHENTICATION (Days 3-4)](#phase-2-core-authentication)
  - [Step 2.1: Backend Authentication API](#step-21-backend-authentication-api)
  - [Step 2.2: Frontend Authentication UI & Context](#step-22-frontend-authentication-ui--context)
- [PHASE 3: PATIENT MANAGEMENT (Days 5-7)](#phase-3-patient-management)
  - [Step 3.1: Backend Patient API](#step-31-backend-patient-api)
  - [Step 3.2: Frontend Patient Management UI](#step-32-frontend-patient-management-ui)
- [PHASE 4: APPOINTMENT MANAGEMENT (Days 8-9)](#phase-4-appointment-management)
  - [Step 4.1: Backend Appointment API](#step-41-backend-appointment-api)
  - [Step 4.2: Frontend Appointment Management UI](#step-42-frontend-appointment-management-ui)
- [PHASE 5: CONSULTATION MODULE (Days 10-13)](#phase-5-consultation-module)
  - [Step 5.1: Backend Consultation API](#step-51-backend-consultation-api)
  - [Step 5.2: Frontend Consultation Form](#step-52-frontend-consultation-form)
  - [Step 5.3: Backend Prescription Generation](#step-53-backend-prescription-generation)
  - [Step 5.4: Frontend Prescription Display & Print](#step-54-frontend-prescription-display--print)
- [PHASE 6: SEARCH & HISTORY (Days 14-15)](#phase-6-search--history)
  - [Step 6.1: Backend Patient Search & History](#step-61-backend-patient-search--history)
  - [Step 6.2: Frontend Patient History Page](#step-62-frontend-patient-history-page)
- [PHASE 7: EXPORT & REPORTING (Day 16)](#phase-7-export--reporting)
  - [Step 7.1: Backend Export API](#step-71-backend-export-api)
  - [Step 7.2: Frontend Export Page](#step-72-frontend-export-page)
- [PHASE 8: UI POLISH & RESPONSIVENESS (Days 17-19)](#phase-8-ui-polish--responsiveness)
  - [Step 8.1: Responsive Design Implementation](#step-81-responsive-design-implementation)
  - [Step 8.2: Accessibility Audit & WCAG AA Compliance](#step-82-accessibility-audit--wcag-aa-compliance)
  - [Step 8.3: Performance Optimization](#step-83-performance-optimization)
- [PHASE 9: TESTING & QA (Days 20-21)](#phase-9-testing--qa)
  - [Step 9.1: Unit & Integration Tests](#step-91-unit--integration-tests)
  - [Step 9.2: End-to-End Testing](#step-92-end-to-end-testing)
  - [Step 9.3: Security Audit](#step-93-security-audit)
- [PHASE 10: DEPLOYMENT (Day 22)](#phase-10-deployment)
  - [Step 10.1: Docker & Environment Setup](#step-101-docker--environment-setup)
  - [Step 10.2: Database Migrations & Seeding](#step-102-database-migrations--seeding)
  - [Step 10.3: Deployment Process](#step-103-deployment-process)

---

# PHASE 1: PROJECT SETUP (Days 1-2)

## Step 1.1: Backend Infrastructure Setup

**Timeline:** 1-2 hours | **Team:** Backend | **Day:** 1

### 📋 PROMPT TO EXECUTE

```
TASK: Backend Infrastructure Setup

GOALS:
1. Initialize Node.js project with TypeScript
2. Set up Express.js server
3. Configure environment variables
4. Create basic middleware structure
5. Implement health check endpoint

DELIVERABLES:
✓ backend/ folder with src/ structure
✓ package.json with dependencies (express, dotenv, cors, typescript, @types/express, @types/node, nodemon, ts-node)
✓ tsconfig.json configured
✓ .env.example with required variables
✓ Server running on http://localhost:5000
✓ GET /health returns { status: "ok", timestamp }

FILES TO CREATE:
- backend/src/index.ts (entry point)
- backend/src/server.ts (Express app)
- backend/src/config/env.ts (env variables)
- backend/src/middleware/requestLogger.ts
- backend/src/middleware/errorHandler.ts
- backend/.env.example
- backend/package.json
- backend/tsconfig.json

VERIFICATION CHECKLIST:
- [ ] npm start runs without errors
- [ ] curl http://localhost:5000/health returns JSON response
- [ ] Logs show "Server running on port 5000"
- [ ] console.log shows request logs
- [ ] Error middleware catches errors

NOTES:
- Use environment variables for PORT (default: 5000)
- CORS enabled for localhost:5173
- Request logging shows method, path, status
- Error handler returns JSON error responses
```

### ✅ VERIFICATION CHECKLIST

```
BEFORE MOVING TO NEXT STEP, VERIFY:

1. Server Startup
   - [ ] npm install completes without errors
   - [ ] npm start runs without throwing errors
   - [ ] Console shows "Server running on port 5000"

2. Health Check Endpoint
   - [ ] curl http://localhost:5000/health works
   - [ ] Response is JSON: { status: "ok", timestamp: "..." }
   - [ ] Status code is 200

3. Environment Configuration
   - [ ] .env.example exists with PORT=5000
   - [ ] .env.local is in .gitignore
   - [ ] Environment variables load from .env file

4. Middleware
   - [ ] Request logs visible in console for each request
   - [ ] Error logs show stack trace for errors
   - [ ] CORS headers present in responses

TIME CHECK: Should take 1-2 hours
NEXT STEP: Step 1.2 - Frontend Infrastructure Setup
```

---

## Step 1.2: Frontend Infrastructure Setup

**Timeline:** 2-3 hours | **Team:** Frontend | **Day:** 1

### 📋 PROMPT TO EXECUTE

```
TASK: Frontend Infrastructure Setup

GOALS:
1. Initialize React project with Vite and TypeScript
2. Set up routing with React Router
3. Create base layout components (Header, Sidebar, Footer)
4. Configure SCSS styling system
5. Set up Context API for authentication

DELIVERABLES:
✓ frontend/ folder with src/ structure
✓ React app running on http://localhost:5173
✓ Basic layout components created (Header, Sidebar, Layout)
✓ SCSS variables and mixins configured
✓ Routing structure established with React Router
✓ App renders without errors on page load

FILES TO CREATE:
- frontend/src/main.tsx (entry point)
- frontend/src/App.tsx (root component + routing)
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

VERIFICATION CHECKLIST:
- [ ] npm run dev starts dev server
- [ ] Page loads at http://localhost:5173
- [ ] Layout components render correctly
- [ ] React Router navigation works between pages
- [ ] SCSS variables work (use colors in components)
- [ ] No console errors

NOTES:
- Colors: Primary Blue (#0066CC), Success Green (#28A745), Error Red (#DC3545)
- Base spacing: 8px unit
- Font: Segoe UI, Tahoma, Arial, sans-serif
- Header height: 60px, Sidebar width: 240px
```

### ✅ VERIFICATION CHECKLIST

```
BEFORE MOVING TO NEXT STEP, VERIFY:

1. Project Structure
   - [ ] frontend/ folder exists with src/ structure
   - [ ] All required files created
   - [ ] package.json has dependencies: react-router-dom, axios, sass

2. Development Server
   - [ ] npm run dev starts without errors
   - [ ] App loads at http://localhost:5173
   - [ ] Hot reload works (change and save file)
   - [ ] No console errors

3. Layout Components
   - [ ] Header renders with text "Patient Management System"
   - [ ] Sidebar renders with menu items
   - [ ] Layout wraps all pages correctly

4. Routing
   - [ ] Can navigate between LoginPage and DashboardPage
   - [ ] URL changes when navigating
   - [ ] Page content updates

5. Styling
   - [ ] SCSS compiles without errors
   - [ ] Colors apply correctly from variables
   - [ ] Responsive design looks good at 1024px

TIME CHECK: Should take 2-3 hours
NEXT STEP: Step 1.3 - Database Setup
```

---

## Step 1.3: Database Setup

**Timeline:** 1-2 hours | **Team:** DevOps/Backend | **Day:** 2

### 📋 PROMPT TO EXECUTE

```
TASK: Database Setup

GOALS:
1. Create PostgreSQL database
2. Define and create all 7 tables with correct schema
3. Add indexes for performance
4. Set up foreign key relationships
5. Create sample user for testing

DELIVERABLES:
✓ PostgreSQL database "doc_patient_db" created
✓ All 7 tables created with correct columns and types:
  - users (id, username, email, password_hash, name, created_at, updated_at)
  - patients (id, name, dob, gender, phone, email, address, created_at, updated_at)
  - appointments (id, patient_id, scheduled_time, status, reason, created_at, updated_at)
  - consultations (id, patient_id, appointment_id, temperature, bp_systolic, bp_diastolic, pulse, complaints, diagnosis, created_at, updated_at)
  - medications (id, consultation_id, name, dosage, frequency, duration, instructions, created_at)
  - prescriptions (id, consultation_id, status, generated_at, printed_at, updated_at)
  - audit_log (id, user_id, action, table_name, record_id, changes, timestamp)

✓ Indexes created for performance:
  - users(email), users(username)
  - patients(name), patients(phone), patients(created_at)
  - appointments(patient_id), appointments(scheduled_time), appointments(status)
  - consultations(patient_id), consultations(created_at)
  - medications(consultation_id)
  - audit_log(user_id), audit_log(timestamp)

✓ Foreign key relationships established
✓ Sample user created for testing
✓ Connection pooling configured

FILES TO CREATE:
- backend/database/migrations/001_init_schema.sql
- backend/database/seeds/seed.ts (optional, for test data)

VERIFICATION CHECKLIST:
- [ ] psql -U postgres -d doc_patient_db works
- [ ] \\dt shows all 7 tables
- [ ] \\di shows all indexes
- [ ] \\d users shows columns: id, username, email, password_hash, name, created_at, updated_at
- [ ] Sample user exists: SELECT * FROM users;
- [ ] No foreign key constraint errors

NOTES:
- All IDs are UUID type
- Use TIMESTAMP DEFAULT NOW() for created_at, updated_at
- Phone numbers should be UNIQUE in patients table
- Consultation status values: 'Scheduled', 'Completed', 'Cancelled', 'No-show'
- Prescription status values: 'Generated', 'Printed', 'Failed'
```

### ✅ VERIFICATION CHECKLIST

```
BEFORE MOVING TO NEXT PHASE, VERIFY:

1. Database Connection
   - [ ] psql connects to doc_patient_db
   - [ ] Database exists and is accessible
   - [ ] Connection string: postgresql://user:password@localhost:5432/doc_patient_db

2. Tables Created
   - [ ] SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'; returns 7
   - [ ] All 7 tables exist:
     - [ ] users
     - [ ] patients
     - [ ] appointments
     - [ ] consultations
     - [ ] medications
     - [ ] prescriptions
     - [ ] audit_log

3. Indexes
   - [ ] SELECT count(*) FROM pg_indexes WHERE schemaname = 'public'; shows all indexes
   - [ ] Key indexes exist:
     - [ ] idx_users_email
     - [ ] idx_patients_name
     - [ ] idx_patients_phone
     - [ ] idx_appointments_patient_id
     - [ ] idx_consultations_patient_id

4. Sample Data
   - [ ] SELECT * FROM users; returns at least 1 row (test user)
   - [ ] Test user: username='doctor', email='doctor@clinic.com'

5. Foreign Keys
   - [ ] Try creating appointment without patient_id → fails with constraint error
   - [ ] Create patient first, then appointment → succeeds

TIME CHECK: Should take 1-2 hours
NEXT PHASE: Phase 2 - Core Authentication (Days 3-4)
```

---

# PHASE 2: CORE AUTHENTICATION (Days 3-4)

## Step 2.1: Backend Authentication API

**Timeline:** 3-4 hours | **Team:** Backend | **Days:** 3

### 📋 PROMPT TO EXECUTE

```
TASK: Backend Authentication API

GOALS:
1. Implement secure login with username/password
2. Generate JWT tokens (access + refresh)
3. Verify tokens in protected routes
4. Handle password hashing and validation
5. Implement logout functionality

DELIVERABLES:
✓ POST /api/auth/login returns JWT tokens on success
✓ POST /api/auth/logout clears sessions
✓ Auth middleware protects routes (verifies JWT)
✓ Passwords hashed with bcrypt (10 rounds)
✓ JWT token expiration: 8 hours (access), 24 hours (refresh)
✓ Error handling for invalid credentials (401 Unauthorized)

FILES TO CREATE:
- backend/src/routes/auth.ts
- backend/src/controllers/authController.ts
- backend/src/services/authService.ts
- backend/src/middleware/auth.ts
- backend/src/utils/jwt.ts
- backend/src/utils/crypto.ts
- backend/src/types/express.d.ts (augment Express.Request)

API ENDPOINTS IMPLEMENTATION:

POST /api/auth/login
Request Body:
{
  "username": "doctor",
  "password": "securepassword"
}

Success Response (200):
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "username": "doctor",
    "email": "doctor@clinic.com",
    "name": "Dr. Admin"
  }
}

Error Response (401):
{
  "success": false,
  "error": "Invalid username or password"
}

POST /api/auth/logout
Headers: Authorization: Bearer <token>
Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}

GET /api/auth/profile (protected route)
Headers: Authorization: Bearer <token>
Response (200):
{
  "success": true,
  "user": { ... }
}

VERIFICATION CHECKLIST:
- [ ] Login with correct credentials returns tokens
- [ ] Login with wrong credentials returns 401
- [ ] Protected routes blocked without token
- [ ] Protected routes allowed with valid token
- [ ] Passwords stored as bcrypt hashes (not plain text)
- [ ] Token expiration: 8 hours for access token
- [ ] Invalid/expired tokens return 401

NOTES:
- JWT_SECRET should be stored in .env file (generate with crypto)
- Use Authorization: Bearer <token> header format
- HttpOnly cookies recommended for token storage
- Implement token refresh mechanism
```

### ✅ VERIFICATION CHECKLIST

```
BEFORE MOVING TO NEXT STEP, VERIFY:

1. Login Endpoint
   - [ ] curl -X POST http://localhost:5000/api/auth/login -d '{"username":"doctor","password":"password"}' returns tokens
   - [ ] Response includes: success, token, refreshToken, user
   - [ ] Tokens are JWT format (3 parts separated by dots)

2. Password Hashing
   - [ ] SELECT password_hash FROM users; shows bcrypt hash (starts with $2b$)
   - [ ] Passwords NOT stored in plain text
   - [ ] bcryptjs.compare() verifies password correctly

3. Protected Routes
   - [ ] Calling /api/auth/profile without token returns 401
   - [ ] Calling /api/auth/profile with valid token returns user data
   - [ ] Calling /api/auth/profile with invalid token returns 401

4. Token Verification
   - [ ] Expired token rejected (401)
   - [ ] Tampered token rejected (401)
   - [ ] Valid token accepted (200)

5. Logout
   - [ ] POST /api/auth/logout clears token
   - [ ] Returns success message

TIME CHECK: Should take 3-4 hours
NEXT STEP: Step 2.2 - Frontend Authentication UI & Context
```

---

## Step 2.2: Frontend Authentication UI & Context

**Timeline:** 2-3 hours | **Team:** Frontend | **Day:** 4

### 📋 PROMPT TO EXECUTE

```
TASK: Frontend Authentication UI & Context

GOALS:
1. Create login page with form validation
2. Implement AuthContext for state management
3. Set up protected routes
4. Add logout button to header
5. Store JWT tokens securely

DELIVERABLES:
✓ Login page renders with form fields
✓ Form validation shows errors
✓ AuthContext manages login/logout state
✓ Protected routes redirect unauthenticated users to /login
✓ Logout clears tokens and redirects to login
✓ Header shows user name and logout button
✓ Page refresh maintains login state if token valid

FILES TO CREATE:
- frontend/src/context/AuthContext.tsx
- frontend/src/hooks/useAuth.ts
- frontend/src/pages/LoginPage.tsx
- frontend/src/components/ProtectedRoute.tsx
- frontend/src/services/authService.ts

UI COMPONENTS:

LoginPage:
- Username input field (required)
- Password input field (required, type="password")
- Login button
- Error message display (red text)
- Loading spinner during login

Header (Updated):
- Logo + App Name (left side)
- User profile dropdown (right side)
  - Display: "Welcome, [User Name]"
  - Dropdown menu with "Settings" and "Logout"
  - Logout button clears tokens

ProtectedRoute:
- Checks AuthContext for authentication
- If authenticated: renders component
- If not authenticated: redirects to /login

VERIFICATION CHECKLIST:
- [ ] Login page displays at http://localhost:5173/login
- [ ] Username and password inputs accept text
- [ ] Login button triggers API call
- [ ] Success redirects to /dashboard
- [ ] Error displays message in red
- [ ] Loading spinner shows during request
- [ ] Token stored (check localStorage or cookies)
- [ ] Page refresh keeps user logged in (token still valid)
- [ ] Logout button appears in header
- [ ] Logout clears token and redirects to login

NOTES:
- Store token in localStorage (browser) or HttpOnly cookie (more secure)
- Form validation: required fields, email format
- Loading state prevents duplicate submissions
- Token expiration check on page load (redirect if expired)
```

### ✅ VERIFICATION CHECKLIST

```
BEFORE MOVING TO PHASE 3, VERIFY:

1. Login Form
   - [ ] Type username: "doctor"
   - [ ] Type password: "password"
   - [ ] Click Login button
   - [ ] Form submits to API
   - [ ] Success redirects to /dashboard

2. Form Validation
   - [ ] Empty username shows error: "Username is required"
   - [ ] Empty password shows error: "Password is required"
   - [ ] Invalid credentials show error: "Invalid username or password"

3. AuthContext
   - [ ] useAuth() hook works in components
   - [ ] Auth state updates after login
   - [ ] User info accessible from context

4. Protected Routes
   - [ ] Try accessing /dashboard without login → redirects to /login
   - [ ] Login → can access /dashboard
   - [ ] Logout → redirects to /login

5. Header
   - [ ] Username displays in header after login
   - [ ] Logout button visible
   - [ ] Click Logout → redirects to /login, token cleared

6. Token Persistence
   - [ ] Login
   - [ ] Refresh page (F5)
   - [ ] Still logged in (token valid)
   - [ ] Logout
   - [ ] Refresh page → redirected to /login

TIME CHECK: Should take 2-3 hours
NEXT PHASE: Phase 3 - Patient Management (Days 5-7)

✅ PHASE 2 COMPLETE: Authentication working end-to-end
```

---

# PHASE 3: PATIENT MANAGEMENT (Days 5-7)

## Step 3.1: Backend Patient API

**Timeline:** 3-4 hours | **Team:** Backend | **Day:** 5

### 📋 PROMPT TO EXECUTE

```
TASK: Backend Patient API (CRUD + Search)

GOALS:
1. Create POST endpoint for new patient registration
2. Create GET endpoints for patient retrieval (single, list, search)
3. Create PUT endpoint for patient updates
4. Implement search with name/phone query (typeahead)
5. Add database validation and error handling

DELIVERABLES:
✓ POST /api/patients creates new patient with validation
✓ GET /api/patients/:id retrieves patient by ID
✓ GET /api/patients/search?q=name returns matching patients
✓ PUT /api/patients/:id updates patient details
✓ Validation prevents duplicate phone numbers
✓ Search returns results < 100ms
✓ All endpoints protected with auth middleware
✓ Proper error responses (400, 404, 409)

FILES TO CREATE:
- backend/src/routes/patients.ts
- backend/src/controllers/patientController.ts
- backend/src/services/patientService.ts
- backend/src/types/models.ts (Patient interface)

API ENDPOINTS IMPLEMENTATION:

POST /api/patients
Headers: Authorization: Bearer <token>
Request Body:
{
  "name": "John Doe",
  "dob": "1980-01-15",
  "gender": "M",
  "phone": "9876543210",
  "email": "john@example.com",
  "address": "123 Main St"
}

Success Response (201):
{
  "success": true,
  "patient": {
    "id": "uuid",
    "name": "John Doe",
    "dob": "1980-01-15",
    "age": 46,
    "gender": "M",
    "phone": "9876543210",
    "email": "john@example.com",
    "address": "123 Main St",
    "created_at": "2026-05-10T10:30:00Z"
  }
}

Error Response (400 - Validation):
{
  "success": false,
  "error": "Name is required",
  "details": { "field": "name" }
}

Error Response (409 - Duplicate Phone):
{
  "success": false,
  "error": "Phone number already exists",
  "statusCode": 409
}

GET /api/patients/:id
Headers: Authorization: Bearer <token>
Response (200): Returns patient object

GET /api/patients/search?q=john&limit=10
Headers: Authorization: Bearer <token>
Response (200):
{
  "success": true,
  "patients": [
    {
      "id": "uuid",
      "name": "John Doe",
      "age": 46,
      "gender": "M",
      "phone": "9876543210",
      "lastVisit": "2026-05-08T14:00:00Z"
    }
  ],
  "total": 1
}

PUT /api/patients/:id
Headers: Authorization: Bearer <token>
Request Body: { "name": "John Doe Jr.", "email": "john.jr@example.com" }
Response (200): Returns updated patient object

VALIDATION RULES:
- Name: Required, max 100 chars, letters/spaces only
- DOB: Required, valid date, age >= 0 and <= 150
- Phone: Required, unique, valid format (10+ digits)
- Gender: M, F, or Other
- Email: Optional, valid email format

VERIFICATION CHECKLIST:
- [ ] Create patient with valid data succeeds (201)
- [ ] Create patient missing name fails (400)
- [ ] Duplicate phone number fails (409)
- [ ] Get patient by ID returns correct data (200)
- [ ] Search returns matching patients < 100ms
- [ ] Search limits results to 10 by default
- [ ] Update patient updates all fields (200)
- [ ] Unauthorized requests return 401

NOTES:
- Use database indexes on name, phone for fast search
- ILIKE for case-insensitive search
- Parameterized queries to prevent SQL injection
- Validate phone format: ^\+?[0-9\s\-\(\)]{10,}$
```

### ✅ VERIFICATION CHECKLIST

```
BEFORE MOVING TO NEXT STEP, VERIFY:

1. Create Patient
   - [ ] POST /api/patients with valid data succeeds
   - [ ] Response has 201 status
   - [ ] Patient ID returned
   - [ ] Patient saved in database

2. Get Patient
   - [ ] GET /api/patients/:id returns patient
   - [ ] All fields populated correctly
   - [ ] Age calculated from DOB

3. Search Patients
   - [ ] GET /api/patients/search?q=John returns matching patients
   - [ ] Search < 100ms (use database index)
   - [ ] Search case-insensitive
   - [ ] Search limits to 10 results
   - [ ] Results include: id, name, age, phone, lastVisit

4. Update Patient
   - [ ] PUT /api/patients/:id with new data succeeds
   - [ ] Patient updated in database
   - [ ] Can update individual fields

5. Validation
   - [ ] Empty name returns 400
   - [ ] Invalid phone format returns 400
   - [ ] Duplicate phone returns 409
   - [ ] Invalid DOB returns 400

TIME CHECK: Should take 3-4 hours
NEXT STEP: Step 3.2 - Frontend Patient Management UI
```

---

## Step 3.2: Frontend Patient Management UI

**Timeline:** 4-5 hours | **Team:** Frontend | **Days:** 5-6

### 📋 PROMPT TO EXECUTE

```
TASK: Frontend Patient Management UI

GOALS:
1. Create patient search page with real-time typeahead
2. Build patient profile page with tabs
3. Create patient registration form
4. Implement patient edit functionality
5. Display patient list with action buttons

DELIVERABLES:
✓ Search page with typeahead that returns results < 100ms
✓ Patient profile page displays all patient info
✓ Patient registration form with validation
✓ Patient edit form with pre-populated data
✓ Actions (Edit, Schedule, Consult) visible and clickable
✓ Responsive design on mobile, tablet, desktop

PAGES/COMPONENTS TO CREATE:

1. PatientSearchPage
   - Large search input field (focus on load)
   - Real-time typeahead (debounce 300ms)
   - Results list showing: name, age, phone, lastVisit
   - Click result → navigate to PatientProfilePage

2. PatientProfilePage
   - Patient name (large heading)
   - Patient info: age, gender, phone, email, DOB, address
   - Tabs: Profile | Appointments | History
   - Action buttons: [Edit] [Schedule Appointment] [Start Consultation]

3. PatientForm
   - Name input (required)
   - DOB input (required, date picker)
   - Gender dropdown (M, F, Other)
   - Phone input (required)
   - Email input (optional)
   - Address textarea (optional)
   - Form validation on blur/submit
   - Error messages below each field

4. PatientCard
   - Compact patient display: name, age, gender, phone
   - Used in search results

UI FEATURES:
- Typeahead search (debounced 300ms)
- Form validation (show errors on blur, allow submit)
- Loading states (spinner while fetching)
- Toast notifications for success/error
- Error messages in red below fields
- Responsive: mobile (stacked), tablet (2-col), desktop (multi-col)

VERIFICATION CHECKLIST:
- [ ] Search page loads and focuses on input
- [ ] Typing triggers typeahead (< 200ms response)
- [ ] Search results clickable → navigates to profile
- [ ] Profile page shows all patient info
- [ ] Edit button opens form with current data
- [ ] Form validation shows errors on blur
- [ ] Save button updates patient
- [ ] Registration form creates new patient
- [ ] Success toast appears after save

NOTES:
- Use useDebounce hook for typeahead
- Form validation: required fields, email format, phone format
- Loading spinner during API calls
- Toast notifications: success (green), error (red), info (blue)
- Error messages appear below each field in red
```

### ✅ VERIFICATION CHECKLIST

```
BEFORE MOVING TO PHASE 4, VERIFY:

1. Search Page
   - [ ] Search page loads at /patients/search
   - [ ] Input field focuses automatically
   - [ ] Type "john" → shows matching patients
   - [ ] Results appear in < 100ms
   - [ ] Click result → goes to /patients/:id

2. Patient Profile
   - [ ] Profile page shows all patient info
   - [ ] Age calculated from DOB
   - [ ] Edit button visible
   - [ ] Tabs: Profile, Appointments, History visible

3. Patient Form
   - [ ] All form fields render
   - [ ] Form validation works
   - [ ] Empty name shows error: "Name is required"
   - [ ] Invalid email shows error
   - [ ] Invalid phone shows error
   - [ ] Date picker opens for DOB

4. Edit Patient
   - [ ] Edit button opens form
   - [ ] Form pre-populated with current data
   - [ ] Update data
   - [ ] Save button submits
   - [ ] Success message appears
   - [ ] Patient info updates on page

5. Register Patient
   - [ ] Can create new patient from search page
   - [ ] Form validation prevents invalid data
   - [ ] Patient appears in search after creation

TIME CHECK: Should take 4-5 hours
NEXT PHASE: Phase 4 - Appointment Management (Days 8-9)

✅ PHASE 3 COMPLETE: Patient management working end-to-end
```

---

# PHASE 4: APPOINTMENT MANAGEMENT (Days 8-9)

## Step 4.1: Backend Appointment API

**Timeline:** 2-3 hours | **Team:** Backend | **Day:** 8

### 📋 PROMPT TO EXECUTE

```
TASK: Backend Appointment API

GOALS:
1. Create endpoint to schedule new appointments
2. Get daily appointments list
3. Update appointment status (Scheduled, Completed, Cancelled, No-show)
4. Prevent double-booking for same patient
5. Implement availability checking

DELIVERABLES:
✓ POST /api/appointments schedules appointment
✓ GET /api/appointments?date=YYYY-MM-DD gets daily list
✓ PUT /api/appointments/:id updates status
✓ No double-booking allowed (409 error)
✓ Appointments sorted by time
✓ Response includes patient details
✓ All endpoints protected with auth

FILES TO CREATE:
- backend/src/routes/appointments.ts
- backend/src/controllers/appointmentController.ts
- backend/src/services/appointmentService.ts

API ENDPOINTS IMPLEMENTATION:

POST /api/appointments
Headers: Authorization: Bearer <token>
Request Body:
{
  "patientId": "uuid",
  "scheduledTime": "2026-05-10T14:30:00Z",
  "reason": "Follow-up for diabetes checkup"
}

Success Response (201):
{
  "success": true,
  "appointment": {
    "id": "uuid",
    "patientId": "uuid",
    "scheduledTime": "2026-05-10T14:30:00Z",
    "status": "Scheduled",
    "reason": "Follow-up",
    "created_at": "2026-05-10T10:00:00Z"
  }
}

Error Response (409 - Double Booking):
{
  "success": false,
  "error": "Patient already has appointment at this time",
  "statusCode": 409
}

GET /api/appointments?date=2026-05-10&status=Scheduled
Headers: Authorization: Bearer <token>
Response (200):
{
  "success": true,
  "appointments": [
    {
      "id": "uuid",
      "patientId": "uuid",
      "patientName": "John Doe",
      "phone": "9876543210",
      "scheduledTime": "2026-05-10T14:30:00Z",
      "status": "Scheduled",
      "reason": "Follow-up",
      "consultationSaved": false
    }
  ]
}

PUT /api/appointments/:id
Headers: Authorization: Bearer <token>
Request Body:
{
  "status": "Completed",
  "reason": "Completed follow-up"
}
Response (200): Returns updated appointment

VALIDATION:
- patientId: Required, valid UUID, patient exists
- scheduledTime: Required, >= now, within clinic hours (9 AM - 6 PM)
- status: Scheduled, Completed, Cancelled, No-show
- No double-booking: SELECT * FROM appointments WHERE patient_id = ? AND DATE(scheduled_time) = ? AND status != 'Cancelled'

DATABASE INDEXES:
- CREATE INDEX idx_appointments_patient_id ON appointments(patient_id)
- CREATE INDEX idx_appointments_scheduled_time ON appointments(scheduled_time DESC)
- CREATE UNIQUE INDEX idx_no_double_booking ON appointments(patient_id, scheduled_time) WHERE status != 'Cancelled'

VERIFICATION CHECKLIST:
- [ ] Create appointment succeeds (201)
- [ ] Double-booking prevented (409)
- [ ] List appointments for date
- [ ] Update status changes correctly
- [ ] Cancelled appointments excluded from availability check
- [ ] Past appointments cannot be created (400)
- [ ] Invalid patient ID returns 404

NOTES:
- Clinic hours: 9 AM to 6 PM (hardcode or config)
- Prevent scheduling outside hours
- Prevent past appointment scheduling
- Double-check uses UNIQUE index on database
```

### ✅ VERIFICATION CHECKLIST

```
BEFORE MOVING TO NEXT STEP, VERIFY:

1. Create Appointment
   - [ ] POST /api/appointments with valid data succeeds (201)
   - [ ] Appointment saved in database
   - [ ] Response includes appointment ID

2. Double-Booking Prevention
   - [ ] Create appointment at 2:30 PM
   - [ ] Try creating another appointment at 2:30 PM same patient
   - [ ] Returns 409 error: "Patient already has appointment at this time"

3. Get Appointments
   - [ ] GET /api/appointments?date=2026-05-10 returns list
   - [ ] Appointments sorted by time (earliest first)
   - [ ] Includes patient name, phone
   - [ ] consultationSaved indicates if visit recorded

4. Update Status
   - [ ] PUT /api/appointments/:id with status "Completed"
   - [ ] Status updates in database
   - [ ] Can change to: Scheduled, Completed, Cancelled, No-show

5. Validation
   - [ ] Past date returns 400
   - [ ] Outside clinic hours (before 9 AM or after 6 PM) returns 400
   - [ ] Invalid patient ID returns 404

TIME CHECK: Should take 2-3 hours
NEXT STEP: Step 4.2 - Frontend Appointment Management UI
```

---

## Step 4.2: Frontend Appointment Management UI

**Timeline:** 3-4 hours | **Team:** Frontend | **Day:** 8-9

### 📋 PROMPT TO EXECUTE

```
TASK: Frontend Appointment Management UI

GOALS:
1. Display today's appointments on dashboard
2. Create appointment scheduling form/modal
3. Show appointment details with patient info
4. Implement status update buttons
5. Add quick action buttons (View, Consult, Cancel)

DELIVERABLES:
✓ Dashboard shows today's appointments
✓ Appointments sorted by time (earliest first)
✓ Schedule appointment form validates date/time
✓ Status update works inline with buttons
✓ Patient info visible in appointment row
✓ Quick action buttons (View Patient, Start Consultation, Cancel)
✓ Confirmation dialog for cancel/no-show

PAGES/COMPONENTS:

1. DashboardPage (Updated)
   - Title: "Today's Schedule" with date
   - Quick stats: Total, Completed, Pending
   - AppointmentList table
   - [+ New Appointment] button

2. AppointmentList
   - Table with columns: Time | Patient | Age | Phone | Reason | Status | Actions
   - Each row clickable
   - Inline action buttons: View, Consult, Cancel
   - Status badge: Scheduled (blue), Completed (green), Cancelled (gray), No-show (red)

3. ScheduleAppointmentForm
   - Date picker (no past dates)
   - Time picker (9 AM - 6 PM)
   - Patient search typeahead
   - Reason textarea
   - [Save] [Cancel] buttons

4. AppointmentItem (Row Component)
   - Displays single appointment
   - Shows patient name, phone, reason
   - Status displayed as colored badge
   - Action buttons inline

UI FEATURES:
- Date/time picker prevents past dates
- Time picker limits to 9 AM - 6 PM
- Patient search typeahead
- Status update buttons: [Mark Complete] [Mark No-Show] [Cancel]
- Confirmation dialog before canceling
- Loading states during actions
- Toast notifications for success/error
- Responsive table (scrollable on mobile)

VERIFICATION CHECKLIST:
- [ ] Dashboard loads and shows today's appointments
- [ ] Appointments sorted by time
- [ ] [+ New Appointment] button opens form
- [ ] Form validates date (no past dates)
- [ ] Form validates time (within clinic hours)
- [ ] Patient search works in form
- [ ] Save creates appointment and refreshes list
- [ ] Status buttons update appointment
- [ ] Confirmation dialog appears for cancel
- [ ] Toast shows success/error message

NOTES:
- Use React Date Picker or similar library
- Clinic hours: 9 AM to 6 PM
- Don't allow scheduling more than 60 days in advance (or define limit)
- Show loading spinner while saving
- Disable buttons during submission
```

### ✅ VERIFICATION CHECKLIST

```
BEFORE MOVING TO PHASE 5, VERIFY:

1. Dashboard Display
   - [ ] Dashboard shows today's appointments
   - [ ] Appointments sorted by time (earliest first)
   - [ ] Patient name, phone visible
   - [ ] Status badge shows correct color

2. Schedule Appointment
   - [ ] Click [+ New Appointment]
   - [ ] Modal/form opens
   - [ ] Date picker opens
   - [ ] Can't select past dates
   - [ ] Time picker shows only 9 AM - 6 PM slots
   - [ ] Patient search works
   - [ ] Can enter reason
   - [ ] Save creates appointment

3. Update Status
   - [ ] Click [Mark Complete] button
   - [ ] Status updates to "Completed"
   - [ ] Badge changes to green
   - [ ] Try [Mark No-Show] → status changes
   - [ ] Try [Cancel] → confirmation dialog appears

4. Error Handling
   - [ ] Try scheduling at 8 AM → error
   - [ ] Try scheduling past date → error
   - [ ] Try scheduling existing time → error
   - [ ] Toast shows error message

5. Refresh
   - [ ] After creating appointment
   - [ ] Refresh page
   - [ ] Appointment still appears in list

TIME CHECK: Should take 3-4 hours
NEXT PHASE: Phase 5 - Consultation Module (Days 10-13)

✅ PHASE 4 COMPLETE: Appointment management working end-to-end
```

---

# PHASE 5: CONSULTATION MODULE (Days 10-13)

## Step 5.1: Backend Consultation API (Vitals + Form)

**Timeline:** 3-4 hours | **Team:** Backend | **Day:** 10

### 📋 PROMPT TO EXECUTE

```
TASK: Backend Consultation API (Vitals + Form)

GOALS:
1. Create POST endpoint for new consultation
2. Record vitals (temperature, BP, pulse) with validation
3. Store complaints, diagnosis, medications
4. Validate vitals within acceptable ranges (warnings allowed)
5. Auto-generate prescription record
6. Get consultation history for patient

DELIVERABLES:
✓ POST /api/consultations creates full consultation record
✓ Vitals validated and stored
✓ Medications added to consultation
✓ Prescription auto-generated
✓ GET /api/patients/:id/consultations returns history
✓ Vitals outside range trigger warning (not blocking save)

FILES TO CREATE:
- backend/src/routes/consultations.ts
- backend/src/controllers/consultationController.ts
- backend/src/services/consultationService.ts

API ENDPOINTS IMPLEMENTATION:

POST /api/consultations
Headers: Authorization: Bearer <token>
Request Body:
{
  "patientId": "uuid",
  "appointmentId": "uuid (optional)",
  "temperature": 101.5,
  "bpSystolic": 130,
  "bpDiastolic": 85,
  "pulse": 92,
  "complaints": "Fever, cough, body ache for 3 days",
  "diagnosis": "Viral fever with URI symptoms",
  "medications": [
    {
      "name": "Paracetamol",
      "dosage": "500mg",
      "frequency": "Twice daily",
      "duration": "5 days",
      "instructions": "After food"
    },
    {
      "name": "Cough Syrup",
      "dosage": "10ml",
      "frequency": "Thrice daily",
      "duration": "7 days",
      "instructions": "After food"
    }
  ]
}

Success Response (201):
{
  "success": true,
  "consultation": {
    "id": "uuid",
    "patientId": "uuid",
    "temperature": 101.5,
    "bp": "130/85",
    "pulse": 92,
    "complaints": "Fever...",
    "diagnosis": "Viral fever...",
    "medications": [ { id, name, dosage, frequency, duration } ],
    "prescription": { "id": "uuid" },
    "vitalsWarnings": {
      "temperature": "High (101.5°F, normal: 98.6°F)"
    },
    "created_at": "2026-05-10T14:30:00Z"
  }
}

GET /api/patients/:id/consultations?limit=10&offset=0
Headers: Authorization: Bearer <token>
Response (200):
{
  "success": true,
  "consultations": [
    {
      "id": "uuid",
      "date": "2026-05-10T14:30:00Z",
      "temperature": 101.5,
      "bp": "130/85",
      "pulse": 92,
      "diagnosis": "Viral fever...",
      "medicationCount": 2,
      "prescriptionId": "uuid"
    }
  ],
  "total": 5,
  "pages": 1
}

VITALS VALIDATION (Warnings - don't block):
- Temperature: 95-105°F normal, alert if outside
- BP Systolic: 90-180 mmHg normal
- BP Diastolic: 60-120 mmHg normal
- Pulse: 40-150 BPM normal

DATABASE MODEL:
consultations: id, patient_id, appointment_id, temperature, bp_systolic, bp_diastolic, pulse, complaints, diagnosis, created_at, updated_at
medications: id, consultation_id, name, dosage, frequency, duration, instructions, created_at
prescriptions: id, consultation_id, status (Generated), generated_at, printed_at, updated_at

VERIFICATION CHECKLIST:
- [ ] Create consultation with vitals succeeds (201)
- [ ] Vitals stored correctly in database
- [ ] Medications added and linked to consultation
- [ ] Prescription auto-generated
- [ ] Get consultation history returns list
- [ ] Vitals outside range return warning in response (but don't block)
- [ ] At least 1 medication required

NOTES:
- Vitals warnings are informational (don't prevent save)
- Auto-generate prescription with status "Generated"
- Medications can be added/removed before save
- Store both systolic and diastolic BP separately
```

### ✅ VERIFICATION CHECKLIST

```
BEFORE MOVING TO NEXT STEP, VERIFY:

1. Create Consultation
   - [ ] POST /api/consultations with all vitals succeeds (201)
   - [ ] Consultation ID returned
   - [ ] Consultation saved in database

2. Vitals Storage
   - [ ] SELECT * FROM consultations WHERE id = ?
   - [ ] All vitals stored: temperature, bp_systolic, bp_diastolic, pulse
   - [ ] Values are correct

3. Medications
   - [ ] Medications table has rows for this consultation
   - [ ] All medication fields stored: name, dosage, frequency, duration, instructions

4. Prescription Auto-Generation
   - [ ] Prescription auto-created for consultation
   - [ ] Prescription status = "Generated"
   - [ ] Prescription linked to consultation_id

5. History Retrieval
   - [ ] GET /api/patients/:id/consultations returns consultations
   - [ ] All consultation details visible
   - [ ] Includes medication count

6. Warnings
   - [ ] Create consultation with temp 104°F
   - [ ] Response includes warning about high temperature
   - [ ] Consultation still saved (warning doesn't block)

TIME CHECK: Should take 3-4 hours
NEXT STEP: Step 5.2 - Frontend Consultation Form
```

---

## Step 5.2: Frontend Consultation Form

**Timeline:** 5-6 hours | **Team:** Frontend | **Days:** 10-11

### 📋 PROMPT TO EXECUTE

```
TASK: Frontend Consultation Form

GOALS:
1. Create multi-section consultation form
2. Implement vitals capture with large input fields (48px)
3. Add complaints and diagnosis text areas
4. Build medication add/remove interface
5. Show medication preview before save
6. Validate form and show errors
7. Auto-generate prescription after save

DELIVERABLES:
✓ Consultation form renders all 5 sections
✓ Vitals fields large (48px height) and easy to input
✓ Vitals outside range show warning (not blocking)
✓ Add/remove medications work
✓ Medication list shows preview
✓ Form validates before submit
✓ Save redirects to prescription view

COMPONENTS:

1. ConsultationPage (Main Container)
   - Fixed patient header: [Patient Name] [Age] [Last Visit]
   - Form sections (progressive/collapsible)
   - Save and Cancel buttons at bottom

2. VitalsForm
   - 4 input fields (48px height):
     - Temperature (°F)
     - BP Systolic (mmHg)
     - BP Diastolic (mmHg)
     - Pulse (BPM)
   - Display normal ranges below each field
   - Warning icon if value outside range
   - Don't block save if warning

3. ComplaintsForm
   - Textarea for symptoms
   - Placeholder: "e.g., Fever, cough, body ache for 3 days"

4. DiagnosisForm
   - Textarea for diagnosis
   - Placeholder: "e.g., Viral fever with URI symptoms"

5. MedicationForm
   - [+ Add Medication] button
   - For each medication:
     - Name input (with autocomplete)
     - Dosage input (e.g., "500mg")
     - Frequency dropdown (Once, Twice, Thrice daily)
     - Duration input (e.g., "5 days")
     - Instructions input (e.g., "After food")
     - [Remove] button

6. MedicationList (Preview)
   - List all added medications
   - Shows: Name | Dosage | Frequency | Duration

7. VitalAlert
   - Shows warning if vital outside range
   - Icon + message: "High (101.5°F, normal: 98.6°F)"

UI FEATURES:
- Autocomplete for medication names (from common list)
- At least 1 medication required (validate on submit)
- Debounced vital validation (show warning in real-time)
- Keyboard shortcuts: Tab to next field, Enter to add medication
- Loading state while saving
- Toast notifications for success/error
- Fixed patient header showing current patient info

VERIFICATION CHECKLIST:
- [ ] All 5 form sections render
- [ ] Vitals input fields 48px height
- [ ] Can enter decimal values (101.5)
- [ ] Warning shows for abnormal vitals (not blocking)
- [ ] Add medication button works
- [ ] Medications list updates in real-time
- [ ] Remove medication works
- [ ] Save validates all fields
- [ ] Submit succeeds with all fields filled
- [ ] Redirects to prescription page after save

NOTES:
- Vital ranges: Temp 98.6°F (95-105), BP 120/80 (90-180/60-120), Pulse 70 (40-150)
- Medication autocomplete from common medicines list
- Required: at least 1 medication
- Form sections can be expandable (collapse/expand)
- Patient info fixed at top so visible while scrolling
```

### ✅ VERIFICATION CHECKLIST

```
BEFORE MOVING TO NEXT STEP, VERIFY:

1. Form Display
   - [ ] Consultation form loads
   - [ ] Patient header visible: name, age, last visit
   - [ ] All 5 sections visible: Vitals, Complaints, Diagnosis, Medications

2. Vitals Input
   - [ ] Temperature field accepts: 101.5
   - [ ] BP fields accept: 130, 85
   - [ ] Pulse field accepts: 92
   - [ ] Fields are large (48px height)

3. Vital Warnings
   - [ ] Enter temperature 104°F
   - [ ] Warning displays: "High (104°F, normal: 98.6°F)"
   - [ ] Warning doesn't block save

4. Medication Management
   - [ ] [+ Add Medication] button works
   - [ ] Medication form appears
   - [ ] Enter: Paracetamol, 500mg, Twice daily, 5 days, After food
   - [ ] [Add] button adds to list
   - [ ] Medication appears in preview list
   - [ ] [Remove] button removes medication
   - [ ] Can add multiple medications

5. Form Submission
   - [ ] Empty medications shows error: "At least 1 medication required"
   - [ ] All fields filled → Save succeeds
   - [ ] Loading spinner shows during save
   - [ ] Redirects to prescription page after save

6. Autocomplete
   - [ ] Start typing "para" in medication name
   - [ ] Suggestions appear: Paracetamol, etc.
   - [ ] Click suggestion → fills field

TIME CHECK: Should take 5-6 hours
NEXT STEP: Step 5.3 - Backend Prescription Generation
```

---

## Step 5.3: Backend Prescription Generation

**Timeline:** 3-4 hours | **Team:** Backend | **Day:** 12

### 📋 PROMPT TO EXECUTE

```
TASK: Backend Prescription Generation

GOALS:
1. Create endpoint to get prescription details
2. Generate prescription PDF
3. Generate HTML for browser printing
4. Track when prescription was printed
5. Include all consultation data in prescription

DELIVERABLES:
✓ GET /api/prescriptions/:id returns prescription data
✓ GET /api/prescriptions/:id/print?format=pdf returns PDF
✓ GET /api/prescriptions/:id/print?format=html returns HTML
✓ PUT /api/prescriptions/:id/mark-printed updates printed_at
✓ PDF includes all required fields

FILES TO CREATE:
- backend/src/routes/prescriptions.ts
- backend/src/controllers/prescriptionController.ts
- backend/src/services/prescriptionService.ts
- backend/src/templates/prescription.html (HTML template)

API ENDPOINTS IMPLEMENTATION:

GET /api/prescriptions/:id
Headers: Authorization: Bearer <token>
Response (200):
{
  "success": true,
  "prescription": {
    "id": "uuid",
    "patientName": "John Doe",
    "patientAge": 46,
    "patientDOB": "1980-01-15",
    "date": "2026-05-10T14:30:00Z",
    "vitals": {
      "temperature": 101.5,
      "bp": "130/85",
      "pulse": 92
    },
    "diagnosis": "Viral fever with URI symptoms",
    "medications": [
      {
        "name": "Paracetamol",
        "dosage": "500mg",
        "frequency": "Twice daily",
        "duration": "5 days",
        "instructions": "After food"
      }
    ],
    "clinicHeader": {
      "name": "City Clinic",
      "address": "123 Main St, City",
      "phone": "9876543210"
    }
  }
}

GET /api/prescriptions/:id/print?format=pdf
Headers: Authorization: Bearer <token>
Response: PDF file
Content-Type: application/pdf
Content-Disposition: attachment; filename="prescription_20260510.pdf"

GET /api/prescriptions/:id/print?format=html
Headers: Authorization: Bearer <token>
Response: HTML string
Content-Type: text/html

PUT /api/prescriptions/:id/mark-printed
Headers: Authorization: Bearer <token>
Response (200):
{
  "success": true,
  "prescription": {
    "id": "uuid",
    "printed_at": "2026-05-10T14:35:00Z"
  }
}

PDF GENERATION:
- Use: puppeteer or pdfkit
- Generate from HTML template
- Include all fields

PRESCRIPTION TEMPLATE FIELDS:
┌─────────────────────────────────────────┐
│   CLINIC HEADER                         │
│   Logo, Name, Address, Phone           │
├─────────────────────────────────────────┤
│   PRESCRIPTION                          │
├─────────────────────────────────────────┤
│ Patient: John Doe                       │
│ Age: 46 | DOB: 15-Jan-1980              │
│ Date: 10-May-2026                       │
├─────────────────────────────────────────┤
│ VITALS:                                 │
│ Temp: 101.5°F | BP: 130/85 | Pulse: 92 │
├─────────────────────────────────────────┤
│ DIAGNOSIS:                              │
│ Viral fever with URI symptoms           │
├─────────────────────────────────────────┤
│ MEDICATIONS:                            │
│ 1. Paracetamol 500mg - Twice daily      │
│    for 5 days - After food              │
│ 2. Cough Syrup 10ml - Thrice daily      │
│    for 7 days - After food              │
├─────────────────────────────────────────┤
│ NOTES:                                  │
│ Rest for 2 days. Drink plenty of water. │
├─────────────────────────────────────────┤
│ Doctor Signature: _________________     │
│ Date: ____________________              │
└─────────────────────────────────────────┘

VERIFICATION CHECKLIST:
- [ ] Get prescription returns correct data
- [ ] PDF generation succeeds
- [ ] HTML template renders correctly
- [ ] PDF has all required fields
- [ ] Mark printed updates timestamp
- [ ] Download triggers file download (not inline)

NOTES:
- PDF generation may take 1-2 seconds
- Use HTML as template, convert to PDF
- Clinic header hardcoded or from config
- Add logo image to PDF (optional)
- Page breaks for multi-page prescriptions
```

### ✅ VERIFICATION CHECKLIST

```
BEFORE MOVING TO NEXT STEP, VERIFY:

1. Get Prescription
   - [ ] GET /api/prescriptions/:id succeeds
   - [ ] Returns patient name, age, DOB
   - [ ] Returns vitals, diagnosis, medications

2. PDF Generation
   - [ ] GET /api/prescriptions/:id/print?format=pdf returns PDF
   - [ ] Response is Content-Type: application/pdf
   - [ ] Content-Disposition: attachment (triggers download)
   - [ ] PDF filename: prescription_YYYYMMDD.pdf

3. HTML Generation
   - [ ] GET /api/prescriptions/:id/print?format=html returns HTML
   - [ ] HTML renders all prescription data
   - [ ] Print-friendly formatting (no navigation, sidebars)

4. Mark Printed
   - [ ] PUT /api/prescriptions/:id/mark-printed updates printed_at
   - [ ] printed_at timestamp set to current time
   - [ ] Response confirms update

5. PDF Content
   - [ ] PDF includes clinic header
   - [ ] PDF includes patient info
   - [ ] PDF includes vitals
   - [ ] PDF includes diagnosis
   - [ ] PDF includes all medications with dosage, frequency, duration
   - [ ] PDF includes signature space at bottom

TIME CHECK: Should take 3-4 hours
NEXT STEP: Step 5.4 - Frontend Prescription Display & Print
```

---

## Step 5.4: Frontend Prescription Display & Print

**Timeline:** 2-3 hours | **Team:** Frontend | **Day:** 12-13

### 📋 PROMPT TO EXECUTE

```
TASK: Frontend Prescription Display & Print

GOALS:
1. Create prescription view page
2. Display prescription in print-friendly format
3. Add print button (browser print)
4. Add PDF download button
5. Show prescription history in patient profile

DELIVERABLES:
✓ Prescription page displays all fields
✓ Print formatting (no sidebar, optimized layout)
✓ Print button works (browser print dialog)
✓ Download PDF button works
✓ Prescription accessible from consultation save
✓ Prescription accessible from patient history

COMPONENTS:

1. PrescriptionPage
   - Full prescription display
   - [Print] [Download PDF] [Email] buttons at top
   - Prescription template content

2. PrescriptionTemplate
   - Print-optimized template
   - Clinic header section
   - Patient info section
   - Vitals section
   - Diagnosis section
   - Medications list (numbered)
   - Footer with signature space

3. PrescriptionActions
   - Print button: Opens browser print dialog
   - Download PDF button: Downloads PDF file
   - Email button: (Optional for Phase 2)
   - Share button: (Optional for Phase 2)

UI FEATURES:
- Print media query for printer-friendly output (@media print)
- Large fonts for readability in print
- Proper page breaks for multi-page prescriptions
- Include clinic letterhead / logo
- Signature space at bottom
- Date and doctor name
- Patient details section (name, DOB, age)
- Vitals section (temp, BP, pulse)
- Diagnosis section
- Medications list (numbered with all details)

VERIFICATION CHECKLIST:
- [ ] Prescription page loads after consultation save
- [ ] All patient and consultation data displays
- [ ] Print button opens print dialog
- [ ] Print preview shows correct layout (no sidebar)
- [ ] Download button downloads PDF
- [ ] PDF opens in browser or downloads to computer
- [ ] Prescription accessible from patient history tab
- [ ] Print formatting looks professional

NOTES:
- Use @media print CSS for print layout
- Hide navigation, buttons in print view
- Optimize spacing for paper (A4/Letter)
- Use print-friendly colors (black on white)
- Include page numbers for multi-page prescriptions
- Set page breaks between sections
```

### ✅ VERIFICATION CHECKLIST

```
BEFORE MOVING TO PHASE 6, VERIFY:

1. Prescription Display
   - [ ] Prescription page loads after saving consultation
   - [ ] Patient name displays
   - [ ] All vitals visible: temp, BP, pulse
   - [ ] Diagnosis visible
   - [ ] All medications listed with dosage, frequency, duration
   - [ ] Clinic header visible

2. Print Button
   - [ ] Click [Print] button
   - [ ] Browser print dialog opens
   - [ ] Print preview shows correct layout
   - [ ] Navigation/sidebar NOT in preview
   - [ ] Layout looks professional
   - [ ] Can print to PDF or printer

3. Download PDF
   - [ ] Click [Download PDF] button
   - [ ] PDF downloads to computer
   - [ ] Filename: prescription_YYYYMMDD.pdf
   - [ ] PDF opens and displays correctly

4. Navigation
   - [ ] From PatientProfilePage → History tab
   - [ ] Click prescription link → opens PrescriptionPage
   - [ ] Can navigate back to patient

5. Responsive
   - [ ] Prescription renders on mobile
   - [ ] Buttons accessible
   - [ ] Print layout works on mobile

TIME CHECK: Should take 2-3 hours
NEXT PHASE: Phase 6 - Search & History (Days 14-15)

✅ PHASE 5 COMPLETE: Full consultation workflow end-to-end
```

---

# PHASE 6: SEARCH & HISTORY (Days 14-15)

## Step 6.1: Backend Patient Search & History

**Timeline:** 1-2 hours | **Team:** Backend | **Day:** 14

### 📋 PROMPT TO EXECUTE

```
TASK: Backend Patient Search & History (Optimization)

GOALS:
1. Optimize search query for < 100ms response
2. Implement date range filtering for history
3. Add pagination to consultation history
4. Return only necessary fields from database
5. Cache common search results (optional)

DELIVERABLES:
✓ Search returns < 100ms
✓ History filtered by date range
✓ Pagination works (limit, offset)
✓ Results limited to 10 by default
✓ Responses optimized (minimal fields)

ENDPOINT ENHANCEMENTS (Already Created - Optimize):

GET /api/patients/search?q=john&limit=10
  [ALREADY EXISTS - Optimize for performance]
  Ensure:
  - Index: patients(name), patients(phone) exists
  - Query uses ILIKE (case-insensitive)
  - Returns only needed fields: id, name, age, phone, lastVisit, gender
  - Response time < 100ms
  - Limit results to 10

GET /api/patients/:id/consultations?limit=10&offset=0&from=2026-01-01&to=2026-05-31
  [ALREADY EXISTS - Enhance with date filtering]
  Response (200):
  {
    "success": true,
    "consultations": [
      {
        "id": "uuid",
        "date": "2026-05-10",
        "temperature": 101.5,
        "bp": "130/85",
        "pulse": 92,
        "diagnosis": "Viral fever...",
        "medicationCount": 2,
        "prescriptionId": "uuid"
      }
    ],
    "total": 5,
    "pages": 1
  }

DATABASE OPTIMIZATION:
- Verify index: patients(name)
- Verify index: patients(phone)
- Verify index: consultations(patient_id, created_at DESC)
- Select only needed fields (not *): id, name, age, phone, lastVisit
- Use LIMIT and OFFSET for pagination

VERIFICATION CHECKLIST:
- [ ] Search returns < 100ms (use EXPLAIN ANALYZE)
- [ ] Search returns limited results (max 10)
- [ ] History filters by date range
- [ ] Pagination works with limit/offset
- [ ] Results show correct fields
- [ ] No N+1 query issues (use JOIN, not separate queries)

NOTES:
- Use database indexes for performance
- EXPLAIN ANALYZE helps identify bottlenecks
- Consider query caching if response time still > 100ms
- Profile queries before and after optimization
```

### ✅ VERIFICATION CHECKLIST

```
BEFORE MOVING TO NEXT STEP, VERIFY:

1. Search Performance
   - [ ] GET /api/patients/search?q=john responds < 100ms
   - [ ] Search results: id, name, age, phone, lastVisit, gender
   - [ ] Limit 10 results by default
   - [ ] Can adjust with ?limit=20

2. History with Date Range
   - [ ] GET /api/patients/:id/consultations?from=2026-01-01&to=2026-05-31
   - [ ] Returns only consultations in date range
   - [ ] Fields: id, date, temp, bp, pulse, diagnosis, medicationCount

3. Pagination
   - [ ] GET /api/patients/:id/consultations?limit=10&offset=0 returns first 10
   - [ ] GET /api/patients/:id/consultations?limit=10&offset=10 returns next 10
   - [ ] Total count returned for UI pagination

TIME CHECK: Should take 1-2 hours
NEXT STEP: Step 6.2 - Frontend Patient History Page
```

---

## Step 6.2: Frontend Patient History Page

**Timeline:** 3-4 hours | **Team:** Frontend | **Day:** 14-15

### 📋 PROMPT TO EXECUTE

```
TASK: Frontend Patient History Page

GOALS:
1. Create patient history page
2. Display consultation list with date, vitals, diagnosis
3. Add date range filter
4. Expandable rows for full details
5. Quick actions (View, Print, Reuse)

DELIVERABLES:
✓ History page displays all consultations
✓ Date filter works (from/to date pickers)
✓ Expandable rows show full details
✓ Print prescription button works
✓ Reuse diagnosis suggestion works
✓ Responsive table (scroll on mobile)

COMPONENTS:

1. PatientHistoryPage
   - Title: "Patient Visit History"
   - Patient name and info
   - DateRangeFilter component
   - ConsultationTable component

2. DateRangeFilter
   - From date picker (default: 90 days ago)
   - To date picker (default: today)
   - [Filter] button
   - Clears on reset

3. ConsultationTable
   - Columns: Date | Temp | BP | Pulse | Diagnosis | Medications | Actions
   - Expandable rows (click to expand)
   - Each row shows: date, vitals, diagnosis
   - Expand to show: full complaints, full diagnosis, medications list

4. ConsultationDetail (Expanded Row)
   - Full vitals display
   - Full complaints text
   - Full diagnosis text
   - Medications list (all details)
   - [Print Prescription] button
   - [Reuse Diagnosis] button

UI FEATURES:
- Default date range: last 90 days
- Sortable table: click column header to sort
- Expandable rows: click row to expand
- Quick action buttons: Print, Reuse
- Pagination: 10 items per page with prev/next
- Loading state while filtering
- No results message if empty

VERIFICATION CHECKLIST:
- [ ] History page loads with consultations
- [ ] Date filter changes displayed consultations
- [ ] Expandable rows work (click to expand/collapse)
- [ ] Print button opens prescription page
- [ ] Reuse diagnosis pre-fills consultation form
- [ ] Pagination navigates between pages
- [ ] Responsive on mobile (scrollable table)

NOTES:
- Expandable rows use ChevronDown/ChevronUp icons
- Medications list shows name, dosage, frequency, duration
- Reuse diagnosis: copy diagnosis text to new consultation form
- Print: navigate to prescription page for consultation
- Sorting optional (by date, vitals)
```

### ✅ VERIFICATION CHECKLIST

```
BEFORE MOVING TO PHASE 7, VERIFY:

1. History Display
   - [ ] History page loads with list of consultations
   - [ ] Default date range: last 90 days
   - [ ] Consultations sorted by date (newest first)

2. Date Filter
   - [ ] From date picker works
   - [ ] To date picker works
   - [ ] [Filter] button applies dates
   - [ ] List updates with filtered data
   - [ ] [Reset] clears dates (back to 90 days)

3. Expandable Rows
   - [ ] Click row → expands to show full details
   - [ ] Shows: complaints, full diagnosis, medications list
   - [ ] Click again → collapses row
   - [ ] Can expand multiple rows

4. Actions
   - [ ] [Print Prescription] button opens prescription page
   - [ ] [Reuse Diagnosis] copies diagnosis to new consultation form
   - [ ] Actions work for each consultation

5. Pagination
   - [ ] Shows 10 items per page
   - [ ] [Previous] and [Next] buttons
   - [ ] Page indicator: "Page 1 of 5"
   - [ ] Can navigate through pages

TIME CHECK: Should take 3-4 hours
NEXT PHASE: Phase 7 - Export & Reporting (Day 16)

✅ PHASE 6 COMPLETE: Patient search and history working
```

---

# PHASE 7: EXPORT & REPORTING (Day 16)

## Step 7.1: Backend Export API (CSV & PDF)

**Timeline:** 2-3 hours | **Team:** Backend | **Day:** 16

### 📋 PROMPT TO EXECUTE

```
TASK: Backend Export API (CSV & PDF)

GOALS:
1. Create CSV export for patients
2. Create CSV export for consultations
3. Create PDF report for consultations
4. Include date range filtering
5. Generate files on-the-fly

DELIVERABLES:
✓ GET /api/exports/patients?format=csv returns CSV file
✓ GET /api/exports/consultations?format=csv returns CSV file
✓ GET /api/exports/consultations?format=pdf returns PDF report
✓ Date filtering works
✓ Files downloadable

FILES TO CREATE:
- backend/src/routes/exports.ts
- backend/src/controllers/exportController.ts
- backend/src/services/exportService.ts

API ENDPOINTS IMPLEMENTATION:

GET /api/exports/patients?format=csv&from=2026-01-01&to=2026-05-31
Headers: Authorization: Bearer <token>
Response: CSV file
Content-Type: text/csv
Content-Disposition: attachment; filename="patients_20260510.csv"

CSV Format:
Name,Age,Gender,Phone,Email,Address,Created Date
John Doe,46,M,9876543210,john@example.com,123 Main St,2025-12-01
Jane Smith,38,F,9876543211,jane@example.com,456 Oak Ave,2025-12-15

GET /api/exports/consultations?format=csv&from=2026-01-01&to=2026-05-31
Headers: Authorization: Bearer <token>
Response: CSV file
Content-Type: text/csv
Content-Disposition: attachment; filename="consultations_20260510.csv"

CSV Format:
Date,Patient,Age,Temperature,BP,Pulse,Diagnosis,Medications
2026-05-10,John Doe,46,101.5,130/85,92,Viral fever,Paracetamol - Twice daily

GET /api/exports/consultations?format=pdf&from=2026-01-01&to=2026-05-31
Headers: Authorization: Bearer <token>
Response: PDF file
Content-Type: application/pdf
Content-Disposition: attachment; filename="consultations_report_20260510.pdf"

PDF Format:
- Title: "Consultations Report"
- Date range shown: "From: 01-Jan-2026 To: 31-May-2026"
- Summary statistics: Total consultations, Average temp, etc. (optional)
- Table of consultations with all data
- Page numbers at bottom

IMPLEMENTATION:
- CSV: Use csv-stringify or similar library
- PDF: Generate HTML table, convert using puppeteer or pdfkit
- BOM for Excel compatibility: Add UTF-8 BOM to CSV
- Date filtering: from=2026-01-01, to=2026-05-31

VERIFICATION CHECKLIST:
- [ ] CSV export downloads file
- [ ] CSV has correct headers and data
- [ ] CSV opens in Excel correctly
- [ ] PDF export generates file
- [ ] PDF includes all data
- [ ] Date filtering works
- [ ] Files have proper names and timestamps

NOTES:
- Include BOM in CSV for Excel: \\uFEFF
- Properly quote strings in CSV
- PDF should be professional looking
- Include date range in report
- File naming: exports_patients_YYYYMMDD.csv
```

### ✅ VERIFICATION CHECKLIST

```
BEFORE MOVING TO NEXT STEP, VERIFY:

1. CSV Patient Export
   - [ ] GET /api/exports/patients?format=csv returns file
   - [ ] CSV opens in Excel/Google Sheets
   - [ ] Headers correct: Name, Age, Gender, Phone, Email, Address, Created Date
   - [ ] Data correct: all patients included
   - [ ] Date filtering works: ?from=2026-01-01&to=2026-05-31

2. CSV Consultation Export
   - [ ] GET /api/exports/consultations?format=csv returns file
   - [ ] CSV headers: Date, Patient, Age, Temperature, BP, Pulse, Diagnosis
   - [ ] All consultations included
   - [ ] Date range filters correctly

3. PDF Export
   - [ ] GET /api/exports/consultations?format=pdf returns PDF
   - [ ] PDF opens in reader
   - [ ] PDF has title and date range
   - [ ] PDF has table with all data
   - [ ] PDF has page numbers

TIME CHECK: Should take 2-3 hours
NEXT STEP: Step 7.2 - Frontend Export Page
```

---

## Step 7.2: Frontend Export Page

**Timeline:** 2-3 hours | **Team:** Frontend | **Day:** 16

### 📋 PROMPT TO EXECUTE

```
TASK: Frontend Export Page

GOALS:
1. Create export page with options
2. Allow selection of export type (Patients, Consultations)
3. Allow format selection (CSV, PDF)
4. Add date range filter
5. Show export progress/success message

DELIVERABLES:
✓ Export page with all options
✓ Format selection works
✓ Date range filter appears
✓ Export button triggers download
✓ Success notification shown
✓ Recently exported list shown (optional)

COMPONENTS:

1. ExportPage
   - Title: "Export Data"
   - ExportTypeSelector
   - FormatSelector
   - DateRangeFilter
   - ExportButton
   - ExportHistory (optional)

2. ExportTypeSelector
   - Radio buttons:
     ◉ Export Patients
     ○ Export Consultations
   - Shows description for each type

3. FormatSelector
   - Radio buttons:
     ◉ CSV
     ○ PDF
   - Shows preview of format

4. DateRangeFilter
   - From date picker
   - To date picker
   - Default: last 90 days

5. ExportButton
   - [Export Data] button
   - Shows loading spinner while exporting
   - Shows success message after export
   - Disables during export

6. ExportHistory (Optional)
   - List of recently exported files
   - Shows: type, format, date, download link

UI FEATURES:
- Default format: CSV
- Default type: Consultations
- Date range pre-filled (90 days back to today)
- Loading state during export
- Success/error toast notification
- File name shows in notification

VERIFICATION CHECKLIST:
- [ ] Export page displays all options
- [ ] Export type selection works
- [ ] Format selection works
- [ ] Date filter visible and works
- [ ] Export button triggers download
- [ ] Success message appears
- [ ] Downloaded file has correct name
- [ ] File contains correct data

NOTES:
- Export happens on-the-fly (generates file)
- No file stored on server (security)
- Show loading spinner (export may take 2-3 seconds)
- Notify user of success and filename
- Error handling if export fails
```

### ✅ VERIFICATION CHECKLIST

```
BEFORE MOVING TO PHASE 8, VERIFY:

1. Export Type Selection
   - [ ] Click "Export Patients" radio button
   - [ ] Description updates
   - [ ] Can switch between types

2. Format Selection
   - [ ] Click "CSV" radio button (default)
   - [ ] Click "PDF" radio button
   - [ ] Preview shows what format looks like

3. Date Filter
   - [ ] From date picker opens
   - [ ] To date picker opens
   - [ ] Default dates: 90 days ago to today
   - [ ] Can change dates

4. Export Action
   - [ ] Select: Export Consultations, CSV, last 90 days
   - [ ] Click [Export Data]
   - [ ] Loading spinner shows
   - [ ] File downloads: consultations_YYYYMMDD.csv
   - [ ] Success toast appears

5. File Validation
   - [ ] CSV opens in Excel correctly
   - [ ] All consultations included
   - [ ] Date range filtered correctly

TIME CHECK: Should take 2-3 hours
NEXT PHASE: Phase 8 - UI Polish & Responsiveness (Days 17-19)

✅ PHASE 7 COMPLETE: Export functionality working end-to-end
```

---

# PHASE 8: UI POLISH & RESPONSIVENESS (Days 17-19)

## Step 8.1: Responsive Design Implementation

**Timeline:** 2-3 hours | **Team:** Frontend | **Days:** 17

### 📋 PROMPT TO EXECUTE

```
TASK: Responsive Design Implementation

GOALS:
1. Implement mobile-first responsive layout
2. Optimize for tablet (768px - 1023px)
3. Maintain desktop experience (≥1024px)
4. Ensure 48px minimum touch targets
5. Test on various screen sizes

DELIVERABLES:
✓ Mobile layout: stacked, full-width, hamburger menu
✓ Tablet layout: optimized spacing, collapsible sidebar
✓ Desktop layout: full sidebar, multi-column
✓ All touch targets ≥48px
✓ Forms fully responsive
✓ Tables scrollable on mobile

BREAKPOINTS & CHANGES:

Mobile (< 768px):
- Hide sidebar (hamburger menu icon top-left)
- Full-width content
- Stacked form fields (1 per row)
- Single-column tables (convert to card layout)
- Larger buttons (48px height)
- Bottom sheet modals
- Full-width dialogs
- Remove decorative columns from tables

Tablet (768px - 1023px):
- Sidebar collapsible (toggle with hamburger)
- 2-column forms where appropriate
- Horizontal scrolling tables
- Optimized spacing (24px margins)
- Medium buttons (40px height)
- Modal centered on screen

Desktop (≥ 1024px):
- Sidebar visible (240px fixed, left side)
- Multi-column layouts
- Standard buttons (40px height)
- Full tables visible
- 2-3 column grids

IMPLEMENTATION:
- Use SCSS media queries (@media)
- Breakpoints: 768px (tablet), 1024px (desktop)
- Mobile-first approach (start mobile, add features for larger)
- Hamburger menu for mobile
- Touch-friendly targets: 48px minimum

VERIFICATION CHECKLIST:
- [ ] Mobile layout stacked correctly (< 768px)
- [ ] Hamburger menu works on mobile
- [ ] Buttons/inputs ≥48px on mobile
- [ ] Tables scrollable or card layout on mobile
- [ ] Tablet layout optimized (768px - 1023px)
- [ ] Desktop layout unchanged (≥1024px)
- [ ] All pages responsive
- [ ] No overflow/horizontal scrolling issues

NOTES:
- Test on real devices: iPhone, iPad, Desktop
- Chrome DevTools mobile emulation
- Test orientation changes (portrait/landscape)
- Touch targets properly spaced (no accidental clicks)
```

### ✅ VERIFICATION CHECKLIST

```
BEFORE MOVING TO NEXT STEP, VERIFY:

1. Mobile (< 768px)
   - [ ] Layout stacked vertically
   - [ ] Sidebar hidden (hamburger menu visible)
   - [ ] Forms: one field per row
   - [ ] Buttons ≥48px height
   - [ ] Tables: scrollable horizontally OR card layout
   - [ ] No horizontal scroll except tables

2. Tablet (768px - 1023px)
   - [ ] Sidebar collapsible (hamburger toggle)
   - [ ] Content spans remaining width
   - [ ] Buttons ≥40px height
   - [ ] Tables visible with horizontal scroll
   - [ ] Spacing optimized for tablet

3. Desktop (≥1024px)
   - [ ] Sidebar visible (240px fixed)
   - [ ] Content area flexible
   - [ ] Multi-column layouts active
   - [ ] All tables visible
   - [ ] Buttons 40px height

4. Touch Targets
   - [ ] All buttons ≥48px height on mobile
   - [ ] All inputs ≥48px height on mobile
   - [ ] Proper spacing between targets (8px minimum)
   - [ ] No accidental click issues

5. Device Testing
   - [ ] Tested on iPhone/Android (Chrome DevTools)
   - [ ] Tested on iPad/Tablet
   - [ ] Tested on desktop (1024px, 1440px, 2560px)
   - [ ] Landscape and portrait modes work

TIME CHECK: Should take 2-3 hours
NEXT STEP: Step 8.2 - Accessibility Audit & WCAG AA Compliance
```

---

## Step 8.2: Accessibility Audit & WCAG AA Compliance

**Timeline:** 2 hours | **Team:** Frontend | **Day:** 17-18

### 📋 PROMPT TO EXECUTE

```
TASK: Accessibility Audit & WCAG AA Compliance

GOALS:
1. Ensure 4.5:1 color contrast (normal text)
2. All interactive elements keyboard accessible
3. Proper heading hierarchy
4. Form labels associated with inputs
5. ARIA labels where needed

DELIVERABLES:
✓ Color contrast fixed (4.5:1 minimum)
✓ Tab order logical
✓ Skip links to main content
✓ Focus indicators visible
✓ Form labels properly associated
✓ Semantic HTML used
✓ Images have alt text
✓ ARIA live regions for notifications

ACCESSIBILITY CHECKLIST:

Color Contrast:
- [ ] Body text vs background: 4.5:1 minimum
- [ ] Large text (18px+) vs background: 3:1 minimum
- [ ] Buttons vs background: 3:1 minimum
- [ ] Use axe DevTools or Lighthouse to verify
- [ ] Fix: Increase font weight, adjust colors

Keyboard Navigation:
- [ ] Tab through all interactive elements
- [ ] Logical tab order (left-to-right, top-to-bottom)
- [ ] Escape closes modals/dropdowns
- [ ] Enter submits forms
- [ ] Focus visible (outline or background change)
- [ ] No focus trap (can escape all elements)

Semantic HTML:
- [ ] Use <h1>, <h2>, <h3> for headings (not <div>)
- [ ] Use <button> for buttons (not <div> or <a>)
- [ ] Use <label> for form labels (linked with <input>)
- [ ] Use <table> with <thead> for data tables
- [ ] Use <nav> for navigation
- [ ] Use <form> for forms
- [ ] Use <section>, <article>, <aside> for structure

Screen Reader Support (Test with NVDA or JAWS):
- [ ] Form inputs have associated labels (<label for="id">)
- [ ] Buttons have descriptive text (not "Click here")
- [ ] Icon buttons have ARIA labels (aria-label="...")
- [ ] Links have descriptive text (not "Read more")
- [ ] Images have alt text (alt="description")
- [ ] Live regions for notifications (aria-live="polite")
- [ ] Form errors announced (role="alert")

IMPLEMENTATION STEPS:
1. Run Lighthouse Accessibility audit (Chrome DevTools)
2. Fix color contrast: adjust colors, fonts, weights
3. Fix heading hierarchy: ensure h1 → h2 → h3
4. Associate form labels: <label for="inputId">
5. Add ARIA labels: aria-label, aria-labelledby
6. Test keyboard navigation: Tab, Shift+Tab, Enter, Escape
7. Test screen reader: ChromeVox, JAWS, or NVDA

VERIFICATION CHECKLIST:
- [ ] Color contrast 4.5:1 for all text
- [ ] All interactive elements keyboard accessible
- [ ] Tab order logical (no jumps)
- [ ] Focus indicator always visible
- [ ] Form labels associated with inputs
- [ ] Icon buttons have ARIA labels
- [ ] Headings use semantic tags
- [ ] Lighthouse accessibility score ≥90

NOTES:
- Lighthouse target: ≥90 accessibility score
- axe DevTools: https://www.deque.com/axe/devtools/
- WCAG 2.1 Level A is minimum
- Level AA is recommended (WCAG AA)
- Test with actual screen readers for best results
```

### ✅ VERIFICATION CHECKLIST

```
BEFORE MOVING TO NEXT STEP, VERIFY:

1. Color Contrast (Use Lighthouse or axe)
   - [ ] Body text vs background: 4.5:1
   - [ ] Button text vs background: 4.5:1 or 3:1
   - [ ] Focus indicators visible
   - [ ] No color-only indicators (use icons + text)

2. Keyboard Navigation
   - [ ] Tab navigates through all interactive elements
   - [ ] Shift+Tab goes backward
   - [ ] Enter activates buttons/submits forms
   - [ ] Escape closes modals/dropdowns
   - [ ] Focus indicator always visible (not just outline)

3. Semantic HTML
   - [ ] Run semantic check: elements use proper tags
   - [ ] Headings: h1, h2, h3 (not skipped)
   - [ ] Forms: <form>, <label>, <input>
   - [ ] Buttons: <button> tags

4. Screen Reader Test
   - [ ] Enable ChromeVox (Chrome)
   - [ ] Navigate page with screen reader
   - [ ] All text read correctly
   - [ ] Form labels announced
   - [ ] Links have descriptive text
   - [ ] Button purposes clear

5. Lighthouse Audit
   - [ ] Run Lighthouse accessibility audit
   - [ ] Score ≥90
   - [ ] Fix any remaining issues

TIME CHECK: Should take 2 hours
NEXT STEP: Step 8.3 - Performance Optimization
```

---

## Step 8.3: Performance Optimization

**Timeline:** 2-3 hours | **Team:** Frontend/Backend | **Day:** 18-19

### 📋 PROMPT TO EXECUTE

```
TASK: Performance Optimization

GOALS:
1. Achieve < 2 second page load
2. First Contentful Paint < 1.5s
3. Largest Contentful Paint < 2.5s
4. Cumulative Layout Shift < 0.1
5. Time to Interactive < 3.5s

DELIVERABLES:
✓ Lighthouse Performance score ≥85
✓ Page load < 2 seconds
✓ FCP < 1.5 seconds
✓ LCP < 2.5 seconds
✓ CLS < 0.1
✓ TTI < 3.5 seconds

PERFORMANCE OPTIMIZATIONS:

Frontend:
- Code splitting: React.lazy for pages (reduce initial bundle)
- Lazy load images: use Intersection Observer API
- CSS minification: Vite does this automatically
- JS minification: Vite does this automatically
- Remove unused CSS: tree-shake unused styles
- Remove unused JS: webpack-bundle-analyzer
- Preload critical assets: fonts, CSS
- Service worker: cache static assets

Backend:
- Database query optimization: use EXPLAIN ANALYZE
- API response caching: cache headers
- Gzip compression: enable on server
- CDN for static assets: images, CSS, JS
- Connection pooling: reuse DB connections

METRICS TO TRACK:
- Lighthouse score (≥85 = good)
- Page load time (< 2s)
- First Contentful Paint (< 1.5s)
- Largest Contentful Paint (< 2.5s)
- Cumulative Layout Shift (< 0.1)
- Time to Interactive (< 3.5s)

IMPLEMENTATION STEPS:

1. Run Lighthouse audit (Chrome DevTools → Lighthouse)
2. Code splitting:
   - Use React.lazy() for pages
   - Wrap with Suspense component
   - Show loading spinner while loading

3. Lazy load images:
   - Use loading="lazy" attribute
   - Or: Intersection Observer API
   - Defer non-critical images

4. Optimize bundles:
   - webpack-bundle-analyzer (if using webpack)
   - Remove unused dependencies
   - Use tree-shake friendly libraries

5. Database optimization:
   - EXPLAIN ANALYZE SELECT ...
   - Verify indexes used
   - Remove N+1 queries

6. Caching:
   - Cache-Control headers: public, max-age=31536000
   - Set-Cookie HttpOnly flags
   - API response caching

7. Compression:
   - Enable gzip on Express: npm install compression
   - app.use(compression())

VERIFICATION CHECKLIST:
- [ ] Lighthouse Performance score ≥85
- [ ] Page load < 2 seconds
- [ ] FCP < 1.5s
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] TTI < 3.5s
- [ ] Search endpoint < 100ms

NOTES:
- Use Chrome DevTools Performance tab to identify bottlenecks
- Use Lighthouse for quick audit
- Profile with real 4G throttling
- Test on actual mobile device (slower than desktop)
- Benchmark before and after optimizations
```

### ✅ VERIFICATION CHECKLIST

```
BEFORE MOVING TO PHASE 9, VERIFY:

1. Lighthouse Audit
   - [ ] Run Lighthouse (DevTools → Lighthouse → Performance)
   - [ ] Performance score ≥85
   - [ ] Fix any low-hanging fruit (images, fonts, unused CSS)

2. Page Load Metrics
   - [ ] Page load time < 2 seconds
   - [ ] FCP < 1.5 seconds
   - [ ] LCP < 2.5 seconds
   - [ ] CLS < 0.1 (no layout shifts)
   - [ ] TTI < 3.5 seconds

3. API Performance
   - [ ] Search endpoint < 100ms
   - [ ] Patient list < 500ms
   - [ ] Consultation save < 1 second

4. Bundle Size
   - [ ] Initial JS bundle < 200KB (gzipped)
   - [ ] CSS < 50KB (gzipped)
   - [ ] No large unused libraries

5. Images
   - [ ] Images lazy loaded or deferred
   - [ ] Image sizes optimized
   - [ ] Format suitable (WebP where possible)

TIME CHECK: Should take 2-3 hours
NEXT PHASE: Phase 9 - Testing & QA (Days 20-21)

✅ PHASE 8 COMPLETE: UI polished, accessible, and performant
```

---

# PHASE 9: TESTING & QA (Days 20-21)

## Step 9.1: Unit & Integration Tests

**Timeline:** 3-4 hours | **Team:** Backend/Frontend | **Day:** 20

### 📋 PROMPT TO EXECUTE

```
TASK: Unit & Integration Testing

GOALS:
1. Write unit tests for services and utilities
2. Write integration tests for API routes
3. Write component tests for React components
4. Achieve ≥80% code coverage
5. Run tests in CI/CD pipeline

DELIVERABLES:
✓ Unit tests for all services
✓ Integration tests for all routes
✓ Component tests for key components
✓ Code coverage ≥80%
✓ All tests passing
✓ Test suite runs < 5 minutes

BACKEND TESTS (Jest + Supertest):

Unit Tests to Write:
- authService.login() → success, invalid credentials, user not found
- patientService.createPatient() → valid data, duplicate phone
- appointmentService.scheduleAppointment() → success, double-booking, past date
- consultationService.createConsultation() → success, validate vitals
- validationFunctions() → email format, phone format, DOB

Integration Tests to Write:
- POST /api/auth/login (success, failure, invalid credentials)
- POST /api/patients (success, validation errors, duplicate)
- GET /api/patients/search (typeahead, performance < 100ms)
- POST /api/appointments (success, double-booking 409)
- POST /api/consultations (success, validate vitals)
- GET /api/prescriptions/:id/print (PDF generation)

FRONTEND TESTS (Jest + React Testing Library):

Component Tests:
- LoginForm: renders, validation, submission, error display
- PatientSearchPage: search input, results display, navigation
- ConsultationForm: all sections render, validation, medication add/remove
- PrescriptionTemplate: all fields display correctly

Hook Tests:
- useAuth: login, logout, refresh token
- useFetch: loading, error, success states
- useDebounce: debounce delay

Service Tests:
- API service: interceptors, error handling, retry logic
- Patient service: API calls, data transformation

IMPLEMENTATION:
- Test files: __tests__/ or .test.ts/.test.tsx
- Run: npm test (watches changes)
- Coverage: npm test -- --coverage
- CI: add to GitHub Actions or similar

VERIFICATION CHECKLIST:
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] All component tests passing
- [ ] Coverage ≥80% (backend services, frontend components)
- [ ] Test suite runs < 5 minutes
- [ ] No flaky tests (run 3x, all pass)

NOTES:
- Mock external APIs (don't make real calls in tests)
- Use fixtures for test data
- Test both happy path and error cases
- Aim for 90%+ coverage on critical code
- 80%+ coverage on overall
```

### ✅ VERIFICATION CHECKLIST

```
BEFORE MOVING TO NEXT STEP, VERIFY:

1. Unit Tests
   - [ ] npm test passes all unit tests
   - [ ] Services tested: auth, patient, appointment, consultation
   - [ ] Validation functions tested
   - [ ] All tests passing (no skips)

2. Integration Tests
   - [ ] API routes tested end-to-end
   - [ ] Success paths tested
   - [ ] Error paths tested (400, 404, 409, 401)
   - [ ] All tests passing

3. Frontend Component Tests
   - [ ] LoginForm tests passing
   - [ ] PatientSearchPage tests passing
   - [ ] ConsultationForm tests passing
   - [ ] Form validation tested

4. Coverage Report
   - [ ] npm test -- --coverage generates report
   - [ ] Backend services: ≥90% coverage
   - [ ] Frontend components: ≥80% coverage
   - [ ] Overall: ≥80% coverage

5. Test Suite Performance
   - [ ] Tests run < 5 minutes
   - [ ] No timeout issues
   - [ ] No memory leaks

TIME CHECK: Should take 3-4 hours
NEXT STEP: Step 9.2 - End-to-End Testing
```

---

## Step 9.2: End-to-End Testing

**Timeline:** 3-4 hours | **Team:** QA | **Day:** 20-21

### 📋 PROMPT TO EXECUTE

```
TASK: End-to-End Testing (Cypress/Playwright)

GOALS:
1. Test critical user flows
2. Test across multiple browsers
3. Test responsive design
4. Verify no broken links/API calls
5. Performance testing

DELIVERABLES:
✓ E2E tests for all major flows
✓ Tests pass on Chrome, Firefox, Safari
✓ Test data setup automated
✓ All tests passing
✓ E2E suite runs < 15 minutes

CRITICAL USER FLOWS TO TEST:

1. Login Flow:
   - [ ] Navigate to login page
   - [ ] Enter credentials
   - [ ] Click login
   - [ ] Verify redirect to dashboard
   - [ ] Verify username in header

2. Patient Management:
   - [ ] Search for patient
   - [ ] View patient profile
   - [ ] Edit patient
   - [ ] Create new patient
   - [ ] Verify in search

3. Appointment Scheduling:
   - [ ] View dashboard appointments
   - [ ] Click "New Appointment"
   - [ ] Select patient
   - [ ] Select date/time
   - [ ] Save appointment
   - [ ] Verify in daily list

4. Consultation (Core Feature):
   - [ ] Click "Start Consultation"
   - [ ] Enter vitals
   - [ ] Enter diagnosis and complaints
   - [ ] Add medications
   - [ ] Save consultation
   - [ ] Verify prescription generated

5. Prescription:
   - [ ] View prescription
   - [ ] Click print
   - [ ] Print dialog opens
   - [ ] Click download
   - [ ] PDF downloads

6. Patient History:
   - [ ] Open patient history
   - [ ] Filter by date range
   - [ ] Expand consultation
   - [ ] Verify details

7. Export:
   - [ ] Select export type
   - [ ] Select format
   - [ ] Click export
   - [ ] File downloads

IMPLEMENTATION (Cypress):

Installation:
npm install --save-dev cypress

Create tests:
cypress/e2e/login.cy.ts
cypress/e2e/patient.cy.ts
cypress/e2e/consultation.cy.ts
cypress/e2e/export.cy.ts

Run tests:
npm run cypress:open (interactive)
npm run cypress:run (headless)

Test data setup:
- Use beforeEach() to seed test data
- Reset database between tests
- Create test user and patients

VERIFICATION CHECKLIST:
- [ ] Login flow passes
- [ ] Patient search passes
- [ ] Patient create passes
- [ ] Appointment scheduling passes
- [ ] Consultation complete passes
- [ ] Prescription generation passes
- [ ] Export functionality passes
- [ ] Tests pass on Chrome, Firefox, Safari
- [ ] Tests run < 15 minutes

NOTES:
- Run tests in headless mode for CI
- Use fixtures for test data
- Screenshot on failure (help with debugging)
- Don't test implementation details (test user behavior)
- Wait for elements (async operations)
```

### ✅ VERIFICATION CHECKLIST

```
BEFORE MOVING TO NEXT STEP, VERIFY:

1. Test Setup
   - [ ] Cypress installed
   - [ ] Test files created in cypress/e2e/
   - [ ] Test database configured

2. Login Flow Test
   - [ ] Test passes for valid credentials
   - [ ] Test passes for invalid credentials
   - [ ] Redirect to dashboard verified

3. Patient Management Tests
   - [ ] Search test passes
   - [ ] Profile test passes
   - [ ] Edit test passes
   - [ ] Create test passes

4. Consultation Flow Test
   - [ ] Consultation form loads
   - [ ] Vitals entered and saved
   - [ ] Medications added
   - [ ] Consultation saved
   - [ ] Prescription appears

5. Cross-Browser Testing
   - [ ] Tests pass on Chrome
   - [ ] Tests pass on Firefox
   - [ ] Tests pass on Safari (if available)

6. Test Execution
   - [ ] All E2E tests passing
   - [ ] Suite runs < 15 minutes
   - [ ] No flaky tests (run 2x, both pass)

TIME CHECK: Should take 3-4 hours
NEXT STEP: Step 9.3 - Security Audit
```

---

## Step 9.3: Security Audit

**Timeline:** 2-3 hours | **Team:** Backend/DevOps | **Day:** 21

### 📋 PROMPT TO EXECUTE

```
TASK: Security Audit & Hardening

GOALS:
1. Check OWASP Top 10 vulnerabilities
2. Verify SQL injection prevention
3. Verify XSS prevention
4. Verify CSRF protection
5. Test authentication/authorization
6. Verify data encryption

DELIVERABLES:
✓ No SQL injection vulnerabilities
✓ No XSS vulnerabilities
✓ CSRF tokens implemented (if applicable)
✓ Authentication enforced on all protected routes
✓ Authorization (user can only access own data)
✓ Sensitive data encrypted (passwords, tokens)
✓ HTTPS enforced
✓ Security headers set

OWASP TOP 10 CHECKS:

1. Broken Authentication:
   - [ ] Passwords hashed with bcrypt (not plaintext)
   - [ ] JWT tokens properly validated
   - [ ] Session timeout implemented (8 hours)
   - [ ] No hardcoded credentials in code

2. Sensitive Data Exposure:
   - [ ] HTTPS enforced (no HTTP)
   - [ ] Passwords hashed with bcrypt
   - [ ] Tokens in HttpOnly cookies (secure)
   - [ ] PII not logged (no passwords in logs)
   - [ ] Secrets in .env files (not in code)

3. SQL Injection:
   - [ ] Parameterized queries used
   - [ ] No string concatenation in SQL
   - [ ] Input validation on all endpoints
   - [ ] Test with payload: '; DROP TABLE users; --

4. Cross-Site Scripting (XSS):
   - [ ] User input sanitized
   - [ ] React escapes by default (use JSX)
   - [ ] No dangerouslySetInnerHTML in components
   - [ ] Content-Security-Policy header set
   - [ ] Test with payload: <script>alert('xss')</script>

5. Broken Access Control:
   - [ ] Authentication required on protected routes
   - [ ] Users can only access own data
   - [ ] Test: modify userId in request → 403
   - [ ] Role-based access if applicable

6. Security Configuration:
   - [ ] Security headers set (Content-Security-Policy, X-Frame-Options, etc.)
   - [ ] CORS properly configured (only trusted origins)
   - [ ] HTTPS certificates valid
   - [ ] Dependencies up-to-date (npm audit)

IMPLEMENTATION STEPS:

1. Check Headers:
   curl -I https://api.clinic.com/health
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: DENY
   - Content-Security-Policy: ...
   - Strict-Transport-Security: ...

2. Test SQL Injection:
   POST /api/patients
   {"name": "'; DROP TABLE patients; --"}
   → Should return error, not drop table

3. Test XSS:
   POST /api/patients
   {"name": "<script>alert('xss')</script>"}
   → Should escape HTML, not execute

4. Test Authorization:
   GET /api/patients/:id
   → With different user's token
   → Should return 403 Forbidden

5. Dependency Check:
   npm audit
   → Fix any high/critical vulnerabilities

VERIFICATION CHECKLIST:
- [ ] No SQL injection found (test payloads)
- [ ] No XSS found (test payloads)
- [ ] Authentication required on protected routes
- [ ] Authorization enforced (can't access others' data)
- [ ] Passwords hashed (not stored plaintext)
- [ ] HTTPS configured
- [ ] Security headers set
- [ ] CORS configured properly
- [ ] npm audit: no high/critical vulnerabilities

NOTES:
- Use OWASP ZAP or Burp Suite for comprehensive testing
- Test with real security testing tools
- Keep dependencies updated
- Rotate secrets regularly
- Use environment variables for sensitive data
```

### ✅ VERIFICATION CHECKLIST

```
BEFORE MOVING TO PHASE 10, VERIFY:

1. SQL Injection Testing
   - [ ] Test: '; DROP TABLE users; --
   - [ ] Database unchanged (not executed)
   - [ ] Error response returned

2. XSS Testing
   - [ ] Test: <script>alert('xss')</script>
   - [ ] HTML escaped (not executed)
   - [ ] Displayed as text: &lt;script&gt;...

3. Authentication
   - [ ] Try accessing protected routes without token
   - [ ] Returns 401 Unauthorized
   - [ ] With valid token → access granted

4. Authorization
   - [ ] Login as Patient A
   - [ ] Try accessing Patient B's data
   - [ ] Returns 403 Forbidden

5. Password Hashing
   - [ ] SELECT password_hash FROM users;
   - [ ] Passwords are bcrypt hashes (not plaintext)
   - [ ] Hashes start with $2b$

6. HTTPS & Headers
   - [ ] curl -I https://api.clinic.com/health
   - [ ] Has X-Frame-Options, CSP, HSTS headers
   - [ ] No HTTP (redirect to HTTPS)

7. Dependencies
   - [ ] npm audit
   - [ ] No high/critical vulnerabilities
   - [ ] All packages up-to-date

TIME CHECK: Should take 2-3 hours
NEXT PHASE: Phase 10 - Deployment (Day 22)

✅ PHASE 9 COMPLETE: Full test coverage and security hardened
```

---

# PHASE 10: DEPLOYMENT (Day 22)

## Step 10.1: Docker & Environment Setup

**Timeline:** 2 hours | **Team:** DevOps | **Day:** 22

### 📋 PROMPT TO EXECUTE

```
TASK: Docker & Environment Configuration

GOALS:
1. Create Dockerfile for backend
2. Create Dockerfile for frontend
3. Create docker-compose for local development
4. Set up environment variables for different stages
5. Prepare for cloud deployment

DELIVERABLES:
✓ Docker images build successfully
✓ docker-compose runs entire stack
✓ Environment variables configured
✓ Health checks configured
✓ Volumes set up for data persistence
✓ Network configured for service communication

FILES TO CREATE:
- docker/Dockerfile.backend
- docker/Dockerfile.frontend
- docker-compose.yml
- nginx.conf (for frontend)
- .env.staging
- .env.production
- docker/.dockerignore

DOCKER SETUP:

Dockerfile.backend:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/src ./src
COPY backend/tsconfig.json ./
RUN npm run build
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5000/health || exit 1
CMD ["node", "dist/index.js"]
```

Dockerfile.frontend:
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1
CMD ["nginx", "-g", "daemon off;"]
```

docker-compose.yml:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: doc_patient_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: .
      dockerfile: docker/Dockerfile.backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/doc_patient_db
      NODE_ENV: development
      JWT_SECRET: dev_secret_key
    depends_on:
      - postgres
    volumes:
      - ./backend/src:/app/src

  frontend:
    build:
      context: .
      dockerfile: docker/Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      VITE_API_BASE_URL: http://localhost:5000/api
    depends_on:
      - backend

volumes:
  postgres_data:
```

ENVIRONMENT VARIABLES:

.env.development (local):
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/doc_patient_db
API_PORT=5000
JWT_SECRET=dev_secret_key_change_in_production
VITE_API_BASE_URL=http://localhost:5000/api

.env.staging:
NODE_ENV=staging
DATABASE_URL=postgresql://user:pass@staging-db:5432/clinic_db
API_PORT=5000
JWT_SECRET=<generate_random_secret>
VITE_API_BASE_URL=https://staging-api.clinic.com/api

.env.production:
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db:5432/clinic_db
API_PORT=5000
JWT_SECRET=<generate_random_secret>
CORS_ORIGIN=https://clinic.example.com
VITE_API_BASE_URL=https://api.clinic.example.com/api

VERIFICATION CHECKLIST:
- [ ] Backend Dockerfile builds
- [ ] Frontend Dockerfile builds
- [ ] docker-compose up starts all services
- [ ] PostgreSQL starts and is accessible
- [ ] Backend starts and health check passes
- [ ] Frontend builds and serves
- [ ] Services communicate (backend can query DB)

NOTES:
- Environment secrets should be rotated in production
- Use strong random strings for JWT_SECRET
- Database credentials should be complex
- Never commit production .env files
```

### ✅ VERIFICATION CHECKLIST

```
BEFORE MOVING TO NEXT STEP, VERIFY:

1. Docker Build
   - [ ] docker build -f docker/Dockerfile.backend -t app-backend .
   - [ ] Backend image builds without errors
   - [ ] docker build -f docker/Dockerfile.frontend -t app-frontend .
   - [ ] Frontend image builds without errors

2. docker-compose
   - [ ] docker-compose up -d
   - [ ] docker-compose ps shows all 3 services (postgres, backend, frontend)
   - [ ] All services show "running" status
   - [ ] No obvious error logs

3. Service Communication
   - [ ] curl http://localhost:5000/health returns JSON
   - [ ] curl http://localhost:3000 returns HTML
   - [ ] Backend can connect to PostgreSQL
   - [ ] No connection errors in logs

4. Cleanup
   - [ ] docker-compose down stops services
   - [ ] docker-compose up again works (idempotent)

TIME CHECK: Should take 2 hours
NEXT STEP: Step 10.2 - Database Migrations & Seeding
```

---

## Step 10.2: Database Migrations & Seeding

**Timeline:** 1-2 hours | **Team:** DevOps/Backend | **Day:** 22

### 📋 PROMPT TO EXECUTE

```
TASK: Database Migrations & Seeding

GOALS:
1. Create migration script for schema
2. Create seeding script for test data
3. Set up backup automation
4. Test migration on fresh database

DELIVERABLES:
✓ Migration script creates all tables
✓ Seed script creates test data
✓ Backup script automated
✓ Schema version tracking
✓ Rollback capability (if needed)

FILES TO CREATE:
- backend/database/migrations/001_init_schema.sql
- backend/database/seeds/seed.ts
- backup.sh (daily backup automation)

MIGRATION SCRIPT (001_init_schema.sql):
[Contains all CREATE TABLE, INDEX statements from Implementation_Document.md Section 3]

SEED SCRIPT (seed.ts):
```typescript
import { pool } from '../config/database';

export async function seed() {
  // Create 1 test user
  await pool.query(`
    INSERT INTO users (username, email, password_hash, name)
    VALUES ('doctor', 'doctor@clinic.com', '$2b$10$...', 'Dr. Admin')
  `);

  // Create 10 test patients
  for (let i = 1; i <= 10; i++) {
    await pool.query(`
      INSERT INTO patients (name, dob, gender, phone, email, address)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      `Patient ${i}`,
      `1980-0${(i % 9) + 1}-15`,
      i % 2 === 0 ? 'M' : 'F',
      `987654321${i}`,
      `patient${i}@example.com`,
      `${i} Main St`
    ]);
  }

  // Create 20 test appointments
  // Create 5 test consultations with medications
  // Create 5 test prescriptions

  console.log('Database seeded successfully!');
}
```

BACKUP SCRIPT (backup.sh):
```bash
#!/bin/bash
BACKUP_DIR="/backups/clinic"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="doc_patient_db"

mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U postgres $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 30 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/backup_$DATE.sql.gz"
```

DEPLOYMENT STEPS:

1. Run migration:
   npm run migrate

2. Seed test data:
   npm run seed

3. Verify schema:
   psql -U postgres -d doc_patient_db -c "\\dt"

VERIFICATION CHECKLIST:
- [ ] Migration creates all tables
- [ ] All indexes created
- [ ] Foreign keys work
- [ ] Seed script creates test data
- [ ] Backup script runs
- [ ] Backup file created (check size > 0)
- [ ] Data can be restored from backup

NOTES:
- Keep migrations in version control
- Each migration file numbered (001_, 002_, etc.)
- Never modify old migration files
- Test migrations before production
- Automated backups should run daily
```

### ✅ VERIFICATION CHECKLIST

```
BEFORE MOVING TO NEXT STEP, VERIFY:

1. Migration Execution
   - [ ] npm run migrate completes without errors
   - [ ] All 7 tables created in database
   - [ ] All indexes created

2. Schema Verification
   - [ ] psql -U postgres -d doc_patient_db
   - [ ] \\dt shows all 7 tables
   - [ ] \\di shows all indexes
   - [ ] Foreign keys present

3. Seed Data
   - [ ] npm run seed completes
   - [ ] 1 test user created
   - [ ] 10 test patients created
   - [ ] Test appointments created
   - [ ] Test consultations created

4. Backup
   - [ ] bash backup.sh runs
   - [ ] Backup file created in /backups/clinic/
   - [ ] File size > 0 KB
   - [ ] Can restore from backup

TIME CHECK: Should take 1-2 hours
NEXT STEP: Step 10.3 - Deployment Process
```

---

## Step 10.3: Deployment Process

**Timeline:** 2-3 hours | **Team:** DevOps | **Day:** 22

### 📋 PROMPT TO EXECUTE

```
TASK: Deployment to Production

GOALS:
1. Deploy to cloud platform (AWS/Azure)
2. Set up CI/CD pipeline
3. Configure monitoring and logging
4. Document rollback procedure
5. Verify production health

DELIVERABLES:
✓ App deployed to cloud
✓ CI/CD pipeline configured
✓ Monitoring alerts set up
✓ Logging configured
✓ Rollback procedure documented
✓ Health checks passing

DEPLOYMENT CHECKLIST:

Pre-Deployment (48 hours before):
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code reviewed and approved
- [ ] Security audit passed
- [ ] Database backup taken
- [ ] Migration tested on staging
- [ ] Performance load test passed
- [ ] Rollback plan documented
- [ ] Team on-call scheduled

Deployment Day (Low-traffic hours):
- [ ] Scheduled during 2-4 AM
- [ ] Create pre-deployment backup
- [ ] Deploy backend (zero-downtime)
- [ ] Run database migrations
- [ ] Deploy frontend
- [ ] Run smoke tests
- [ ] Verify health checks
- [ ] Monitor error logs (1 hour)
- [ ] Team on standby

Post-Deployment (24 hours):
- [ ] Monitor error rates and performance
- [ ] Check user feedback
- [ ] Monitor database performance
- [ ] Verify backups running
- [ ] Document lessons learned

CI/CD PIPELINE (GitHub Actions):

.github/workflows/deploy.yml:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run lint
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build Docker images
        run: |
          docker build -f docker/Dockerfile.backend -t app-backend:latest .
          docker build -f docker/Dockerfile.frontend -t app-frontend:latest .
      - name: Push to container registry
        run: |
          docker push app-backend:latest
          docker push app-frontend:latest
      - name: Deploy to cloud
        run: |
          # Deploy commands (AWS ECS, Azure Container Instances, etc.)
          aws ecs update-service --cluster production --service clinic-app --force-new-deployment
```

MONITORING & LOGGING:

Application Logs:
- All errors logged with timestamp
- Request/response logging
- Performance metrics logged

Error Monitoring:
- Set up error tracking (Sentry, LogRocket)
- Alert on errors > threshold
- Alert on 5xx status codes

Performance Monitoring:
- API response time monitoring
- Database query performance
- Error rate alerting (> 1%)

Logging Setup:
```javascript
// backend/config/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

ROLLBACK PROCEDURE:

If critical error in production:
1. Revert to previous Docker image:
   ```bash
   aws ecs update-service --cluster production --service clinic-app \\
     --force-new-deployment --task-definition clinic-app:PREVIOUS_VERSION
   ```

2. Run migrations rollback (if applicable):
   ```bash
   npm run migrate:rollback
   ```

3. Restore from backup (if needed):
   ```bash
   psql -U postgres -d doc_patient_db < backup_20260510_145000.sql
   ```

4. Verify health checks:
   ```bash
   curl https://api.clinic.com/health
   ```

5. Clear caches (if applicable):
   ```bash
   redis-cli FLUSHALL
   ```

6. Monitor for recovery (1 hour minimum)

VERIFICATION CHECKLIST:
- [ ] App deployed to cloud
- [ ] Health checks passing (200 response)
- [ ] API endpoints responding
- [ ] Frontend loading at domain
- [ ] Database connected and queries working
- [ ] Monitoring alerts active
- [ ] Logging working (errors visible in logs)
- [ ] Backups running (check last backup timestamp)
- [ ] SSL/HTTPS working (no warnings)
- [ ] Performance metrics normal (< 2s response time)

NOTES:
- Zero-downtime deployment: use load balancer with multiple instances
- Rolling deployment: update one instance at a time
- Blue-green deployment: run two environments, switch traffic
- Database migrations: must be backward compatible
- Secrets: use secret management (AWS Secrets Manager, Azure Key Vault)
- Monitoring: set up alerts for critical issues
```

### ✅ VERIFICATION CHECKLIST

```
BEFORE COMPLETING IMPLEMENTATION, VERIFY:

1. Pre-Deployment
   - [ ] All tests passing (npm test)
   - [ ] Code reviewed
   - [ ] Security audit passed
   - [ ] Backup created and tested

2. Deployment Success
   - [ ] App deployed successfully
   - [ ] No errors during deployment
   - [ ] Deployment completed in < 30 minutes

3. Health Checks
   - [ ] GET /health returns 200 with JSON
   - [ ] Login works
   - [ ] Can search patients
   - [ ] Can create appointment
   - [ ] Can save consultation

4. Monitoring
   - [ ] Error logs visible (0 errors expected)
   - [ ] Performance metrics normal (< 2s)
   - [ ] API response times < 500ms
   - [ ] Database queries < 100ms (search)

5. Backups
   - [ ] Backup created today
   - [ ] Backup file size > 1MB
   - [ ] Can restore from backup (tested)

6. Final Verification
   - [ ] Doctor can login
   - [ ] Can complete full consultation workflow
   - [ ] Can print prescription
   - [ ] Can export data
   - [ ] All pages responsive
   - [ ] No console errors

TIME CHECK: Should take 2-3 hours (plus ongoing monitoring)
✅ IMPLEMENTATION COMPLETE - ALL PHASES DONE!
```

---

# 📊 FINAL CHECKLIST - IMPLEMENTATION COMPLETE

## Overall Status

- ✅ Phase 1: Project Setup (Days 1-2) - Backend, Frontend, Database
- ✅ Phase 2: Authentication (Days 3-4) - Login, JWT, Protected Routes
- ✅ Phase 3: Patient Management (Days 5-7) - CRUD, Search, UI
- ✅ Phase 4: Appointments (Days 8-9) - Scheduling, Status, List
- ✅ Phase 5: Consultations (Days 10-13) - Vitals, Medications, Prescriptions
- ✅ Phase 6: Search & History (Days 14-15) - Typeahead, History, Filters
- ✅ Phase 7: Export (Day 16) - CSV, PDF, Reports
- ✅ Phase 8: UI Polish (Days 17-19) - Responsive, Accessible, Performance
- ✅ Phase 9: Testing & QA (Days 20-21) - Unit, E2E, Security
- ✅ Phase 10: Deployment (Day 22) - Docker, CI/CD, Production

## Success Metrics Achieved

- ✅ All features implemented per BRD
- ✅ Test coverage ≥80%
- ✅ Page load < 2 seconds
- ✅ Search < 100ms
- ✅ Consultation completed < 3 minutes
- ✅ WCAG AA compliant (accessibility)
- ✅ All tests passing
- ✅ Deployed to production
- ✅ Monitoring and logging active
- ✅ Documentation complete

**Total Timeline:** 22 days  
**Total Hours:** ~200 hours  
**Start Date:** May 8, 2026  
**End Date:** May 29, 2026  

---

**Document Version:** 1.0  
**Last Updated:** May 7, 2026  
**Status:** READY FOR EXECUTION
