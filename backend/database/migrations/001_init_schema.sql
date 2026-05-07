-- ================================================
-- Patient Management System - Initial Schema
-- Version: 1.0
-- Date: May 7, 2026
-- Description: Creates all 7 tables with indexes and relationships
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- TABLE: users
-- Description: Doctor/admin authentication
-- ================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- ================================================
-- TABLE: patients
-- Description: Patient demographics and contact info
-- ================================================
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  dob DATE NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('M', 'F', 'Other')),
  phone VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(100),
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for patients
CREATE INDEX idx_patients_name ON patients(name);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_patients_created_at ON patients(created_at DESC);

-- ================================================
-- TABLE: appointments
-- Description: Scheduled patient appointments
-- ================================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMP NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled', 'No-show')),
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for appointments
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_scheduled_time ON appointments(scheduled_time DESC);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Unique constraint to prevent double-booking (same patient, same time, not cancelled)
CREATE UNIQUE INDEX idx_no_double_booking ON appointments(patient_id, scheduled_time) 
WHERE status != 'Cancelled';

-- ================================================
-- TABLE: consultations
-- Description: Patient visit records with vitals and diagnosis
-- ================================================
CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  temperature DECIMAL(4, 1),
  bp_systolic INTEGER,
  bp_diastolic INTEGER,
  pulse INTEGER,
  complaints TEXT,
  diagnosis TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for consultations
CREATE INDEX idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX idx_consultations_appointment_id ON consultations(appointment_id);
CREATE INDEX idx_consultations_created_at ON consultations(created_at DESC);

-- ================================================
-- TABLE: medications
-- Description: Prescribed medications for consultations
-- ================================================
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  dosage VARCHAR(100) NOT NULL,
  frequency VARCHAR(100) NOT NULL,
  duration VARCHAR(100) NOT NULL,
  instructions TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for medications
CREATE INDEX idx_medications_consultation_id ON medications(consultation_id);

-- ================================================
-- TABLE: prescriptions
-- Description: Generated prescriptions for consultations
-- ================================================
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID NOT NULL UNIQUE REFERENCES consultations(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'Generated' CHECK (status IN ('Generated', 'Printed', 'Failed')),
  generated_at TIMESTAMP DEFAULT NOW(),
  printed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for prescriptions
CREATE INDEX idx_prescriptions_consultation_id ON prescriptions(consultation_id);
CREATE INDEX idx_prescriptions_printed_at ON prescriptions(printed_at);

-- ================================================
-- TABLE: audit_log
-- Description: Tracks all data modifications for compliance
-- ================================================
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  table_name VARCHAR(50) NOT NULL,
  record_id VARCHAR(100),
  changes JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Indexes for audit_log
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp DESC);
CREATE INDEX idx_audit_log_record_id ON audit_log(table_name, record_id);

-- ================================================
-- TRIGGERS: Update updated_at timestamp automatically
-- ================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON consultations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- END OF SCHEMA
-- ================================================
