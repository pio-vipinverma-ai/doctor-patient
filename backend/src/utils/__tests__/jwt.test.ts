import * as jwtUtil from '../jwt';
import jwt from 'jsonwebtoken';

// Mock jwt library
jest.mock('jsonwebtoken');

const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('JWT Utils', () => {
  const mockPayload = {
    userId: 'user123',
    username: 'testuser',
    email: 'test@example.com'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAccessToken', () => {
    it('should generate access token successfully', () => {
      const mockToken = 'mock.access.token';
      mockJwt.sign.mockReturnValueOnce(mockToken as any);

      const token = jwtUtil.generateAccessToken(mockPayload);

      expect(token).toBe(mockToken);
      expect(mockJwt.sign).toHaveBeenCalledWith(
        mockPayload,
        expect.any(String),
        expect.objectContaining({
          expiresIn: expect.any(String),
          issuer: 'doc-patient-api',
          audience: 'doc-patient-app'
        })
      );
    });

    it('should use correct secret and options', () => {
      const mockToken = 'mock.access.token';
      mockJwt.sign.mockReturnValueOnce(mockToken as any);

      jwtUtil.generateAccessToken(mockPayload);

      const [[payload, secret, options]] = mockJwt.sign.mock.calls;
      expect(payload).toEqual(mockPayload);
      expect(typeof secret).toBe('string');
      expect(options).toHaveProperty('issuer', 'doc-patient-api');
      expect(options).toHaveProperty('audience', 'doc-patient-app');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate refresh token successfully', () => {
      const mockToken = 'mock.refresh.token';
      mockJwt.sign.mockReturnValueOnce(mockToken as any);

      const token = jwtUtil.generateRefreshToken(mockPayload);

      expect(token).toBe(mockToken);
      expect(mockJwt.sign).toHaveBeenCalledWith(
        mockPayload,
        expect.any(String),
        expect.objectContaining({
          expiresIn: expect.any(String),
          issuer: 'doc-patient-api',
          audience: 'doc-patient-app'
        })
      );
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify and decode valid token', () => {
      const token = 'valid.token.here';
      mockJwt.verify.mockReturnValueOnce(mockPayload as any);

      const result = jwtUtil.verifyAccessToken(token);

      expect(result).toEqual(mockPayload);
      expect(mockJwt.verify).toHaveBeenCalledWith(
        token,
        expect.any(String),
        expect.objectContaining({
          issuer: 'doc-patient-api',
          audience: 'doc-patient-app'
        })
      );
    });

    it('should return null for expired token', () => {
      const token = 'expired.token.here';
      const error = new jwt.TokenExpiredError('Token expired', new Date());
      mockJwt.verify.mockImplementationOnce(() => {
        throw error;
      });

      const result = jwtUtil.verifyAccessToken(token);

      expect(result).toBeNull();
    });

    it('should return null for invalid token', () => {
      const token = 'invalid.token.here';
      const error = new jwt.JsonWebTokenError('Invalid token');
      mockJwt.verify.mockImplementationOnce(() => {
        throw error;
      });

      const result = jwtUtil.verifyAccessToken(token);

      expect(result).toBeNull();
    });

    it('should return null for other verification errors', () => {
      const token = 'error.token.here';
      mockJwt.verify.mockImplementationOnce(() => {
        throw new Error('Unknown error');
      });

      const result = jwtUtil.verifyAccessToken(token);

      expect(result).toBeNull();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify and decode valid refresh token', () => {
      const token = 'valid.refresh.token';
      mockJwt.verify.mockReturnValueOnce(mockPayload as any);

      const result = jwtUtil.verifyRefreshToken(token);

      expect(result).toEqual(mockPayload);
    });

    it('should return null for expired refresh token', () => {
      const token = 'expired.refresh.token';
      const error = new jwt.TokenExpiredError('Refresh token expired', new Date());
      mockJwt.verify.mockImplementationOnce(() => {
        throw error;
      });

      const result = jwtUtil.verifyRefreshToken(token);

      expect(result).toBeNull();
    });

    it('should return null for invalid refresh token', () => {
      const token = 'invalid.refresh.token';
      const error = new jwt.JsonWebTokenError('Invalid refresh token');
      mockJwt.verify.mockImplementationOnce(() => {
        throw error;
      });

      const result = jwtUtil.verifyRefreshToken(token);

      expect(result).toBeNull();
    });

    it('should return null for refresh token verification errors', () => {
      const token = 'error.refresh.token';
      mockJwt.verify.mockImplementationOnce(() => {
        throw new Error('Unknown error');
      });

      const result = jwtUtil.verifyRefreshToken(token);

      expect(result).toBeNull();
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Bearer header', () => {
      const authHeader = 'Bearer valid.token.here';
      const result = jwtUtil.extractTokenFromHeader(authHeader);

      expect(result).toBe('valid.token.here');
    });

    it('should return null for undefined header', () => {
      const result = jwtUtil.extractTokenFromHeader(undefined);

      expect(result).toBeNull();
    });

    it('should return null for header without Bearer prefix', () => {
      const authHeader = 'Basic valid.token.here';
      const result = jwtUtil.extractTokenFromHeader(authHeader);

      expect(result).toBeNull();
    });

    it('should return null for header with wrong format', () => {
      const authHeader = 'Bearer';
      const result = jwtUtil.extractTokenFromHeader(authHeader);

      expect(result).toBeNull();
    });

    it('should return null for header with multiple spaces', () => {
      const authHeader = 'Bearer token part1 part2';
      const result = jwtUtil.extractTokenFromHeader(authHeader);

      expect(result).toBeNull();
    });

    it('should return null for empty header', () => {
      const result = jwtUtil.extractTokenFromHeader('');

      expect(result).toBeNull();
    });
  });
});
