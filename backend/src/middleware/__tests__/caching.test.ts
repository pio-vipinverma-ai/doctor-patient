import { Request, Response, NextFunction } from 'express';
import { cacheControl, healthCheckCache } from '../caching';

describe('Caching Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      setHeader: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('cacheControl', () => {
    it('should set Cache-Control header to no-cache for default', () => {
      cacheControl(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should set custom cache duration when provided', () => {
      const customCache = cacheControl('public, max-age=3600');
      
      customCache(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Cache-Control', 'public, max-age=3600');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should set private cache control', () => {
      const privateCache = cacheControl('private, max-age=1800');
      
      privateCache(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Cache-Control', 'private, max-age=1800');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should call next middleware', () => {
      cacheControl(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should work with no-store directive', () => {
      const noStoreCache = cacheControl('no-store');
      
      noStoreCache(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store');
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('healthCheckCache', () => {
    it('should set short cache for health check endpoint', () => {
      healthCheckCache(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Cache-Control', 'public, max-age=10');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should call next middleware', () => {
      healthCheckCache(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should allow public caching for health checks', () => {
      healthCheckCache(mockReq as Request, mockRes as Response, mockNext);

      const cacheHeader = (mockRes.setHeader as jest.Mock).mock.calls[0][1];
      expect(cacheHeader).toContain('public');
      expect(cacheHeader).toContain('max-age=10');
    });
  });

  describe('Integration', () => {
    it('should chain multiple caching middleware', () => {
      cacheControl(mockReq as Request, mockRes as Response, () => {
        healthCheckCache(mockReq as Request, mockRes as Response, mockNext);
      });

      expect(mockRes.setHeader).toHaveBeenCalledTimes(2);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should not interfere with other response methods', () => {
      mockRes.json = jest.fn();
      mockRes.status = jest.fn().mockReturnThis();

      cacheControl(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.json).not.toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });
});
