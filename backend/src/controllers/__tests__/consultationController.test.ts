import { Request, Response } from 'express';
import {
  createConsultationController,
  getConsultationController,
  getPatientConsultationsController
} from '../consultationController';
import * as consultationService from '../../services/consultationService';

jest.mock('../../services/consultationService');

const mockConsultationService = consultationService as jest.Mocked<typeof consultationService>;

describe('ConsultationController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      query: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('createConsultationController', () => {
    it('should create consultation successfully', async () => {
      const consultationData = {
        patientId: 'p1',
        appointmentId: 'a1',
        temperature: 98.6,
        bpSystolic: 120,
        bpDiastolic: 80,
        pulse: 72,
        complaints: 'Headache',
        diagnosis: 'Migraine',
        medications: [
          {
            name: 'Paracetamol',
            dosage: '500mg',
            frequency: 'Twice daily',
            duration: '5 days',
            instructions: 'Take after meals'
          }
        ]
      };

      mockReq.body = consultationData;

      mockConsultationService.validateConsultationInput.mockReturnValueOnce({
        valid: true,
        errors: []
      });

      const mockResult = {
        consultation: {
          id: 'c1',
          patient_id: 'p1',
          appointment_id: 'a1',
          temperature: 98.6,
          bp_systolic: 120,
          bp_diastolic: 80,
          pulse: 72,
          complaints: 'Headache',
          diagnosis: 'Migraine',
          created_at: new Date(),
          updated_at: new Date()
        },
        medications: [
          {
            id: 'm1',
            consultation_id: 'c1',
            name: 'Paracetamol',
            dosage: '500mg',
            frequency: 'Twice daily',
            duration: '5 days',
            instructions: 'Take after meals',
            created_at: new Date()
          }
        ],
        prescription: {
          id: 'rx1',
          consultation_id: 'c1',
          status: 'Generated' as const,
          generated_at: new Date(),
          printed_at: null,
          updated_at: new Date()
        },
        vitalsWarnings: {}
      };

      mockConsultationService.createConsultation.mockResolvedValueOnce(mockResult);

      await createConsultationController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          consultation: expect.objectContaining({
            id: 'c1',
            patientId: 'p1',
            diagnosis: 'Migraine'
          })
        })
      );
    });

    it('should return 400 for validation errors', async () => {
      mockReq.body = {
        patientId: 'p1',
        medications: [] // Invalid: no medications
      };

      mockConsultationService.validateConsultationInput.mockReturnValueOnce({
        valid: false,
        errors: ['At least 1 medication is required']
      });

      await createConsultationController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'At least 1 medication is required'
        })
      );
    });

    it('should return 404 if patient not found', async () => {
      mockReq.body = {
        patientId: 'nonexistent',
        medications: [{ name: 'Test', dosage: '100mg', frequency: 'Daily', duration: '5 days' }]
      };

      mockConsultationService.validateConsultationInput.mockReturnValueOnce({
        valid: true,
        errors: []
      });

      const error = new Error('Patient not found');
      mockConsultationService.createConsultation.mockRejectedValueOnce(error);

      await createConsultationController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Patient not found'
      });
    });

    it('should return 404 if appointment not found', async () => {
      mockReq.body = {
        patientId: 'p1',
        appointmentId: 'nonexistent',
        medications: [{ name: 'Test', dosage: '100mg', frequency: 'Daily', duration: '5 days' }]
      };

      mockConsultationService.validateConsultationInput.mockReturnValueOnce({
        valid: true,
        errors: []
      });

      const error = new Error('Appointment not found');
      mockConsultationService.createConsultation.mockRejectedValueOnce(error);

      await createConsultationController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Appointment not found'
      });
    });

    it('should return 500 for other errors', async () => {
      mockReq.body = {
        patientId: 'p1',
        medications: [{ name: 'Test', dosage: '100mg', frequency: 'Daily', duration: '5 days' }]
      };

      mockConsultationService.validateConsultationInput.mockReturnValueOnce({
        valid: true,
        errors: []
      });

      mockConsultationService.createConsultation.mockRejectedValueOnce(new Error('Database error'));

      await createConsultationController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to create consultation'
      });
    });
  });

  describe('getConsultationController', () => {
    it('should get consultation by ID', async () => {
      mockReq.params = { id: 'c1' };

      const mockResult = {
        consultation: {
          id: 'c1',
          patient_id: 'p1',
          appointment_id: 'a1',
          temperature: 98.6,
          bp_systolic: 120,
          bp_diastolic: 80,
          pulse: 72,
          complaints: 'Headache',
          diagnosis: 'Migraine',
          created_at: new Date(),
          updated_at: new Date()
        },
        medications: [
          {
            id: 'm1',
            consultation_id: 'c1',
            name: 'Paracetamol',
            dosage: '500mg',
            frequency: 'Twice daily',
            duration: '5 days',
            instructions: 'Take after meals',
            created_at: new Date()
          }
        ],
        prescription: {
          id: 'rx1',
          consultation_id: 'c1',
          status: 'Generated' as const,
          generated_at: new Date(),
          printed_at: null,
          updated_at: new Date()
        }
      };

      mockConsultationService.getConsultationById.mockResolvedValueOnce(mockResult);

      await getConsultationController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          consultation: expect.objectContaining({
            id: 'c1',
            diagnosis: 'Migraine'
          })
        })
      );
    });

    it('should return 404 if consultation not found', async () => {
      mockReq.params = { id: 'nonexistent' };

      mockConsultationService.getConsultationById.mockResolvedValueOnce(null);

      await getConsultationController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Consultation not found'
      });
    });

    it('should handle service errors', async () => {
      mockReq.params = { id: 'c1' };

      mockConsultationService.getConsultationById.mockRejectedValueOnce(new Error('Database error'));

      await getConsultationController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to retrieve consultation'
      });
    });
  });

  describe('getPatientConsultationsController', () => {
    it('should get consultations for a patient', async () => {
      mockReq.params = { id: 'p1' };
      mockReq.query = {};

      const mockResult = {
        consultations: [
          {
            id: 'c1',
            date: new Date('2026-05-01'),
            diagnosis: 'Flu',
            temperature: 99.5,
            bp: '120/80',
            pulse: 75,
            medicationCount: 2,
            prescriptionId: 'rx1'
          },
          {
            id: 'c2',
            date: new Date('2026-05-08'),
            diagnosis: 'Migraine',
            temperature: 98.6,
            bp: '118/78',
            pulse: 72,
            medicationCount: 1,
            prescriptionId: 'rx2'
          }
        ],
        total: 2
      };

      mockConsultationService.getConsultationHistory.mockResolvedValueOnce(mockResult);

      await getPatientConsultationsController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          consultations: expect.arrayContaining([
            expect.objectContaining({
              id: 'c1',
              diagnosis: 'Flu'
            })
          ]),
          total: 2,
          pages: 1,
          currentPage: 1,
          limit: 10
        })
      );
    });

    it('should return empty array if no consultations', async () => {
      mockReq.params = { id: 'p1' };
      mockReq.query = {};

      const mockResult = {
        consultations: [],
        total: 0
      };

      mockConsultationService.getConsultationHistory.mockResolvedValueOnce(mockResult);

      await getPatientConsultationsController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          consultations: [],
          total: 0,
          pages: 0
        })
      );
    });

    it('should handle errors', async () => {
      mockReq.params = { id: 'p1' };
      mockReq.query = {};

      mockConsultationService.getConsultationHistory.mockRejectedValueOnce(new Error('Database error'));

      await getPatientConsultationsController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to retrieve consultation history'
      });
    });
  });
});
