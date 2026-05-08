import { Request, Response, NextFunction } from 'express';

/**
 * Security Validation Middleware
 * Prevents common security vulnerabilities like SQL injection, XSS, etc.
 */

/**
 * Sanitize input to prevent SQL injection
 * Checks for dangerous SQL patterns
 */
export const sanitizeInput = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // SQL injection patterns to detect
    const sqlInjectionPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi,
      /(--)/g,
      /(;)/g,
      /(')/g,
      /(\bOR\b.*=)/gi,
      /(\bAND\b.*=)/gi,
    ];

    // XSS patterns to detect
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi, // Event handlers like onclick, onload
    ];

    // Function to check if input contains dangerous patterns
    const containsDangerousPattern = (value: any): boolean => {
      if (typeof value !== 'string') return false;

      // Check SQL injection patterns
      for (const pattern of sqlInjectionPatterns) {
        if (pattern.test(value)) {
          return true;
        }
      }

      // Check XSS patterns
      for (const pattern of xssPatterns) {
        if (pattern.test(value)) {
          return true;
        }
      }

      return false;
    };

    // Function to recursively check object for dangerous patterns
    const checkObject = (obj: any, path: string = ''): string | null => {
      if (obj === null || obj === undefined) return null;

      if (typeof obj === 'string') {
        if (containsDangerousPattern(obj)) {
          return path || 'input';
        }
      } else if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
          const result = checkObject(obj[i], `${path}[${i}]`);
          if (result) return result;
        }
      } else if (typeof obj === 'object') {
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const result = checkObject(obj[key], path ? `${path}.${key}` : key);
            if (result) return result;
          }
        }
      }

      return null;
    };

    // Check request body
    if (req.body) {
      const suspiciousField = checkObject(req.body);
      if (suspiciousField) {
        console.warn(`[Security] Suspicious input detected in ${suspiciousField}`);
        res.status(400).json({
          success: false,
          error: 'Invalid input',
          message: 'Input contains potentially dangerous characters',
        });
        return;
      }
    }

    // Check query parameters
    if (req.query) {
      const suspiciousField = checkObject(req.query);
      if (suspiciousField) {
        console.warn(`[Security] Suspicious query parameter: ${suspiciousField}`);
        res.status(400).json({
          success: false,
          error: 'Invalid query parameter',
          message: 'Query contains potentially dangerous characters',
        });
        return;
      }
    }

    next();
  } catch (error) {
    console.error('[Security Validation] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Security validation error',
    });
  }
};

/**
 * Rate limiting middleware (basic implementation)
 * Prevents brute force attacks
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    // Get or create rate limit entry
    let entry = requestCounts.get(ip);

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      entry = {
        count: 1,
        resetTime: now + windowMs,
      };
      requestCounts.set(ip, entry);
      next();
      return;
    }

    // Increment count
    entry.count++;

    if (entry.count > maxRequests) {
      console.warn(`[Security] Rate limit exceeded for IP: ${ip}`);
      res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: 'Please try again later',
      });
      return;
    }

    next();
  };
};

/**
 * Clean up old rate limit entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of requestCounts.entries()) {
    if (now > entry.resetTime) {
      requestCounts.delete(ip);
    }
  }
}, 60 * 1000); // Clean up every minute
