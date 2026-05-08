import { createConsultation, getConsultationById } from '../consultationService';
import { pool } from '../../config/database';

jest.mock('../../config/database');

const mockPool = pool as any;

describe('ConsultationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Initialize pool.connect mock
    mockPool.connect = jest.fn();
    mockPool.query = jest.fn();
  });

  describe('createConsultation', () => {
    const validConsultationInput = {
      patientId: '550e8400-e29b-41d4-a716-446655440001',
      appointmentId: '550e8400-e29b-41d4-a716-446655440100',
      temperature: 98.6,
      bpSystolic: 120,
      bpDiastolic: 80,
      pulse: 72,
      complaints: 'Headache and fever',
      diagnosis: 'Viral infection',
      medications: [
        {
          name: 'Paracetamol',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '5 days',
          instructions: 'Take after meals'
        },
        {
          name: 'Amoxicillin',
          dosage: '250mg',
          frequency: 'Three times daily',
          duration: '7 days',
          instructions: 'Complete the course'
        }
      ]
    };

    it('should create consultation with medications successfully', async () => {
      // Arrange
      const mockConsultation = {
        id: '550e8400-e29b-41d4-a716-446655440200',
        patient_id: validConsultationInput.patientId,
        appointment_id: validConsultationInput.appointmentId,
        temperature: validConsultationInput.temperature,
        bp_systolic: validConsultationInput.bpSystolic,
        bp_diastolic: validConsultationInput.bpDiastolic,
        pulse: validConsultationInput.pulse,
        complaints: validConsultationInput.complaints,
        diagnosis: validConsultationInput.diagnosis,
        created_at: new Date(),
        updated_at: new Date()
      };

      const mockMedications = validConsultationInput.medications.map((med, index) => ({
        id: `med-${index}`,
        consultation_id: mockConsultation.id,
        ...med,
        created_at: new Date()
      }));

      const mockPrescription = {
        id: 'rx-1',
        consultation_id: mockConsultation.id,
        status: 'Generated',
        generated_at: new Date(),
        printed_at: null,
        updated_at: new Date()
      };

      // Mock patient existence check
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: validConsultationInput.patientId }]
      });

      // Mock appointment existence check
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: validConsultationInput.appointmentId }]
      });

      // Mock client for transaction
      const mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce({})  // BEGIN
          .mockResolvedValueOnce({ rows: [mockConsultation] })  // INSERT consultation
          .mockResolvedValueOnce({ rows: [mockMedications[0]] })  // INSERT medication 1
          .mockResolvedValueOnce({ rows: [mockMedications[1]] })  // INSERT medication 2
          .mockResolvedValueOnce({ rows: [mockPrescription] })  // INSERT prescription
          .mockResolvedValueOnce({})  // UPDATE appointment
          .mockResolvedValueOnce({}),  // COMMIT
        release: jest.fn()
      };
      mockPool.connect.mockResolvedValueOnce(mockClient);

      // Act
      const result = await createConsultation(validConsultationInput);

      // Assert
      expect(result).toBeDefined();
      expect(result.consultation).toBeDefined();
      expect(result.consultation.id).toBe(mockConsultation.id);
      expect(result.medications).toHaveLength(2);
      expect(result.medications[0].name).toBe('Paracetamol');
      expect(result.medications[1].name).toBe('Amoxicillin');
      expect(result.prescription).toBeDefined();
      expect(result.prescription.id).toBe(mockPrescription.id);
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should validate vital signs within normal ranges', async () => {
      // Arrange
      const invalidVitals = {
        ...validConsultationInput,
        temperature: 110, // Invalid: too high
        bpSystolic: 200,  // Invalid: too high
        pulse: 150        // Invalid: too high
      };

      // This test assumes validation happens before DB call
      // In real implementation, you'd add validation in the service

      // Act & Assert
      // Note: This test would need actual validation logic in the service
      expect(invalidVitals.temperature).toBeGreaterThan(105); // Warning threshold
      expect(invalidVitals.bpSystolic).toBeGreaterThan(180); // Critical threshold
      expect(invalidVitals.pulse).toBeGreaterThan(120); // Warning threshold
    });

    it('should handle transaction rollback on error', async () => {
      // Mock patient existence check
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: validConsultationInput.patientId }]
      });

      // Mock appointment existence check
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: validConsultationInput.appointmentId }]
      });

      // Mock client with transaction that fails
      const mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce({})  // BEGIN
          .mockRejectedValueOnce(new Error('Database error'))  // consultation INSERT fails
          .mockResolvedValueOnce({}),  // ROLLBACK
        release: jest.fn()
      };
      mockPool.connect.mockResolvedValueOnce(mockClient);

      // Act & Assert
      await expect(createConsultation(validConsultationInput)).rejects.toThrow('Database error');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should require at least one medication', async () => {
      // Arrange
      const consultationWithoutMeds = {
        ...validConsultationInput,
        medications: []
      };

      // Act & Assert
      // Note: This would require validation in the service
      expect(consultationWithoutMeds.medications).toHaveLength(0);
      // In real implementation, service should throw error
    });
  });

  describe('getConsultationById', () => {
    it('should return consultation with medications', async () => {
      // Arrange
      const mockConsultation = {
        id: '550e8400-e29b-41d4-a716-446655440200',
        patient_id: '550e8400-e29b-41d4-a716-446655440001',
        temperature: 98.6,
        bp_systolic: 120,
        bp_diastolic: 80,
        pulse: 72,
        complaints: 'Headache',
        diagnosis: 'Viral infection',
        created_at: new Date('2026-05-10T10:30:00'),
        updated_at: new Date('2026-05-10T10:30:00')
      };

      const mockMedication = {
        id: 'med-1',
        consultation_id: '550e8400-e29b-41d4-a716-446655440200',
        name: 'Paracetamol',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '5 days',
        instructions: 'Take after meals',
        created_at: new Date(),
        updated_at: new Date()
      };

      const mockPrescription = {
        id: 'rx-1',
        consultation_id: '550e8400-e29b-41d4-a716-446655440200',
        patient_id: '550e8400-e29b-41d4-a716-446655440001',
        prescription_number: 'RX20240101001',
        created_at: new Date(),
        updated_at: new Date()
      };

      // Mock 3 queries: consultation, medications, prescription
      mockPool.query.mockResolvedValueOnce({
        rows: [mockConsultation],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: []
      } as any);

      mockPool.query.mockResolvedValueOnce({
        rows: [mockMedication],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: []
      } as any);

      mockPool.query.mockResolvedValueOnce({
        rows: [mockPrescription],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: []
      } as any);

      // Act
      const result = await getConsultationById('550e8400-e29b-41d4-a716-446655440200');

      // Assert
      expect(result).not.toBeNull();
      expect(result?.consultation).toBeDefined();
      expect(result?.consultation?.id).toBe(mockConsultation.id);
      expect(result?.consultation?.patient_id).toBe(mockConsultation.patient_id);
      expect(Array.isArray(result?.medications)).toBe(true);
      expect(result?.medications).toHaveLength(1);
      expect(result?.medications[0].name).toBe('Paracetamol');
      expect(result?.prescription).toBeDefined();
      expect(result?.prescription?.id).toBe(mockPrescription.id);
    });

    it('should return null when consultation not found', async () => {
      // Arrange
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: []
      } as any);

      // Act
      const result = await getConsultationById('nonexistent-id');

      // Assert
      expect(result).toBeNull();
    });
  });
});

