import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, extractTokenFromHeader } from '../utils/jwt';

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header and attaches user to request
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'No token provided',
      });
      return;
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        message: 'Please login again',
      });
      return;
    }

    // Attach user info to request object
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email,
    };

    next();
  } catch (error) {
    console.error('[Auth Middleware] Error:', error);
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: 'Invalid token',
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't block if missing
 */
export const optionalAuthenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        req.user = {
          userId: decoded.userId,
          username: decoded.username,
          email: decoded.email,
        };
      }
    }

    next();
  } catch (error) {
    console.error('[Optional Auth Middleware] Error:', error);
    next();
  }
};
