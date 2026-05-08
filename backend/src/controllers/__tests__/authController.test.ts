import { Request, Response } from 'express';
import { loginController } from '../authController';
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
  });
});
