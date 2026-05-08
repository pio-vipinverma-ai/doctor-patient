import axios from 'axios';
import { searchPatients, createPatient, getPatientById } from '../patientService';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('patientService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchPatients', () => {
    it('should search patients by query', async () => {
      const mockResults = {
        data: {
          success: true,
          patients: [
            {
              id: '1',
              name: 'John Doe',
              age: 46,
              gender: 'M',
              phone: '9876543210',
              lastVisit: '2026-05-01T10:00:00.000Z'
            }
          ]
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResults);

      const result = await searchPatients('john');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/patients/search'),
        expect.objectContaining({
          params: expect.objectContaining({ q: 'john' })
        })
      );
      expect(result).toEqual(mockResults.data.patients);
    });

    it('should include limit parameter if provided', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { success: true, patients: [] }
      });

      await searchPatients('john', 5);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/patients/search'),
        expect.objectContaining({
          params: expect.objectContaining({
            q: 'john',
            limit: 5
          })
        })
      );
    });
  });

  describe('createPatient', () => {
    it('should create a new patient', async () => {
      const patientData = {
        name: 'John Doe',
        dob: '1980-01-15',
        gender: 'M' as const,
        phone: '9876543210',
        email: 'john@example.com',
        address: '123 Main St'
      };

      const mockResponse = {
        data: {
          success: true,
          patient: {
            id: '1',
            ...patientData,
            created_at: '2026-05-10T10:00:00.000Z',
            updated_at: '2026-05-10T10:00:00.000Z'
          }
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await createPatient(patientData);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/patients'),
        patientData,
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse.data.patient);
    });

    it('should handle duplicate phone error', async () => {
      const patientData = {
        name: 'Jane Doe',
        dob: '1985-03-20',
        gender: 'F' as const,
        phone: '9876543210'
      };

      const mockError = {
        response: {
          data: {
            success: false,
            error: 'Phone number already exists'
          },
          status: 409
        }
      };

      mockedAxios.post.mockRejectedValueOnce(mockError);

      try {
        await createPatient(patientData);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(mockedAxios.post).toHaveBeenCalled();
      }
    });
  });

  describe('getPatientById', () => {
    it('should fetch patient by ID', async () => {
      const mockPatient = {
        data: {
          success: true,
          patient: {
            id: '1',
            name: 'John Doe',
            dob: '1980-01-15',
            gender: 'M',
            phone: '9876543210',
            email: 'john@example.com',
            address: '123 Main St'
          }
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockPatient);

      const result = await getPatientById('1');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/patients/1'),
        expect.any(Object)
      );
      expect(result).toEqual(mockPatient.data.patient);
    });

    it('should handle patient not found', async () => {
      const mockError = {
        response: {
          data: {
            success: false,
            error: 'Patient not found'
          },
          status: 404
        }
      };

      mockedAxios.get.mockRejectedValueOnce(mockError);

      try {
        await getPatientById('nonexistent');
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(mockedAxios.get).toHaveBeenCalled();
      }
    });
  });
});
