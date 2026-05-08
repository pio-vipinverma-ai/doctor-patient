-- ================================================
-- Performance Optimization Indexes
-- Version: 1.1
-- Date: May 8, 2026
-- Description: Additional indexes for improved query performance
-- ================================================

-- Composite index for consultation history queries with date filtering
-- This helps with queries filtering by patient_id and date range
CREATE INDEX IF NOT EXISTS idx_consultations_patient_date ON consultations(patient_id, created_at DESC);

-- Composite index for patient search with name prefix matching
-- This helps with ILIKE queries starting with a prefix
CREATE INDEX IF NOT EXISTS idx_patients_name_lower ON patients(LOWER(name) text_pattern_ops);

-- Verify indexes were created
SELECT 
  tablename, 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('patients', 'consultations')
ORDER BY tablename, indexname;
