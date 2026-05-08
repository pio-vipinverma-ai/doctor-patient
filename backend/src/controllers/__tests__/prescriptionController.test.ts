import { Request, Response } from 'express';
import {
  getPrescriptionController,
  printPrescriptionController,
  markPrintedController
} from '../prescriptionController';
import * as prescriptionService from '../../services/prescriptionService';

jest.mock('../../services/prescriptionService');

const mockPrescriptionService = prescriptionService as jest.Mocked<typeof prescriptionService>;

describe('PrescriptionController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = {
      params: {},
      query: {},
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('getPrescriptionController', () => {
    it('should get prescription by ID successfully', async () => {
      const mockPrescription = {
        id: 'rx1',
        consultationId: 'c1',
        status: 'Generated' as const,
        generatedAt: new Date('2026-05-01'),
        printedAt: null,
        patientName: 'John Doe',
        patientAge: 36,
        patientDOB: '1990-01-15',
        patientGender: 'M' as const,
        patientPhone: '9876543210',
        date: new Date('2026-05-01'),
        vitals: {
          temperature: 98.6,
          bp: '120/80',
          pulse: 72
        },
        diagnosis: 'Flu',
        complaints: 'Fever and headache',
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
          name: 'City Clinic',
          address: '123 Main St',
          phone: '555-1234'
        }
      };

      mockReq.params = { id: 'rx1' };
      mockPrescriptionService.getPrescriptionById.mockResolvedValueOnce(mockPrescription);

      await getPrescriptionController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        prescription: expect.objectContaining({
          id: 'rx1',
          patientName: 'John Doe',
          diagnosis: 'Flu'
        })
      });
      expect(mockPrescriptionService.getPrescriptionById).toHaveBeenCalledWith('rx1');
    });

    it('should return 404 if prescription not found', async () => {
      mockReq.params = { id: 'nonexistent' };
      mockPrescriptionService.getPrescriptionById.mockResolvedValueOnce(null);

      await getPrescriptionController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Prescription not found'
      });
    });

    it('should handle service errors', async () => {
      mockReq.params = { id: 'rx1' };
      const error = new Error('Database error');
      mockPrescriptionService.getPrescriptionById.mockRejectedValueOnce(error);

      await getPrescriptionController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Failed to fetch prescription'
        })
      );
    });
  });

  describe('printPrescriptionController', () => {
    it('should generate prescription HTML successfully', async () => {
      const mockPrescription = {
        id: 'rx1',
        consultationId: 'c1',
        status: 'Generated' as const,
        generatedAt: new Date('2026-05-01'),
        printedAt: null,
        patientName: 'John Doe',
        patientAge: 36,
        patientDOB: '1990-01-15',
        patientGender: 'M' as const,
        patientPhone: '9876543210',
        date: new Date('2026-05-01'),
        vitals: {
          temperature: 98.6,
          bp: '120/80',
          pulse: 72
        },
        diagnosis: 'Flu',
        complaints: 'Fever',
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
          name: 'City Clinic',
          address: '123 Main St',
          phone: '555-1234'
        }
      };

      const mockHTML = '<html><body>Prescription</body></html>';

      mockReq.params = { id: 'rx1' };
      mockPrescriptionService.getPrescriptionById.mockResolvedValueOnce(mockPrescription);
      mockPrescriptionService.generatePrescriptionHTML.mockReturnValueOnce(mockHTML);

      await printPrescriptionController(mockReq as Request, mockRes as Response);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/html');
      expect(mockRes.send).toHaveBeenCalledWith(mockHTML);
    });

    it('should return 404 if prescription not found', async () => {
      mockReq.params = { id: 'nonexistent' };
      mockPrescriptionService.getPrescriptionById.mockResolvedValueOnce(null);

      await printPrescriptionController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Prescription not found'
      });
    });

    it('should handle errors', async () => {
      mockReq.params = { id: 'rx1' };
      mockPrescriptionService.getPrescriptionById.mockRejectedValueOnce(new Error('DB error'));

      await printPrescriptionController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Failed to print prescription'
        })
      );
    });

    it('should return 501 for PDF format', async () => {
      const mockPrescription = {
        id: 'rx1',
        consultationId: 'c1',
        status: 'Generated' as const,
        generatedAt: new Date('2026-05-01'),
        printedAt: null,
        patientName: 'John Doe',
        patientAge: 36,
        patientDOB: '1990-01-15',
        patientGender: 'M' as const,
        patientPhone: '9876543210',
        date: new Date('2026-05-01'),
        vitals: {
          temperature: 98.6,
          bp: '120/80',
          pulse: 72
        },
        diagnosis: 'Flu',
        complaints: 'Fever',
        medications: [],
        clinicHeader: {
          name: 'City Clinic',
          address: '123 Main St',
          phone: '555-1234'
        }
      };

      mockReq.params = { id: 'rx1' };
      mockReq.query = { format: 'pdf' };
      mockPrescriptionService.getPrescriptionById.mockResolvedValueOnce(mockPrescription);

      await printPrescriptionController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(501);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'PDF generation not yet implemented',
        message: 'Use format=html and print from browser, or wait for puppeteer integration'
      });
    });

    it('should return 400 for invalid format', async () => {
      const mockPrescription = {
        id: 'rx1',
        consultationId: 'c1',
        status: 'Generated' as const,
        generatedAt: new Date('2026-05-01'),
        printedAt: null,
        patientName: 'John Doe',
        patientAge: 36,
        patientDOB: '1990-01-15',
        patientGender: 'M' as const,
        patientPhone: '9876543210',
        date: new Date('2026-05-01'),
        vitals: {
          temperature: 98.6,
          bp: '120/80',
          pulse: 72
        },
        diagnosis: 'Flu',
        complaints: 'Fever',
        medications: [],
        clinicHeader: {
          name: 'City Clinic',
          address: '123 Main St',
          phone: '555-1234'
        }
      };

      mockReq.params = { id: 'rx1' };
      mockReq.query = { format: 'xml' };
      mockPrescriptionService.getPrescriptionById.mockResolvedValueOnce(mockPrescription);

      await printPrescriptionController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid format',
        message: 'Format must be either "pdf" or "html"'
      });
    });
  });

  describe('markPrintedController', () => {
    it('should mark prescription as printed successfully', async () => {
      const printedAt = new Date();
      const mockResult = {
        id: 'rx1',
        printedAt
      };

      mockReq.params = { id: 'rx1' };
      mockPrescriptionService.markAsPrinted.mockResolvedValueOnce(mockResult);

      await markPrintedController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        prescription: mockResult
      });
      expect(mockPrescriptionService.markAsPrinted).toHaveBeenCalledWith('rx1');
    });

    it('should handle prescription not found error', async () => {
      mockReq.params = { id: 'nonexistent' };
      const error = new Error('Prescription not found');
      mockPrescriptionService.markAsPrinted.mockRejectedValueOnce(error);

      await markPrintedController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Prescription not found'
      });
    });

    it('should handle other errors', async () => {
      mockReq.params = { id: 'rx1' };
      mockPrescriptionService.markAsPrinted.mockRejectedValueOnce(new Error('Database error'));

      await markPrintedController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Failed to mark prescription as printed'
        })
      );
    });
  });
});
