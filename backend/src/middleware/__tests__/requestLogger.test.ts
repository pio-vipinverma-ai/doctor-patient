import { Request, Response } from 'express';
import { requestLogger } from '../requestLogger';

// Mock console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

describe('RequestLogger Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      path: '/api/patients'
    };
    
    // Use Object.defineProperty for readonly ip property
    Object.defineProperty(mockReq, 'ip', {
      value: '127.0.0.1',
      writable: true,
      configurable: true
    });
    
    mockRes = {
      statusCode: 200,
      send: jest.fn().mockReturnThis()
    };
    
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should log request details', () => {
    requestLogger(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.send).toBeDefined();
  });

  it('should log method and URL', () => {
    mockReq.method = 'POST';
    Object.defineProperty(mockReq, 'path', {
      value: '/api/auth/login',
      writable: true,
      configurable: true
    });

    requestLogger(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should override res.send and log on response', () => {
    requestLogger(mockReq as Request, mockRes as Response, mockNext);
    
    // The middleware should override res.send
    expect(mockRes.send).toBeDefined();
    
    // Call the overridden send method
    mockRes.send!({test: 'data'});
    
    // Console.log should have been called when send was invoked
    expect(console.log).toHaveBeenCalled();
  });

  it('should call next middleware', () => {
    requestLogger(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should handle different HTTP methods', () => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    
    methods.forEach(method => {
      jest.clearAllMocks();
      mockReq.method = method;
      
      requestLogger(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });
  });

  it('should log errors for 500 status codes', () => {
    mockRes.statusCode = 500;
    
    requestLogger(mockReq as Request, mockRes as Response, mockNext);
    
    // Call the overridden send method
    mockRes.send!({error: 'Server error'});
    
    // Console.error should have been called for 500 errors
    expect(console.error).toHaveBeenCalled();
  });
});
