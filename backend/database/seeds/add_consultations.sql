-- ================================================
-- Test Consultation Data for Alice Johnson
-- ================================================

-- Insert sample consultations for Alice Johnson
INSERT INTO consultations (id, patient_id, appointment_id, temperature, bp_systolic, bp_diastolic, pulse, complaints, diagnosis, created_at, updated_at)
VALUES 
-- Consultation 1 (Recent - May 2026)
(
  '650e8400-e29b-41d4-a716-446655440010',
  '550e8400-e29b-41d4-a716-446655440002', -- Alice Johnson
  NULL,
  101.5,
  130,
  85,
  92,
  'Fever, headache, body ache for 2 days',
  'Viral fever with upper respiratory infection',
  '2026-05-05 10:30:00',
  '2026-05-05 10:30:00'
),
-- Consultation 2 (April 2026)
(
  '650e8400-e29b-41d4-a716-446655440011',
  '550e8400-e29b-41d4-a716-446655440002',
  NULL,
  98.6,
  120,
  80,
  75,
  'Regular checkup',
  'Healthy, no issues found',
  '2026-04-15 14:00:00',
  '2026-04-15 14:00:00'
),
-- Consultation 3 (March 2026)
(
  '650e8400-e29b-41d4-a716-446655440012',
  '550e8400-e29b-41d4-a716-446655440002',
  NULL,
  99.2,
  125,
  82,
  78,
  'Cough and cold',
  'Common cold with mild cough',
  '2026-03-10 11:15:00',
  '2026-03-10 11:15:00'
),
-- Consultation 4 (February 2026 - outside current range for testing)
(
  '650e8400-e29b-41d4-a716-446655440013',
  '550e8400-e29b-41d4-a716-446655440002',
  NULL,
  98.4,
  118,
  78,
  72,
  'Follow-up checkup',
  'Recovered well, no issues',
  '2026-02-20 15:45:00',
  '2026-02-20 15:45:00'
),
-- Consultation 5 (January 2026)
(
  '650e8400-e29b-41d4-a716-446655440014',
  '550e8400-e29b-41d4-a716-446655440002',
  NULL,
  100.8,
  128,
  84,
  88,
  'Stomach pain and nausea',
  'Gastritis, advised dietary changes',
  '2026-01-12 09:20:00',
  '2026-01-12 09:20:00'
);

-- Insert medications for consultations
INSERT INTO medications (id, consultation_id, name, dosage, frequency, duration, instructions, created_at)
VALUES
-- Medications for Consultation 1 (Viral fever)
(
  '750e8400-e29b-41d4-a716-446655440020',
  '650e8400-e29b-41d4-a716-446655440010',
  'Paracetamol',
  '500mg',
  'Twice daily',
  '5 days',
  'After food',
  '2026-05-05 10:30:00'
),
(
  '750e8400-e29b-41d4-a716-446655440021',
  '650e8400-e29b-41d4-a716-446655440010',
  'Cough Syrup',
  '10ml',
  'Thrice daily',
  '7 days',
  'Before bed',
  '2026-05-05 10:30:00'
),
-- Medication for Consultation 3 (Cold)
(
  '750e8400-e29b-41d4-a716-446655440022',
  '650e8400-e29b-41d4-a716-446655440012',
  'Cetirizine',
  '10mg',
  'Once daily',
  '5 days',
  'At night',
  '2026-03-10 11:15:00'
),
-- Medications for Consultation 5 (Gastritis)
(
  '750e8400-e29b-41d4-a716-446655440023',
  '650e8400-e29b-41d4-a716-446655440014',
  'Omeprazole',
  '20mg',
  'Once daily',
  '14 days',
  'Before breakfast',
  '2026-01-12 09:20:00'
),
(
  '750e8400-e29b-41d4-a716-446655440024',
  '650e8400-e29b-41d4-a716-446655440014',
  'Antacid',
  '10ml',
  'After meals',
  '7 days',
  'If needed for discomfort',
  '2026-01-12 09:20:00'
);

-- Insert prescriptions for consultations
INSERT INTO prescriptions (id, consultation_id, status, generated_at, printed_at, updated_at)
VALUES
(
  '850e8400-e29b-41d4-a716-446655440030',
  '650e8400-e29b-41d4-a716-446655440010',
  'Generated',
  '2026-05-05 10:30:00',
  NULL,
  '2026-05-05 10:30:00'
),
(
  '850e8400-e29b-41d4-a716-446655440031',
  '650e8400-e29b-41d4-a716-446655440012',
  'Generated',
  '2026-03-10 11:15:00',
  NULL,
  '2026-03-10 11:15:00'
),
(
  '850e8400-e29b-41d4-a716-446655440032',
  '650e8400-e29b-41d4-a716-446655440014',
  'Generated',
  '2026-01-12 09:20:00',
  NULL,
  '2026-01-12 09:20:00'
);

-- Insert sample consultations for Bob Smith
INSERT INTO consultations (id, patient_id, appointment_id, temperature, bp_systolic, bp_diastolic, pulse, complaints, diagnosis, created_at, updated_at)
VALUES 
(
  '650e8400-e29b-41d4-a716-446655440015',
  '550e8400-e29b-41d4-a716-446655440003', -- Bob Smith
  NULL,
  99.0,
  135,
  88,
  82,
  'Routine diabetes checkup',
  'Type 2 Diabetes - controlled',
  '2026-05-01 10:00:00',
  '2026-05-01 10:00:00'
);

-- Medications for Bob's consultation
INSERT INTO medications (id, consultation_id, name, dosage, frequency, duration, instructions, created_at)
VALUES
(
  '750e8400-e29b-41d4-a716-446655440025',
  '650e8400-e29b-41d4-a716-446655440015',
  'Metformin',
  '500mg',
  'Twice daily',
  '30 days',
  'After meals',
  '2026-05-01 10:00:00'
);

-- Prescription for Bob
INSERT INTO prescriptions (id, consultation_id, status, generated_at, printed_at, updated_at)
VALUES
(
  '850e8400-e29b-41d4-a716-446655440033',
  '650e8400-e29b-41d4-a716-446655440015',
  'Generated',
  '2026-05-01 10:00:00',
  NULL,
  '2026-05-01 10:00:00'
);

-- Verify data
SELECT 
  c.id,
  p.name,
  c.created_at as consultation_date,
  c.diagnosis,
  COUNT(m.id) as medication_count
FROM consultations c
JOIN patients p ON c.patient_id = p.id
LEFT JOIN medications m ON c.id = m.consultation_id
GROUP BY c.id, p.name, c.created_at, c.diagnosis
ORDER BY c.created_at DESC;
