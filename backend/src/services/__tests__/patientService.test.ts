import { createPatient, getPatientById, searchPatients, updatePatient } from '../patientService';
import { pool } from '../../config/database';

jest.mock('../../config/database');

const mockPool = pool as any;

describe('PatientService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPatient', () => {
    const validPatientInput = {
      name: 'John Doe',
      dob: '1980-01-15',
      gender: 'M' as const,
      phone: '9876543210',
      email: 'john@example.com',
      address: '123 Main St'
    };

    it('should create a new patient successfully', async () => {
      // Arrange
      const mockPatient = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        ...validPatientInput,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [mockPatient],
        command: 'INSERT',
        rowCount: 1,
        oid: 0,
        fields: []
      } as any);

      // Act
      const result = await createPatient(validPatientInput);

      // Assert
      expect(result).toEqual(mockPatient);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO patients'),
        ['John Doe', '1980-01-15', 'M', '9876543210', 'john@example.com', '123 Main St']
      );
    });

    it('should throw error when phone number already exists', async () => {
      // Arrange
      const dbError: any = new Error('Duplicate key');
      dbError.code = '23505';
      dbError.constraint = 'patients_phone_key';

      mockPool.query.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(createPatient(validPatientInput)).rejects.toThrow('Phone number already exists');
    });

    it('should handle null email and address', async () => {
      // Arrange
      const inputWithoutOptional = {
        name: 'Jane Doe',
        dob: '1990-05-20',
        gender: 'F' as const,
        phone: '9876543211'
      };

      const mockPatient = {
        id: '550e8400-e29b-41d4-a716-446655440002',
        ...inputWithoutOptional,
        email: null,
        address: null,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [mockPatient],
        command: 'INSERT',
        rowCount: 1,
        oid: 0,
        fields: []
      } as any);

      // Act
      const result = await createPatient(inputWithoutOptional);

      // Assert
      expect(result.email).toBeNull();
      expect(result.address).toBeNull();
    });
  });

  describe('getPatientById', () => {
    it('should return patient when found', async () => {
      // Arrange
      const mockPatient = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'John Doe',
        dob: '1980-01-15',
        gender: 'M',
        phone: '9876543210',
        email: 'john@example.com',
        address: '123 Main St',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [mockPatient],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: []
      } as any);

      // Act
      const result = await getPatientById('550e8400-e29b-41d4-a716-446655440001');

      // Assert
      expect(result).toEqual(mockPatient);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM patients WHERE id = $1'),
        ['550e8400-e29b-41d4-a716-446655440001']
      );
    });

    it('should return null when patient not found', async () => {
      // Arrange
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: []
      } as any);

      // Act
      const result = await getPatientById('nonexistent-id');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('searchPatients', () => {
    it('should search patients by name (typeahead)', async () => {
      // Arrange
      const mockResults = [
        {
          id: '1',
          name: 'John Doe',
          age: 46,
          gender: 'M',
          phone: '9876543210',
          lastvisit: '2026-05-01T10:00:00.000Z'
        },
        {
          id: '2',
          name: 'Johnny Smith',
          age: 35,
          gender: 'M',
          phone: '9876543211',
          lastvisit: null
        }
      ];

      mockPool.query.mockResolvedValueOnce({
        rows: mockResults,
        command: 'SELECT',
        rowCount: 2,
        oid: 0,
        fields: []
      } as any);

      // Act
      const result = await searchPatients('john', 10);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('John Doe');
      expect(result[0].age).toBe(46);
      expect(result[0].lastVisit).toBe('2026-05-01T10:00:00.000Z');
      expect(result[1].lastVisit).toBeNull();

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('LOWER(p.name) ILIKE $1 OR'),
        ['%john%', '%john%', 10]
      );
    });

    it('should search patients by phone number', async () => {
      // Arrange
      const mockResults = [
        {
          id: '1',
          name: 'John Doe',
          age: 46,
          gender: 'M',
          phone: '9876543210',
          lastvisit: null
        }
      ];

      mockPool.query.mockResolvedValueOnce({
        rows: mockResults,
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: []
      } as any);

      // Act
      const result = await searchPatients('987654', 10);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].phone).toBe('9876543210');
    });

    it('should respect limit parameter', async () => {
      // Arrange
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: []
      } as any);

      // Act
      await searchPatients('john', 5);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.anything(),
        expect.arrayContaining([expect.anything(), expect.anything(), 5])
      );
    });

    it('should use default limit of 10', async () => {
      // Arrange
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: []
      } as any);

      // Act
      await searchPatients('john');

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.anything(),
        expect.arrayContaining([expect.anything(), expect.anything(), 10])
      );
    });
  });

  describe('updatePatient', () => {
    it('should update patient fields', async () => {
      // Arrange
      const updates = {
        name: 'John Doe Jr.',
        phone: '9876543299',
        email: 'john.jr@example.com'
      };

      const mockUpdatedPatient = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        ...updates,
        dob: '1980-01-15',
        gender: 'M',
        address: '123 Main St',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [mockUpdatedPatient],
        command: 'UPDATE',
        rowCount: 1,
        oid: 0,
        fields: []
      } as any);

      // Act
      const result = await updatePatient('550e8400-e29b-41d4-a716-446655440001', updates);

      // Assert
      expect(result).toEqual(mockUpdatedPatient);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE patients'),
        expect.arrayContaining([...Object.values(updates), '550e8400-e29b-41d4-a716-446655440001'])
      );
    });

    it('should return null when patient not found', async () => {
      // Arrange
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        command: 'UPDATE',
        rowCount: 0,
        oid: 0,
        fields: []
      } as any);

      // Act
      const result = await updatePatient('nonexistent-id', { name: 'Test' });

      // Assert
      expect(result).toBeNull();
    });
  });
});
