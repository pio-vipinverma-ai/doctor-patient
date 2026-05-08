import { Request, Response } from 'express';
import {
  createPatientController,
  getPatientController,
  searchPatientsController,
  updatePatientController
} from '../patientController';
import * as patientService from '../../services/patientService';

jest.mock('../../services/patientService');

const mockPatientService = patientService as jest.Mocked<typeof patientService>;

describe('PatientController', () => {
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

  describe('createPatientController', () => {
    it('should create patient successfully', async () => {
      const mockPatient = {
        id: 'p1',
        name: 'John Doe',
        phone: '9876543210',
        dob: '1990-01-01',
        gender: 'M' as const,
        address: '123 Main St',
        email: undefined,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockReq.body = {
        name: 'John Doe',
        phone: '9876543210',
        dob: '1990-01-01',
        gender: 'M',
        address: '123 Main St'
      };

      mockPatientService.createPatient.mockResolvedValueOnce(mockPatient);

      await createPatientController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        patient: expect.objectContaining({
          id: mockPatient.id,
          name: mockPatient.name,
          phone: mockPatient.phone,
          age: expect.any(Number)
        })
      });
    });

    it('should handle duplicate phone error', async () => {
      mockReq.body = {
        name: 'John Doe',
        phone: '9876543210',
        dob: '1990-01-01',
        gender: 'M'
      };

      const error: any = new Error('Duplicate phone');
      error.code = '23505';
      mockPatientService.createPatient.mockRejectedValueOnce(error);

      await createPatientController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Phone number already exists',
        statusCode: 409
      });
    });

    it('should handle other errors', async () => {
      mockReq.body = {
        name: 'John Doe',
        phone: '9876543210'
      };

      const error = new Error('Database error');
      mockPatientService.createPatient.mockRejectedValueOnce(error);

      await createPatientController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getPatientController', () => {
    it('should return patient by id', async () => {
      const mockPatient = {
        id: 'p1',
        name: 'John Doe',
        phone: '9876543210',
        dob: '1990-01-01',
        gender: 'M' as const,
        address: '123 Main St',
        email: undefined,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockReq.params = { id: 'p1' };
      mockPatientService.getPatientById.mockResolvedValueOnce(mockPatient);

      await getPatientController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        patient: expect.objectContaining({
          id: mockPatient.id,
          name: mockPatient.name,
          age: expect.any(Number)
        })
      });
    });

    it('should return 404 if patient not found', async () => {
      mockReq.params = { id: 'nonexistent' };
      mockPatientService.getPatientById.mockResolvedValueOnce(null);

      await getPatientController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Patient not found'
      });
    });
  });

  describe('searchPatientsController', () => {
    it('should search patients with query', async () => {
      const mockPatients = [
        { 
          id: 'p1', 
          name: 'John Doe', 
          phone: '9876543210',
          age: 34,
          gender: 'M' as 'M' | 'F' | 'Other',
          lastVisit: '2026-05-01'
        }
      ];

      mockReq.query = { q: 'John' };
      mockPatientService.searchPatients.mockResolvedValueOnce(mockPatients);

      await searchPatientsController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        patients: mockPatients,
        total: mockPatients.length
      });
    });

    it('should return error if no query provided', async () => {
      mockReq.query = {};

      await searchPatientsController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Search query is required'
      });
    });
  });

  describe('updatePatientController', () => {
    it('should update patient successfully', async () => {
      const mockPatient = {
        id: 'p1',
        name: 'John Updated',
        phone: '9876543210',
        dob: '1990-01-01',
        gender: 'M' as const,
        address: '456 New St',
        email: undefined,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockReq.params = { id: 'p1' };
      mockReq.body = { name: 'John Updated', address: '456 New St' };
      mockPatientService.updatePatient.mockResolvedValueOnce(mockPatient);

      await updatePatientController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        patient: expect.objectContaining({
          id: mockPatient.id,
          name: mockPatient.name,
          age: expect.any(Number)
        })
      });
    });

    it('should return 404 if patient not found', async () => {
      mockReq.params = { id: 'nonexistent' };
      mockReq.body = { name: 'Updated' };
      mockPatientService.updatePatient.mockResolvedValueOnce(null);

      await updatePatientController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Patient not found'
      });
    });
  });
});
