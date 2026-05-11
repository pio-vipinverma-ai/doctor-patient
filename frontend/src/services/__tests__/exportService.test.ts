import axios from 'axios';
import {
  exportPatients,
  exportConsultations,
  downloadFile,
  generateFilename
} from '../exportService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('exportService', () => {
  const mockToken = 'test-token';

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', mockToken);
    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();
    // Mock document.createElement
    document.createElement = jest.fn((tagName) => {
      if (tagName === 'a') {
        return {
          href: '',
          download: '',
          click: jest.fn(),
          style: {}
        } as any;
      }
      return {} as any;
    });
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('exportPatients', () => {
    it('should export patients as CSV', async () => {
      const mockCSV = 'Name,Age,Gender\nJohn,36,M';
      mockedAxios.get.mockResolvedValueOnce({ data: mockCSV });

      await exportPatients('csv');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:5000/api/exports/patients',
        expect.objectContaining({
          params: { format: 'csv' },
          headers: expect.objectContaining({ Authorization: `Bearer ${mockToken}` }),
          responseType: 'blob'
        })
      );
    });

    it('should export patients with date range', async () => {
      const mockCSV = 'Name,Age,Gender\nJohn,36,M';
      mockedAxios.get.mockResolvedValueOnce({ data: mockCSV });

      await exportPatients('csv', '2026-01-01', '2026-05-31');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:5000/api/exports/patients',
        expect.objectContaining({
          params: {
            format: 'csv',
            from: '2026-01-01',
            to: '2026-05-31'
          }
        })
      );
    });

    it('should throw error on export failure', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { data: { error: 'Export failed' } }
      });

      await expect(exportPatients('csv'))
        .rejects.toThrow();
    });
  });

  describe('exportConsultations', () => {
    it('should export consultations as CSV', async () => {
      const mockCSV = 'Date,Patient,Diagnosis\n2026-05-08,John,Flu';
      mockedAxios.get.mockResolvedValueOnce({ data: mockCSV });

      await exportConsultations('csv');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:5000/api/exports/consultations',
        expect.objectContaining({
          params: { format: 'csv' }
        })
      );
    });

    it('should export consultations as PDF', async () => {
      const mockPDF = new Blob(['pdf content'], { type: 'application/pdf' });
      mockedAxios.get.mockResolvedValueOnce({ data: mockPDF });

      await exportConsultations('pdf', '2026-01-01', '2026-05-31');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:5000/api/exports/consultations',
        expect.objectContaining({
          params: {
            format: 'pdf',
            from: '2026-01-01',
            to: '2026-05-31'
          }
        })
      );
    });

    it('should throw error on export failure', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(exportConsultations('csv'))
        .rejects.toThrow();
    });
  });

  describe('downloadFile', () => {
    it('should trigger file download', () => {
      const mockBlob = new Blob(['test'], { type: 'text/csv' });
      const mockClick = jest.fn();
      const mockLink = {
        href: '',
        download: '',
        click: mockClick,
        style: {}
      };

      jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);

      downloadFile(mockBlob, 'test.csv');

      expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(mockLink.download).toBe('test.csv');
      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe('generateFilename', () => {
    it('should generate filename for patients CSV export', () => {
      const mockDate = new Date('2026-05-11T10:30:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const filename = generateFilename('patients', 'csv');

      expect(filename).toBe('patients_20260511.csv');
    });

    it('should generate filename for patients PDF export', () => {
      const mockDate = new Date('2026-05-11T10:30:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const filename = generateFilename('patients', 'pdf');

      expect(filename).toBe('patients_20260511.pdf');
    });

    it('should generate filename for consultations CSV export', () => {
      const mockDate = new Date('2026-05-11T10:30:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const filename = generateFilename('consultations', 'csv');

      expect(filename).toBe('consultations_20260511.csv');
    });

    it('should generate filename for consultations PDF export', () => {
      const mockDate = new Date('2026-05-11T10:30:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const filename = generateFilename('consultations', 'pdf');

      expect(filename).toBe('consultations_20260511.pdf');
    });

    it('should use current date in filename', () => {
      const filename = generateFilename('patients', 'csv');

      // Should have format: patients_YYYYMMDD.csv
      expect(filename).toMatch(/^patients_\d{8}\.csv$/);
    });
  });
});
