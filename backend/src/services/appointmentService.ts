import { pool } from '../config/database';

/**
 * Appointment Service - Database operations for appointment management
 */

export interface Appointment {
  id: string;
  patient_id: string;
  scheduled_time: Date;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-show';
  reason: string;
  created_at: Date;
  updated_at: Date;
}

export interface AppointmentInput {
  patientId: string;
  scheduledTime: string | Date;
  reason: string;
}

export interface AppointmentListItem {
  id: string;
  patientId: string;
  patientName: string;
  phone: string;
  scheduledTime: string;
  status: string;
  reason: string;
  consultationSaved: boolean;
}

/**
 * Create a new appointment
 */
export const createAppointment = async (appointmentData: AppointmentInput): Promise<Appointment> => {
  const { patientId, scheduledTime, reason } = appointmentData;

  // Check if patient exists
  const patientCheck = await pool.query('SELECT id FROM patients WHERE id = $1', [patientId]);
  if (patientCheck.rows.length === 0) {
    throw new Error('Patient not found');
  }

  // Check for double-booking
  const doubleBookingCheck = await pool.query(
    `SELECT id FROM appointments 
     WHERE patient_id = $1 
     AND scheduled_time = $2 
     AND status != 'Cancelled'`,
    [patientId, scheduledTime]
  );

  if (doubleBookingCheck.rows.length > 0) {
    throw new Error('Patient already has appointment at this time');
  }

  const query = `
    INSERT INTO appointments (patient_id, scheduled_time, status, reason)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

  const values = [patientId, scheduledTime, 'Scheduled', reason];

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Get appointments for a specific date
 */
export const getAppointmentsByDate = async (
  date: string,
  status?: string
): Promise<AppointmentListItem[]> => {
  let query = `
    SELECT 
      a.id,
      a.patient_id as "patientId",
      p.name as "patientName",
      p.phone,
      a.scheduled_time as "scheduledTime",
      a.status,
      a.reason,
      CASE WHEN COUNT(c.id) > 0 THEN true ELSE false END as "consultationSaved"
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    LEFT JOIN consultations c ON a.id = c.appointment_id
    WHERE DATE(a.scheduled_time) = $1
  `;

  const values: any[] = [date];

  if (status) {
    query += ` AND a.status = $2`;
    values.push(status);
  }

  query += `
    GROUP BY a.id, a.patient_id, p.name, p.phone, a.scheduled_time, a.status, a.reason
    ORDER BY a.scheduled_time ASC
  `;

  const result = await pool.query(query, values);
  return result.rows;
};

/**
 * Get appointment by ID
 */
export const getAppointmentById = async (appointmentId: string): Promise<Appointment | null> => {
  const query = `SELECT * FROM appointments WHERE id = $1`;
  const result = await pool.query(query, [appointmentId]);
  return result.rows[0] || null;
};

/**
 * Update appointment status or details
 */
export const updateAppointment = async (
  appointmentId: string,
  updates: { status?: string; reason?: string }
): Promise<Appointment | null> => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (updates.status !== undefined) {
    fields.push(`status = $${paramCount++}`);
    values.push(updates.status);
  }

  if (updates.reason !== undefined) {
    fields.push(`reason = $${paramCount++}`);
    values.push(updates.reason);
  }

  if (fields.length === 0) {
    return getAppointmentById(appointmentId);
  }

  fields.push(`updated_at = NOW()`);
  values.push(appointmentId);

  const query = `
    UPDATE appointments 
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

/**
 * Validate appointment input
 */
export const validateAppointmentInput = (data: AppointmentInput): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.patientId || data.patientId.trim() === '') {
    errors.push('Patient ID is required');
  }

  if (!data.scheduledTime) {
    errors.push('Scheduled time is required');
  } else {
    const scheduledDate = new Date(data.scheduledTime);
    const now = new Date();

    // Check if date is in the past
    if (scheduledDate < now) {
      errors.push('Cannot schedule appointment in the past');
    }

    // Check clinic hours (9 AM to 6 PM)
    const hours = scheduledDate.getHours();
    if (hours < 9 || hours >= 18) {
      errors.push('Appointments must be scheduled between 9 AM and 6 PM');
    }
  }

  if (!data.reason || data.reason.trim() === '') {
    errors.push('Reason for appointment is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate appointment status
 */
export const isValidStatus = (status: string): boolean => {
  const validStatuses = ['Scheduled', 'Completed', 'Cancelled', 'No-show'];
  return validStatuses.includes(status);
};
