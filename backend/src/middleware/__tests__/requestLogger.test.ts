import { Request, Response } from 'express';
import { requestLogger } from '../requestLogger';

// Mock console methods
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe('RequestLogger Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      originalUrl: '/api/patients',
      ip: '127.0.0.1',
      get: jest.fn((header: string) => {
        if (header === 'user-agent') return 'jest-test';
        return undefined;
      })
    };
    mockRes = {
      statusCode: 200,
      on: jest.fn((event: string, callback: Function) => {
        if (event === 'finish') {
          // Simulate response finishing
          setTimeout(() => callback(), 0);
        }
        return mockRes;
      })
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should log request details', () => {
    requestLogger(mockReq as Request, mockRes as Response, mockNext);

    expect(console.log).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });

  it('should log method and URL', () => {
    mockReq.method = 'POST';
    mockReq.originalUrl = '/api/auth/login';

    requestLogger(mockReq as Request, mockRes as Response, mockNext);

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('POST')
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/login')
    );
  });

  it('should log response time on finish', (done) => {
    mockRes.on = jest.fn((event: string, callback: Function) => {
      if (event === 'finish') {
        callback();
        expect(console.log).toHaveBeenCalled();
        done();
      }
      return mockRes;
    });

    requestLogger(mockReq as Request, mockRes as Response, mockNext);
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

  it('should log client IP address', () => {
    mockReq.ip = '192.168.1.100';

    requestLogger(mockReq as Request, mockRes as Response, mockNext);

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('192.168.1.100')
    );
  });
});
