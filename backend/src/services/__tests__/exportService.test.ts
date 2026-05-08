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

      const csv = await exportService.exportPatientsToCSV('2026-01-01', '2026-01-31');

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
      consdate: new Date('2026-05-08T10:30:00'),
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
        expect.stringContaining('c.created_at >=
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('DATE(c.created_at)'),
        expect.arrayContaining(['2026-05-01', '2026-05-31'])
      );
    });
  });

  describe('getDateString', () => {
    it('should format current date as YYYY-MM-DD', () => {
      const formatted = exportService.getDateString();
      
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(formatted).toBe(new Date().toISOString().split('T')[0]);
    });
  });
});

    });
  });
});