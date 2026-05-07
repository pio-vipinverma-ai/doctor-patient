import { Request, Response, NextFunction } from 'express';

interface ErrorResponse {
  success: boolean;
  error: string;
  statusCode: number;
  timestamp: string;
  requestId?: string;
}

interface CustomError extends Error {
  statusCode?: number;
  details?: any;
}

/**
 * Global error handling middleware
 * Catches all errors and returns JSON error responses
 */
export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const requestId = (req as any).requestId;

  // Log the error with stack trace
  console.error(`\x1b[31m[ERROR] Request ID: ${requestId}\x1b[0m`);
  console.error(`\x1b[31m${err.message}\x1b[0m`);
  if (err.stack) {
    console.error(`\x1b[31m${err.stack}\x1b[0m`);
  }

  const errorResponse: ErrorResponse = {
    success: false,
    error: err.message || 'Internal Server Error',
    statusCode,
    timestamp: new Date().toISOString(),
    requestId,
  };

  // Don't expose internal error details in production
  if (process.env.NODE_ENV === 'production') {
    errorResponse.error =
      statusCode === 500 ? 'Internal Server Error' : errorResponse.error;
  } else if (err.details) {
    // Include error details in development
    (errorResponse as any).details = err.details;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Async error wrapper for route handlers
 * Catches errors thrown in async functions and passes them to error handler
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found middleware
 * Handles routes that don't exist
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const errorResponse: ErrorResponse = {
    success: false,
    error: `Route ${req.path} not found`,
    statusCode: 404,
    timestamp: new Date().toISOString(),
    requestId: (req as any).requestId,
  };

  res.status(404).json(errorResponse);
};
