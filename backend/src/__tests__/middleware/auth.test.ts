import { Request, Response, NextFunction } from 'express';
import { authenticate, optionalAuthenticate } from '../../middleware/auth';
import * as jwt from '../../utils/jwt';

jest.mock('../../utils/jwt');

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockNext = jest.fn();

    mockRequest = {
      headers: {},
      user: undefined,
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
  });

  describe('authenticate', () => {
    it('should authenticate user with valid token', () => {
      const mockDecoded = {
        userId: '1',
        username: 'admin',
        email: 'admin@example.com',
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      (jwt.extractTokenFromHeader as jest.Mock).mockReturnValue('valid-token');
      (jwt.verifyAccessToken as jest.Mock).mockReturnValue(mockDecoded);

      authenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toEqual(mockDecoded);
      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should return 401 when no token provided', () => {
      mockRequest.headers = {};

      (jwt.extractTokenFromHeader as jest.Mock).mockReturnValue(null);

      authenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required',
        message: 'No token provided',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      (jwt.extractTokenFromHeader as jest.Mock).mockReturnValue('invalid-token');
      (jwt.verifyAccessToken as jest.Mock).mockReturnValue(null);

      authenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid or expired token',
        message: 'Please login again',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token verification throws error', () => {
      mockRequest.headers = {
        authorization: 'Bearer error-token',
      };

      (jwt.extractTokenFromHeader as jest.Mock).mockReturnValue('error-token');
      (jwt.verifyAccessToken as jest.Mock).mockImplementation(() => {
        throw new Error('Token verification failed');
      });

      authenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication failed',
        message: 'Invalid token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle missing authorization header', () => {
      mockRequest.headers = {};

      (jwt.extractTokenFromHeader as jest.Mock).mockReturnValue(null);

      authenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required',
        message: 'No token provided',
      });
    });
  });

  describe('optionalAuthenticate', () => {
    it('should attach user when valid token provided', () => {
      const mockDecoded = {
        userId: '1',
        username: 'admin',
        email: 'admin@example.com',
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      (jwt.extractTokenFromHeader as jest.Mock).mockReturnValue('valid-token');
      (jwt.verifyAccessToken as jest.Mock).mockReturnValue(mockDecoded);

      optionalAuthenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toEqual(mockDecoded);
      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should continue without user when no token provided', () => {
      mockRequest.headers = {};

      (jwt.extractTokenFromHeader as jest.Mock).mockReturnValue(null);

      optionalAuthenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should continue without user when token is invalid', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      (jwt.extractTokenFromHeader as jest.Mock).mockReturnValue('invalid-token');
      (jwt.verifyAccessToken as jest.Mock).mockReturnValue(null);

      optionalAuthenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should continue without user when token verification throws error', () => {
      mockRequest.headers = {
        authorization: 'Bearer error-token',
      };

      (jwt.extractTokenFromHeader as jest.Mock).mockReturnValue('error-token');
      (jwt.verifyAccessToken as jest.Mock).mockImplementation(() => {
        throw new Error('Token verification failed');
      });

      optionalAuthenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });
  });
});
