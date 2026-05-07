import { Request, Response, NextFunction } from 'express';

/**
 * Request logging middleware
 * Logs incoming requests with method, path, and response status
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Store request ID in request object for tracking
  (req as any).requestId = requestId;

  // Capture the original send method
  const originalSend = res.send;

  res.send = function(data?: any): Response {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Determine log level based on status code
    const logLevel =
      statusCode >= 500 ? 'ERROR' :
      statusCode >= 400 ? 'WARN' :
      'INFO';

    const logMessage = `[${logLevel}] ${req.method} ${req.path} - Status: ${statusCode} - Duration: ${duration}ms`;

    // Color code console output based on status
    if (statusCode >= 500) {
      console.error(`\x1b[31m${logMessage}\x1b[0m`); // Red for errors
    } else if (statusCode >= 400) {
      console.warn(`\x1b[33m${logMessage}\x1b[0m`); // Yellow for warnings
    } else {
      console.log(`\x1b[32m${logMessage}\x1b[0m`); // Green for success
    }

    // Call the original send method
    return originalSend.call(this, data);
  };

  next();
};
