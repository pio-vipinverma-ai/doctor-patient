/// <reference path="../types/express.d.ts" />
import { Request, Response } from 'express';
import * as consultationService from '../services/consultationService';

/**
 * Consultation Controller - Request handlers for consultation endpoints
 */

/**
 * Create new consultation
 * POST /api/consultations
 */
export const createConsultationController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const consultationData = req.body;

    console.log('[ConsultationController] Received data:', JSON.stringify(consultationData));

    // Validate input
    const validation = consultationService.validateConsultationInput(consultationData);
    if (!validation.valid) {
      console.log('[ConsultationController] Validation failed:', validation.errors);
      res.status(400).json({
        success: false,
        error: validation.errors[0],
        details: { errors: validation.errors },
      });
      return;
    }

    // Create consultation
    const result = await consultationService.createConsultation(consultationData);

    res.status(201).json({
      success: true,
      consultation: {
        id: result.consultation.id,
        patientId: result.consultation.patient_id,
        appointmentId: result.consultation.appointment_id,
        temperature: result.consultation.temperature,
        bp: `${result.consultation.bp_systolic}/${result.consultation.bp_diastolic}`,
        pulse: result.consultation.pulse,
        complaints: result.consultation.complaints,
        diagnosis: result.consultation.diagnosis,
        medications: result.medications.map((med) => ({
          id: med.id,
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          instructions: med.instructions,
        })),
        prescription: {
          id: result.prescription.id,
          status: result.prescription.status,
        },
        vitalsWarnings: Object.keys(result.vitalsWarnings).length > 0 ? result.vitalsWarnings : undefined,
        created_at: result.consultation.created_at,
      },
    });
  } catch (error: any) {
    console.error('[ConsultationController] Create error:', error);

    if (error.message === 'Patient not found') {
      res.status(404).json({
        success: false,
        error: error.message,
      });
      return;
    }

    if (error.message === 'Appointment not found') {
      res.status(404).json({
        success: false,
        error: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create consultation',
    });
  }
};

/**
 * Get consultation by ID
 * GET /api/consultations/:id
 */
export const getConsultationController = async (req: Request, res: Response): Promise<void> => {
  try {
    const consultationId = req.params.id;

    const result = await consultationService.getConsultationById(consultationId);

    if (!result || !result.consultation) {
      res.status(404).json({
        success: false,
        error: 'Consultation not found',
      });
      return;
    }

    const consultation = result.consultation;

    res.status(200).json({
      success: true,
      consultation: {
        id: consultation.id,
        patientId: consultation.patient_id,
        appointmentId: consultation.appointment_id,
        temperature: consultation.temperature,
        bp: `${consultation.bp_systolic}/${consultation.bp_diastolic}`,
        pulse: consultation.pulse,
        complaints: consultation.complaints,
        diagnosis: consultation.diagnosis,
        medications: result.medications.map((med) => ({
          id: med.id,
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          instructions: med.instructions,
        })),
        prescription: result.prescription
          ? {
              id: result.prescription.id,
              status: result.prescription.status,
              generatedAt: result.prescription.generated_at,
              printedAt: result.prescription.printed_at,
            }
          : null,
        created_at: consultation.created_at,
        updated_at: consultation.updated_at,
      },
    });
  } catch (error: any) {
    console.error('[ConsultationController] Get consultation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve consultation',
    });
  }
};

/**
 * Get consultation history for a patient
 * GET /api/patients/:id/consultations
 */
export const getPatientConsultationsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const patientId = req.params.id;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await consultationService.getConsultationHistory(patientId, limit, offset);

    const pages = Math.ceil(result.total / limit);

    res.status(200).json({
      success: true,
      consultations: result.consultations.map((c) => ({
        id: c.id,
        date: c.date,
        temperature: c.temperature,
        bp: c.bp,
        pulse: c.pulse,
        diagnosis: c.diagnosis,
        medicationCount: c.medicationCount,
        prescriptionId: c.prescriptionId,
      })),
      total: result.total,
      pages,
      currentPage: Math.floor(offset / limit) + 1,
      limit,
    });
  } catch (error: any) {
    console.error('[ConsultationController] Get patient consultations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve consultation history',
    });
  }
};
