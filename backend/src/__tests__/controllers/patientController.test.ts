import { Request, Response } from 'express';
import * as patientController from '../../controllers/patientController';
import * as patientService from '../../services/patientService';

jest.mock('../../services/patientService');

describe('Patient Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {
      body: {},
      params: {},
      query: {},
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
  });

  describe('createPatientController', () => {
    it('should create patient successfully', async () => {
      const patientData = {
        name: 'John Doe',
        phone: '1234567890',
        dob: '1990-01-01',
        gender: 'male',
        bloodGroup: 'O+',
      };

      const createdPatient = {
        id: '1',
        ...patientData,
        dob: new Date('1990-01-01'),
      };

      mockRequest.body = patientData;

      (patientService.validatePatientInput as jest.Mock).mockReturnValue({
        valid: true,
        errors: [],
      });

      (patientService.createPatient as jest.Mock).mockResolvedValue(createdPatient);

      await patientController.createPatientController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          patient: expect.objectContaining({
            id: '1',
            name: 'John Doe',
          }),
        })
      );
    });

    it('should return 400 for invalid input', async () => {
      mockRequest.body = { name: '' };

      (patientService.validatePatientInput as jest.Mock).mockReturnValue({
        valid: false,
        errors: ['Name is required'],
      });

      await patientController.createPatientController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Name is required',
        details: { errors: ['Name is required'] },
      });
    });

    it('should return 409 for duplicate phone number', async () => {
      mockRequest.body = {
        name: 'John Doe',
        phone: '1234567890',
        dob: '1990-01-01',
      };

      (patientService.validatePatientInput as jest.Mock).mockReturnValue({
        valid: true,
        errors: [],
      });

      (patientService.createPatient as jest.Mock).mockRejectedValue(
        new Error('Phone number already exists')
      );

      await patientController.createPatientController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Phone number already exists',
        statusCode: 409,
      });
    });

    it('should return 500 for internal errors', async () => {
      mockRequest.body = {
        name: 'John Doe',
        phone: '1234567890',
        dob: '1990-01-01',
      };

      (patientService.validatePatientInput as jest.Mock).mockReturnValue({
        valid: true,
        errors: [],
      });

      (patientService.createPatient as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await patientController.createPatientController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to create patient',
      });
    });
  });

  describe('getPatientController', () => {
    it('should get patient successfully', async () => {
      const patient = {
        id: '1',
        name: 'John Doe',
        dob: new Date('1990-01-01'),
        phone: '1234567890',
      };

      mockRequest.params = { id: '1' };

      (patientService.getPatientById as jest.Mock).mockResolvedValue(patient);

      await patientController.getPatientController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          patient: expect.objectContaining({
            id: '1',
            name: 'John Doe',
          }),
        })
      );
    });

    it('should return 404 for non-existent patient', async () => {
      mockRequest.params = { id: '999' };

      (patientService.getPatientById as jest.Mock).mockResolvedValue(null);

      await patientController.getPatientController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Patient not found',
      });
    });

    it('should return 500 for internal errors', async () => {
      mockRequest.params = { id: '1' };

      (patientService.getPatientById as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await patientController.getPatientController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to retrieve patient',
      });
    });
  });

  describe('searchPatientsController', () => {
    it('should search patients successfully', async () => {
      const patients = [
        { id: '1', name: 'John Doe', phone: '1234567890' },
        { id: '2', name: 'Jane Doe', phone: '0987654321' },
      ];

      mockRequest.query = { q: 'Doe', limit: '10' };

      (patientService.searchPatients as jest.Mock).mockResolvedValue(patients);

      await patientController.searchPatientsController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        patients,
        total: 2,
      });
    });

    it('should return 400 for empty search query', async () => {
      mockRequest.query = { q: '', limit: '10' };

      await patientController.searchPatientsController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Search query is required',
      });
    });

    it('should return 400 for missing search query', async () => {
      mockRequest.query = { limit: '10' };

      await patientController.searchPatientsController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Search query is required',
      });
    });

    it('should use default limit if not provided', async () => {
      mockRequest.query = { q: 'Doe' };

      (patientService.searchPatients as jest.Mock).mockResolvedValue([]);

      await patientController.searchPatientsController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(patientService.searchPatients).toHaveBeenCalledWith('Doe', 10);
    });

    it('should return 500 for internal errors', async () => {
      mockRequest.query = { q: 'Doe', limit: '10' };

      (patientService.searchPatients as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await patientController.searchPatientsController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to search patients',
      });
    });
  });

  describe('updatePatientController', () => {
    it('should update patient successfully', async () => {
      const existingPatient = {
        id: '1',
        name: 'John Doe',
        dob: new Date('1990-01-01'),
        phone: '1234567890',
      };

      const updatedPatient = {
        ...existingPatient,
        name: 'John Smith',
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'John Smith' };

      (patientService.getPatientById as jest.Mock).mockResolvedValue(existingPatient);
      (patientService.updatePatient as jest.Mock).mockResolvedValue(updatedPatient);

      await patientController.updatePatientController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          patient: expect.objectContaining({
            name: 'John Smith',
          }),
        })
      );
    });

    it('should return 404 for non-existent patient', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { name: 'John Smith' };

      (patientService.getPatientById as jest.Mock).mockResolvedValue(null);

      await patientController.updatePatientController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Patient not found',
      });
    });

    it('should return 400 for invalid name', async () => {
      const existingPatient = {
        id: '1',
        name: 'John Doe',
        dob: new Date('1990-01-01'),
        phone: '1234567890',
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = { name: '' };

      (patientService.getPatientById as jest.Mock).mockResolvedValue(existingPatient);

      await patientController.updatePatientController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid name',
      });
    });

    it('should return 500 for internal errors', async () => {
      const existingPatient = {
        id: '1',
        name: 'John Doe',
        dob: new Date('1990-01-01'),
        phone: '1234567890',
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'John Smith' };

      (patientService.getPatientById as jest.Mock).mockResolvedValue(existingPatient);
      (patientService.updatePatient as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await patientController.updatePatientController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to update patient',
      });
    });
  });
});
