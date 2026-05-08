import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  exportPatients,
  exportConsultations
} from '../controllers/exportController';

const router = Router();

/**
 * Export Routes - Data export endpoints
 * All routes require authentication
 */

/**
 * @route   GET /api/exports/patients
 * @desc    Export patients to CSV
 * @access  Private (requires JWT token)
 * @query   format=csv (default)
 * @query   from=YYYY-MM-DD (optional - filter by created date)
 * @query   to=YYYY-MM-DD (optional - filter by created date)
 */
router.get('/patients', authenticate, exportPatients);

/**
 * @route   GET /api/exports/consultations
 * @desc    Export consultations to CSV or PDF
 * @access  Private (requires JWT token)
 * @query   format=csv|pdf (default: csv)
 * @query   from=YYYY-MM-DD (optional - filter by consultation date)
 * @query   to=YYYY-MM-DD (optional - filter by consultation date)
 */
router.get('/consultations', authenticate, exportConsultations);

export default router;
