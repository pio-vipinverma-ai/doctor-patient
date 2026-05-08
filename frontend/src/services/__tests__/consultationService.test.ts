import axios from 'axios';
import {
  createConsultation,
  getConsultationById,
  getPatientConsultations
} from '../consultationService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('consultationService', () => {
  const mockToken = 'test-token';

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', mockToken);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('createConsultation', () => {
    it('should create a consultation with vitals and medications', async () => {
      const consultationData = {
        patientId: 'p1',
        appointmentId: 'a1',
        temperature: 98.6,
        bpSystolic: 120,
        bpDiastolic: 80,
        pulse: 72,
        complaints: 'Headache',
        diagnosis: 'Viral infection',
        medications: [
          {
            name: 'Paracetamol',
            dosage: '500mg',
            frequency: 'Twice daily',
            duration: '5 days',
            instructions: 'After meals'
          }
        ]
      };

      const mockResponse = {
        data: {
          success: true,
          consultation: {
            id: 'c1',
            ...consultationData,
            bp: '120/80',
            created_at: '2026-05-08'
          }
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await createConsultation(consultationData);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:5000/api/consultations',
        consultationData,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          })
        })
      );
      expect(result).toEqual(mockResponse.data.consultation);
    });

    it('should throw error on creation failure', async () => {
      const consultationData = {
        patientId: 'p1',
        appointmentId: 'a1',
        temperature: 98.6,
        bpSystolic: 120,
        bpDiastolic: 80,
        pulse: 72,
        complaints: 'Headache',
        diagnosis: 'Viral infection',
        medications: []
      };

      mockedAxios.post.mockRejectedValueOnce({
        response: { data: { error: 'At least 1 medication required' } }
      });

      await expect(createConsultation(consultationData))
        .rejects.toThrow('At least 1 medication required');
    });

    it('should throw generic error on network failure', async () => {
      const consultationData = {
        patientId: 'p1',
        appointmentId: 'a1',
        temperature: 98.6,
        bpSystolic: 120,
        bpDiastolic: 80,
        pulse: 72,
        complaints: 'Headache',
        diagnosis: 'Viral infection',
        medications: [{ name: 'Med', dosage: '10mg', frequency: 'Daily', duration: '5 days', instructions: '' }]
      };

      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

      await expect(createConsultation(consultationData))
        .rejects.toThrow('Failed to create consultation');
    });
  });

  describe('getConsultationById', () => {
    it('should fetch consultation by ID', async () => {
      const mockConsultation = {
        id: 'c1',
        patientId: 'p1',
        temperature: 98.6,
        bp: '120/80',
        pulse: 72,
        diagnosis: 'Viral infection',
        complaints: 'Headache',
        medications: [],
        created_at: '2026-05-08'
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: { success: true, consultation: mockConsultation }
      });

      const result = await getConsultationById('c1');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:5000/api/consultations/c1',
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: `Bearer ${mockToken}` })
        })
      );
      expect(result).toEqual(mockConsultation);
    });

    it('should throw error when consultation not found', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { data: { error: 'Consultation not found' } }
      });

      await expect(getConsultationById('c1'))
        .rejects.toThrow('Consultation not found');
    });
  });

  describe('getPatientConsultations', () => {
    it('should fetch patient consultation history', async () => {
      const mockResponse = {
        consultations: [
          { id: 'c1', patientId: 'p1', diagnosis: 'Flu', date: '2026-05-01' },
          { id: 'c2', patientId: 'p1', diagnosis: 'Cold', date: '2026-04-01' }
        ],
        total: 2,
        pages: 1,
        currentPage: 1
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: mockResponse
      });

      const result = await getPatientConsultations('p1');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:5000/api/patients/p1/consultations',
        expect.objectContaining({
          params: { limit: 10, offset: 0 },
          headers: expect.objectContaining({ Authorization: `Bearer ${mockToken}` })
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch with custom pagination and date filters', async () => {
      const mockResponse = {
        consultations: [],
        total: 0,
        pages: 0,
        currentPage: 2
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: mockResponse
      });

      await getPatientConsultations('p1', 20, 20, '2026-01-01', '2026-05-31');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:5000/api/patients/p1/consultations',
        expect.objectContaining({
          params: {
            limit: 20,
            offset: 20,
            from: '2026-01-01',
            to: '2026-05-31'
          }
        })
      );
    });

    it('should throw error on fetch failure', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { data: { error: 'Patient not found' } }
      });

      await expect(getPatientConsultations('p1'))
        .rejects.toThrow('Patient not found');
    });

    it('should throw generic error on network failure', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(getPatientConsultations('p1'))
        .rejects.toThrow('Failed to fetch consultation history');
    });
  });

  describe('edge cases', () => {
    it('should handle invalid medication data in createConsultation', async () => {
      const consultationData = {
        patientId: 'p1',
        temperature: 98.6,
        bpSystolic: 120,
        bpDiastolic: 80,
        pulse: 72,
        complaints: 'Headache',
        diagnosis: 'Viral infection',
        medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
      };

      mockedAxios.post.mockRejectedValueOnce({
        response: { data: { error: 'Invalid medication data' } }
      });

      await expect(createConsultation(consultationData))
        .rejects.toThrow('Invalid medication data');
    });

    it('should handle missing required vitals', async () => {
      const consultationData = {
        patientId: 'p1',
        temperature: 0,
        bpSystolic: 0,
        bpDiastolic: 0,
        pulse: 0,
        complaints: 'Headache',
        diagnosis: 'Viral infection',
        medications: [{ name: 'Med', dosage: '10mg', frequency: 'Daily', duration: '5 days', instructions: '' }]
      };

      mockedAxios.post.mockRejectedValueOnce({
        response: { data: { error: 'Invalid vital signs' } }
      });

      await expect(createConsultation(consultationData))
        .rejects.toThrow('Invalid vital signs');
    });

    it('should handle pagination error in getPatientConsultations', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { 
          status: 400,
          data: { error: 'Invalid pagination parameters' } 
        }
      });

      await expect(getPatientConsultations('p1', -1, -1))
        .rejects.toThrow('Invalid pagination parameters');
    });

    it('should handle malformed response in getPatientConsultations', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: null });

      await expect(getPatientConsultations('p1'))
        .rejects.toThrow();
    });

    it('should handle empty medication list', async () => {
      const consultationData = {
        patientId: 'p1',
        temperature: 98.6,
        bpSystolic: 120,
        bpDiastolic: 80,
        pulse: 72,
        complaints: 'Headache',
        diagnosis: 'Viral infection',
        medications: []
      };

      mockedAxios.post.mockRejectedValueOnce({
        response: { data: { error: 'At least one medication required' } }
      });

      await expect(createConsultation(consultationData))
        .rejects.toThrow('At least one medication required');
    });

    it('should handle invalid patient ID in createConsultation', async () => {
      const consultationData = {
        patientId: '',
        temperature: 98.6,
        bpSystolic: 120,
        bpDiastolic: 80,
        pulse: 72,
        complaints: 'Headache',
        diagnosis: 'Viral infection',
        medications: [{ name: 'Med', dosage: '10mg', frequency: 'Daily', duration: '5 days', instructions: '' }]
      };

      mockedAxios.post.mockRejectedValueOnce({
        response: { data: { error: 'Patient ID required' } }
      });

      await expect(createConsultation(consultationData))
        .rejects.toThrow('Patient ID required');
    });

    it('should handle timeout error', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        code: 'ECONNABORTED',
        message: 'timeout exceeded'
      });

      const consultationData = {
        patientId: 'p1',
        temperature: 98.6,
        bpSystolic: 120,
        bpDiastolic: 80,
        pulse: 72,
        complaints: 'Headache',
        diagnosis: 'Viral infection',
        medications: [{ name: 'Med', dosage: '10mg', frequency: 'Daily', duration: '5 days', instructions: '' }]
      };

      await expect(createConsultation(consultationData))
        .rejects.toThrow();
    });
  });
});

