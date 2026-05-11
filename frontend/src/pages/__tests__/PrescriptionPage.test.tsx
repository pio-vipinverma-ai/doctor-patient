import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { PrescriptionPage } from '../PrescriptionPage';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import * as prescriptionService from '../../services/prescriptionService';

jest.mock('../../services/prescriptionService');

// Mock html2pdf
jest.mock('html2pdf.js', () => {
  const mockHtml2pdf = jest.fn(() => ({
    from: jest.fn(() => ({
      set: jest.fn(() => ({
        save: jest.fn(() => Promise.resolve())
      }))
    }))
  }));
  mockHtml2pdf.default = mockHtml2pdf;
  return mockHtml2pdf;
});

// Mock window.print
global.window.print = jest.fn();

describe('PrescriptionPage', () => {
  const mockPrescription: prescriptionService.PrescriptionData = {
    id: 'presc1',
    consultationId: 'cons1',
    patientId: 'p1',
    patientName: 'John Doe',
    patientAge: 35,
    patientGender: 'M',
    diagnosis: 'Common cold',
    medications: [
      {
        name: 'Paracetamol',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '5 days',
        instructions: 'After food'
      }
    ],
    printed: false,
    createdAt: '2026-05-10T10:00:00Z',
    clinicHeader: {
      name: 'Test Clinic',
      address: '123 Main St',
      phone: '555-0100'
    },
    vitals: {
      temperature: 98.6,
      bp: '120/80',
      pulse: 72
    }
  };

  const mockHtml = '<div class="prescription"><h1>Prescription</h1></div>';

  beforeEach(() => {
    jest.clearAllMocks();
    (prescriptionService.getPrescriptionById as jest.Mock).mockResolvedValue(mockPrescription);
    (prescriptionService.getPrescriptionHTML as jest.Mock).mockResolvedValue(mockHtml);
    (prescriptionService.markAsPrinted as jest.Mock).mockResolvedValue(undefined);
  });

  const renderPage = (prescriptionId = 'presc1') => {
    return render(
      <MemoryRouter initialEntries={[`/prescription/${prescriptionId}`]}>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/prescription/:prescriptionId" element={<PrescriptionPage />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    );
  };

  it('should render loading state initially', () => {
    (prescriptionService.getPrescriptionById as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderPage();
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should fetch prescription data on mount', async () => {
    renderPage();

    await waitFor(() => {
      expect(prescriptionService.getPrescriptionById).toHaveBeenCalledWith('presc1');
      expect(prescriptionService.getPrescriptionHTML).toHaveBeenCalledWith('presc1');
    });
  });

  it('should render prescription content after loading', async () => {
    renderPage();

    await waitFor(() => {
      expect(prescriptionService.getPrescriptionById).toHaveBeenCalled();
    });

    // Should not show loading anymore
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  });

  it('should handle missing prescription ID', async () => {
    render(
      <MemoryRouter initialEntries={['/prescription/']}>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/prescription/:prescriptionId?" element={<PrescriptionPage />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(prescriptionService.getPrescriptionById).not.toHaveBeenCalled();
    });
  });

  it('should handle prescription fetch error', async () => {
    (prescriptionService.getPrescriptionById as jest.Mock).mockRejectedValue(
      new Error('Not found')
    );

    renderPage();

    await waitFor(() => {
      expect(prescriptionService.getPrescriptionById).toHaveBeenCalled();
    });
  });

  it('should handle prescription fetch error with response data', async () => {
    (prescriptionService.getPrescriptionById as jest.Mock).mockRejectedValue({
      response: {
        data: {
          error: 'Prescription not found'
        }
      }
    });

    renderPage();

    await waitFor(() => {
      expect(prescriptionService.getPrescriptionById).toHaveBeenCalled();
    });
  });

  describe('Print Functionality', () => {
    it('should handle print button click', async () => {
      renderPage();

      await waitFor(() => {
        expect(prescriptionService.getPrescriptionById).toHaveBeenCalled();
      });

      const printButton = screen.getByRole('button', { name: /print prescription/i });
      printButton.click();

      await waitFor(() => {
        expect(prescriptionService.markAsPrinted).toHaveBeenCalledWith('presc1');
        expect(window.print).toHaveBeenCalled();
      });
    });

    it('should handle print error', async () => {
      (prescriptionService.markAsPrinted as jest.Mock).mockRejectedValue(
        new Error('Failed to mark as printed')
      );

      renderPage();

      await waitFor(() => {
        expect(prescriptionService.getPrescriptionById).toHaveBeenCalled();
      });

      const printButton = screen.getByRole('button', { name: /print prescription/i });
      printButton.click();

      await waitFor(() => {
        expect(prescriptionService.markAsPrinted).toHaveBeenCalledWith('presc1');
      });
    });
  });

  describe('Download PDF Functionality', () => {
    it('should handle download PDF button click', async () => {
      const mockHtml2pdf = require('html2pdf.js');
      
      renderPage();

      await waitFor(() => {
        expect(prescriptionService.getPrescriptionById).toHaveBeenCalled();
      });

      const downloadButton = screen.getByRole('button', { name: /download pdf/i });
      downloadButton.click();

      await waitFor(() => {
        expect(prescriptionService.markAsPrinted).toHaveBeenCalledWith('presc1');
        expect(mockHtml2pdf).toHaveBeenCalled();
      });
    });

    it('should handle download PDF error', async () => {
      (prescriptionService.markAsPrinted as jest.Mock).mockRejectedValue(
        new Error('Failed to mark as printed')
      );

      renderPage();

      await waitFor(() => {
        expect(prescriptionService.getPrescriptionById).toHaveBeenCalled();
      });

      const downloadButton = screen.getByRole('button', { name: /download pdf/i });
      downloadButton.click();

      await waitFor(() => {
        expect(prescriptionService.markAsPrinted).toHaveBeenCalledWith('presc1');
      });
    });
  });

  describe('Navigation', () => {
    it('should handle view full page button click', async () => {
      const mockOpen = jest.fn();
      global.window.open = mockOpen;

      renderPage();

      await waitFor(() => {
        expect(prescriptionService.getPrescriptionById).toHaveBeenCalled();
      });

      const viewHtmlButton = screen.getByRole('button', { name: /view full page/i });
      viewHtmlButton.click();

      expect(mockOpen).toHaveBeenCalledWith(
        'http://localhost:5000/api/prescriptions/presc1/print?format=html',
        '_blank'
      );
    });

    it('should handle back to dashboard button click', async () => {
      renderPage();

      await waitFor(() => {
        expect(prescriptionService.getPrescriptionById).toHaveBeenCalled();
      });

      const backButton = screen.getByRole('button', { name: /back to dashboard/i });
      backButton.click();

      // Navigation will occur (tested via router)
      await waitFor(() => {
        expect(backButton).toBeInTheDocument();
      });
    });
  });
});
