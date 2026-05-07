# Database Directory

This directory contains all database-related files for the Patient Management System.

## Directory Structure

```
database/
├── migrations/           # SQL schema migrations
│   └── 001_init_schema.sql  # Initial schema (7 tables + indexes)
│
└── seeds/               # Test data
    └── seed.sql         # Sample users, patients, appointments
```

## Files

### migrations/001_init_schema.sql

**Complete database schema with:**
- ✓ 7 tables (users, patients, appointments, consultations, medications, prescriptions, audit_log)
- ✓ UUID primary keys for all tables
- ✓ Foreign key relationships with cascading deletes
- ✓ Indexes for performance (17 indexes total)
- ✓ Check constraints for data validation
- ✓ Unique constraints to prevent duplicates
- ✓ Auto-update triggers for `updated_at` fields

**Tables created:**
1. **users** - Doctor authentication (JWT)
2. **patients** - Patient demographics
3. **appointments** - Scheduled visits
4. **consultations** - Visit records with vitals
5. **medications** - Prescribed medications
6. **prescriptions** - Generated prescriptions
7. **audit_log** - Change tracking for compliance

### seeds/seed.sql

**Sample data for testing:**
- 1 test user: `doctor` / `password123`
- 3 sample patients (Alice, Bob, Carol)
- 2 scheduled appointments
- Verification queries (commented out)

## Usage

### Quick Setup (Automated)

From project root:
```powershell
.\scripts\setup-db.ps1
```

### Manual Setup

1. **Create database:**
```powershell
psql -U postgres -c "CREATE DATABASE doc_patient_db;"
```

2. **Run migrations:**
```powershell
psql -U postgres -d doc_patient_db -f backend\database\migrations\001_init_schema.sql
```

3. **Seed data:**
```powershell
psql -U postgres -d doc_patient_db -f backend\database\seeds\seed.sql
```

## Verification

After setup, verify with psql:

```sql
-- Connect to database
\c doc_patient_db

-- List tables (should show 7)
\dt

-- Count users
SELECT count(*) FROM users;
-- Expected: 1

-- View test user
SELECT username, email, name FROM users;
-- Expected: doctor | doctor@clinic.com | Dr. John Admin

-- List indexes
\di

-- Exit
\q
```

## Database Schema

### Entity Relationships

```
users (1) ──> (N) audit_log

patients (1) ──> (N) appointments
patients (1) ──> (N) consultations

appointments (1) ──> (0..1) consultations

consultations (1) ──> (N) medications
consultations (1) ──> (1) prescriptions
```

### Key Constraints

- **Unique phone numbers:** Prevents duplicate patient registrations
- **No double-booking:** Same patient cannot have two appointments at same time (unless cancelled)
- **Cascade delete:** Deleting patient removes all related appointments/consultations
- **One prescription per consultation:** Enforced by UNIQUE constraint

## Indexes

Performance-optimized queries with indexes on:

**Users:**
- `idx_users_email` - Login by email
- `idx_users_username` - Login by username

**Patients:**
- `idx_patients_name` - Search by name
- `idx_patients_phone` - Search by phone
- `idx_patients_created_at` - Sort by registration date

**Appointments:**
- `idx_appointments_patient_id` - Get patient appointments
- `idx_appointments_scheduled_time` - Daily schedule
- `idx_appointments_status` - Filter by status
- `idx_no_double_booking` - Prevent double-booking

**Consultations:**
- `idx_consultations_patient_id` - Patient history
- `idx_consultations_appointment_id` - Link to appointment
- `idx_consultations_created_at` - Sort by date

**Medications:**
- `idx_medications_consultation_id` - Get consultation medications

**Prescriptions:**
- `idx_prescriptions_consultation_id` - Link to consultation
- `idx_prescriptions_printed_at` - Track printed prescriptions

**Audit Log:**
- `idx_audit_log_user_id` - User activity
- `idx_audit_log_timestamp` - Time-based queries
- `idx_audit_log_record_id` - Track specific records

## Adding New Migrations

When adding new features that require schema changes:

1. Create new migration file: `002_description.sql`
2. Include both UP and DOWN scripts
3. Update this README with changes
4. Test migration on clean database

Example migration format:

```sql
-- Migration: 002_add_patient_notes.sql
-- Description: Adds notes field to patients table
-- Date: YYYY-MM-DD

-- UP
ALTER TABLE patients ADD COLUMN notes TEXT;
CREATE INDEX idx_patients_notes ON patients USING gin(to_tsvector('english', notes));

-- DOWN (for rollback)
-- DROP INDEX idx_patients_notes;
-- ALTER TABLE patients DROP COLUMN notes;
```

## Troubleshooting

### "relation already exists"

Tables already exist. Drop database and recreate:

```sql
DROP DATABASE doc_patient_db;
CREATE DATABASE doc_patient_db;
```

### "duplicate key value violates unique constraint"

Seed data already inserted. Either:
- Skip seed file
- Drop and recreate database

### "permission denied"

PostgreSQL user doesn't have permissions:

```sql
GRANT ALL PRIVILEGES ON DATABASE doc_patient_db TO postgres;
```

## Next Steps

After database setup:

1. ✓ Update `backend/.env.local` with database credentials
2. ✓ Start backend: `npm run dev`
3. ✓ Check console for "✓ Database connected successfully"
4. ✓ Test health endpoint: http://localhost:5000/health

If connection successful, proceed to **Phase 2: Core Authentication**
