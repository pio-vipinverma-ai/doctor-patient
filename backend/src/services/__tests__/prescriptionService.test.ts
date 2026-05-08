import * as prescriptionService from '../prescriptionService';
import { pool } from '../../config/database';

jest.mock('../../config/database');

const mockPool = pool as any;

describe('PrescriptionService', () => {
  let mockClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = {
      query: jest.fn(),
      release: jest.fn()
    };
    mockPool.connect = jest.fn().mockResolvedValue(mockClient);
  });

  describe('getPrescriptionById', () => {
    it('should retrieve prescription with medications and patient details', async () => {
      const mockPrescriptionRow = {
        prescription_id: 'rx-1',
        consultation_id: 'c1',
        status: 'Generated',
        generated_at: new Date('2026-05-08T10:00:00'),
        printed_at: null,
        temperature: 98.6,
        bp_systolic: 120,
        bp_diastolic: 80,
        pulse: 72,
        complaints: 'Headache',
        diagnosis: 'Migraine',
        consultation_date: new Date('2026-05-08T10:00:00'),
        patient_name: 'John Doe',
        patient_dob: '1990-01-15',
        patient_gender: 'M',
        patient_phone: '9876543210',
        patient_age: '36'
      };

      const mockMedications = [
        {
          name: 'Paracetamol',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '5 days',
          instructions: 'Take after meals'
        }
      ];

      mockClient.query
        .mockResolvedValueOnce({ rows: [mockPrescriptionRow] })
        .mockResolvedValueOnce({ rows: mockMedications });

      const result = await prescriptionService.getPrescriptionById('rx-1');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('rx-1');
      expect(result?.consultationId).toBe('c1');
      expect(result?.patientName).toBe('John Doe');
      expect(result?.patientAge).toBe(36);
      expect(result?.vitals.temperature).toBe(98.6);
      expect(result?.vitals.bp).toBe('120/80');
      expect(result?.vitals.pulse).toBe(72);
      expect(result?.medications).toHaveLength(1);
      expect(result?.medications[0].name).toBe('Paracetamol');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should return null if prescription not found', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [] });

      const result = await prescriptionService.getPrescriptionById('nonexistent');

      expect(result).toBeNull();
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('markAsPrinted', () => {
    it('should mark prescription as printed with timestamp', async () => {
      const printedAt = new Date();
      
      mockClient.query.mockResolvedValueOnce({
        rows: [{ id: 'rx-1', printed_at: printedAt }]
      });

      const result = await prescriptionService.markAsPrinted('rx-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('rx-1');
      expect(result.printedAt).toEqual(printedAt);
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE prescriptions'),
        ['rx-1']
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should throw error if prescription not found', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [] });

      await expect(prescriptionService.markAsPrinted('nonexistent')).rejects.toThrow('Prescription not found');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('generatePrescriptionHTML', () => {
    it('should generate HTML string from prescription data', () => {
      const mockData = {
        id: 'rx-1',
        prescriptionNumber: 'RX20260508001',
        patientName: 'John Doe',
        patientPhone: '9876543210',
        patientDob: '1990-01-15',
        patientGender: 'Male',
        consultationDate: new Date('2026-05-08'),
        temperature: 98.6,
        bpSystolic: 120,
        consultationId: 'c1',
        status: 'Generated',
        generatedAt: new Date('2026-05-08T10:00:00'),
        printedAt: null,
        patientName: 'John Doe',
        patientAge: 36,
        patientDOB: '1990-01-15',
        patientGender: 'M',
        patientPhone: '9876543210',
        date: new Date('2026-05-08'),
        vitals: {
          temperature: 98.6,
          bp: '120/80',
          pulse: 72
        },
        diagnosis: 'Viral infection',
        complaints: 'Headache and fever',
        medications: [
          {
            name: 'Paracetamol',
            dosage: '500mg',
            frequency: 'Twice daily',
            duration: '5 days',
            instructions: 'Take after meals'
          }
        ],
        clinicHeader: {
          name: 'City Medical Clinic',
          address: '123 Main Street, Cityville, ST 12345',
          phone: '+1 (555) 123-4567'
        }
      };

      const html = prescriptionService.generatePrescriptionHTML(mockData);

      expect(html).toContain('<html');
      expect(html).toContain('John Doe');
      expect(html).toContain('Paracetamol');
      expect(html).toContain('500mg');
      expect(html).toContain('Viral infection');
      expect(html).toContain('</html>');
    });

    it('should handle multiple medications', () => {
      const mockData = {
        id: 'rx-1',
        consultationId: 'c1',
        status: 'Generated',
        generatedAt: new Date('2026-05-08T10:00:00'),
        printedAt: null,
        patientName: 'Jane Smith',
        patientAge: 41,
        patientDOB: '1985-05-20',
        patientGender: 'F',
        patientPhone: '9876543211',
        date: new Date('2026-05-08'),
        vitals: {
          temperature: 99.0,
          bp: '130/85',
          pulse: 75
        },
        diagnosis: 'Upper respiratory infection',
        complaints: 'Cough and cold',
        medications: [
          {
            name: 'Amoxicillin',
            dosage: '250mg',
            frequency: 'Three times daily',
            duration: '7 days',
            instructions: 'Complete the course'
          },
          {
            name: 'Cetirizine',
            dosage: '10mg',
            frequency: 'Once daily',
            duration: '5 days',
            instructions: 'Take before bedtime'
          }
        ],
        clinicHeader: {
          name: 'City Medical Clinic',
          address: '123 Main Street, Cityville, ST 12345',
          phone: '+1 (555) 123-4567'
        }
      };

      const html = prescriptionService.generatePrescriptionHTML(mockData);

      expect(html).toContain('Amoxicillin');
      expect(html).toContain('Cetirizine');
      expect(html).toContain('250mg');
      expect(html).toContain('10mg');
    });
  });
});
