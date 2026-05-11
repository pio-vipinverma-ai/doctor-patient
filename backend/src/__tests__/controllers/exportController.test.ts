import { Request, Response, NextFunction } from 'express';
import * as exportController from '../../controllers/exportController';
import * as exportService from '../../services/exportService';

jest.mock('../../services/exportService');

describe('Export Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let sendMock: jest.Mock;
  let setHeaderMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    jsonMock = jest.fn();
    sendMock = jest.fn();
    setHeaderMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockNext = jest.fn();

    mockRequest = {
      query: {},
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
      send: sendMock,
      setHeader: setHeaderMock,
    };
  });

  describe('exportPatients', () => {
    it('should export patients as CSV successfully', async () => {
      const mockCSV = 'id,name,phone\n1,John Doe,1234567890';
      mockRequest.query = { format: 'csv' };

      (exportService.exportPatientsToCSV as jest.Mock).mockResolvedValue(mockCSV);
      (exportService.getDateString as jest.Mock).mockReturnValue('2026-05-11');

      await exportController.exportPatients(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(setHeaderMock).toHaveBeenCalledWith('Content-Type', 'text/csv; charset=utf-8');
      expect(setHeaderMock).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="patients_2026-05-11.csv"');
      expect(sendMock).toHaveBeenCalledWith(mockCSV);
    });

    it('should export patients with date filters', async () => {
      const mockCSV = 'id,name,phone\n1,John Doe,1234567890';
      mockRequest.query = {
        format: 'csv',
        from: '2026-01-01',
        to: '2026-05-31',
      };

      (exportService.exportPatientsToCSV as jest.Mock).mockResolvedValue(mockCSV);
      (exportService.getDateString as jest.Mock).mockReturnValue('2026-05-11');

      await exportController.exportPatients(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(exportService.exportPatientsToCSV).toHaveBeenCalledWith('2026-01-01', '2026-05-31');
      expect(sendMock).toHaveBeenCalledWith(mockCSV);
    });

    it('should return 400 for invalid format', async () => {
      mockRequest.query = { format: 'pdf' };

      await exportController.exportPatients(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid format. Only CSV is supported for patient export.',
      });
    });

    it('should return 400 for invalid from date', async () => {
      mockRequest.query = {
        format: 'csv',
        from: 'invalid-date',
      };

      await exportController.exportPatients(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid from date format. Use YYYY-MM-DD.',
      });
    });

    it('should return 400 for invalid to date', async () => {
      mockRequest.query = {
        format: 'csv',
        to: 'invalid-date',
      };

      await exportController.exportPatients(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid to date format. Use YYYY-MM-DD.',
      });
    });

    it('should call next on error', async () => {
      mockRequest.query = { format: 'csv' };
      const error = new Error('Export failed');

      (exportService.exportPatientsToCSV as jest.Mock).mockRejectedValue(error);

      await exportController.exportPatients(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('exportConsultations', () => {
    it('should export consultations as CSV successfully', async () => {
      const mockCSV = 'id,patient_name,date\n1,John Doe,2026-05-11';
      mockRequest.query = { format: 'csv' };

      (exportService.exportConsultationsToCSV as jest.Mock).mockResolvedValue(mockCSV);
      (exportService.getDateString as jest.Mock).mockReturnValue('2026-05-11');

      await exportController.exportConsultations(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(setHeaderMock).toHaveBeenCalledWith('Content-Type', 'text/csv; charset=utf-8');
      expect(setHeaderMock).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="consultations_2026-05-11.csv"');
      expect(sendMock).toHaveBeenCalledWith(mockCSV);
    });

    it('should export consultations as PDF successfully', async () => {
      const mockPDFStream = {
        pipe: jest.fn()
      };
      mockRequest.query = { format: 'pdf' };

      (exportService.exportConsultationsToPDF as jest.Mock).mockResolvedValue(mockPDFStream);
      (exportService.getDateString as jest.Mock).mockReturnValue('2026-05-11');

      await exportController.exportConsultations(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(setHeaderMock).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(setHeaderMock).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="consultations_report_2026-05-11.pdf"');
      expect(mockPDFStream.pipe).toHaveBeenCalledWith(mockResponse);
    });

    it('should export consultations with date filters', async () => {
      const mockCSV = 'id,patient_name,date\n1,John Doe,2026-05-11';
      mockRequest.query = {
        format: 'csv',
        from: '2026-01-01',
        to: '2026-05-31',
      };

      (exportService.exportConsultationsToCSV as jest.Mock).mockResolvedValue(mockCSV);
      (exportService.getDateString as jest.Mock).mockReturnValue('2026-05-11');

      await exportController.exportConsultations(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(exportService.exportConsultationsToCSV).toHaveBeenCalledWith('2026-01-01', '2026-05-31');
      expect(sendMock).toHaveBeenCalledWith(mockCSV);
    });

    it('should return 400 for invalid format', async () => {
      mockRequest.query = { format: 'xml' };

      await exportController.exportConsultations(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid format. Supported formats: csv, pdf.',
      });
    });

    it('should return 400 for invalid from date', async () => {
      mockRequest.query = {
        format: 'csv',
        from: 'invalid-date',
      };

      await exportController.exportConsultations(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid from date format. Use YYYY-MM-DD.',
      });
    });

    it('should return 400 for invalid to date', async () => {
      mockRequest.query = {
        format: 'csv',
        to: 'invalid-date',
      };

      await exportController.exportConsultations(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid to date format. Use YYYY-MM-DD.',
      });
    });

    it('should call next on error', async () => {
      mockRequest.query = { format: 'csv' };
      const error = new Error('Export failed');

      (exportService.exportConsultationsToCSV as jest.Mock).mockRejectedValue(error);

      await exportController.exportConsultations(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
