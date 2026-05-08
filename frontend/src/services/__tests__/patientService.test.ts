import axios from 'axios';
import {
  searchPatients,
  getPatientById,
  createPatient,
  updatePatient,
  getAllPatients,
  validatePatientInput
} from '../patientService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('patientService', () => {
  const mockToken = 'test-token';

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', mockToken);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('searchPatients', () => {
    it('should search patients by query', async () => {
      const mockPatients = [
        { id: '1', name: 'John Doe', age: 36, gender: 'M' as const, phone: '1234567890', lastVisit: '2026-05-01' }
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: { patients: mockPatients } });

      const result = await searchPatients('John');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:5000/api/patients/search',
        expect.objectContaining({
          params: { q: 'John', limit: 10 }
        })
      );
      expect(result).toEqual(mockPatients);
    });

    it('should use custom limit', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { patients: [] } });

      await searchPatients('John', 20);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: { q: 'John', limit: 20 }
        })
      );
    });

    it('should throw error on search failure', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { data: { error: 'Search failed' } }
      });

      await expect(searchPatients('John')).rejects.toThrow();
    });
  });

  describe('getPatientById', () => {
    it('should fetch patient by ID', async () => {
      const mockPatient = {
        id: '1',
        name: 'John Doe',
        dob: '1990-01-01',
        age: 36,
        gender: 'M' as const,
        phone: '1234567890'
      };
      mockedAxios.get.mockResolvedValueOnce({ data: { patient: mockPatient } });

      const result = await getPatientById('1');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:5000/api/patients/1',
        expect.any(Object)
      );
      expect(result).toEqual(mockPatient);
    });

    it('should throw error when patient not found', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { data: { error: 'Patient not found' } }
      });

      await expect(getPatientById('999')).rejects.toThrow();
    });
  });

  describe('createPatient', () => {
    const newPatient = {
      name: 'John Doe',
      dob: '1990-01-01',
      gender: 'M' as const,
      phone: '1234567890',
      email: 'john@example.com',
      address: '123 Main St'
    };

    it('should create new patient', async () => {
      const mockResponse = { id: '1', ...newPatient, age: 36 };
      mockedAxios.post.mockResolvedValueOnce({ data: { patient: mockResponse } });

      const result = await createPatient(newPatient);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:5000/api/patients',
        newPatient,
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on creation failure', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: { data: { error: 'Validation failed' } }
      });

      await expect(createPatient(newPatient)).rejects.toThrow();
    });
  });

  describe('updatePatient', () => {
    it('should update patient', async () => {
      const updates = { phone: '9876543210', email: 'newemail@example.com' };
      const mockResponse = { id: '1', name: 'John Doe', ...updates };
      mockedAxios.put.mockResolvedValueOnce({ data: { patient: mockResponse } });

      const result = await updatePatient('1', updates);

      expect(mockedAxios.put).toHaveBeenCalledWith(
        'http://localhost:5000/api/patients/1',
        updates,
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on update failure', async () => {
      mockedAxios.put.mockRejectedValueOnce({
        response: { data: { error: 'Update failed' } }
      });

      await expect(updatePatient('1', { phone: '999' })).rejects.toThrow();
    });
  });

  describe('getAllPatients', () => {
    it('should fetch all patients with default pagination', async () => {
      const mockPatients = [
        { id: '1', name: 'John Doe', dob: '1990-01-01', gender: 'M' as const, phone: '123' }
      ];
      mockedAxios.get.mockResolvedValueOnce({
        data: { patients: mockPatients, total: 1 }
      });

      const result = await getAllPatients();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:5000/api/patients',
        expect.objectContaining({
          params: { limit: 50, offset: 0 }
        })
      );
      expect(result).toEqual({ patients: mockPatients, total: 1 });
    });

    it('should use custom pagination', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { patients: [], total: 0 } });

      await getAllPatients(25, 50);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: { limit: 25, offset: 50 }
        })
      );
    });

    it('should throw error on fetch failure', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(getAllPatients()).rejects.toThrow();
    });
  });

  describe('validatePatientInput', () => {
    const validPatient = {
      name: 'John Doe',
      dob: '1990-01-01',
      gender: 'M' as const,
      phone: '1234567890',
      email: 'john@example.com'
    };

    it('should validate correct patient input', () => {
      const result = validatePatientInput(validPatient);
      expect(result.valid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should return error for missing name', () => {
      const result = validatePatientInput({ ...validPatient, name: '' });
      expect(result.valid).toBe(false);
      expect(result.errors.name).toBeDefined();
    });

    it('should return error for invalid name format', () => {
      const result = validatePatientInput({ ...validPatient, name: 'John123' });
      expect(result.valid).toBe(false);
      expect(result.errors.name).toContain('letters');
    });

    it('should return error for missing DOB', () => {
      const result = validatePatientInput({ ...validPatient, dob: '' });
      expect(result.valid).toBe(false);
      expect(result.errors.dob).toBeDefined();
    });

    it('should return error for invalid DOB', () => {
      const result = validatePatientInput({ ...validPatient, dob: 'invalid-date' });
      expect(result.valid).toBe(false);
      expect(result.errors.dob).toBeDefined();
    });

    it('should return error for future DOB', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const result = validatePatientInput({ ...validPatient, dob: futureDate.toISOString().split('T')[0] });
      expect(result.valid).toBe(false);
      expect(result.errors.dob).toBeDefined();
    });

    it('should return error for invalid gender', () => {
      const result = validatePatientInput({ ...validPatient, gender: 'X' as any });
      expect(result.valid).toBe(false);
      expect(result.errors.gender).toBeDefined();
    });

    it('should return error for missing phone', () => {
      const result = validatePatientInput({ ...validPatient, phone: '' });
      expect(result.valid).toBe(false);
      expect(result.errors.phone).toBeDefined();
    });

    it('should return error for invalid phone format', () => {
      const result = validatePatientInput({ ...validPatient, phone: '123' });
      expect(result.valid).toBe(false);
      expect(result.errors.phone).toBeDefined();
    });

    it('should return error for invalid email format', () => {
      const result = validatePatientInput({ ...validPatient, email: 'invalid-email' });
      expect(result.valid).toBe(false);
      expect(result.errors.email).toBeDefined();
    });

    it('should allow missing email', () => {
      const { email, ...withoutEmail } = validPatient;
      const result = validatePatientInput(withoutEmail);
      expect(result.valid).toBe(true);
    });

    it('should return multiple errors for invalid input', () => {
      const result = validatePatientInput({
        name: '',
        dob: '',
        gender: 'M',
        phone: ''
      });
      expect(result.valid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThanOrEqual(3);
    });

    it('should validate long phone numbers', () => {
      const result = validatePatientInput({
        name: 'John Doe',
        dob: '1990-01-01',
        gender: 'M',
        phone: '+1-555-123-4567'
      });
      expect(result.valid).toBe(true);
    });

    it('should reject too short phone numbers', () => {
      const result = validatePatientInput({
        name: 'John Doe',
        dob: '1990-01-01',
        gender: 'M',
        phone: '123'
      });
      expect(result.valid).toBe(false);
      expect(result.errors.phone).toBeDefined();
    });

    it('should handle very long names', () => {
      const longName = 'a'.repeat(101);
      const result = validatePatientInput({
        name: longName,
        dob: '1990-01-01',
        gender: 'M',
        phone: '1234567890'
      });
      expect(result.valid).toBe(false);
      expect(result.errors.name).toContain('100');
    });

    it('should handle names with numbers', () => {
      const result = validatePatientInput({
        name: 'John123',
        dob: '1990-01-01',
        gender: 'M',
        phone: '1234567890'
      });
      expect(result.valid).toBe(false);
      expect(result.errors.name).toContain('letters');
    });

    it('should handle very old dates', () => {
      const result = validatePatientInput({
        name: 'John Doe',
        dob: '1800-01-01',
        gender: 'M',
        phone: '1234567890'
      });
      expect(result.valid).toBe(false);
      expect(result.errors.dob).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty search results', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { patients: [] } });

      const result = await searchPatients('NonExistent');
      expect(result).toEqual([]);
    });

    it('should handle network timeout in search', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        code: 'ECONNABORTED',
        message: 'timeout'
      });

      await expect(searchPatients('John')).rejects.toThrow();
    });

    it('should handle malformed response in getPatientById', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: null });

      await expect(getPatientById('1')).rejects.toThrow();
    });

    it('should handle duplicate phone in createPatient', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          status: 409,
          data: { error: 'Phone number already exists' }
        }
      });

      const newPatient = {
        name: 'Jane Doe',
        dob: '1990-01-01',
        gender: 'F' as const,
        phone: '1234567890'
      };

      await expect(createPatient(newPatient)).rejects.toThrow();
    });
  });
});
