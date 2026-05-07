import { pool } from '../config/database';
import { Patient, PatientInput, PatientSearchResult, PatientUpdateInput } from '../types/models';

/**
 * Patient Service - Database operations for patient management
 */

/**
 * Create a new patient
 */
export const createPatient = async (patientData: PatientInput): Promise<Patient> => {
  const { name, dob, gender, phone, email, address } = patientData;

  const query = `
    INSERT INTO patients (name, dob, gender, phone, email, address)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;

  const values = [name, dob, gender, phone, email || null, address || null];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error: any) {
    // Handle duplicate phone number
    if (error.code === '23505' && error.constraint === 'patients_phone_key') {
      throw new Error('Phone number already exists');
    }
    throw error;
  }
};

/**
 * Get patient by ID
 */
export const getPatientById = async (patientId: string): Promise<Patient | null> => {
  const query = `
    SELECT * FROM patients WHERE id = $1
  `;

  const result = await pool.query(query, [patientId]);
  return result.rows[0] || null;
};

/**
 * Search patients by name or phone (typeahead)
 */
export const searchPatients = async (searchQuery: string, limit: number = 10): Promise<PatientSearchResult[]> => {
  const query = `
    SELECT 
      p.id,
      p.name,
      EXTRACT(YEAR FROM AGE(p.dob))::INTEGER as age,
      p.gender,
      p.phone,
      MAX(c.created_at) as lastVisit
    FROM patients p
    LEFT JOIN consultations c ON p.id = c.patient_id
    WHERE 
      LOWER(p.name) ILIKE $1 OR 
      p.phone LIKE $2
    GROUP BY p.id
    ORDER BY p.name ASC
    LIMIT $3
  `;

  const searchPattern = `%${searchQuery.toLowerCase()}%`;
  const phonePattern = `%${searchQuery}%`;

  const result = await pool.query(query, [searchPattern, phonePattern, limit]);
  
  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    age: row.age,
    gender: row.gender,
    phone: row.phone,
    lastVisit: row.lastvisit ? new Date(row.lastvisit).toISOString() : null
  }));
};

/**
 * Update patient details
 */
export const updatePatient = async (patientId: string, updates: PatientUpdateInput): Promise<Patient | null> => {
  // Build dynamic update query
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (updates.name !== undefined) {
    fields.push(`name = $${paramCount++}`);
    values.push(updates.name);
  }
  if (updates.dob !== undefined) {
    fields.push(`dob = $${paramCount++}`);
    values.push(updates.dob);
  }
  if (updates.gender !== undefined) {
    fields.push(`gender = $${paramCount++}`);
    values.push(updates.gender);
  }
  if (updates.phone !== undefined) {
    fields.push(`phone = $${paramCount++}`);
    values.push(updates.phone);
  }
  if (updates.email !== undefined) {
    fields.push(`email = $${paramCount++}`);
    values.push(updates.email);
  }
  if (updates.address !== undefined) {
    fields.push(`address = $${paramCount++}`);
    values.push(updates.address);
  }

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  fields.push(`updated_at = NOW()`);
  values.push(patientId);

  const query = `
    UPDATE patients
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;

  try {
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  } catch (error: any) {
    // Handle duplicate phone number
    if (error.code === '23505' && error.constraint === 'patients_phone_key') {
      throw new Error('Phone number already exists');
    }
    throw error;
  }
};

/**
 * Get all patients with pagination
 */
export const getAllPatients = async (limit: number = 50, offset: number = 0): Promise<{ patients: Patient[]; total: number }> => {
  const countQuery = 'SELECT COUNT(*) FROM patients';
  const dataQuery = `
    SELECT * FROM patients
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `;

  const countResult = await pool.query(countQuery);
  const dataResult = await pool.query(dataQuery, [limit, offset]);

  return {
    patients: dataResult.rows,
    total: parseInt(countResult.rows[0].count)
  };
};

/**
 * Validate patient input
 */
export const validatePatientInput = (data: PatientInput): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Name validation
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Name is required');
  } else if (data.name.length > 100) {
    errors.push('Name must be 100 characters or less');
  } else if (!/^[a-zA-Z\s]+$/.test(data.name)) {
    errors.push('Name must contain only letters and spaces');
  }

  // DOB validation
  if (!data.dob) {
    errors.push('Date of birth is required');
  } else {
    const dob = new Date(data.dob);
    const now = new Date();
    const age = now.getFullYear() - dob.getFullYear();
    
    if (isNaN(dob.getTime())) {
      errors.push('Invalid date of birth');
    } else if (age < 0 || age > 150) {
      errors.push('Invalid age (must be between 0 and 150)');
    }
  }

  // Gender validation
  if (!data.gender || !['M', 'F', 'Other'].includes(data.gender)) {
    errors.push('Gender must be M, F, or Other');
  }

  // Phone validation
  if (!data.phone || data.phone.trim().length === 0) {
    errors.push('Phone number is required');
  } else if (!/^\+?[0-9\s\-\(\)]{10,}$/.test(data.phone)) {
    errors.push('Invalid phone number format');
  }

  // Email validation (optional)
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};
