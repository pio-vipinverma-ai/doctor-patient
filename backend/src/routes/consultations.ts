import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as consultationController from '../controllers/consultationController';

const router = Router();

/**
 * Consultation routes - All routes require authentication
 */

// Create new consultation
router.post('/', authenticate, consultationController.createConsultationController);

// Get consultation by ID
router.get('/:id', authenticate, consultationController.getConsultationController);

export default router;
