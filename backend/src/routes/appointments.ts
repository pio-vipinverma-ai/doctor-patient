import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as appointmentController from '../controllers/appointmentController';

const router = Router();

/**
 * Appointment routes - All routes require authentication
 */

// Get appointments by date (with optional status filter)
router.get('/', authenticate, appointmentController.getAppointmentsController);

// Get appointment by ID
router.get('/:id', authenticate, appointmentController.getAppointmentController);

// Create new appointment
router.post('/', authenticate, appointmentController.createAppointmentController);

// Update appointment (status, reason, etc.)
router.put('/:id', authenticate, appointmentController.updateAppointmentController);

export default router;
