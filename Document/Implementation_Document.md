# Implementation Document: Patient Management Application

**Document Version:** 1.0  
**Date Created:** May 5, 2026  
**Status:** READY FOR DEVELOPMENT  
**Audience:** Development Team, QA, DevOps  

---

## Table of Contents

1. [Technical Architecture](#1-technical-architecture)
2. [Code Structure & Organization](#2-code-structure--organization)
3. [Database Design & Schema](#3-database-design--schema)
4. [API Specifications](#4-api-specifications)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Backend Implementation Details](#6-backend-implementation-details)
7. [Testing Strategy](#7-testing-strategy)
8. [Deployment & Operations](#8-deployment--operations)
9. [Development Guidelines](#9-development-guidelines)
10. [Common Patterns & Examples](#10-common-patterns--examples)

---

## 1. Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Client Layer (Browser)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React 18 + TypeScript                                   │  │
│  │  - Components (UI elements, pages, forms)                │  │
│  │  - Hooks (state management, data fetching)               │  │
│  │  - Services (API client, business logic)                 │  │
│  │  - Context (global state: auth, notifications)           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────┬──────────────────────────────────────┘
                          │ HTTPS/REST
┌─────────────────────────▼──────────────────────────────────────┐
│                      Server Layer (Node.js)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Express.js + TypeScript                                 │  │
│  │  - Routes (HTTP endpoints)                               │  │
│  │  - Controllers (request handlers)                         │  │
│  │  - Services (business logic, calculations)                │  │
│  │  - Middleware (auth, validation, error handling)          │  │
│  │  - Models (data access layer)                             │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────┬──────────────────────────────────────┘
                          │ SQL
┌─────────────────────────▼──────────────────────────────────────┐
│                    Data Layer (PostgreSQL)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Relational Database                                     │  │
│  │  - Users (authentication)                                │  │
│  │  - Patients (demographics)                               │  │
│  │  - Appointments (scheduling)                             │  │
│  │  - Consultations (visit records)                          │  │
│  │  - Medications (prescriptions)                            │  │
│  │  - Audit Logs (tracking)                                 │  │
│  │  - Backups (automated daily)                              │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Technology Choices Rationale

| Component | Technology | Why | Trade-offs |
|-----------|-----------|-----|-----------|
| **Frontend** | React 18 + TypeScript | Fast, component-based; strong typing reduces bugs | Learning curve; build complexity |
| **State Management** | Context API + Hooks | Lightweight, built-in; no extra dependencies for single-user app | Not suitable for massive apps; context drilling possible |
| **HTTP Client** | Axios | Promise-based, interceptors for auth; good error handling | Alternative: fetch API |
| **Backend** | Express.js + Node.js | Lightweight, fast; excellent for REST APIs; great ecosystem | Single-threaded (mitigate with async/await); requires proper error handling |
| **Database** | PostgreSQL 14+ | ACID compliance; relational data; excellent for healthcare records | Requires DevOps knowledge; slower for unstructured data |
| **Authentication** | JWT | Stateless; scalable; easy to implement for single-user | Token refresh complexity; need secure storage |
| **Styling** | SCSS | Nesting, variables, mixins reduce CSS complexity | Requires build step; learning curve for CSS beginners |
| **Build Tool** | Vite | Fast HMR; optimized bundle; modern tooling | Less ecosystem compared to webpack |
| **Testing** | Jest + React Testing Library | Industry standard; good coverage tools; clear syntax | Setup overhead; test maintenance |
| **Deployment** | Docker + Cloud (AWS/Azure) | Containerized, reproducible; easy scaling; clinic owns data | DevOps knowledge required; AWS/Azure costs |

---

## 2. Code Structure & Organization

### Directory Structure

```
doc-patient/
│
├── frontend/                              # React + TypeScript
│   ├── public/                            # Static assets
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── manifest.json
│   │
│   ├── src/
│   │   ├── index.tsx                      # Entry point
│   │   ├── main.tsx                       # React mount
│   │   ├── vite-env.d.ts                  # Vite types
│   │   ├── App.tsx                        # Root component + routing
│   │   │
│   │   ├── components/                    # Reusable UI components
│   │   │   ├── common/                    # Generic components
│   │   │   │   ├── Button.tsx             # Reusable button
│   │   │   │   ├── Input.tsx              # Text input with validation
│   │   │   │   ├── Modal.tsx              # Modal dialog
│   │   │   │   ├── Card.tsx               # Card container
│   │   │   │   ├── Table.tsx              # Data table
│   │   │   │   ├── Toast.tsx              # Notifications
│   │   │   │   ├── Dropdown.tsx           # Select dropdown
│   │   │   │   ├── DatePicker.tsx         # Calendar date picker
│   │   │   │   └── Tabs.tsx               # Tab navigation
│   │   │   │
│   │   │   ├── layout/                    # Layout components
│   │   │   │   ├── Layout.tsx             # Main app layout (header, sidebar, main)
│   │   │   │   ├── Header.tsx             # Top navigation
│   │   │   │   ├── Sidebar.tsx            # Left navigation menu
│   │   │   │   └── Footer.tsx             # Footer
│   │   │   │
│   │   │   └── forms/                     # Form components (optional; can be in pages)
│   │   │       ├── PatientForm.tsx        # Patient registration/edit
│   │   │       ├── AppointmentForm.tsx    # Appointment scheduling
│   │   │       ├── ConsultationForm.tsx   # Consultation entry
│   │   │       ├── VitalsForm.tsx         # Vitals capture (sub-form)
│   │   │       ├── MedicationForm.tsx     # Medication entry (sub-form)
│   │   │       └── ExportForm.tsx         # Data export
│   │   │
│   │   ├── pages/                         # Page-level components (screens)
│   │   │   ├── LoginPage.tsx              # Login screen
│   │   │   ├── DashboardPage.tsx          # Home + daily appointments
│   │   │   ├── PatientSearchPage.tsx      # Patient lookup
│   │   │   ├── PatientProfilePage.tsx     # Patient details + actions
│   │   │   ├── AppointmentPage.tsx        # Appointment management
│   │   │   ├── ConsultationPage.tsx       # Consultation workflow
│   │   │   ├── PrescriptionPage.tsx       # Prescription view/print
│   │   │   ├── PatientHistoryPage.tsx     # Visit history
│   │   │   ├── ExportPage.tsx             # Data export
│   │   │   └── SettingsPage.tsx           # User settings
│   │   │
│   │   ├── hooks/                         # Custom React hooks
│   │   │   ├── useAuth.ts                 # Authentication state
│   │   │   ├── usePatient.ts              # Patient data fetching
│   │   │   ├── useAppointment.ts          # Appointment state
│   │   │   ├── useConsultation.ts         # Consultation state
│   │   │   ├── useFetch.ts                # Generic data fetching
│   │   │   ├── useLocalStorage.ts         # Browser storage
│   │   │   ├── useDebounce.ts             # Debounce hook
│   │   │   └── useNotification.ts         # Toast notifications
│   │   │
│   │   ├── services/                      # API client & business logic
│   │   │   ├── api.ts                     # Axios instance + interceptors
│   │   │   ├── authService.ts             # Auth API calls
│   │   │   ├── patientService.ts          # Patient API calls
│   │   │   ├── appointmentService.ts      # Appointment API calls
│   │   │   ├── consultationService.ts     # Consultation API calls
│   │   │   ├── prescriptionService.ts     # Prescription API calls
│   │   │   ├── exportService.ts           # Data export logic
│   │   │   └── storageService.ts          # Local storage wrapper
│   │   │
│   │   ├── context/                       # React Context (global state)
│   │   │   ├── AuthContext.tsx            # Auth state provider
│   │   │   ├── NotificationContext.tsx    # Toast/notification state
│   │   │   └── CacheContext.tsx           # Data cache (optional)
│   │   │
│   │   ├── types/                         # TypeScript interfaces
│   │   │   ├── index.ts                   # Re-export all types
│   │   │   ├── patient.ts                 # Patient interfaces
│   │   │   ├── appointment.ts             # Appointment interfaces
│   │   │   ├── consultation.ts            # Consultation interfaces
│   │   │   ├── prescription.ts            # Prescription interfaces
│   │   │   ├── auth.ts                    # Auth interfaces
│   │   │   └── common.ts                  # Common types (pagination, error, etc.)
│   │   │
│   │   ├── utils/                         # Helper functions
│   │   │   ├── validation.ts              # Form validation functions
│   │   │   ├── formatters.ts              # Date, currency, vital formatters
│   │   │   ├── vitals.ts                  # Vital range checking, warnings
│   │   │   ├── constants.ts               # App-wide constants
│   │   │   ├── errorHandler.ts            # Error parsing and display
│   │   │   └── storage.ts                 # Browser storage utilities
│   │   │
│   │   ├── styles/                        # Global styles
│   │   │   ├── index.scss                 # Main styles
│   │   │   ├── variables.scss             # Colors, spacing, fonts
│   │   │   ├── mixins.scss                # SCSS mixins
│   │   │   ├── responsive.scss            # Media queries
│   │   │   └── animations.scss            # Keyframe animations
│   │   │
│   │   └── __tests__/                     # Test files (mirror src/)
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── services/
│   │       └── utils/
│   │
│   ├── .env.example                       # Environment variables template
│   ├── .env.local                         # Local env (git ignored)
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── jest.config.js
│   ├── .eslintrc.json
│   └── README.md
│
├── backend/                               # Node.js + Express
│   ├── src/
│   │   ├── index.ts                       # Entry point (run server)
│   │   ├── server.ts                      # Express app creation
│   │   │
│   │   ├── config/                        # Configuration
│   │   │   ├── database.ts                # PostgreSQL connection
│   │   │   ├── env.ts                     # Environment variables
│   │   │   ├── constants.ts               # App constants
│   │   │   └── logger.ts                  # Logging configuration
│   │   │
│   │   ├── middleware/                    # Express middleware
│   │   │   ├── auth.ts                    # JWT verification
│   │   │   ├── errorHandler.ts            # Global error handler
│   │   │   ├── requestLogger.ts           # Request/response logging
│   │   │   ├── validation.ts              # Input validation
│   │   │   └── cors.ts                    # CORS configuration
│   │   │
│   │   ├── routes/                        # API routes
│   │   │   ├── index.ts                   # Route aggregation
│   │   │   ├── auth.ts                    # POST /auth/login, /logout
│   │   │   ├── patients.ts                # GET/POST /patients, search
│   │   │   ├── appointments.ts            # GET/POST /appointments
│   │   │   ├── consultations.ts           # GET/POST /consultations
│   │   │   ├── medications.ts             # GET /medications (autocomplete)
│   │   │   ├── prescriptions.ts           # GET /prescriptions, print
│   │   │   ├── exports.ts                 # GET /exports (CSV/PDF)
│   │   │   └── health.ts                  # GET /health (monitoring)
│   │   │
│   │   ├── controllers/                   # Request handlers
│   │   │   ├── authController.ts
│   │   │   ├── patientController.ts
│   │   │   ├── appointmentController.ts
│   │   │   ├── consultationController.ts
│   │   │   ├── prescriptionController.ts
│   │   │   └── exportController.ts
│   │   │
│   │   ├── services/                      # Business logic
│   │   │   ├── authService.ts             # Authentication logic
│   │   │   ├── patientService.ts          # Patient operations
│   │   │   ├── appointmentService.ts      # Appointment operations
│   │   │   ├── consultationService.ts     # Consultation operations
│   │   │   ├── prescriptionService.ts     # Prescription generation
│   │   │   ├── exportService.ts           # CSV/PDF generation
│   │   │   └── emailService.ts            # Email (for Phase 2)
│   │   │
│   │   ├── models/                        # Data access layer
│   │   │   ├── User.ts                    # User model
│   │   │   ├── Patient.ts                 # Patient model
│   │   │   ├── Appointment.ts             # Appointment model
│   │   │   ├── Consultation.ts            # Consultation model
│   │   │   ├── Medication.ts              # Medication model
│   │   │   ├── Prescription.ts            # Prescription model
│   │   │   └── AuditLog.ts                # Audit log model
│   │   │
│   │   ├── database/                      # Database migrations & setup
│   │   │   ├── migrations/
│   │   │   │   ├── 001_init_schema.sql
│   │   │   │   ├── 002_add_indexes.sql
│   │   │   │   └── 003_add_audit_log.sql
│   │   │   ├── seeds/
│   │   │   │   └── seed.ts                # Test data generation
│   │   │   └── schema.sql                 # Complete schema DDL
│   │   │
│   │   ├── utils/                         # Helper functions
│   │   │   ├── validators.ts              # Input validation
│   │   │   ├── errorHandler.ts            # Error creation & handling
│   │   │   ├── logger.ts                  # Logging wrapper
│   │   │   ├── jwt.ts                     # JWT generation/verification
│   │   │   ├── crypto.ts                  # Password hashing
│   │   │   └── dateUtils.ts               # Date calculations
│   │   │
│   │   ├── types/                         # TypeScript interfaces
│   │   │   ├── index.ts
│   │   │   ├── express.d.ts               # Express type augmentation
│   │   │   ├── models.ts                  # Entity interfaces
│   │   │   └── errors.ts                  # Error types
│   │   │
│   │   └── __tests__/                     # Test files
│   │       ├── unit/
│   │       │   ├── services/
│   │       │   └── utils/
│   │       └── integration/
│   │           └── routes/
│   │
│   ├── .env.example
│   ├── .env.local
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   ├── .eslintrc.json
│   └── README.md
│
├── docker/
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   ├── docker-compose.yml
│   └── .dockerignore
│
├── docs/
│   ├── API.md                             # API endpoint documentation
│   ├── ARCHITECTURE.md                    # System architecture
│   ├── DATABASE.md                        # Database schema & relationships
│   ├── SETUP.md                           # Development setup guide
│   ├── DEPLOYMENT.md                      # Production deployment guide
│   ├── RUNBOOK.md                         # Operational runbook
│   └── TROUBLESHOOTING.md                 # FAQ & common issues
│
├── scripts/
│   ├── setup.sh                           # Project setup script
│   ├── db-migrate.sh                      # Database migration script
│   ├── db-seed.sh                         # Seed test data
│   ├── deploy.sh                          # Deployment script
│   └── backup.sh                          # Backup automation
│
├── .gitignore
├── .github/
│   └── workflows/
│       ├── ci.yml                         # CI/CD pipeline (tests, build)
│       └── deploy.yml                     # Deployment automation
│
└── README.md                              # Project overview
```

### Naming Conventions

**Files & Folders:**
- Components: PascalCase (e.g., `PatientForm.tsx`)
- Utilities, services, hooks: camelCase (e.g., `patientService.ts`, `useAuth.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `VITALS_RANGES.ts`)
- Folders: lowercase kebab-case (e.g., `common-components/`, `patient-forms/`)

**Variables & Functions:**
- Variables: camelCase (e.g., `patientId`, `isLoading`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_PATIENT_NAME_LENGTH`)
- Booleans: is/has prefix (e.g., `isOpen`, `hasError`, `canSave`)
- Functions: camelCase, verb prefix (e.g., `getPatients()`, `validateForm()`, `handleSubmit()`)

**Classes & Types:**
- Classes: PascalCase (e.g., `PatientService`, `AppointmentController`)
- Interfaces: PascalCase with `I` prefix (e.g., `IPatient`, `IAppointment`) or no prefix (e.g., `Patient`, `Appointment`)
- Types: PascalCase (e.g., `AppointmentStatus = 'Scheduled' | 'Completed'`)

---

## 3. Database Design & Schema

### Database Diagram (ER Model)

```
┌──────────────────┐
│      USERS       │
├──────────────────┤
│ id (PK)          │
│ username         │
│ email            │
│ password_hash    │
│ name             │
│ created_at       │
│ updated_at       │
└──────┬───────────┘
       │
       │ 1:N
       ▼
┌──────────────────┐         ┌──────────────────┐
│    PATIENTS      │◄────────│ APPOINTMENTS     │
├──────────────────┤     N:1 ├──────────────────┤
│ id (PK)          │         │ id (PK)          │
│ name             │         │ patient_id (FK)  │
│ dob              │         │ scheduled_time   │
│ gender           │         │ status           │
│ phone            │         │ reason           │
│ email            │         │ created_at       │
│ address          │         │ updated_at       │
│ created_at       │         └──────┬───────────┘
│ updated_at       │                │
└────────┬─────────┘                │
         │                          │
         │ 1:N                      │
         ▼                          │
┌──────────────────┐                │
│ CONSULTATIONS    │◄───────────────┘
├──────────────────┤ (optional FK)
│ id (PK)          │
│ patient_id (FK)  │
│ appointment_id   │
│   (FK, optional) │
│ temperature      │
│ bp_systolic      │
│ bp_diastolic     │
│ pulse            │
│ complaints       │
│ diagnosis        │
│ created_at       │
│ updated_at       │
└──────┬───────────┘
       │
       │ 1:N
       ▼
┌──────────────────┐         ┌──────────────────┐
│  MEDICATIONS     │         │ PRESCRIPTIONS    │
├──────────────────┤         ├──────────────────┤
│ id (PK)          │         │ id (PK)          │
│ consultation_id  │◄────────│ consultation_id  │
│   (FK)           │    N:1  │   (FK)           │
│ name             │         │ status           │
│ dosage           │         │ generated_at     │
│ frequency        │         │ printed_at       │
│ duration         │         │ updated_at       │
│ instructions     │         │                  │
│ created_at       │         │                  │
└──────────────────┘         └──────────────────┘

┌──────────────────────┐
│    AUDIT_LOG         │
├──────────────────────┤
│ id (PK, serial)      │
│ user_id (FK)         │
│ action               │
│ table_name           │
│ record_id            │
│ changes (JSONB)      │
│ timestamp            │
└──────────────────────┘
```

### Complete Schema (SQL DDL)

```sql
-- Users table (doctor authentication)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);

-- Patients table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  dob DATE NOT NULL,
  gender VARCHAR(10),
  phone VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(100),
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_patients_name ON patients(name);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_patients_created_at ON patients(created_at DESC);

-- Appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled', 'No-show')),
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_scheduled_time ON appointments(scheduled_time DESC);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE UNIQUE INDEX idx_no_double_booking ON appointments(patient_id, scheduled_time) WHERE status != 'Cancelled';

-- Consultations table
CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  temperature DECIMAL(5,2),
  bp_systolic INT,
  bp_diastolic INT,
  pulse INT,
  complaints TEXT,
  diagnosis TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX idx_consultations_appointment_id ON consultations(appointment_id);
CREATE INDEX idx_consultations_created_at ON consultations(created_at DESC);

-- Medications table
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  dosage VARCHAR(50) NOT NULL,
  frequency VARCHAR(20) NOT NULL,
  duration VARCHAR(50) NOT NULL,
  instructions TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_medications_consultation_id ON medications(consultation_id);

-- Prescriptions table
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL UNIQUE REFERENCES consultations(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'Generated' CHECK (status IN ('Generated', 'Printed', 'Failed')),
  generated_at TIMESTAMP DEFAULT NOW(),
  printed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_prescriptions_consultation_id ON prescriptions(consultation_id);
CREATE INDEX idx_prescriptions_printed_at ON prescriptions(printed_at);

-- Audit log table
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  table_name VARCHAR(50),
  record_id UUID,
  changes JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp DESC);
CREATE INDEX idx_audit_log_record_id ON audit_log(table_name, record_id);
```

### Data Integrity Constraints

**Primary Keys:** All tables use UUID for distributed system compatibility
**Foreign Keys:** Cascading deletes for patient (deletes all related appointments/consultations)
**Unique Constraints:** 
- `users(username)`, `users(email)`
- `patients(phone)`
- `appointments(patient_id, scheduled_time)` (prevents double-booking)
- `prescriptions(consultation_id)` (one prescription per consultation)

**Check Constraints:**
- `appointments.status` IN ('Scheduled', 'Completed', 'Cancelled', 'No-show')
- `prescriptions.status` IN ('Generated', 'Printed', 'Failed')

**Indexes for Performance:**
- Patient lookup: `patients(name)`, `patients(phone)`
- Appointment queries: `appointments(patient_id, scheduled_time)`, `appointments(status)`
- History retrieval: `consultations(patient_id)`, `consultations(created_at DESC)`
- Audit trail: `audit_log(user_id)`, `audit_log(timestamp DESC)`

---

## 4. API Specifications

### Authentication Endpoints

#### POST /api/auth/login
**Purpose:** Doctor authentication; issues JWT token

**Request:**
```json
{
  "username": "doctor@clinic.com",
  "password": "securepassword"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 28800,
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Dr. Smith",
      "email": "doctor@clinic.com"
    }
  }
}
```

**Error (401 Unauthorized):**
```json
{
  "success": false,
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "Invalid username or password"
  }
}
```

**Implementation Notes:**
- Password hashed with bcrypt (10 rounds)
- JWT token: 8-hour expiration
- Refresh token: 24-hour expiration
- Both stored in HttpOnly cookies (secure + sameSite=strict)

---

#### POST /api/auth/logout
**Purpose:** Invalidate session

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Patient Endpoints

#### GET /api/patients/search?q=name&limit=10
**Purpose:** Search patients by name or phone (typeahead)

**Query Parameters:**
- `q` (string, required): Search query (name or phone)
- `limit` (number, optional): Max results (default: 10)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "age": 45,
      "gender": "M",
      "phone": "9876543210",
      "lastVisit": "2026-05-01T10:30:00Z"
    }
  ]
}
```

**Database Query:** `SELECT id, name, EXTRACT(YEAR FROM age(dob)) as age, gender, phone, MAX(c.created_at) as lastVisit FROM patients p LEFT JOIN consultations c ON p.id = c.patient_id WHERE LOWER(p.name) ILIKE $1 OR p.phone LIKE $2 GROUP BY p.id LIMIT $3`

**Performance Target:** < 100ms for 1,000+ patient database

---

#### POST /api/patients
**Purpose:** Create new patient

**Request:**
```json
{
  "name": "John Doe",
  "dob": "1980-05-15",
  "gender": "M",
  "phone": "9876543210",
  "email": "john@example.com",
  "address": "123 Main St"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "dob": "1980-05-15",
    "age": 45,
    "gender": "M",
    "phone": "9876543210",
    "email": "john@example.com",
    "address": "123 Main St",
    "created_at": "2026-05-05T10:00:00Z"
  }
}
```

**Validation:**
- Name: Required, max 100 chars
- DOB: Required, valid date, age >= 0
- Phone: Required, unique, valid format (regex: `^\+?[0-9\s\-\(\)]{10,}$`)
- Email: Optional, valid email format
- Gender: Enum: M, F, Other

**Error (409 Conflict - Duplicate):**
```json
{
  "success": false,
  "error": {
    "code": "PATIENT_DUPLICATE",
    "message": "Patient with phone 9876543210 already exists",
    "suggestedPatient": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "John D.",
      "dob": "1980-05-15"
    }
  }
}
```

---

#### GET /api/patients/:id
**Purpose:** Retrieve patient profile

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "dob": "1980-05-15",
    "age": 45,
    "gender": "M",
    "phone": "9876543210",
    "email": "john@example.com",
    "address": "123 Main St",
    "totalVisits": 5,
    "lastVisit": "2026-05-01T10:30:00Z",
    "created_at": "2025-12-01T00:00:00Z",
    "updated_at": "2026-05-05T10:00:00Z"
  }
}
```

---

#### PUT /api/patients/:id
**Purpose:** Update patient details

**Request:**
```json
{
  "name": "John Doe Jr.",
  "phone": "9876543211",
  "email": "john.jr@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe Jr.",
    "phone": "9876543211",
    "email": "john.jr@example.com",
    "updated_at": "2026-05-05T11:00:00Z"
  }
}
```

---

### Appointment Endpoints

#### POST /api/appointments
**Purpose:** Schedule new appointment

**Request:**
```json
{
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "scheduledTime": "2026-05-10T14:00:00Z",
  "reason": "Follow-up for diabetes checkup"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "patientName": "John Doe",
    "scheduledTime": "2026-05-10T14:00:00Z",
    "status": "Scheduled",
    "reason": "Follow-up for diabetes checkup",
    "created_at": "2026-05-05T10:00:00Z"
  }
}
```

**Validation:**
- `patientId`: Required, valid UUID, patient must exist
- `scheduledTime`: Required, >= now, within clinic hours (9 AM–6 PM)
- No double-booking: Check `appointments` table for same patient + time

**Error (409 Conflict - Double-booking):**
```json
{
  "success": false,
  "error": {
    "code": "APPOINTMENT_DOUBLE_BOOKING",
    "message": "Patient already has appointment at 2026-05-10 14:00",
    "conflictingAppointment": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "scheduledTime": "2026-05-10T14:00:00Z",
      "status": "Scheduled"
    }
  }
}
```

---

#### GET /api/appointments?date=2026-05-10
**Purpose:** Get daily appointments list

**Query Parameters:**
- `date` (string, optional): ISO date (default: today)
- `status` (string, optional): Filter by status (Scheduled, Completed, Cancelled, No-show)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "patientId": "550e8400-e29b-41d4-a716-446655440000",
      "patientName": "John Doe",
      "patientPhone": "9876543210",
      "scheduledTime": "2026-05-10T09:00:00Z",
      "status": "Scheduled",
      "reason": "Follow-up checkup",
      "consultationSaved": false
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "patientName": "Jane Smith",
      "scheduledTime": "2026-05-10T10:00:00Z",
      "status": "Completed",
      "reason": "Annual checkup",
      "consultationSaved": true
    }
  ],
  "meta": {
    "total": 2,
    "date": "2026-05-10"
  }
}
```

**Query:** `SELECT a.id, a.patient_id, p.name, p.phone, a.scheduled_time, a.status, a.reason, COUNT(c.id) > 0 as consultationSaved FROM appointments a JOIN patients p ON a.patient_id = p.id LEFT JOIN consultations c ON a.id = c.appointment_id WHERE DATE(a.scheduled_time) = $1 ORDER BY a.scheduled_time ASC`

---

#### PUT /api/appointments/:id
**Purpose:** Update appointment status or details

**Request:**
```json
{
  "status": "Completed",
  "reason": "Follow-up for diabetes checkup (completed)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "status": "Completed",
    "reason": "Follow-up for diabetes checkup (completed)",
    "updated_at": "2026-05-10T14:30:00Z"
  }
}
```

---

### Consultation Endpoints

#### POST /api/consultations
**Purpose:** Create new consultation record

**Request:**
```json
{
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "appointmentId": "550e8400-e29b-41d4-a716-446655440002",
  "temperature": 98.6,
  "bpSystolic": 120,
  "bpDiastolic": 80,
  "pulse": 72,
  "complaints": "Fever and cough for 3 days",
  "diagnosis": "Acute bronchitis",
  "medications": [
    {
      "name": "Amoxicillin",
      "dosage": "500mg",
      "frequency": "BD",
      "duration": "7 days",
      "instructions": "Take with food"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440005",
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "appointmentId": "550e8400-e29b-41d4-a716-446655440002",
    "temperature": 98.6,
    "bpSystolic": 120,
    "bpDiastolic": 80,
    "pulse": 72,
    "complaints": "Fever and cough for 3 days",
    "diagnosis": "Acute bronchitis",
    "medications": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440006",
        "name": "Amoxicillin",
        "dosage": "500mg",
        "frequency": "BD",
        "duration": "7 days",
        "instructions": "Take with food"
      }
    ],
    "created_at": "2026-05-10T14:30:00Z"
  }
}
```

**Validation:**
- All vitals required (temperature, BP systolic, BP diastolic, pulse)
- At least 1 medication required
- Vitals within acceptable ranges (warnings allowed):
  - Temp: 95–105°F acceptable range
  - BP: 0–200 systolic, 0–150 diastolic
  - Pulse: 30–200 BPM

---

#### GET /api/patients/:id/consultations?limit=10&offset=0
**Purpose:** Get patient consultation history

**Query Parameters:**
- `limit` (number, optional): Results per page (default: 10)
- `offset` (number, optional): Pagination offset (default: 0)
- `from` (date, optional): Filter from date
- `to` (date, optional): Filter to date

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440005",
      "visitDate": "2026-05-10T14:30:00Z",
      "temperature": 98.6,
      "bpSystolic": 120,
      "bpDiastolic": 80,
      "pulse": 72,
      "diagnosis": "Acute bronchitis",
      "medicineCount": 1,
      "prescriptionId": "550e8400-e29b-41d4-a716-446655440007"
    }
  ],
  "meta": {
    "total": 5,
    "limit": 10,
    "offset": 0
  }
}
```

---

### Prescription Endpoints

#### GET /api/prescriptions/:id
**Purpose:** Get prescription details (for display/print)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440007",
    "consultationId": "550e8400-e29b-41d4-a716-446655440005",
    "generatedAt": "2026-05-10T14:30:00Z",
    "printedAt": null,
    "status": "Generated",
    "patient": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "age": 45,
      "gender": "M",
      "phone": "9876543210"
    },
    "vitals": {
      "temperature": 98.6,
      "bpSystolic": 120,
      "bpDiastolic": 80,
      "pulse": 72
    },
    "diagnosis": "Acute bronchitis",
    "medications": [
      {
        "name": "Amoxicillin",
        "dosage": "500mg",
        "frequency": "BD",
        "duration": "7 days",
        "instructions": "Take with food"
      }
    ]
  }
}
```

---

#### GET /api/prescriptions/:id/print
**Purpose:** Generate printable PDF or HTML for prescription

**Query Parameters:**
- `format` (string, optional): 'pdf' or 'html' (default: 'pdf')

**Response (200 OK):**
- Content-Type: `application/pdf` or `text/html`
- Headers: `Content-Disposition: attachment; filename="prescription_YYYYMMDD.pdf"`

**HTML Template (for printing):**
```html
<html>
  <head>
    <style>
      body { font-family: Arial; max-width: 800px; margin: 0 auto; }
      .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
      .clinic-name { font-size: 24px; font-weight: bold; }
      .patient-info { margin-top: 20px; }
      .vitals { margin-top: 10px; padding: 10px; background: #f5f5f5; }
      .medications { margin-top: 20px; }
      .footer { margin-top: 40px; text-align: center; border-top: 1px solid #000; padding-top: 20px; }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="clinic-name">Dr. Smith's Clinic</div>
      <div class="clinic-contact">Phone: 123-456-7890 | Email: clinic@example.com</div>
      <div class="date">Date: {{ printDate }}</div>
    </div>
    
    <div class="patient-info">
      <h3>Patient Information</h3>
      <p>Name: {{ patient.name }} | Age: {{ patient.age }} | Gender: {{ patient.gender }}</p>
      <p>Phone: {{ patient.phone }}</p>
    </div>
    
    <div class="vitals">
      <h3>Vitals</h3>
      <p>Temperature: {{ vitals.temperature }}°F | BP: {{ vitals.bpSystolic }}/{{ vitals.bpDiastolic }} | Pulse: {{ vitals.pulse }} BPM</p>
    </div>
    
    <div class="diagnosis">
      <h3>Diagnosis</h3>
      <p>{{ diagnosis }}</p>
    </div>
    
    <div class="medications">
      <h3>Medications</h3>
      <table border="1" cellpadding="10" width="100%">
        <tr>
          <th>Medicine</th>
          <th>Dosage</th>
          <th>Frequency</th>
          <th>Duration</th>
          <th>Instructions</th>
        </tr>
        {{ #medications }}
        <tr>
          <td>{{ name }}</td>
          <td>{{ dosage }}</td>
          <td>{{ frequency }}</td>
          <td>{{ duration }}</td>
          <td>{{ instructions }}</td>
        </tr>
        {{ /medications }}
      </table>
    </div>
    
    <div class="footer">
      <div>__________________________</div>
      <div>Doctor Signature</div>
      <div style="margin-top: 30px;">Clinic Stamp</div>
    </div>
  </body>
</html>
```

---

### Export Endpoints

#### GET /api/exports/patients?format=csv&from=2026-01-01&to=2026-05-31
**Purpose:** Export patient list to CSV

**Query Parameters:**
- `format` (string, required): 'csv' or 'pdf'
- `from` (date, optional): Start date
- `to` (date, optional): End date

**Response (200 OK, CSV):**
```
CSV Headers: Name,Age,Gender,Phone,Email,Address,Created Date
John Doe,45,M,9876543210,john@example.com,123 Main St,2025-12-01
Jane Smith,38,F,9876543211,jane@example.com,456 Oak Ave,2025-12-15
...
```

---

#### GET /api/exports/consultations?format=pdf&from=2026-01-01&to=2026-05-31
**Purpose:** Export consultation records to PDF report

---

## 5. Frontend Architecture

### Component Hierarchy

```
App (root component)
├── Router (React Router)
├── AuthContext Provider
├── NotificationContext Provider
└── Routes
    ├── LoginPage (public)
    ├── Layout (private routes)
    │   ├── Header
    │   ├── Sidebar
    │   └── Main Content
    │       ├── DashboardPage
    │       │   ├── AppointmentList
    │       │   │   └── AppointmentItem (with inline actions)
    │       │   └── QuickActions
    │       ├── PatientSearchPage
    │       │   ├── SearchInput
    │       │   └── PatientSearchResults
    │       ├── PatientProfilePage
    │       │   ├── PatientCard (info display)
    │       │   └── ActionButtons (schedule appointment, start consultation, etc.)
    │       ├── ConsultationPage
    │       │   ├── PatientHeader (fixed, shows current patient)
    │       │   ├── VitalsForm
    │       │   ├── ComplaintsForm
    │       │   ├── DiagnosisForm
    │       │   ├── MedicationForm (with add/remove)
    │       │   ├── MedicationList (preview)
    │       │   └── SaveButton / CancelButton
    │       ├── PrescriptionPage
    │       │   ├── PrescriptionTemplate (for display)
    │       │   └── PrintButton / SavePDFButton
    │       ├── PatientHistoryPage
    │       │   ├── DateRangeFilter
    │       │   ├── HistoryTable
    │       │   └── DetailsDrilldown
    │       └── ExportPage
    │           ├── ExportTypeSelector
    │           ├── DateRangeFilter
    │           └── ExportButton
    └── 404 Page
```

### State Management Strategy

**AuthContext:**
```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}
```

**NotificationContext:**
```typescript
interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (type, message, duration?) => void;
  removeNotification: (id) => void;
}
```

**Component-level state:**
- Use `useState` for form inputs, UI toggles, loading states
- Use `useReducer` for complex state (e.g., consultation form with multiple sections)
- Use `useMemo` / `useCallback` to prevent unnecessary re-renders

---

## 6. Backend Implementation Details

### Error Handling Strategy

**Error Classes:**
```typescript
class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Specific error types
class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

class NotFoundError extends AppError {
  constructor(message: string) {
    super('NOT_FOUND', message, 404);
  }
}

class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super('AUTH_ERROR', message, 401);
  }
}

class AuthorizationError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super('FORBIDDEN', message, 403);
  }
}
```

**Global Error Handler Middleware:**
```typescript
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      }
    });
  }
  
  // Unexpected error
  logger.error('Unexpected error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred'
    }
  });
});
```

### Request Validation Pattern

```typescript
// Middleware for validating request body
const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }
    req.body = value;
    next();
  };
};

// Usage in route:
router.post(
  '/patients',
  validateRequest(createPatientSchema),
  patientController.createPatient
);
```

### Service Layer Pattern

```typescript
export class PatientService {
  async createPatient(data: CreatePatientDTO): Promise<Patient> {
    // Validation
    const existing = await Patient.findByPhone(data.phone);
    if (existing) {
      throw new ValidationError('Patient with this phone already exists', { existing });
    }

    // Business logic
    const patient = new Patient({
      ...data,
      id: generateUUID()
    });

    // Persistence
    await patient.save();

    // Audit logging
    await AuditLog.create({
      userId: null, // Set from context
      action: 'CREATE',
      tableName: 'patients',
      recordId: patient.id,
      changes: data
    });

    return patient;
  }

  async searchPatients(query: string, limit: number = 10): Promise<Patient[]> {
    // Normalize query
    const normalizedQuery = query.toLowerCase().trim();

    // Query database
    const patients = await db.query(`
      SELECT * FROM patients 
      WHERE LOWER(name) ILIKE $1 OR phone LIKE $2
      LIMIT $3
    `, [`%${normalizedQuery}%`, `%${query}%`, limit]);

    return patients;
  }
}
```

---

## 7. Testing Strategy

### Unit Testing Example

```typescript
// services/__tests__/patientService.test.ts
describe('PatientService', () => {
  describe('createPatient', () => {
    it('should create a new patient with valid data', async () => {
      const data = {
        name: 'John Doe',
        dob: new Date('1980-05-15'),
        gender: 'M',
        phone: '9876543210'
      };

      const result = await patientService.createPatient(data);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe('John Doe');
      expect(result.phone).toBe('9876543210');
    });

    it('should throw error if patient with same phone exists', async () => {
      const data = {
        name: 'John Doe',
        phone: '9876543210' // already exists
      };

      await expect(patientService.createPatient(data))
        .rejects
        .toThrow('Patient with this phone already exists');
    });
  });

  describe('searchPatients', () => {
    it('should return patients matching search query', async () => {
      const results = await patientService.searchPatients('John');

      expect(results).toHaveLength(1);
      expect(results[0].name).toContain('John');
    });

    it('should search by phone number', async () => {
      const results = await patientService.searchPatients('9876543210');

      expect(results).toHaveLength(1);
      expect(results[0].phone).toBe('9876543210');
    });

    it('should return empty array if no matches', async () => {
      const results = await patientService.searchPatients('NonExistent');

      expect(results).toEqual([]);
    });
  });
});
```

### Integration Testing Example

```typescript
// routes/__tests__/patients.integration.test.ts
describe('Patient Routes', () => {
  let token: string;

  beforeAll(async () => {
    // Login and get token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'doctor@test.com',
        password: 'password'
      });
    token = response.body.data.token;
  });

  describe('POST /api/patients', () => {
    it('should create a new patient', async () => {
      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'John Doe',
          dob: '1980-05-15',
          gender: 'M',
          phone: '9876543210'
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('John Doe');
    });

    it('should reject without authentication', async () => {
      const response = await request(app)
        .post('/api/patients')
        .send({
          name: 'John Doe',
          phone: '9876543210'
        });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/patients/search', () => {
    it('should search patients by name', async () => {
      const response = await request(app)
        .get('/api/patients/search?q=John')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
```

---

## 8. Deployment & Operations

### Docker Setup

**Dockerfile.backend:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy source
COPY backend/src ./src
COPY backend/tsconfig.json ./

# Build
RUN npm run build

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Run
CMD ["node", "dist/index.js"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    container_name: clinic-db
    environment:
      POSTGRES_USER: clinicadmin
      POSTGRES_PASSWORD: securepassword
      POSTGRES_DB: clinic_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U clinicadmin"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: docker/Dockerfile.backend
    container_name: clinic-api
    environment:
      NODE_ENV: production
      DATABASE_URL: postgres://clinicadmin:securepassword@postgres:5432/clinic_db
      JWT_SECRET: your-secret-key-here
      API_PORT: 5000
    ports:
      - "5000:5000"
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: docker/Dockerfile.frontend
    container_name: clinic-web
    ports:
      - "3000:80"
    environment:
      VITE_API_BASE_URL: http://localhost:5000/api
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

### Environment Variables

**.env.production (Backend):**
```
NODE_ENV=production
API_PORT=5000
DATABASE_URL=postgres://user:password@prod-db-host:5432/clinic_db
JWT_SECRET=<long-random-secret>
JWT_EXPIRY=8h
REFRESH_TOKEN_EXPIRY=24h
LOG_LEVEL=warn
CORS_ORIGIN=https://clinic.example.com
```

**.env.production (Frontend):**
```
VITE_API_BASE_URL=https://api.clinic.example.com/api
VITE_APP_NAME=Patient Management System
VITE_LOG_LEVEL=error
```

### Deployment Checklist

**Pre-Deployment (48 hours before):**
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code coverage ≥85% (backend), ≥80% (frontend)
- [ ] Performance tests passing (search < 2s, etc.)
- [ ] Security audit completed
- [ ] Database backup taken
- [ ] Migration scripts tested
- [ ] Rollback plan documented

**Deployment Day:**
- [ ] Scheduled during off-hours (2–4 AM)
- [ ] Team on standby
- [ ] Database migrations run
- [ ] Docker images built and pushed
- [ ] Services deployed
- [ ] Health checks passing
- [ ] Smoke tests passing
- [ ] Doctor availability verified

**Post-Deployment (First 24 hours):**
- [ ] Monitor error logs
- [ ] Monitor API response times
- [ ] Monitor database performance
- [ ] Doctor feedback collected
- [ ] Critical issues escalated immediately

---

## 9. Development Guidelines

### Code Style & Standards

**TypeScript Strict Mode:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitThis": true
  }
}
```

**ESLint Rules:**
- Max line length: 100 characters
- Indentation: 2 spaces
- Semicolons: Required
- Single quotes: Preferred
- Trailing commas: Required
- No console statements in production code

**Git Commit Message Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

Examples:
- `feat(patient): add patient search typeahead`
- `fix(consultation): prevent save without vitals`
- `test(appointment): add double-booking tests`
- `docs(api): update prescription endpoints`
- `chore(deps): update jest to v28`

---

## 10. Common Patterns & Examples

### API Interceptor (Axios)

```typescript
// services/api.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { useAuth } from '../hooks/useAuth';

const api: AxiosInstance = axios.create({
  baseURL: process.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Request interceptor: Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired, try refresh
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('/api/auth/refresh', {
          refreshToken
        });
        localStorage.setItem('authToken', response.data.data.token);
        // Retry original request
        return api.request(error.config!);
      } catch (refreshError) {
        // Refresh failed, logout
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Custom Hook (usePatient)

```typescript
// hooks/usePatient.ts
import { useState, useCallback } from 'react';
import { Patient } from '../types/patient';
import patientService from '../services/patientService';

export const usePatient = () => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPatient = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await patientService.getPatient(id);
      setPatient(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchPatients = useCallback(async (query: string) => {
    setLoading(true);
    try {
      return await patientService.searchPatients(query);
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { patient, loading, error, fetchPatient, searchPatients };
};
```

### Service Layer (Consultation)

```typescript
// services/consultationService.ts
import api from './api';
import { Consultation, CreateConsultationDTO } from '../types/consultation';

const consultationService = {
  async createConsultation(data: CreateConsultationDTO): Promise<Consultation> {
    const response = await api.post('/consultations', data);
    return response.data.data;
  },

  async getConsultation(id: string): Promise<Consultation> {
    const response = await api.get(`/consultations/${id}`);
    return response.data.data;
  },

  async getPatientConsultations(patientId: string, limit = 10, offset = 0) {
    const response = await api.get(
      `/patients/${patientId}/consultations`,
      { params: { limit, offset } }
    );
    return response.data.data;
  },

  async updateConsultation(id: string, data: Partial<Consultation>) {
    const response = await api.put(`/consultations/${id}`, data);
    return response.data.data;
  }
};

export default consultationService;
```

### React Component (Form with Validation)

```typescript
// components/forms/PatientForm.tsx
import React, { useState } from 'react';
import { useNotification } from '../../hooks/useNotification';
import { validatePatient } from '../../utils/validation';
import patientService from '../../services/patientService';
import Button from '../common/Button';
import Input from '../common/Input';

interface PatientFormProps {
  onSuccess?: () => void;
  initialData?: any;
}

const PatientForm: React.FC<PatientFormProps> = ({ onSuccess, initialData }) => {
  const [formData, setFormData] = useState(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotification();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const validation = validatePatient(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      if (initialData?.id) {
        await patientService.updatePatient(initialData.id, formData);
        addNotification('success', 'Patient updated successfully');
      } else {
        await patientService.createPatient(formData);
        addNotification('success', 'Patient created successfully');
      }
      onSuccess?.();
    } catch (error) {
      addNotification('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Name"
        name="name"
        value={formData.name || ''}
        onChange={handleChange}
        error={errors.name}
        required
      />
      <Input
        label="Phone"
        name="phone"
        value={formData.phone || ''}
        onChange={handleChange}
        error={errors.phone}
        required
      />
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save'}
      </Button>
    </form>
  );
};

export default PatientForm;
```

---

## Conclusion

This Implementation Document provides developers with:
- ✅ Complete technical architecture
- ✅ Code organization and file structure
- ✅ Database schema with indexes and constraints
- ✅ API specifications with examples
- ✅ Frontend component patterns
- ✅ Backend service patterns
- ✅ Testing strategies and examples
- ✅ Deployment procedures
- ✅ Development guidelines
- ✅ Common code patterns

Use this as your reference guide during development. Update as architectural decisions change.

**Status:** Ready for Development  
**Next Step:** Begin Phase 1 Implementation
