import { Request, Response, NextFunction } from 'express';
import { authenticate } from '../auth';
import { verifyAccessToken, extractTokenFromHeader } from '../../utils/jwt';

jest.mock('../../utils/jwt');

const mockVerifyAccessToken = verifyAccessToken as jest.MockedFunction<typeof verifyAccessToken>;
const mockExtractTokenFromHeader = extractTokenFromHeader as jest.MockedFunction<typeof extractTokenFromHeader>;

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should authenticate with valid token', () => {
      const mockPayload = { userId: 'u1', username: 'doctor', email: 'doctor@example.com' };
      mockReq.headers = { authorization: 'Bearer valid-token' };
      mockExtractTokenFromHeader.mockReturnValueOnce('valid-token');
      mockVerifyAccessToken.mockReturnValueOnce(mockPayload);

      authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockExtractTokenFromHeader).toHaveBeenCalledWith('Bearer valid-token');
      expect(mockVerifyAccessToken).toHaveBeenCalledWith('valid-token');
      expect(mockReq.user).toEqual(mockPayload);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject missing authorization header', () => {
      mockReq.headers = {};
      mockExtractTokenFromHeader.mockReturnValueOnce(null);

      authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required',
        message: 'No token provided'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject invalid token format', () => {
      mockReq.headers = { authorization: 'InvalidFormat' };
      mockExtractTokenFromHeader.mockReturnValueOnce(null);

      authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required',
        message: 'No token provided'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject invalid token', () => {
      mockReq.headers = { authorization: 'Bearer invalid-token' };
      mockExtractTokenFromHeader.mockReturnValueOnce('invalid-token');
      mockVerifyAccessToken.mockReturnValueOnce(null);

      authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid or expired token',
        message: 'Please login again'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle token verification errors', () => {
      mockReq.headers = { authorization: 'Bearer error-token' };
      mockExtractTokenFromHeader.mockReturnValueOnce('error-token');
      mockVerifyAccessToken.mockImplementationOnce(() => {
        throw new Error('Verification error');
      });

      authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication failed',
        message: 'Invalid token'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
