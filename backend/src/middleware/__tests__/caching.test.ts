import { Request, Response, NextFunction } from 'express';
import { cacheControl, healthCheckCache } from '../caching';

describe('Caching Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      headers: {}
    };
    mockRes = {
      set: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('cacheControl', () => {
    it('should not cache authenticated requests', () => {
      mockReq.headers = { authorization: 'Bearer token123' };
      
      cacheControl(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      expect(mockRes.set).toHaveBeenCalledWith('Pragma', 'no-cache');
      expect(mockRes.set).toHaveBeenCalledWith('Expires', '0');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should not cache POST requests', () => {
      mockReq.method = 'POST';
      
      cacheControl(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith('Cache-Control', 'no-store, no-cache, must-revalidate');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should not cache PUT requests', () => {
      mockReq.method = 'PUT';
      
      cacheControl(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith('Cache-Control', 'no-store, no-cache, must-revalidate');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should not cache DELETE requests', () => {
      mockReq.method = 'DELETE';
      
      cacheControl(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith('Cache-Control', 'no-store, no-cache, must-revalidate');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should cache GET requests with default 5 minutes', () => {
      mockReq.method = 'GET';
      
      cacheControl(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith('Cache-Control', 'public, max-age=300');
      expect(mockRes.set).toHaveBeenCalledWith('ETag', expect.any(String));
      expect(mockNext).toHaveBeenCalled();
    });

    it('should cache HEAD requests', () => {
      mockReq.method = 'HEAD';
      
      cacheControl(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith('Cache-Control', 'public, max-age=300');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should call next middleware', () => {
      cacheControl(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('healthCheckCache', () => {
    it('should set cache for health check endpoint', () => {
      healthCheckCache(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith('Cache-Control', 'public, max-age=60');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should call next middleware', () => {
      healthCheckCache(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should allow public caching for health checks', () => {
      healthCheckCache(mockReq as Request, mockRes as Response, mockNext);

      const cacheHeader = (mockRes.set as jest.Mock).mock.calls[0][1];
      expect(cacheHeader).toContain('public');
      expect(cacheHeader).toContain('max-age=60');
    });
  });

  describe('Integration', () => {
    it('should chain multiple caching middleware', () => {
      cacheControl(mockReq as Request, mockRes as Response, () => {
        healthCheckCache(mockReq as Request, mockRes as Response, mockNext);
      });

      expect(mockRes.set).toHaveBeenCalled();
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
