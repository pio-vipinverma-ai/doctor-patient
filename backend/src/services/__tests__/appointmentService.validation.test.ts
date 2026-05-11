import {
  validateAppointmentInput,
  isValidStatus,
  createAppointment,
  updateAppointment,
  getAppointmentsByDate
} from '../appointmentService';
import { pool } from '../../config/database';

jest.mock('../../config/database');

const mockPool = pool as any;

describe('AppointmentService - Validation and Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPool.query = jest.fn();
  });

  describe('validateAppointmentInput', () => {
    const validInput = {
      patientId: 'p1',
      scheduledTime: '2026-05-12T10:00:00',
      reason: 'Checkup'
    };

    it('should validate correct input', () => {
      const result = validateAppointmentInput(validInput);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return error for missing patientId', () => {
      const result = validateAppointmentInput({ ...validInput, patientId: '' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Patient ID is required');
    });

    it('should return error for missing scheduledTime', () => {
      const result = validateAppointmentInput({ ...validInput, scheduledTime: '' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Scheduled time is required');
    });

    it('should return error for appointment in past', () => {
      const result = validateAppointmentInput({ ...validInput, scheduledTime: '2020-01-01T10:00:00' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Cannot schedule appointment in the past');
    });

    it('should return error for appointment outside clinic hours (before 9 AM)', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(8, 0, 0, 0);
      
      const result = validateAppointmentInput({ ...validInput, scheduledTime: futureDate.toISOString() });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Appointments must be scheduled between 9 AM and 6 PM');
    });

    it('should return error for appointment outside clinic hours (after 6 PM)', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(18, 0, 0, 0);
      
      const result = validateAppointmentInput({ ...validInput, scheduledTime: futureDate.toISOString() });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Appointments must be scheduled between 9 AM and 6 PM');
    });

    it('should return error for missing reason', () => {
      const result = validateAppointmentInput({ ...validInput, reason: '' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Reason for appointment is required');
    });

    it('should return multiple errors for invalid input', () => {
      const result = validateAppointmentInput({
        patientId: '',
        scheduledTime: 'invalid',
        reason: ''
      });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBe(2); // patientId and reason (scheduledTime combined with reason check)
    });
  });

  describe('isValidStatus', () => {
    it('should return true for valid Scheduled status', () => {
      expect(isValidStatus('Scheduled')).toBe(true);
    });

    it('should return true for valid Completed status', () => {
      expect(isValidStatus('Completed')).toBe(true);
    });

    it('should return true for valid Cancelled status', () => {
      expect(isValidStatus('Cancelled')).toBe(true);
    });

    it('should return true for valid No-show status', () => {
      expect(isValidStatus('No-show')).toBe(true);
    });

    it('should return false for invalid status', () => {
      expect(isValidStatus('Invalid')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidStatus('')).toBe(false);
    });

    it('should return false for case-sensitive mismatch', () => {
      expect(isValidStatus('scheduled')).toBe(false);
    });
  });

  describe('createAppointment - error handling', () => {
    it('should throw error if patient does not exist', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] }); // Patient not found

      await expect(
        createAppointment({
          patientId: 'nonexistent',
          scheduledTime: '2026-05-10T10:00:00',
          reason: 'Checkup'
        })
      ).rejects.toThrow('Patient not found');
    });

    it('should throw error if patient has existing appointment at same time', async () => {
      // Patient exists
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 'p1', name: 'John' }]
      });

      // Existing appointment found
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 'existing-appointment' }]
      });

      await expect(
        createAppointment({
          patientId: 'p1',
          scheduledTime: '2026-05-10T10:00:00',
          reason: 'Checkup'
        })
      ).rejects.toThrow('Patient already has appointment at this time');
    });
  });

  describe('updateAppointment - edge cases', () => {
    it('should update appointment status only', async () => {
      const mockAppointment = {
        id: 'a1',
        patient_id: 'p1',
        scheduled_time: new Date(),
        status: 'Completed',
        reason: 'Checkup',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [mockAppointment]
      });

      const result = await updateAppointment('a1', { status: 'Completed' });
      expect(result).not.toBeNull();
      expect(result!.status).toBe('Completed');
    });

    it('should return null if appointment not found', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await updateAppointment('nonexistent', { status: 'Completed' });
      expect(result).toBeNull();
    });
  });

  describe('getAppointmentsByDate - filtering', () => {
    it('should filter by status when provided', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: []
      });

      await getAppointmentsByDate('2026-05-10', 'Scheduled');
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('status = $2'),
        expect.arrayContaining(['2026-05-10', 'Scheduled'])
      );
    });

    it('should not filter by status when not provided', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: []
      });

      await getAppointmentsByDate('2026-05-10');
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE'),
        expect.arrayContaining(['2026-05-10'])
      );
    });
  });
});
