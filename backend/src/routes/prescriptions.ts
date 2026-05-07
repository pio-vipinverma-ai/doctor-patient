import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as prescriptionController from '../controllers/prescriptionController';

const router = Router();

/**
 * Prescription routes - All routes require authentication
 */

// Get prescription by ID
router.get('/:id', authenticate, prescriptionController.getPrescriptionController);

// Print prescription (PDF or HTML)
router.get('/:id/print', authenticate, prescriptionController.printPrescriptionController);

// Mark prescription as printed
router.put('/:id/mark-printed', authenticate, prescriptionController.markPrintedController);

export default router;
