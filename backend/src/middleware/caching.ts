import { Request, Response, NextFunction } from 'express';

/**
 * Caching Middleware - Add appropriate cache headers for API responses
 * 
 * - Static resources: Long cache (1 year)
 * - API data: No cache or short cache
 * - Public data: Short cache (5 minutes)
 */

export const cacheControl = (req: Request, res: Response, next: NextFunction): void => {
  // Don't cache authenticated requests
  if (req.headers.authorization) {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    return next();
  }

  // Don't cache POST, PUT, DELETE requests
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return next();
  }

  // Default: short cache for GET requests (5 minutes)
  res.set('Cache-Control', 'public, max-age=300');
  res.set('ETag', `"${Date.now()}"`);
  
  next();
};

/**
 * Static asset caching - Long cache for static files
 */
export const staticAssetCache = (_req: Request, res: Response, next: NextFunction): void => {
  // Cache static assets for 1 year
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  next();
};

/**
 * Health check caching - Very short cache
 */
export const healthCheckCache = (_req: Request, res: Response, next: NextFunction): void => {
  // Cache health check for 1 minute
  res.set('Cache-Control', 'public, max-age=60');
  next();
};
