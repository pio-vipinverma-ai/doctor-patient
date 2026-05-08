import axios from 'axios';
import {
  getPrescriptionById,
  getPrescriptionHTML,
  markAsPrinted
} from '../prescriptionService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('prescriptionService', () => {
  const mockToken = 'test-token';

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', mockToken);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getPrescriptionById', () => {
    it('should fetch prescription by ID', async () => {
      const mockPrescription = {
        id: 'rx1',
        patientName: 'John Doe',
        patientAge: 36,
        medications: [{ name: 'Med1', dosage: '10mg' }]
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: { success: true, prescription: mockPrescription }
      });

      const result = await getPrescriptionById('rx1');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:5000/api/prescriptions/rx1',
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: `Bearer ${mockToken}` })
        })
      );
      expect(result).toEqual(mockPrescription);
    });

    it('should throw error when prescription not found', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { data: { error: 'Prescription not found' } }
      });

      await expect(getPrescriptionById('rx1'))
        .rejects.toThrow();
    });
  });

  describe('getPrescriptionHTML', () => {
    it('should fetch prescription HTML for printing', async () => {
      const mockHTML = '<html><body>Prescription</body></html>';

      mockedAxios.get.mockResolvedValueOnce({ data: mockHTML });

      const result = await getPrescriptionHTML('rx1');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:5000/api/prescriptions/rx1/print?format=html',
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: `Bearer ${mockToken}` }),
          responseType: 'text'
        })
      );
      expect(result).toEqual(mockHTML);
    });

    it('should throw error on print failure', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Print failed'));

      await expect(getPrescriptionHTML('rx1'))
        .rejects.toThrow();
    });
  });

  describe('markAsPrinted', () => {
    it('should mark prescription as printed', async () => {
      mockedAxios.put.mockResolvedValueOnce({
        data: { success: true }
      });

      await markAsPrinted('rx1');

      expect(mockedAxios.put).toHaveBeenCalledWith(
        'http://localhost:5000/api/prescriptions/rx1/mark-printed',
        {},
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: `Bearer ${mockToken}` })
        })
      );
    });

    it('should throw error on mark failure', async () => {
      mockedAxios.put.mockRejectedValueOnce({
        response: { data: { error: 'Prescription not found' } }
      });

      await expect(markAsPrinted('rx1'))
        .rejects.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle missing prescription ID', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { 
          status: 400,
          data: { error: 'Prescription ID required' } 
        }
      });

      await expect(getPrescriptionById(''))
        .rejects.toThrow();
    });

    it('should handle HTML generation failure', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { 
          status: 500,
          data: { error: 'Failed to generate prescription HTML' } 
        }
      });

      await expect(getPrescriptionHTML('rx1'))
        .rejects.toThrow();
    });

    it('should handle malformed HTML response', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: null });

      const result = await getPrescriptionHTML('rx1');
      expect(result).toBe(null);
    });

    it('should handle print marking error for already printed prescription', async () => {
      mockedAxios.put.mockRejectedValueOnce({
        response: { 
          status: 409,
          data: { error: 'Prescription already marked as printed' } 
        }
      });

      await expect(markAsPrinted('rx1'))
        .rejects.toThrow();
    });

    it('should handle network timeout on getPrescriptionById', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        code: 'ECONNABORTED',
        message: 'timeout exceeded'
      });

      await expect(getPrescriptionById('rx1'))
        .rejects.toThrow();
    });

    it('should handle network timeout on markAsPrinted', async () => {
      mockedAxios.put.mockRejectedValueOnce({
        code: 'ECONNABORTED',
        message: 'timeout exceeded'
      });

      await expect(markAsPrinted('rx1'))
        .rejects.toThrow();
    });

    it('should handle 404 for non-existent prescription', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { 
          status: 404,
          data: { error: 'Prescription not found' } 
        }
      });

      await expect(getPrescriptionById('invalid-id'))
        .rejects.toThrow();
    });

    it('should handle unauthorized access', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { 
          status: 401,
          data: { error: 'Unauthorized' } 
        }
      });

      await expect(getPrescriptionById('rx1'))
        .rejects.toThrow();
    });
  });
});

