/// <reference path="../types/express.d.ts" />
import { Request, Response } from 'express';
import * as patientService from '../services/patientService';
import { PatientInput, PatientUpdateInput } from '../types/models';

/**
 * Patient Controller - Request handlers for patient endpoints
 */

/**
 * Create new patient
 * POST /api/patients
 */
export const createPatientController = async (req: Request, res: Response): Promise<void> => {
  try {
    const patientData: PatientInput = req.body;

    // Validate input
    const validation = patientService.validatePatientInput(patientData);
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        error: validation.errors[0],
        details: { errors: validation.errors }
      });
      return;
    }

    // Create patient
    const patient = await patientService.createPatient(patientData);

    // Calculate age
    const age = new Date().getFullYear() - new Date(patient.dob).getFullYear();

    res.status(201).json({
      success: true,
      patient: {
        ...patient,
        age
      }
    });
  } catch (error: any) {
    if (error.message === 'Phone number already exists') {
      res.status(409).json({
        success: false,
        error: error.message,
        statusCode: 409
      });
      return;
    }

    console.error('[PatientController] Create error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create patient'
    });
  }
};

/**
 * Get patient by ID
 * GET /api/patients/:id
 */
export const getPatientController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const patient = await patientService.getPatientById(id);

    if (!patient) {
      res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
      return;
    }

    // Calculate age
    const age = new Date().getFullYear() - new Date(patient.dob).getFullYear();

    res.status(200).json({
      success: true,
      patient: {
        ...patient,
        age
      }
    });
  } catch (error) {
    console.error('[PatientController] Get error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve patient'
    });
  }
};

/**
 * Search patients
 * GET /api/patients/search?q=query&limit=10
 */
export const searchPatientsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string || '';
    const limit = parseInt(req.query.limit as string) || 10;

    if (!query || query.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
      return;
    }

    const patients = await patientService.searchPatients(query, limit);

    res.status(200).json({
      success: true,
      patients,
      total: patients.length
    });
  } catch (error) {
    console.error('[PatientController] Search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search patients'
    });
  }
};

/**
 * Update patient
 * PUT /api/patients/:id
 */
export const updatePatientController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates: PatientUpdateInput = req.body;

    // Check if patient exists
    const existingPatient = await patientService.getPatientById(id);
    if (!existingPatient) {
      res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
      return;
    }

    // Validate updates (only validate fields that are being updated)
    if (updates.name !== undefined && (updates.name.trim().length === 0 || updates.name.length > 100)) {
      res.status(400).json({
        success: false,
        error: 'Invalid name'
      });
      return;
    }

    if (updates.phone !== undefined && !/^\+?[0-9\s\-\(\)]{10,}$/.test(updates.phone)) {
      res.status(400).json({
        success: false,
        error: 'Invalid phone number format'
      });
      return;
    }

    if (updates.email !== undefined && updates.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
      res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
      return;
    }

    if (updates.dob !== undefined) {
      const dob = new Date(updates.dob);
      const age = new Date().getFullYear() - dob.getFullYear();
      if (isNaN(dob.getTime()) || age < 0 || age > 150) {
        res.status(400).json({
          success: false,
          error: 'Invalid date of birth'
        });
        return;
      }
    }

    if (updates.gender !== undefined && !['M', 'F', 'Other'].includes(updates.gender)) {
      res.status(400).json({
        success: false,
        error: 'Gender must be M, F, or Other'
      });
      return;
    }

    // Update patient
    const updatedPatient = await patientService.updatePatient(id, updates);

    if (!updatedPatient) {
      res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
      return;
    }

    // Calculate age
    const age = new Date().getFullYear() - new Date(updatedPatient.dob).getFullYear();

    res.status(200).json({
      success: true,
      patient: {
        ...updatedPatient,
        age
      }
    });
  } catch (error: any) {
    if (error.message === 'Phone number already exists') {
      res.status(409).json({
        success: false,
        error: error.message,
        statusCode: 409
      });
      return;
    }

    console.error('[PatientController] Update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update patient'
    });
  }
};

/**
 * Get all patients with pagination
 * GET /api/patients?limit=50&offset=0
 */
export const getAllPatientsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await patientService.getAllPatients(limit, offset);

    res.status(200).json({
      success: true,
      patients: result.patients,
      total: result.total,
      limit,
      offset
    });
  } catch (error) {
    console.error('[PatientController] Get all error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve patients'
    });
  }
};
