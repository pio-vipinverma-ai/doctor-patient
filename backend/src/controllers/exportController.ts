import { Request, Response, NextFunction } from 'express';
import {
  exportPatientsToCSV,
  exportConsultationsToCSV,
  exportConsultationsToPDF,
  getDateString
} from '../services/exportService';

/**
 * Export Controller - Handle export requests
 */

/**
 * Export patients as CSV
 * GET /api/exports/patients?format=csv&from=2026-01-01&to=2026-05-31
 */
export const exportPatients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { format = 'csv', from, to } = req.query;

    // Validate format
    if (format !== 'csv') {
      res.status(400).json({
        success: false,
        error: 'Invalid format. Only CSV is supported for patient export.'
      });
      return;
    }

    // Validate dates if provided
    if (from && isNaN(Date.parse(from as string))) {
      res.status(400).json({
        success: false,
        error: 'Invalid from date format. Use YYYY-MM-DD.'
      });
      return;
    }

    if (to && isNaN(Date.parse(to as string))) {
      res.status(400).json({
        success: false,
        error: 'Invalid to date format. Use YYYY-MM-DD.'
      });
      return;
    }

    // Generate CSV
    const csv = await exportPatientsToCSV(from as string, to as string);

    // Set response headers for file download
    const filename = `patients_${getDateString()}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Send CSV
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

/**
 * Export consultations as CSV or PDF
 * GET /api/exports/consultations?format=csv&from=2026-01-01&to=2026-05-31
 * GET /api/exports/consultations?format=pdf&from=2026-01-01&to=2026-05-31
 */
export const exportConsultations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { format = 'csv', from, to } = req.query;

    // Validate format
    if (format !== 'csv' && format !== 'pdf') {
      res.status(400).json({
        success: false,
        error: 'Invalid format. Supported formats: csv, pdf.'
      });
      return;
    }

    // Validate dates if provided
    if (from && isNaN(Date.parse(from as string))) {
      res.status(400).json({
        success: false,
        error: 'Invalid from date format. Use YYYY-MM-DD.'
      });
      return;
    }

    if (to && isNaN(Date.parse(to as string))) {
      res.status(400).json({
        success: false,
        error: 'Invalid to date format. Use YYYY-MM-DD.'
      });
      return;
    }

    if (format === 'csv') {
      // Generate CSV
      const csv = await exportConsultationsToCSV(from as string, to as string);

      // Set response headers for file download
      const filename = `consultations_${getDateString()}.csv`;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // Send CSV
      res.send(csv);
    } else if (format === 'pdf') {
      // Generate PDF
      const pdfStream = await exportConsultationsToPDF(from as string, to as string);

      // Set response headers for file download
      const filename = `consultations_report_${getDateString()}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // Pipe PDF stream to response
      pdfStream.pipe(res);
    }
  } catch (error) {
    next(error);
  }
};
