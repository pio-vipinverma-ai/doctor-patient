import { login, getUserById } from '../authService';
import { pool } from '../../config/database';
import { comparePassword } from '../../utils/crypto';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt';

// Mock dependencies
jest.mock('../../config/database');
jest.mock('../../utils/crypto');
jest.mock('../../utils/jwt');

const mockPool = pool as any;
const mockComparePassword = comparePassword as jest.MockedFunction<typeof comparePassword>;
const mockGenerateAccessToken = generateAccessToken as jest.MockedFunction<typeof generateAccessToken>;
const mockGenerateRefreshToken = generateRefreshToken as jest.MockedFunction<typeof generateRefreshToken>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const mockUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      username: 'doctor',
      email: 'doctor@clinic.com',
      password_hash: '$2b$10$hashedpassword',
      name: 'Dr. Smith',
      created_at: new Date(),
      updated_at: new Date()
    };

    it('should successfully login with valid credentials', async () => {
      // Arrange
      mockPool.query.mockResolvedValueOnce({
        rows: [mockUser],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: []
      } as any);

      mockComparePassword.mockResolvedValueOnce(true);
      mockGenerateAccessToken.mockReturnValueOnce('access-token-123');
      mockGenerateRefreshToken.mockReturnValueOnce('refresh-token-123');

      // Act
      const result = await login('doctor', 'password123');

      // Assert
      expect(result.success).toBe(true);
      expect(result.token).toBe('access-token-123');
      expect(result.refreshToken).toBe('refresh-token-123');
      expect(result.user).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        name: mockUser.name
      });

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, username, email, password_hash'),
        ['doctor']
      );
      expect(mockComparePassword).toHaveBeenCalledWith('password123', mockUser.password_hash);
    });

    it('should throw error when user not found', async () => {
      // Arrange
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: []
      } as any);

      // Act & Assert
      await expect(login('nonexistent', 'password123')).rejects.toThrow('Invalid username or password');
      expect(mockComparePassword).not.toHaveBeenCalled();
    });

    it('should throw error with invalid password', async () => {
      // Arrange
      mockPool.query.mockResolvedValueOnce({
        rows: [mockUser],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: []
      } as any);

      mockComparePassword.mockResolvedValueOnce(false);

      // Act & Assert
      await expect(login('doctor', 'wrongpassword')).rejects.toThrow('Invalid username or password');
      expect(mockGenerateAccessToken).not.toHaveBeenCalled();
    });

    it('should accept email as username', async () => {
      // Arrange
      mockPool.query.mockResolvedValueOnce({
        rows: [mockUser],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: []
      } as any);

      mockComparePassword.mockResolvedValueOnce(true);
      mockGenerateAccessToken.mockReturnValueOnce('token');
      mockGenerateRefreshToken.mockReturnValueOnce('refresh');

      // Act
      await login('doctor@clinic.com', 'password123');

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE username = $1 OR email = $1'),
        ['doctor@clinic.com']
      );
    });
  });

  describe('getUserById', () => {
    const mockUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      username: 'doctor',
      email: 'doctor@clinic.com',
      name: 'Dr. Smith',
      created_at: new Date(),
      updated_at: new Date()
    };

    it('should return user when found', async () => {
      // Arrange
      mockPool.query.mockResolvedValueOnce({
        rows: [mockUser],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: []
      } as any);

      // Act
      const result = await getUserById('550e8400-e29b-41d4-a716-446655440000');

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, username, email, name'),
        ['550e8400-e29b-41d4-a716-446655440000']
      );
    });

    it('should return null when user not found', async () => {
      // Arrange
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: []
      } as any);

      // Act
      const result = await getUserById('nonexistent-id');

      // Assert
      expect(result).toBeNull();
    });
  });
});
