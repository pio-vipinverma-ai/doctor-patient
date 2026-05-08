import { pool } from '../config/database';

/**
 * Consultation Service - Database operations for consultation management
 */

export interface Consultation {
  id: string;
  patient_id: string;
  appointment_id: string | null;
  temperature: number;
  bp_systolic: number;
  bp_diastolic: number;
  pulse: number;
  complaints: string;
  diagnosis: string;
  created_at: Date;
  updated_at: Date;
}

export interface Medication {
  id: string;
  consultation_id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  created_at: Date;
}

export interface Prescription {
  id: string;
  consultation_id: string;
  status: 'Generated' | 'Printed' | 'Failed';
  generated_at: Date;
  printed_at: Date | null;
  updated_at: Date;
}

export interface ConsultationInput {
  patientId: string;
  appointmentId?: string;
  temperature: number;
  bpSystolic: number;
  bpDiastolic: number;
  pulse: number;
  complaints: string;
  diagnosis: string;
  medications: MedicationInput[];
}

export interface MedicationInput {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface ConsultationHistoryItem {
  id: string;
  date: Date;
  temperature: number;
  bp: string;
  pulse: number;
  diagnosis: string;
  medicationCount: number;
  prescriptionId: string;
}

export interface VitalsWarnings {
  temperature?: string;
  bpSystolic?: string;
  bpDiastolic?: string;
  pulse?: string;
}

/**
 * Validate vitals and return warnings (non-blocking)
 */
export const validateVitals = (
  temperature: number,
  bpSystolic: number,
  bpDiastolic: number,
  pulse: number
): VitalsWarnings => {
  const warnings: VitalsWarnings = {};

  // Temperature: 95-105°F normal
  if (temperature < 95) {
    warnings.temperature = `Low (${temperature}°F, normal: 98.6°F, range: 95-105°F)`;
  } else if (temperature > 105) {
    warnings.temperature = `High (${temperature}°F, normal: 98.6°F, range: 95-105°F)`;
  } else if (temperature > 100.4) {
    warnings.temperature = `Elevated (${temperature}°F, normal: 98.6°F)`;
  }

  // BP Systolic: 90-180 mmHg normal
  if (bpSystolic < 90) {
    warnings.bpSystolic = `Low (${bpSystolic} mmHg, normal: 120 mmHg, range: 90-180 mmHg)`;
  } else if (bpSystolic > 180) {
    warnings.bpSystolic = `High (${bpSystolic} mmHg, normal: 120 mmHg, range: 90-180 mmHg)`;
  } else if (bpSystolic > 140) {
    warnings.bpSystolic = `Elevated (${bpSystolic} mmHg, normal: 120 mmHg)`;
  }

  // BP Diastolic: 60-120 mmHg normal
  if (bpDiastolic < 60) {
    warnings.bpDiastolic = `Low (${bpDiastolic} mmHg, normal: 80 mmHg, range: 60-120 mmHg)`;
  } else if (bpDiastolic > 120) {
    warnings.bpDiastolic = `High (${bpDiastolic} mmHg, normal: 80 mmHg, range: 60-120 mmHg)`;
  } else if (bpDiastolic > 90) {
    warnings.bpDiastolic = `Elevated (${bpDiastolic} mmHg, normal: 80 mmHg)`;
  }

  // Pulse: 40-150 BPM normal
  if (pulse < 40) {
    warnings.pulse = `Low (${pulse} BPM, normal: 60-100 BPM, range: 40-150 BPM)`;
  } else if (pulse > 150) {
    warnings.pulse = `High (${pulse} BPM, normal: 60-100 BPM, range: 40-150 BPM)`;
  } else if (pulse > 100) {
    warnings.pulse = `Elevated (${pulse} BPM, normal: 60-100 BPM)`;
  } else if (pulse < 60) {
    warnings.pulse = `Low (${pulse} BPM, normal: 60-100 BPM)`;
  }

  return warnings;
};

/**
 * Validate consultation input
 */
export const validateConsultationInput = (
  data: ConsultationInput
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Patient ID required
  if (!data.patientId || data.patientId.trim() === '') {
    errors.push('Patient ID is required');
  }

  // Vitals required
  if (data.temperature === undefined || data.temperature === null) {
    errors.push('Temperature is required');
  }
  if (data.bpSystolic === undefined || data.bpSystolic === null) {
    errors.push('BP Systolic is required');
  }
  if (data.bpDiastolic === undefined || data.bpDiastolic === null) {
    errors.push('BP Diastolic is required');
  }
  if (data.pulse === undefined || data.pulse === null) {
    errors.push('Pulse is required');
  }

  // Complaints and diagnosis required
  if (!data.complaints || data.complaints.trim() === '') {
    errors.push('Complaints are required');
  }
  if (!data.diagnosis || data.diagnosis.trim() === '') {
    errors.push('Diagnosis is required');
  }

  // At least 1 medication required
  if (!data.medications || data.medications.length === 0) {
    errors.push('At least 1 medication is required');
  } else {
    // Validate each medication
    data.medications.forEach((med, index) => {
      if (!med.name || med.name.trim() === '') {
        errors.push(`Medication ${index + 1}: Name is required`);
      }
      if (!med.dosage || med.dosage.trim() === '') {
        errors.push(`Medication ${index + 1}: Dosage is required`);
      }
      if (!med.frequency || med.frequency.trim() === '') {
        errors.push(`Medication ${index + 1}: Frequency is required`);
      }
      if (!med.duration || med.duration.trim() === '') {
        errors.push(`Medication ${index + 1}: Duration is required`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Create a new consultation with medications and auto-generate prescription
 */
export const createConsultation = async (
  consultationData: ConsultationInput
): Promise<{
  consultation: Consultation;
  medications: Medication[];
  prescription: Prescription;
  vitalsWarnings: VitalsWarnings;
}> => {
  const {
    patientId,
    appointmentId,
    temperature,
    bpSystolic,
    bpDiastolic,
    pulse,
    complaints,
    diagnosis,
    medications: medicationsInput,
  } = consultationData;

  // Check if patient exists
  const patientCheck = await pool.query('SELECT id FROM patients WHERE id = $1', [patientId]);
  if (patientCheck.rows.length === 0) {
    throw new Error('Patient not found');
  }

  // If appointment ID provided, verify it exists
  if (appointmentId) {
    const appointmentCheck = await pool.query('SELECT id FROM appointments WHERE id = $1', [
      appointmentId,
    ]);
    if (appointmentCheck.rows.length === 0) {
      throw new Error('Appointment not found');
    }
  }

  // Start transaction
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert consultation
    const consultationQuery = `
      INSERT INTO consultations (
        patient_id, appointment_id, temperature, bp_systolic, bp_diastolic,
        pulse, complaints, diagnosis
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const consultationValues = [
      patientId,
      appointmentId || null,
      temperature,
      bpSystolic,
      bpDiastolic,
      pulse,
      complaints,
      diagnosis,
    ];
    const consultationResult = await client.query(consultationQuery, consultationValues);
    const consultation: Consultation = consultationResult.rows[0];

    // Insert medications
    const medications: Medication[] = [];
    for (const med of medicationsInput) {
      const medQuery = `
        INSERT INTO medications (consultation_id, name, dosage, frequency, duration, instructions)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      const medValues = [
        consultation.id,
        med.name,
        med.dosage,
        med.frequency,
        med.duration,
        med.instructions || '',
      ];
      const medResult = await client.query(medQuery, medValues);
      medications.push(medResult.rows[0]);
    }

    // Auto-generate prescription
    const prescriptionQuery = `
      INSERT INTO prescriptions (consultation_id, status)
      VALUES ($1, $2)
      RETURNING *
    `;
    const prescriptionResult = await client.query(prescriptionQuery, [consultation.id, 'Generated']);
    const prescription: Prescription = prescriptionResult.rows[0];

    // If appointment provided, update appointment status to Completed
    if (appointmentId) {
      await client.query(
        `UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2`,
        ['Completed', appointmentId]
      );
    }

    await client.query('COMMIT');

    // Calculate vitals warnings
    const vitalsWarnings = validateVitals(temperature, bpSystolic, bpDiastolic, pulse);

    return {
      consultation,
      medications,
      prescription,
      vitalsWarnings,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get consultation history for a patient
 * With date range filtering and pagination
 */
export const getConsultationHistory = async (
  patientId: string,
  limit: number = 10,
  offset: number = 0,
  fromDate?: string,
  toDate?: string
): Promise<{ consultations: ConsultationHistoryItem[]; total: number }> => {
  // Build WHERE clause with date filtering
  let whereClause = 'WHERE c.patient_id = $1';
  const queryParams: any[] = [patientId];
  let paramCount = 2;

  if (fromDate) {
    whereClause += ` AND c.created_at >= $${paramCount}`;
    queryParams.push(fromDate);
    paramCount++;
  }

  if (toDate) {
    whereClause += ` AND c.created_at <= $${paramCount}`;
    queryParams.push(toDate);
    paramCount++;
  }

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as count
    FROM consultations c
    ${whereClause}
  `;
  const countResult = await pool.query(countQuery, queryParams);
  const total = parseInt(countResult.rows[0].count);

  // Get consultation history
  const query = `
    SELECT 
      c.id,
      c.created_at as date,
      c.temperature,
      c.bp_systolic,
      c.bp_diastolic,
      c.pulse,
      c.diagnosis,
      (
        SELECT COUNT(*) 
        FROM medications m 
        WHERE m.consultation_id = c.id
      ) as medication_count,
      (
        SELECT p.id 
        FROM prescriptions p 
        WHERE p.consultation_id = c.id
        LIMIT 1
      ) as prescription_id
    FROM consultations c
    ${whereClause}
    ORDER BY c.created_at DESC
    LIMIT $${paramCount} OFFSET $${paramCount + 1}
  `;

  queryParams.push(limit, offset);
  const result = await pool.query(query, queryParams);

  const consultations: ConsultationHistoryItem[] = result.rows.map((row) => ({
    id: row.id,
    date: row.date,
    temperature: parseFloat(row.temperature),
    bp: `${row.bp_systolic}/${row.bp_diastolic}`,
    pulse: parseInt(row.pulse),
    diagnosis: row.diagnosis,
    medicationCount: parseInt(row.medication_count),
    prescriptionId: row.prescription_id,
  }));

  return {
    consultations,
    total,
  };
};

/**
 * Get consultation by ID with medications
 */
export const getConsultationById = async (
  consultationId: string
): Promise<{
  consultation: Consultation | null;
  medications: Medication[];
  prescription: Prescription | null;
} | null> => {
  // Get consultation
  const consultationQuery = `SELECT * FROM consultations WHERE id = $1`;
  const consultationResult = await pool.query(consultationQuery, [consultationId]);

  if (consultationResult.rows.length === 0) {
    return null;
  }

  const consultation: Consultation = consultationResult.rows[0];

  // Get medications
  const medicationsQuery = `SELECT * FROM medications WHERE consultation_id = $1 ORDER BY created_at ASC`;
  const medicationsResult = await pool.query(medicationsQuery, [consultationId]);
  const medications: Medication[] = medicationsResult.rows;

  // Get prescription
  const prescriptionQuery = `SELECT * FROM prescriptions WHERE consultation_id = $1`;
  const prescriptionResult = await pool.query(prescriptionQuery, [consultationId]);
  const prescription: Prescription | null = prescriptionResult.rows[0] || null;

  return {
    consultation,
    medications,
    prescription,
  };
};
