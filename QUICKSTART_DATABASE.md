# Database Setup - Quick Reference Card

## 🎯 Prerequisites

**Install PostgreSQL 14+:** https://www.postgresql.org/download/windows/

---

## ⚡ Quick Commands

### Setup (Choose One)

**Automated (Recommended):**
```powershell
cd d:\vipin\projects\doc-patient
.\scripts\setup-db.ps1
```

**Manual:**
```powershell
# 1. Create database
psql -U postgres -c "CREATE DATABASE doc_patient_db;"

# 2. Run migrations
psql -U postgres -d doc_patient_db -f backend\database\migrations\001_init_schema.sql

# 3. Seed data
psql -U postgres -d doc_patient_db -f backend\database\seeds\seed.sql
```

---

## ✅ Verification

### Check Tables
```sql
psql -U postgres -d doc_patient_db
\dt                    -- List tables (should show 7)
\q                     -- Exit
```

### Check Test User
```sql
SELECT * FROM users;
-- Expected: doctor | doctor@clinic.com
```

### Test Backend Connection
```powershell
cd backend
npm run dev
# Look for: "✓ Database connected successfully"
```

---

## 🔧 Configuration

**Update `backend/.env.local`:**
```env
DB_PASSWORD=your_postgres_password
```

---

## 🧪 Test Credentials

**Username:** `doctor`  
**Password:** `password123`

**Connection String:**
```
postgresql://postgres:password@localhost:5432/doc_patient_db
```

---

## 📋 What Was Created

- ✅ 7 tables (users, patients, appointments, consultations, medications, prescriptions, audit_log)
- ✅ 17+ indexes for performance
- ✅ Foreign key relationships
- ✅ Sample data (1 user, 3 patients, 2 appointments)
- ✅ Connection pool configuration
- ✅ Auto-update triggers

---

## 🚀 Next Steps

1. ✅ Install PostgreSQL
2. ✅ Run `.\scripts\setup-db.ps1`
3. ✅ Update `.env.local` with password
4. ✅ Start backend: `npm run dev`
5. ✅ Verify connection in console
6. ➡️ Proceed to Phase 2: Authentication

---

## 🆘 Quick Troubleshooting

**psql not found:**
- Add to PATH: `C:\Program Files\PostgreSQL\16\bin`
- Restart terminal

**Connection failed:**
- Check PostgreSQL service running
- Verify password in `.env.local`

**Tables already exist:**
```sql
DROP DATABASE doc_patient_db;
CREATE DATABASE doc_patient_db;
```
Then re-run setup.

---

## 📚 Full Documentation

- **Setup Guide:** `docs/DATABASE_SETUP.md`
- **Schema Details:** `backend/database/README.md`
- **Completion Summary:** `Document/Step_1_3_Database_Setup_Complete.md`

---

**Status:** ✅ READY (Awaiting PostgreSQL installation)
