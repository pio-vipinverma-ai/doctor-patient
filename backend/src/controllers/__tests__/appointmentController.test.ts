import { Request, Response } from 'express';
import {
  createAppointmentController,
  getAppointmentsController,
  updateAppointmentController
} from '../appointmentController';
import * as appointmentService from '../../services/appointmentService';

jest.mock('../../services/appointmentService');

const mockAppointmentService = appointmentService as jest.Mocked<typeof appointmentService>;

describe('AppointmentController', () => {
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

  describe('createAppointmentController', () => {
    it('should schedule appointment successfully', async () => {
      const mockAppointment = {
        id: 'a1',
        patient_id: 'p1',
        scheduled_time: new Date('2026-05-10T10:00:00'),
        status: 'Scheduled' as const,
        reason: 'Checkup',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockReq.body = {
        patientId: 'p1',
        scheduledTime: '2026-05-10T10:00:00',
        reason: 'Checkup'
      };

      mockAppointmentService.validateAppointmentInput.mockReturnValueOnce({
        valid: true,
        errors: []
      });
      mockAppointmentService.createAppointment.mockResolvedValueOnce(mockAppointment);

      await createAppointmentController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        appointment: {
          id: mockAppointment.id,
          patientId: mockAppointment.patient_id,
          scheduledTime: mockAppointment.scheduled_time,
          status: mockAppointment.status,
          reason: mockAppointment.reason,
          created_at: mockAppointment.created_at
        }
      });
    });

    it('should handle validation errors', async () => {
      mockReq.body = {
        patientId: '',
        scheduledTime: 'invalid-date'
      };

      mockAppointmentService.validateAppointmentInput.mockReturnValueOnce({
        valid: false,
        errors: ['Patient ID is required', 'Invalid scheduled time']
      });

      await createAppointmentController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Patient ID is required'
        })
      );
    });

    it('should handle double-booking error', async () => {
      mockReq.body = {
        patientId: 'p1',
        scheduledTime: '2026-05-10T10:00:00',
        reason: 'Checkup'
      };

      mockAppointmentService.validateAppointmentInput.mockReturnValueOnce({
        valid: true,
        errors: []
      });

      const error = new Error('Patient already has appointment at this time');
      mockAppointmentService.createAppointment.mockRejectedValueOnce(error);

      await createAppointmentController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Patient already has appointment at this time',
        statusCode: 409
      });
    });

    it('should handle other errors', async () => {
      mockReq.body = {
        patientId: 'p1',
        scheduledTime: '2026-05-10T10:00:00'
      };

      mockAppointmentService.validateAppointmentInput.mockReturnValueOnce({
        valid: true,
        errors: []
      });

      const error = new Error('Database error');
      mockAppointmentService.createAppointment.mockRejectedValueOnce(error);

      await createAppointmentController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getAppointmentsController', () => {
    it('should get appointments by date', async () => {
      const mockAppointments = [
        {
          id: 'a1',
          patientId: 'p1',
          patientName: 'John Doe',
          phone: '9876543210',
          scheduledTime: '2026-05-10T10:00:00',
          status: 'Scheduled' as const,
          reason: 'Checkup',
          consultationSaved: false
        }
      ];

      mockReq.query = { date: '2026-05-10' };
      mockAppointmentService.getAppointmentsByDate.mockResolvedValueOnce(mockAppointments);

      await getAppointmentsController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        appointments: mockAppointments
      });
    });

    it('should filter by status if provided', async () => {
      const mockAppointments = [
        {
          id: 'a1',
          patientId: 'p1',
          patientName: 'John Doe',
          phone: '9876543210',
          scheduledTime: '2026-05-10T10:00:00',
          status: 'Completed' as const,
          reason: 'Checkup',
          consultationSaved: true
        }
      ];

      mockReq.query = { date: '2026-05-10', status: 'Completed' };
      mockAppointmentService.getAppointmentsByDate.mockResolvedValueOnce(mockAppointments);

      await getAppointmentsController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        appointments: mockAppointments
      });
      expect(mockAppointmentService.getAppointmentsByDate).toHaveBeenCalledWith('2026-05-10', 'Completed');
    });
  });

  describe('updateAppointmentController', () => {
    it('should update appointment status successfully', async () => {
      const mockAppointment = {
        id: 'a1',
        patient_id: 'p1',
        scheduled_time: new Date('2026-05-10T10:00:00'),
        status: 'Completed' as const,
        reason: 'Checkup',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockReq.params = { id: 'a1' };
      mockReq.body = { status: 'Completed' };
      
      mockAppointmentService.isValidStatus.mockReturnValueOnce(true);
      mockAppointmentService.getAppointmentById.mockResolvedValueOnce(mockAppointment);
      mockAppointmentService.updateAppointment.mockResolvedValueOnce(mockAppointment);

      await updateAppointmentController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        appointment: {
          id: mockAppointment.id,
          patientId: mockAppointment.patient_id,
          scheduledTime: mockAppointment.scheduled_time,
          status: mockAppointment.status,
          reason: mockAppointment.reason,
          updated_at: mockAppointment.updated_at
        }
      });
    });

    it('should return 404 if appointment not found', async () => {
      mockReq.params = { id: 'nonexistent' };
      mockReq.body = { status: 'Completed' };
      
      mockAppointmentService.isValidStatus.mockReturnValueOnce(true);
      mockAppointmentService.getAppointmentById.mockResolvedValueOnce(null);

      await updateAppointmentController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Appointment not found'
      });
    });

    it('should return 400 for invalid status', async () => {
      mockReq.params = { id: 'a1' };
      mockReq.body = { status: 'InvalidStatus' };
      
      mockAppointmentService.isValidStatus.mockReturnValueOnce(false);

      await updateAppointmentController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid status. Must be: Scheduled, Completed, Cancelled, or No-show'
      });
    });

    it('should handle database errors during update', async () => {
      const mockAppointment = {
        id: 'a1',
        patient_id: 'p1',
        scheduled_time: new Date(),
        status: 'Scheduled' as const,
        reason: 'Checkup',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockReq.params = { id: 'a1' };
      mockReq.body = { status: 'Completed' };
      
      mockAppointmentService.isValidStatus.mockReturnValueOnce(true);
      mockAppointmentService.getAppointmentById.mockResolvedValueOnce(mockAppointment);
      mockAppointmentService.updateAppointment.mockRejectedValueOnce(new Error('Database error'));

      await updateAppointmentController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to update appointment'
      });
    });

    it('should update without status validation if status not provided', async () => {
      const mockAppointment = {
        id: 'a1',
        patient_id: 'p1',
        scheduled_time: new Date(),
        status: 'Scheduled' as const,
        reason: 'Updated reason',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockReq.params = { id: 'a1' };
      mockReq.body = { reason: 'Updated reason' };
      
      mockAppointmentService.getAppointmentById.mockResolvedValueOnce(mockAppointment);
      mockAppointmentService.updateAppointment.mockResolvedValueOnce(mockAppointment);

      await updateAppointmentController(mockReq as Request, mockRes as Response);

      expect(mockAppointmentService.isValidStatus).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getAppointmentsController', () => {
    it('should handle database errors', async () => {
      mockReq.query = { date: '2026-05-10' };
      mockAppointmentService.getAppointmentsByDate.mockRejectedValueOnce(new Error('Database error'));

      await getAppointmentsController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to retrieve appointments'
      });
    });

    it('should use current date if date not provided', async () => {
      const mockAppointments = [
        {
          id: 'a1',
          patientId: 'p1',
          patientName: 'John Doe',
          phone: '9876543210',
          scheduledTime: '2026-05-08T10:00:00',
          status: 'Scheduled' as const,
          reason: 'Checkup',
          consultationSaved: false
        }
      ];

      mockReq.query = {};
      mockAppointmentService.getAppointmentsByDate.mockResolvedValueOnce(mockAppointments);

      await getAppointmentsController(mockReq as Request, mockRes as Response);

      expect(mockAppointmentService.getAppointmentsByDate).toHaveBeenCalledWith(
        expect.stringContaining('2026-05-08'),
        undefined
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createAppointmentController edge cases', () => {
    it('should handle patient not found error', async () => {
      mockReq.body = {
        patientId: 'nonexistent',
        scheduledTime: '2026-05-10T10:00:00',
        reason: 'Checkup'
      };

      mockAppointmentService.validateAppointmentInput.mockReturnValueOnce({
        valid: true,
        errors: []
      });

      const error = new Error('Patient not found');
      mockAppointmentService.createAppointment.mockRejectedValueOnce(error);

      await createAppointmentController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Patient not found'
      });
    });
  });
});

