import { Request, Response } from 'express';
import * as authController from '../../controllers/authController';
import * as authService from '../../services/authService';

jest.mock('../../services/authService');

describe('Auth Controller', () => {
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
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
  });

  describe('loginController', () => {
    it('should login successfully with valid credentials', async () => {
      const loginData = { username: 'admin', password: 'password123' };
      const loginResponse = {
        success: true,
        accessToken: 'token123',
        user: { userId: 1, username: 'admin' },
      };

      mockRequest.body = loginData;

      (authService.validateLoginCredentials as jest.Mock).mockReturnValue({
        valid: true,
      });

      (authService.login as jest.Mock).mockResolvedValue(loginResponse);

      await authController.loginController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(loginResponse);
    });

    it('should return 400 for invalid credentials format', async () => {
      mockRequest.body = { username: '', password: 'pass' };

      (authService.validateLoginCredentials as jest.Mock).mockReturnValue({
        valid: false,
        error: 'Username is required',
      });

      await authController.loginController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Username is required',
      });
    });

    it('should return 401 for invalid username or password', async () => {
      mockRequest.body = { username: 'admin', password: 'wrongpass' };

      (authService.validateLoginCredentials as jest.Mock).mockReturnValue({
        valid: true,
      });

      (authService.login as jest.Mock).mockRejectedValue(
        new Error('Invalid username or password')
      );

      await authController.loginController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid username or password',
      });
    });

    it('should return 500 for internal server errors', async () => {
      mockRequest.body = { username: 'admin', password: 'password' };

      (authService.validateLoginCredentials as jest.Mock).mockReturnValue({
        valid: true,
      });

      (authService.login as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      await authController.loginController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
        message: 'Failed to authenticate user',
      });
    });
  });

  describe('logoutController', () => {
    it('should logout successfully', async () => {
      await authController.logoutController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'Logged out successfully',
      });
    });
  });
});
