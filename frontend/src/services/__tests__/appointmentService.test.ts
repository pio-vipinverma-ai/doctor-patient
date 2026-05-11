import axios from 'axios';
import {
  getAppointmentsByDate,
  createAppointment,
  updateAppointment,
  getAppointmentById,
  getAppointmentsByPatient,
  getTodaysAppointments
} from '../appointmentService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('appointmentService', () => {
  const mockToken = 'test-token';

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', mockToken);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getAppointmentsByDate', () => {
    it('should fetch appointments for a specific date', async () => {
      const mockAppointments = [
        {
          id: 'a1',
          patientId: 'p1',
          patientName: 'John Doe',
          phone: '1234567890',
          scheduledTime: '2026-05-08T10:00:00',
          status: 'Scheduled',
          reason: 'Checkup',
          consultationSaved: false
        }
      ];

      mockedAxios.get.mockResolvedValueOnce({ data: { appointments: mockAppointments } });

      const result = await getAppointmentsByDate('2026-05-08');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:5000/api/appointments',
        expect.objectContaining({
          params: { date: '2026-05-08' },
          headers: expect.objectContaining({ Authorization: `Bearer ${mockToken}` })
        })
      );
      expect(result).toEqual(mockAppointments);
    });

    it('should fetch appointments with status filter', async () => {
      const mockAppointments = [];
      mockedAxios.get.mockResolvedValueOnce({ data: { appointments: mockAppointments } });

      await getAppointmentsByDate('2026-05-08', 'Scheduled');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:5000/api/appointments',
        expect.objectContaining({
          params: { date: '2026-05-08', status: 'Scheduled' }
        })
      );
    });

    it('should throw error on failed fetch', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { data: { error: 'Database error' } }
      });

      await expect(getAppointmentsByDate('2026-05-08'))
        .rejects.toThrow('Database error');
    });

    it('should throw generic error on network failure', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(getAppointmentsByDate('2026-05-08'))
        .rejects.toThrow('Failed to fetch appointments');
    });
  });

  describe('createAppointment', () => {
    it('should create a new appointment', async () => {
      const appointmentData = {
        patientId: 'p1',
        scheduledTime: '2026-05-10T10:00:00',
        reason: 'Checkup'
      };

      const mockResponse = {
        data: {
          success: true,
          appointment: { ...appointmentData, id: 'a1', status: 'Scheduled' }
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await createAppointment(appointmentData);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:5000/api/appointments',
        appointmentData,
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: `Bearer ${mockToken}` })
        })
      );
      expect(result).toEqual(mockResponse.data.appointment);
    });

    it('should throw error on creation failure', async () => {
      const appointmentData = {
        patientId: 'p1',
        scheduledTime: '2026-05-10T10:00:00',
        reason: 'Checkup'
      };

      mockedAxios.post.mockRejectedValueOnce({
        response: { data: { error: 'Patient not found' } }
      });

      await expect(createAppointment(appointmentData))
        .rejects.toThrow('Patient not found');
    });
  });

  describe('updateAppointment', () => {
    it('should update appointment status', async () => {
      const mockResponse = {
        data: {
          success: true,
          appointment: { id: 'a1', status: 'Completed' }
        }
      };

      mockedAxios.put.mockResolvedValueOnce(mockResponse);

      const result = await updateAppointment('a1', { status: 'Completed' });

      expect(mockedAxios.put).toHaveBeenCalledWith(
        'http://localhost:5000/api/appointments/a1',
        { status: 'Completed' },
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: `Bearer ${mockToken}` })
        })
      );
      expect(result).toEqual(mockResponse.data.appointment);
    });

    it('should throw error on update failure', async () => {
      mockedAxios.put.mockRejectedValueOnce({
        response: { data: { error: 'Appointment not found' } }
      });

      await expect(updateAppointment('a1', { status: 'Completed' }))
        .rejects.toThrow('Appointment not found');
    });
  });

  describe('getAppointmentById', () => {
    it('should fetch appointment by ID', async () => {
      const mockAppointment = {
        id: 'a1',
        patientId: 'p1',
        scheduledTime: '2026-05-10T10:00:00',
        status: 'Scheduled',
        reason: 'Checkup'
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: { appointment: mockAppointment }
      });

      const result = await getAppointmentById('a1');

      expect(result).toEqual(mockAppointment);
    });

    it('should throw error when appointment not found', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { data: { error: 'Appointment not found' } }
      });

      await expect(getAppointmentById('a1'))
        .rejects.toThrow('Appointment not found');
    });
  });

  describe('getAppointmentsByPatient', () => {
    it('should fetch appointments for a specific patient', async () => {
      const mockAppointments = [
        {
          id: 'a1',
          patientId: 'p1',
          patientName: 'John Doe',
          phone: '1234567890',
          scheduledTime: '2026-05-08T10:00:00',
          status: 'Scheduled',
          reason: 'Checkup',
          consultationSaved: false
        },
        {
          id: 'a2',
          patientId: 'p1',
          patientName: 'John Doe',
          phone: '1234567890',
          scheduledTime: '2026-05-09T14:00:00',
          status: 'Completed',
          reason: 'Follow-up',
          consultationSaved: true
        }
      ];

      mockedAxios.get.mockResolvedValueOnce({ data: { appointments: mockAppointments } });

      const result = await getAppointmentsByPatient('p1');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:5000/api/appointments',
        expect.objectContaining({
          params: { patientId: 'p1' },
          headers: expect.objectContaining({ Authorization: `Bearer ${mockToken}` })
        })
      );
      expect(result).toEqual(mockAppointments);
    });

    it('should fetch appointments for patient with status filter', async () => {
      const mockAppointments = [
        {
          id: 'a1',
          patientId: 'p1',
          patientName: 'John Doe',
          phone: '1234567890',
          scheduledTime: '2026-05-08T10:00:00',
          status: 'Scheduled',
          reason: 'Checkup',
          consultationSaved: false
        }
      ];

      mockedAxios.get.mockResolvedValueOnce({ data: { appointments: mockAppointments } });

      const result = await getAppointmentsByPatient('p1', 'Scheduled');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:5000/api/appointments',
        expect.objectContaining({
          params: { patientId: 'p1', status: 'Scheduled' }
        })
      );
      expect(result).toEqual(mockAppointments);
    });

    it('should throw error on failed fetch', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { data: { error: 'Patient not found' } }
      });

      await expect(getAppointmentsByPatient('p1'))
        .rejects.toThrow('Patient not found');
    });

    it('should handle empty appointments list for patient', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { appointments: [] } });

      const result = await getAppointmentsByPatient('p1');
      expect(result).toEqual([]);
    });
  });

  describe('getTodaysAppointments', () => {
    it('should fetch today\'s appointments', async () => {
      const today = new Date().toISOString().split('T')[0];
      const mockAppointments = [
        {
          id: 'a1',
          patientId: 'p1',
          patientName: 'John Doe',
          phone: '1234567890',
          scheduledTime: `${today}T10:00:00`,
          status: 'Scheduled',
          reason: 'Checkup',
          consultationSaved: false
        }
      ];

      mockedAxios.get.mockResolvedValueOnce({ data: { appointments: mockAppointments } });

      const result = await getTodaysAppointments();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:5000/api/appointments',
        expect.objectContaining({
          params: { date: today }
        })
      );
      expect(result).toEqual(mockAppointments);
    });

    it('should handle no appointments for today', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { appointments: [] } });

      const result = await getTodaysAppointments();
      expect(result).toEqual([]);
    });

    it('should throw error on failed fetch', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { data: { error: 'Database error' } }
      });

      await expect(getTodaysAppointments())
        .rejects.toThrow('Database error');
    });
  });

  describe('edge cases', () => {
    it('should handle empty appointments list', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { appointments: [] } });

      const result = await getAppointmentsByDate('2026-05-08');
      expect(result).toEqual([]);
    });

    it('should handle malformed response', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: null });

      await expect(getAppointmentsByDate('2026-05-08')).rejects.toThrow();
    });

    it('should handle appointment time conflict', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          status: 409,
          data: { error: 'Time slot already booked' }
        }
      });

      await expect(createAppointment({
        patientId: 'p1',
        scheduledTime: '2026-05-10T10:00:00',
        reason: 'Checkup'
      })).rejects.toThrow();
    });

    it('should handle invalid date format', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: { data: { error: 'Invalid date format' } }
      });

      await expect(createAppointment({
        patientId: 'p1',
        scheduledTime: 'invalid-date',
        reason: 'Checkup'
      })).rejects.toThrow();
    });

    it('should handle network timeout', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        code: 'ECONNABORTED',
        message: 'timeout'
      });

      await expect(getAppointmentsByDate('2026-05-08')).rejects.toThrow();
    });
  });
});

