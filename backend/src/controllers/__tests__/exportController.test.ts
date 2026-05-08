import { Request, Response } from 'express';
import {
  exportPatients,
  exportConsultations
} from '../exportController';
import * as exportService from '../../services/exportService';

jest.mock('../../services/exportService');

const mockExportService = exportService as jest.Mocked<typeof exportService>;

describe('ExportController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      query: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('exportPatients', () => {
    it('should export patients to CSV successfully', async () => {
      const mockCSV = 'Name,Age,Gender\nJohn Doe,36,M\n';
      
      mockExportService.exportPatientsToCSV.mockResolvedValueOnce(mockCSV);
      mockExportService.getDateString.mockReturnValueOnce('20260508');

      await exportPatients(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv; charset=utf-8');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="patients_20260508.csv"');
      expect(mockRes.send).toHaveBeenCalledWith(mockCSV);
      expect(mockExportService.exportPatientsToCSV).toHaveBeenCalledWith(undefined, undefined);
    });

    it('should export patients with date range filter', async () => {
      const mockCSV = 'Name,Age,Gender\nJohn Doe,36,M\n';
      
      mockReq.query = {
        from: '2026-01-01',
        to: '2026-05-31'
      };

      mockExportService.exportPatientsToCSV.mockResolvedValueOnce(mockCSV);
      mockExportService.getDateString.mockReturnValueOnce('20260508');

      await exportPatients(mockReq as Request, mockRes as Response, mockNext);

      expect(mockExportService.exportPatientsToCSV).toHaveBeenCalledWith('2026-01-01', '2026-05-31');
      expect(mockRes.send).toHaveBeenCalledWith(mockCSV);
    });

    it('should handle export errors', async () => {
      const error = new Error('Database error');
      mockExportService.exportPatientsToCSV.mockRejectedValueOnce(error);

      await exportPatients(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should return 400 for invalid format', async () => {
      mockReq.query = { format: 'pdf' };

      await exportPatients(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid format. Only CSV is supported for patient export.'
      });
      expect(mockExportService.exportPatientsToCSV).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid from date', async () => {
      mockReq.query = { from: 'invalid-date' };

      await exportPatients(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid from date format. Use YYYY-MM-DD.'
      });
      expect(mockExportService.exportPatientsToCSV).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid to date', async () => {
      mockReq.query = { to: 'invalid-date' };

      await exportPatients(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid to date format. Use YYYY-MM-DD.'
      });
      expect(mockExportService.exportPatientsToCSV).not.toHaveBeenCalled();
    });
  });

  describe('exportConsultations', () => {
    it('should export consultations to CSV successfully', async () => {
      const mockCSV = 'Date,Patient,Diagnosis\n2026-05-08,John Doe,Flu\n';
      
      mockExportService.exportConsultationsToCSV.mockResolvedValueOnce(mockCSV);
      mockExportService.getDateString.mockReturnValueOnce('20260508');

      await exportConsultations(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv; charset=utf-8');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="consultations_20260508.csv"');
      expect(mockRes.send).toHaveBeenCalledWith(mockCSV);
      expect(mockExportService.exportConsultationsToCSV).toHaveBeenCalledWith(undefined, undefined);
    });

    it('should export consultations with date range filter', async () => {
      const mockCSV = 'Date,Patient,Diagnosis\n2026-05-08,John Doe,Flu\n';
      
      mockReq.query = {
        from: '2026-05-01',
        to: '2026-05-31'
      };

      mockExportService.exportConsultationsToCSV.mockResolvedValueOnce(mockCSV);
      mockExportService.getDateString.mockReturnValueOnce('20260508');

      await exportConsultations(mockReq as Request, mockRes as Response, mockNext);

      expect(mockExportService.exportConsultationsToCSV).toHaveBeenCalledWith('2026-05-01', '2026-05-31');
      expect(mockRes.send).toHaveBeenCalledWith(mockCSV);
    });

    it('should export consultations to PDF successfully', async () => {
      const mockPDFStream = {
        pipe: jest.fn()
      };
      
      mockReq.query = { format: 'pdf' };
      mockExportService.exportConsultationsToPDF.mockResolvedValueOnce(mockPDFStream as any);
      mockExportService.getDateString.mockReturnValueOnce('20260508');

      await exportConsultations(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="consultations_report_20260508.pdf"');
      expect(mockPDFStream.pipe).toHaveBeenCalledWith(mockRes);
    });

    it('should export consultations to PDF with date range', async () => {
      const mockPDFStream = {
        pipe: jest.fn()
      };
      
      mockReq.query = {
        format: 'pdf',
        from: '2026-05-01',
        to: '2026-05-31'
      };

      mockExportService.exportConsultationsToPDF.mockResolvedValueOnce(mockPDFStream as any);
      mockExportService.getDateString.mockReturnValueOnce('20260508');

      await exportConsultations(mockReq as Request, mockRes as Response, mockNext);

      expect(mockExportService.exportConsultationsToPDF).toHaveBeenCalledWith('2026-05-01', '2026-05-31');
      expect(mockPDFStream.pipe).toHaveBeenCalledWith(mockRes);
    });

    it('should return 400 for invalid format', async () => {
      mockReq.query = { format: 'xml' };

      await exportConsultations(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid format. Supported formats: csv, pdf.'
      });
      expect(mockExportService.exportConsultationsToCSV).not.toHaveBeenCalled();
      expect(mockExportService.exportConsultationsToPDF).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid from date', async () => {
      mockReq.query = { from: 'not-a-date' };

      await exportConsultations(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid from date format. Use YYYY-MM-DD.'
      });
    });

    it('should return 400 for invalid to date', async () => {
      mockReq.query = { to: 'not-a-date' };

      await exportConsultations(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid to date format. Use YYYY-MM-DD.'
      });
    });

    it('should handle PDF export errors', async () => {
      const error = new Error('PDF generation error');
      mockReq.query = { format: 'pdf' };
      mockExportService.exportConsultationsToPDF.mockRejectedValueOnce(error);

      await exportConsultations(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle CSV export errors', async () => {
      const error = new Error('Database error');
      mockExportService.exportConsultationsToCSV.mockRejectedValueOnce(error);

      await exportConsultations(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
