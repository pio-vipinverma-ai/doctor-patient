import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import config from './config/env';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { cacheControl, healthCheckCache } from './middleware/caching';
import { sanitizeInput, rateLimit } from './middleware/security';
import authRoutes from './routes/auth';
import patientRoutes from './routes/patients';
import appointmentRoutes from './routes/appointments';
import consultationRoutes from './routes/consultations';
import prescriptionRoutes from './routes/prescriptions';
import exportRoutes from './routes/exports';

// Create Express app
export const createApp = (): Express => {
  const app = express();

  // Middleware: Trust proxy (for production deployments)
  app.set('trust proxy', 1);

  // Middleware: Security headers with Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      frameguard: {
        action: 'deny', // Prevent clickjacking
      },
      xssFilter: true,
      noSniff: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    })
  );

  // Middleware: Gzip compression for responses
  app.use(compression({
    // Compress all responses
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    // Compression level: 6 is a good balance between speed and compression ratio
    level: 6,
    // Only compress responses larger than 1KB
    threshold: 1024,
  }));

  // Middleware: Parse JSON request bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Middleware: CORS configuration
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    config.FRONTEND_URL,
  ];
  
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // In development, allow any localhost
        if (config.NODE_ENV === 'development' && origin.includes('localhost')) {
          return callback(null, true);
        }
        
        // Check allowed origins
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Middleware: Request logging
  app.use(requestLogger);

  // Middleware: Input sanitization (prevent SQL injection & XSS)
  app.use(sanitizeInput);

  // Middleware: Rate limiting (prevent brute force)
  app.use(rateLimit(100, 15 * 60 * 1000)); // 100 requests per 15 minutes

  // Middleware: Cache control for API responses
  app.use(cacheControl);

  // Routes

  // Health check endpoint - for monitoring and startup verification
  app.get('/health', healthCheckCache, (_req: Request, res: Response) => {
    const healthResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.NODE_ENV,
    };
    res.status(200).json(healthResponse);
  });

  // Root endpoint
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      message: 'Patient Management System API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/patients', patientRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/consultations', consultationRoutes);
  app.use('/api/prescriptions', prescriptionRoutes);
  app.use('/api/exports', exportRoutes);

  // Middleware: 404 Not Found handler (must be before error handler)
  app.use(notFoundHandler);

  // Middleware: Global error handler (must be last)
  app.use(errorHandler);

  return app;
};
