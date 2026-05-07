import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import config from './config/env';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import patientRoutes from './routes/patients';
import appointmentRoutes from './routes/appointments';
import consultationRoutes from './routes/consultations';
import prescriptionRoutes from './routes/prescriptions';

// Create Express app
export const createApp = (): Express => {
  const app = express();

  // Middleware: Trust proxy (for production deployments)
  app.set('trust proxy', 1);

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

  // Routes

  // Health check endpoint - for monitoring and startup verification
  app.get('/health', (_req: Request, res: Response) => {
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

  // Middleware: 404 Not Found handler (must be before error handler)
  app.use(notFoundHandler);

  // Middleware: Global error handler (must be last)
  app.use(errorHandler);

  return app;
};
