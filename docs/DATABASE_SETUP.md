# Database Setup Guide

## Prerequisites

### 1. Install PostgreSQL

PostgreSQL must be installed on your system before proceeding.

**Windows:**
- Download PostgreSQL 14+ from: https://www.postgresql.org/download/windows/
- Use the interactive installer (EDB installer recommended)
- During installation:
  - Set a password for the `postgres` user (remember this!)
  - Default port: 5432 (recommended)
  - Install pgAdmin 4 (optional but helpful for GUI management)

**After Installation:**
- Add PostgreSQL to your PATH (if not done automatically):
  - Default location: `C:\Program Files\PostgreSQL\16\bin`
  - Add this to your System Environment Variables PATH

### 2. Verify PostgreSQL Installation

Open a new PowerShell window and run:
```powershell
psql --version
```

You should see output like: `psql (PostgreSQL) 16.x`

---

## Quick Setup (Automated)

### Option 1: Run the Setup Script

1. Navigate to the project root directory
2. Run the PowerShell setup script:

```powershell
cd d:\vipin\projects\doc-patient
.\scripts\setup-db.ps1
```

The script will:
- ✓ Create the database `doc_patient_db`
- ✓ Run migrations to create all 7 tables
- ✓ Add indexes for performance
- ✓ Seed sample data (test user + patients)
- ✓ Verify the setup

**Default test credentials:**
- Username: `doctor`
- Password: `password123`

---

## Manual Setup (Step-by-Step)

If the automated script doesn't work, follow these manual steps:

### Step 1: Create Database

Open PostgreSQL command line (psql):

```powershell
# Connect to PostgreSQL (will prompt for password)
psql -U postgres -h localhost
```

Inside psql, run:

```sql
-- Create database
CREATE DATABASE doc_patient_db;

-- Connect to the new database
\c doc_patient_db

-- Verify connection
SELECT current_database();
```

### Step 2: Run Schema Migration

From your project root directory, run the migration file:

```powershell
# Run schema migration
psql -U postgres -h localhost -d doc_patient_db -f backend\database\migrations\001_init_schema.sql
```

### Step 3: Seed Sample Data

```powershell
# Run seed data
psql -U postgres -h localhost -d doc_patient_db -f backend\database\seeds\seed.sql
```

### Step 4: Verify Setup

Connect to psql and verify:

```sql
-- Connect to database
\c doc_patient_db

-- List all tables (should show 7 tables)
\dt

-- Expected tables:
-- appointments
-- audit_log
-- consultations
-- medications
-- patients
-- prescriptions
-- users

-- Count records in users table
SELECT count(*) FROM users;
-- Expected: At least 1 (test user)

-- View test user
SELECT id, username, email, name FROM users;
-- Expected: doctor | doctor@clinic.com | Dr. John Admin

-- List all indexes
\di

-- Exit psql
\q
```

---

## Database Configuration

### Update Backend Environment Variables

Edit `backend/.env.local` with your database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=doc_patient_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here
```

### Test Backend Connection

1. Navigate to backend directory:
```powershell
cd backend
```

2. Start the backend server:
```powershell
npm run dev
```

3. Check the console output for database connection:
```
✓ Database connected successfully at: 2026-05-07T...
```

If you see this message, the database is connected correctly!

---

## Database Schema Overview

The database includes 7 tables:

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| **users** | Doctor authentication | username, email, password_hash |
| **patients** | Patient demographics | name, dob, gender, phone, email |
| **appointments** | Scheduled appointments | patient_id, scheduled_time, status |
| **consultations** | Visit records + vitals | patient_id, temperature, bp, pulse, diagnosis |
| **medications** | Prescribed medications | consultation_id, name, dosage, frequency |
| **prescriptions** | Generated prescriptions | consultation_id, status, generated_at |
| **audit_log** | Change tracking | user_id, action, table_name, changes |

---

## Verification Checklist

After setup, verify everything is working:

### Database Connection
- [ ] `psql -U postgres -d doc_patient_db` connects successfully
- [ ] Database `doc_patient_db` exists
- [ ] Connection string: `postgresql://postgres:password@localhost:5432/doc_patient_db`

### Tables Created
- [ ] `SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';` returns `7`
- [ ] All 7 tables exist (run `\dt` in psql)

### Indexes
- [ ] `SELECT count(*) FROM pg_indexes WHERE schemaname = 'public';` shows all indexes
- [ ] Key indexes exist:
  - [ ] `idx_users_email`
  - [ ] `idx_patients_name`
  - [ ] `idx_patients_phone`
  - [ ] `idx_appointments_patient_id`
  - [ ] `idx_consultations_patient_id`

### Sample Data
- [ ] `SELECT * FROM users;` returns at least 1 row
- [ ] Test user: `username='doctor'`, `email='doctor@clinic.com'`
- [ ] `SELECT * FROM patients;` returns 3 sample patients

### Foreign Keys
- [ ] Try creating appointment without patient_id → fails with constraint error
- [ ] Create patient first, then appointment → succeeds

### Backend Connection
- [ ] Run `npm run dev` in backend folder
- [ ] Console shows: "✓ Database connected successfully"
- [ ] No connection errors

---

## Troubleshooting

### Issue: "psql: command not found"

**Solution:** PostgreSQL is not installed or not in PATH

1. Install PostgreSQL from: https://www.postgresql.org/download/
2. Add PostgreSQL to PATH:
   - Windows: `C:\Program Files\PostgreSQL\16\bin`
   - Restart PowerShell after adding to PATH

### Issue: "password authentication failed for user postgres"

**Solution:** Incorrect postgres password

1. Use the password you set during PostgreSQL installation
2. Update `backend/.env.local` with the correct password:
   ```env
   DB_PASSWORD=your_actual_password
   ```

### Issue: "database doc_patient_db already exists"

**Solution:** Database already created

- Run the setup script and choose to drop/recreate when prompted
- OR manually drop: `psql -U postgres -c "DROP DATABASE doc_patient_db;"`

### Issue: "relation already exists" during migration

**Solution:** Tables already exist

1. Drop and recreate database:
   ```sql
   DROP DATABASE doc_patient_db;
   CREATE DATABASE doc_patient_db;
   ```
2. Re-run migration script

### Issue: Backend shows "Database connection failed"

**Check:**
1. PostgreSQL service is running:
   - Windows: Check "Services" app for "postgresql-x64-16"
2. Database credentials in `.env.local` are correct
3. Database `doc_patient_db` exists
4. Firewall allows port 5432

---

## Next Steps

After successful database setup:

1. ✓ Start backend server: `cd backend && npm run dev`
2. ✓ Verify health endpoint: http://localhost:5000/health
3. ✓ Start frontend: `cd frontend && npm run dev`
4. ✓ Open browser: http://localhost:5173
5. ✓ Login with test credentials:
   - Username: `doctor`
   - Password: `password123`

**Proceed to Phase 2: Core Authentication (Days 3-4)**

---

## Database Maintenance

### Backup Database

```powershell
# Create backup
pg_dump -U postgres -h localhost doc_patient_db > backup.sql

# Restore backup
psql -U postgres -h localhost doc_patient_db < backup.sql
```

### Reset Database

```powershell
# Drop and recreate
psql -U postgres -h localhost -c "DROP DATABASE doc_patient_db;"
psql -U postgres -h localhost -c "CREATE DATABASE doc_patient_db;"

# Re-run migrations
psql -U postgres -h localhost -d doc_patient_db -f backend\database\migrations\001_init_schema.sql
psql -U postgres -h localhost -d doc_patient_db -f backend\database\seeds\seed.sql
```

---

## Support

If you encounter issues not covered here:

1. Check PostgreSQL logs: `C:\Program Files\PostgreSQL\16\data\log`
2. Verify PostgreSQL service is running
3. Test basic psql connection: `psql -U postgres -h localhost`
4. Check error messages in backend console output
