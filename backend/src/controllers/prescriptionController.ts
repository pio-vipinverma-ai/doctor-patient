/// <reference path="../types/express.d.ts" />
import { Request, Response } from 'express';
import * as prescriptionService from '../services/prescriptionService';

/**
 * Prescription Controller - Request handlers for prescription endpoints
 */

/**
 * Get prescription by ID
 * GET /api/prescriptions/:id
 */
export const getPrescriptionController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    console.log(`[PrescriptionController] Fetching prescription: ${id}`);

    const prescription = await prescriptionService.getPrescriptionById(id);

    if (!prescription) {
      res.status(404).json({
        success: false,
        error: 'Prescription not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      prescription: {
        id: prescription.id,
        patientName: prescription.patientName,
        patientAge: prescription.patientAge,
        patientDOB: prescription.patientDOB,
        date: prescription.date,
        vitals: prescription.vitals,
        diagnosis: prescription.diagnosis,
        complaints: prescription.complaints,
        medications: prescription.medications,
        clinicHeader: prescription.clinicHeader,
        status: prescription.status,
        generatedAt: prescription.generatedAt,
        printedAt: prescription.printedAt,
      },
    });
  } catch (error: any) {
    console.error('[PrescriptionController] Error fetching prescription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch prescription',
      details: error.message,
    });
  }
};

/**
 * Print prescription (PDF or HTML)
 * GET /api/prescriptions/:id/print?format=pdf|html
 */
export const printPrescriptionController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const format = (req.query.format as string) || 'html';

    console.log(`[PrescriptionController] Printing prescription: ${id}, format: ${format}`);

    const prescription = await prescriptionService.getPrescriptionById(id);

    if (!prescription) {
      res.status(404).json({
        success: false,
        error: 'Prescription not found',
      });
      return;
    }

    if (format === 'html') {
      // Return HTML for browser printing
      const html = prescriptionService.generatePrescriptionHTML(prescription);
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } else if (format === 'pdf') {
      // PDF generation - will implement with puppeteer later
      // For now, return error message
      res.status(501).json({
        success: false,
        error: 'PDF generation not yet implemented',
        message: 'Use format=html and print from browser, or wait for puppeteer integration',
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid format',
        message: 'Format must be either "pdf" or "html"',
      });
    }
  } catch (error: any) {
    console.error('[PrescriptionController] Error printing prescription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to print prescription',
      details: error.message,
    });
  }
};

/**
 * Mark prescription as printed
 * PUT /api/prescriptions/:id/mark-printed
 */
export const markPrintedController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    console.log(`[PrescriptionController] Marking prescription as printed: ${id}`);

    const result = await prescriptionService.markAsPrinted(id);

    res.status(200).json({
      success: true,
      prescription: {
        id: result.id,
        printedAt: result.printedAt,
      },
    });
  } catch (error: any) {
    console.error('[PrescriptionController] Error marking prescription as printed:', error);
    
    if (error.message === 'Prescription not found') {
      res.status(404).json({
        success: false,
        error: 'Prescription not found',
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to mark prescription as printed',
      details: error.message,
    });
  }
};
