import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as patientController from '../controllers/patientController';
import * as consultationController from '../controllers/consultationController';

const router = Router();

/**
 * Patient routes - All routes require authentication
 */

// Search patients (must come before /:id to avoid conflicts)
router.get('/search', authenticate, patientController.searchPatientsController);

// Get all patients with pagination
router.get('/', authenticate, patientController.getAllPatientsController);

// Get patient by ID
router.get('/:id', authenticate, patientController.getPatientController);

// Create new patient
router.post('/', authenticate, patientController.createPatientController);

// Update patient
router.put('/:id', authenticate, patientController.updatePatientController);

// Get patient consultation history
router.get('/:id/consultations', authenticate, consultationController.getPatientConsultationsController);

export default router;
