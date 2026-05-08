import * as exportService from '../exportService';
import { pool } from '../../config/database';

jest.mock('../../config/database');

const mockPool = pool as any;

describe('ExportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPool.query = jest.fn();
  });

  describe('exportPatientsToCSV', () => {
    it('should export all patients to CSV format', async () => {
      const mockPatients = [
        {
          name: 'John Doe',
          age: 36,
          gender: 'M',
          phone: '9876543210',
          email: 'john@example.com',
          address: '123 Main St',
          created_at: new Date('2026-01-01')
        },
        {
          name: 'Jane Smith',
          age: 41,
          gender: 'F',
          phone: '9876543211',
          email: null,
          address: '456 Oak Ave',
          created_at: new Date('2026-01-02')
        }
      ];

      mockPool.query.mockResolvedValueOnce({
        rows: mockPatients,
        command: 'SELECT',
        rowCount: 2,
        oid: 0,
        fields: []
      } as any);

      const csv = await exportService.exportPatientsToCSV();

      expect(csv).toContain('Name');
      expect(csv).toContain('Age');
      expect(csv).toContain('Gender');
      expect(csv).toContain('John Doe');
      expect(csv).toContain('9876543210');
      expect(csv).toContain('Jane Smith');
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        []
      );
    });

    it('should filter by date range if provided', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: []
      } as any);

      await exportService.exportPatientsToCSV('2026-01-01', '2026-01-31');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('created_at >='),
        expect.arrayContaining(['2026-01-01', '2026-01-31'])
      );
    });

    it('should return CSV with header even if no patients', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: []
      } as any);

      const csv = await exportService.exportPatientsToCSV();

      expect(csv).toContain('Name');
      expect(csv).toContain('Age');
      expect(csv).toContain('Gender');
    });
  });

  describe('exportConsultationsToCSV', () => {
    it('should export consultations with patient details', async () => {
      const mockConsultations = [
        {
          date: new Date('2026-05-08T10:30:00'),
          patient: 'John Doe',
          age: 36,
          temperature: 98.6,
          bp: '120/80',
          pulse: 72,
          diagnosis: 'Migraine',
          medications: 'Paracetamol - Twice daily for 5 days'
        }
      ];

      mockPool.query.mockResolvedValueOnce({
        rows: mockConsultations,
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: []
      } as any);

      const csv = await exportService.exportConsultationsToCSV();

      expect(csv).toContain('Date');
      expect(csv).toContain('Patient');
      expect(csv).toContain('John Doe');
      expect(csv).toContain('98.6');
      expect(csv).toContain('120/80');
      expect(csv).toContain('Migraine');
    });

    it('should filter by date range', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: []
      } as any);

      await exportService.exportConsultationsToCSV('2026-05-01', '2026-05-31');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('c.created_at >='),
        expect.arrayContaining(['2026-05-01', '2026-05-31'])
      );
    });
  });

  describe('getDateString', () => {
    it('should format current date as YYYYMMDD', () => {
      const formatted = exportService.getDateString();
      
      // Should be YYYYMMDD format without dashes (for filenames)
      expect(formatted).toMatch(/^\d{8}$/);
      
      // Verify it matches today's date
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      expect(formatted).toBe(`${year}${month}${day}`);
    });
  });

  describe('exportConsultationsToPDF', () => {
    it('should export consultations to PDF format', async () => {
      const mockConsultations = [
        {
          date: new Date('2026-05-08'),
          patient: 'John Doe',
          age: 36,
          temperature: 98.6,
          bp: '120/80',
          pulse: 72,
          diagnosis: 'Migraine',
          medications: 'Paracetamol - 500mg, Twice daily for 5 days'
        }
      ];

      mockPool.query.mockResolvedValueOnce({
        rows: mockConsultations,
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: []
      } as any);

      const pdf = await exportService.exportConsultationsToPDF();

      expect(pdf).toBeDefined();
      expect(mockPool.query).toHaveBeenCalled();
    });

    it('should filter PDF export by date range', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: []
      } as any);

      await exportService.exportConsultationsToPDF('2026-05-01', '2026-05-31');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('c.created_at >='),
        expect.arrayContaining(['2026-05-01', '2026-05-31'])
      );
    });

    it('should handle empty consultations for PDF', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: []
      } as any);

      const pdf = await exportService.exportConsultationsToPDF();

      expect(pdf).toBeDefined();
    });

    it('should filter PDF export by from date only', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: []
      } as any);

      await exportService.exportConsultationsToPDF('2026-05-01');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('c.created_at >='),
        ['2026-05-01']
      );
    });
  });

  describe('exportPatientsToCSV edge cases', () => {
    it('should handle patients with Other gender', async () => {
      const mockPatients = [
        {
          name: 'Alex Taylor',
          age: 28,
          gender: 'O',
          phone: '1231231234',
          email: 'alex@example.com',
          address: '789 Pine Rd',
          created_at: new Date('2026-03-01')
        }
      ];

      mockPool.query.mockResolvedValueOnce({
        rows: mockPatients,
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: []
      } as any);

      const csv = await exportService.exportPatientsToCSV();

      expect(csv).toContain('Other');
      expect(csv).toContain('Alex Taylor');
    });

    it('should filter patients by from date only', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: []
      } as any);

      await exportService.exportPatientsToCSV('2026-01-01');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('created_at >='),
        ['2026-01-01']
      );
    });

    it('should handle null emails and addresses', async () => {
      const mockPatients = [
        {
          name: 'No Contact',
          age: 50,
          gender: 'M',
          phone: '5555555555',
          email: null,
          address: null,
          created_at: new Date('2026-04-01')
        }
      ];

      mockPool.query.mockResolvedValueOnce({
        rows: mockPatients,
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: []
      } as any);

      const csv = await exportService.exportPatientsToCSV();

      expect(csv).toContain('No Contact');
      // CSV should have empty fields for null values
      expect(csv.split('\n')[1]).toMatch(/,,/); // Empty fields
    });
  });

  describe('exportConsultationsToCSV edge cases', () => {
    it('should handle null medications', async () => {
      const mockConsultations = [
        {
          date: new Date('2026-05-08'),
          patient: 'Jane Doe',
          age: 40,
          temperature: 98.2,
          bp: '118/76',
          pulse: 68,
          diagnosis: 'Checkup',
          medications: null
        }
      ];

      mockPool.query.mockResolvedValueOnce({
        rows: mockConsultations,
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: []
      } as any);

      const csv = await exportService.exportConsultationsToCSV();

      expect(csv).toContain('None');
      expect(csv).toContain('Jane Doe');
    });

    it('should filter consultations by from date only', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: []
      } as any);

      await exportService.exportConsultationsToCSV('2026-05-01');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('c.created_at >='),
        ['2026-05-01']
      );
    });

    it('should return CSV with header even if no consultations', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: []
      } as any);

      const csv = await exportService.exportConsultationsToCSV();

      expect(csv).toContain('Date');
      expect(csv).toContain('Patient');
      expect(csv).toContain('Diagnosis');
    });
  });
});