import { createAppointment, getAppointmentsByDate, updateAppointment } from '../appointmentService';
import { pool } from '../../config/database';

jest.mock('../../config/database');

const mockPool = pool as any;

describe('AppointmentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAppointment', () => {
    const validAppointmentInput = {
      patientId: '550e8400-e29b-41d4-a716-446655440001',
      scheduledTime: new Date('2026-05-15T10:00:00'),
      reason: 'Regular checkup'
    };

    it('should schedule an appointment successfully', async () => {
      // Arrange
      const mockAppointment = {
        id: '550e8400-e29b-41d4-a716-446655440100',
        patient_id: validAppointmentInput.patientId,
        scheduled_time: validAppointmentInput.scheduledTime,
        status: 'Scheduled',
        reason: validAppointmentInput.reason,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Mock 1: Patient existence check
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: validAppointmentInput.patientId }],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: []
      } as any);

      // Mock 2: Double-booking check (no conflicts)
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: []
      } as any);

      // Mock 3: INSERT appointment
      mockPool.query.mockResolvedValueOnce({
        rows: [mockAppointment],
        command: 'INSERT',
        rowCount: 1,
        oid: 0,
        fields: []
      } as any);

      // Act
      const result = await createAppointment(validAppointmentInput);

      // Assert
      expect(result).toEqual(mockAppointment);
      expect(mockPool.query).toHaveBeenCalledTimes(3);
    });

    it('should throw error on double-booking', async () => {
      // Arrange
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: validAppointmentInput.patientId }],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: []
      });
      
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 'existing-appointment' }],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: []
      });

      // Act & Assert
      await expect(createAppointment(validAppointmentInput)).rejects.toThrow('Patient already has appointment at this time');
    });

    it('should throw error when patient does not exist', async () => {
      // Arrange
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: []
      });

      // Act & Assert
      await expect(createAppointment({
        patientId: 'nonexistent-id',
        scheduledTime: validAppointmentInput.scheduledTime,
        reason: validAppointmentInput.reason
      })).rejects.toThrow('Patient not found');
    });
  });

  describe('getAppointmentsByDate', () => {
    it('should return appointments for a specific date', async () => {
      // Arrange
      const mockAppointments = [
        {
          id: '1',
          patient_id: 'p1',
          name: 'John Doe',
          phone: '9876543210',
          scheduled_time: new Date('2026-05-10T10:00:00'),
          status: 'Scheduled',
          reason: 'Checkup',
          consultationSaved: false
        },
        {
          id: '2',
          patient_id: 'p2',
          name: 'Jane Smith',
          phone: '9876543211',
          scheduled_time: new Date('2026-05-10T11:00:00'),
          status: 'Completed',
          reason: 'Follow-up',
          consultationSaved: true
        }
      ];

      mockPool.query.mockResolvedValueOnce({
        rows: mockAppointments,
        command: 'SELECT',
        rowCount: 2,
        oid: 0,
        fields: []
      } as any);

      // Act
      const result = await getAppointmentsByDate('2026-05-10');

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].consultationSaved).toBe(false);
      expect(result[1].consultationSaved).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('DATE(a.scheduled_time) = $1'),
        ['2026-05-10']
      );
    });

    it('should filter by status if provided', async () => {
      // Arrange
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: []
      } as any);

      // Act
      await getAppointmentsByDate('2026-05-10', 'Completed');

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND a.status = $2'),
        ['2026-05-10', 'Completed']
      );
    });

    it('should filter by patientId if provided', async () => {
      // Arrange
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: []
      } as any);

      // Act
      await getAppointmentsByDate('2026-05-10', undefined, 'patient-123');

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND a.patient_id = $2'),
        ['2026-05-10', 'patient-123']
      );
    });
  });

  describe('updateAppointment', () => {
    it('should update appointment status', async () => {
      // Arrange
      const mockUpdatedAppointment = {
        id: '550e8400-e29b-41d4-a716-446655440100',
        patient_id: '550e8400-e29b-41d4-a716-446655440001',
        scheduled_time: new Date('2026-05-15T10:00:00'),
        status: 'Completed',
        reason: 'Regular checkup',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [mockUpdatedAppointment],
        command: 'UPDATE',
        rowCount: 1,
        oid: 0,
        fields: []
      } as any);

      // Act
      const result = await updateAppointment('550e8400-e29b-41d4-a716-446655440100', {
        status: 'Completed'
      });

      // Assert
      expect(result).toEqual(mockUpdatedAppointment);
      expect(result?.status).toBe('Completed');
    });

    it('should return null when appointment not found', async () => {
      // Arrange
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        command: 'UPDATE',
        rowCount: 0,
        oid: 0,
        fields: []
      } as any);

      // Act
      const result = await updateAppointment('nonexistent-id', {
        status: 'Cancelled'
      });

      // Assert
      expect(result).toBeNull();
    });
  });
});
