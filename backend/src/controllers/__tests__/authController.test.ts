import { Request, Response } from 'express';
import { loginController, logoutController, getProfileController } from '../authController';
import * as authService from '../../services/authService';

jest.mock('../../services/authService');

const mockAuthService = authService as jest.Mocked<typeof authService>;

// Mock console.error
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('AuthController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = {
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('loginController', () => {
    it('should login successfully with valid credentials', async () => {
      const mockLoginResponse = {
        success: true,
        user: { 
          id: 'u1', 
          username: 'doctor', 
          email: 'doctor@example.com',
          name: 'Dr. Smith'
        },
        token: 'access-token',
        refreshToken: 'refresh-token'
      };

      mockReq.body = {
        username: 'doctor',
        password: 'password123'
      };

      mockAuthService.validateLoginCredentials.mockReturnValueOnce({ valid: true });
      mockAuthService.login.mockResolvedValueOnce(mockLoginResponse);

      await loginController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockLoginResponse);
    });

    it('should return 400 for invalid input', async () => {
      mockReq.body = {
        username: '',
        password: ''
      };

      mockAuthService.validateLoginCredentials.mockReturnValueOnce({
        valid: false,
        error: 'Username and password are required'
      });

      await loginController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Username and password are required'
      });
    });

    it('should return 401 for invalid credentials', async () => {
      mockReq.body = {
        username: 'doctor',
        password: 'wrongpassword'
      };

      mockAuthService.validateLoginCredentials.mockReturnValueOnce({ valid: true });
      mockAuthService.login.mockRejectedValueOnce(new Error('Invalid username or password'));

      await loginController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid username or password'
      });
    });

    it('should return 500 for other errors', async () => {
      mockReq.body = {
        username: 'doctor',
        password: 'password123'
      };

      mockAuthService.validateLoginCredentials.mockReturnValueOnce({ valid: true });
      mockAuthService.login.mockRejectedValueOnce(new Error('Database error'));

      await loginController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
        message: 'Failed to authenticate user'
      });
    });

    it('should return 400 for missing username', async () => {
      mockReq.body = {
        username: '',
        password: 'password123'
      };

      mockAuthService.validateLoginCredentials.mockReturnValueOnce({
        valid: false,
        error: 'Username is required'
      });

      await loginController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Username is required'
      });
    });

    it('should return 400 for missing password', async () => {
      mockReq.body = {
        username: 'doctor',
        password: ''
      };

      mockAuthService.validateLoginCredentials.mockReturnValueOnce({
        valid: false,
        error: 'Password is required'
      });

      await loginController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Password is required'
      });
    });
  });

  describe('logoutController', () => {
    it('should logout successfully', async () => {
      await logoutController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logged out successfully'
      });
    });
  });

  describe('getProfileController', () => {
    it('should return user profile', async () => {
      const mockUser = {
        id: 'u1',
        username: 'doctor',
        email: 'doctor@example.com',
        name: 'Dr. Smith',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockReq.user = {
        userId: 'u1',
        username: 'doctor',
        email: 'doctor@example.com'
      };

      mockAuthService.getUserById.mockResolvedValueOnce(mockUser);

      await getProfileController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        user: mockUser
      });
    });

    it('should return 401 if user not authenticated', async () => {
      mockReq.user = undefined;

      await getProfileController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    });

    it('should return 404 if user not found', async () => {
      mockReq.user = {
        userId: 'nonexistent',
        username: 'doctor',
        email: 'doctor@example.com'
      };

      mockAuthService.getUserById.mockResolvedValueOnce(null);

      await getProfileController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found'
      });
    });

    it('should handle database errors', async () => {
      mockReq.user = {
        userId: 'u1',
        username: 'doctor',
        email: 'doctor@example.com'
      };

      mockAuthService.getUserById.mockRejectedValueOnce(new Error('Database error'));

      await getProfileController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch user profile'
      });
    });
  });
});

