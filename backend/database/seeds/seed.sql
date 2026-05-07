-- ================================================
-- Sample Data Seed for Testing
-- Date: May 7, 2026
-- Description: Creates test user and sample patient data
-- ================================================

-- Insert test doctor user (password: password123)
-- Password hash generated with bcrypt, 10 rounds
INSERT INTO users (id, username, email, password_hash, name, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'doctor',
  'doctor@clinic.com',
  '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', -- password: password123
  'Dr. John Admin',
  NOW(),
  NOW()
);

-- Insert sample patients for testing
INSERT INTO patients (id, name, dob, gender, phone, email, address, created_at, updated_at)
VALUES 
(
  '550e8400-e29b-41d4-a716-446655440002',
  'Alice Johnson',
  '1985-03-15',
  'F',
  '9876543210',
  'alice@example.com',
  '123 Main Street, Springfield',
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  'Bob Smith',
  '1978-07-22',
  'M',
  '9876543211',
  'bob@example.com',
  '456 Oak Avenue, Springfield',
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440004',
  'Carol Williams',
  '1992-11-30',
  'F',
  '9876543212',
  'carol@example.com',
  '789 Pine Road, Springfield',
  NOW(),
  NOW()
);

-- Insert sample appointments
INSERT INTO appointments (id, patient_id, scheduled_time, status, reason, created_at, updated_at)
VALUES
(
  '550e8400-e29b-41d4-a716-446655440005',
  '550e8400-e29b-41d4-a716-446655440002',
  NOW() + INTERVAL '2 hours',
  'Scheduled',
  'Regular checkup',
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440006',
  '550e8400-e29b-41d4-a716-446655440003',
  NOW() + INTERVAL '4 hours',
  'Scheduled',
  'Follow-up consultation',
  NOW(),
  NOW()
);

-- ================================================
-- Verification Queries
-- ================================================

-- Count tables
-- SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';

-- List all tables
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Count indexes
-- SELECT count(*) FROM pg_indexes WHERE schemaname = 'public';

-- Verify users
-- SELECT id, username, email, name FROM users;

-- Verify patients
-- SELECT id, name, EXTRACT(YEAR FROM age(dob)) as age, phone FROM patients;

-- Verify appointments
-- SELECT a.id, p.name as patient_name, a.scheduled_time, a.status 
-- FROM appointments a 
-- JOIN patients p ON a.patient_id = p.id;
