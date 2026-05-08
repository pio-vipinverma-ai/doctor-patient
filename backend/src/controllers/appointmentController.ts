/// <reference path="../types/express.d.ts" />
import { Request, Response } from 'express';
import * as appointmentService from '../services/appointmentService';

/**
 * Appointment Controller - Request handlers for appointment endpoints
 */

/**
 * Create new appointment
 * POST /api/appointments
 */
export const createAppointmentController = async (req: Request, res: Response): Promise<void> => {
  try {
    const appointmentData = req.body;

    console.log('[AppointmentController] Received data:', JSON.stringify(appointmentData));

    // Validate input
    const validation = appointmentService.validateAppointmentInput(appointmentData);
    if (!validation.valid) {
      console.log('[AppointmentController] Validation failed:', validation.errors);
      res.status(400).json({
        success: false,
        error: validation.errors[0],
        details: { errors: validation.errors }
      });
      return;
    }

    // Create appointment
    const appointment = await appointmentService.createAppointment(appointmentData);

    res.status(201).json({
      success: true,
      appointment: {
        id: appointment.id,
        patientId: appointment.patient_id,
        scheduledTime: appointment.scheduled_time,
        status: appointment.status,
        reason: appointment.reason,
        created_at: appointment.created_at
      }
    });
  } catch (error: any) {
    console.error('[AppointmentController] Create error:', error);

    if (error.message === 'Patient not found') {
      res.status(404).json({
        success: false,
        error: error.message
      });
      return;
    }

    if (error.message === 'Patient already has appointment at this time') {
      res.status(409).json({
        success: false,
        error: error.message,
        statusCode: 409
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create appointment'
    });
  }
};

/**
 * Get appointments by date
 * GET /api/appointments?date=YYYY-MM-DD&status=Scheduled&patientId=uuid
 */
export const getAppointmentsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, status } = req.query;

    // Default to today's date if not provided
    const searchDate = (date as string) || new Date().toISOString().split('T')[0];

    const appointments = await appointmentService.getAppointmentsByDate(
      searchDate,
      status as string | undefined
    );

    res.status(200).json({
      success: true,
      appointments
    });
  } catch (error) {
    console.error('[AppointmentController] Get appointments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve appointments'
    });
  }
};

/**
 * Get appointment by ID
 * GET /api/appointments/:id
 */
export const getAppointmentController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const appointment = await appointmentService.getAppointmentById(id);

    if (!appointment) {
      res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      appointment: {
        id: appointment.id,
        patientId: appointment.patient_id,
        scheduledTime: appointment.scheduled_time,
        status: appointment.status,
        reason: appointment.reason,
        created_at: appointment.created_at,
        updated_at: appointment.updated_at
      }
    });
  } catch (error) {
    console.error('[AppointmentController] Get appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve appointment'
    });
  }
};

/**
 * Update appointment status or details
 * PUT /api/appointments/:id
 */
export const updateAppointmentController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate status if provided
    if (updates.status && !appointmentService.isValidStatus(updates.status)) {
      res.status(400).json({
        success: false,
        error: 'Invalid status. Must be: Scheduled, Completed, Cancelled, or No-show'
      });
      return;
    }

    // Check if appointment exists
    const existing = await appointmentService.getAppointmentById(id);
    if (!existing) {
      res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
      return;
    }

    // Update appointment
    const appointment = await appointmentService.updateAppointment(id, updates);

    res.status(200).json({
      success: true,
      appointment: {
        id: appointment!.id,
        patientId: appointment!.patient_id,
        scheduledTime: appointment!.scheduled_time,
        status: appointment!.status,
        reason: appointment!.reason,
        updated_at: appointment!.updated_at
      }
    });
  } catch (error) {
    console.error('[AppointmentController] Update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update appointment'
    });
  }
};
