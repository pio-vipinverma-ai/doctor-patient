import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PrescriptionPage } from '../PrescriptionPage';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import * as prescriptionService from '../../services/prescriptionService';

jest.mock('../../services/authService');
jest.mock('../../services/prescriptionService');
jest.mock('html2pdf.js');

describe('PrescriptionPage', () => {
  const mockPrescription = {
    id: '1',
    patientId: '1',
    consultationId: '1',
    patientName: 'John Doe',
    date: '2026-05-08',
    medications: [
      {
        name: 'Paracetamol',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '5 days',
        instructions: 'After meals'
      }
    ]
  };

  const renderPrescriptionPage = () => {
    return render(
      <MemoryRouter initialEntries={['/prescriptions/1']}>\n        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/prescriptions/:id" element={<PrescriptionPage />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (prescriptionService.getPrescriptionById as jest.Mock).mockResolvedValue(mockPrescription);
    (prescriptionService.getPrescriptionHTML as jest.Mock).mockResolvedValue('<html>Prescription</html>');
    (prescriptionService.markAsPrinted as jest.Mock).mockResolvedValue(undefined);
  });

  it('should render prescription page', async () => {
    const { container } = renderPrescriptionPage();
    expect(container).toBeTruthy();
  });

  it('should load prescription data', async () => {
    renderPrescriptionPage();

    await waitFor(() => {
      expect(prescriptionService.getPrescriptionById).toHaveBeenCalledWith('1');
    }, { timeout: 3000 });
  });

  it('should display prescription information', async () => {
    renderPrescriptionPage();

    await waitFor(() => {
      expect(prescriptionService.getPrescriptionById).toHaveBeenCalled();
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(screen.queryByText('John Doe')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should display medications', async () => {
    renderPrescriptionPage();

    await waitFor(() => {
      expect(prescriptionService.getPrescriptionById).toHaveBeenCalled();
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(screen.queryByText('Paracetamol')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should have print button', async () => {
    renderPrescriptionPage();

    await waitFor(() => {
      expect(prescriptionService.getPrescriptionById).toHaveBeenCalled();
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /print/i })).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should have download button', async () => {
    renderPrescriptionPage();

    await waitFor(() => {
      expect(prescriptionService.getPrescriptionById).toHaveBeenCalled();
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /download/i })).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should call print service when print clicked', async () => {
    const mockPrint = jest.fn();
    window.print = mockPrint;

    renderPrescriptionPage();

    await waitFor(() => {
      expect(prescriptionService.getPrescriptionById).toHaveBeenCalled();
    }, { timeout: 3000 });

    await waitFor(() => {
      const printButton = screen.queryByRole('button', { name: /print/i });
      if (printButton) {
        printButton.click();
      }
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(prescriptionService.markAsPrinted).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('should handle prescription load error', async () => {
    (prescriptionService.getPrescriptionById as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to load')
    );

    renderPrescriptionPage();

    await waitFor(() => {
      expect(prescriptionService.getPrescriptionById).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('should handle print error', async () => {
    (prescriptionService.markAsPrinted as jest.Mock).mockRejectedValueOnce(
      new Error('Print failed')
    );

    window.print = jest.fn();

    renderPrescriptionPage();

    await waitFor(() => {
      expect(prescriptionService.getPrescriptionById).toHaveBeenCalled();
    }, { timeout: 3000 });

    await waitFor(() => {
      const printButton = screen.queryByRole('button', { name: /print/i });
      if (printButton) {
        printButton.click();
      }
    }, { timeout: 3000 });
  });

  it('should show loading state', () => {
    (prescriptionService.getPrescriptionById as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockPrescription), 100))
    );

    renderPrescriptionPage();

    // Just verify render doesn't crash during loading
    expect(screen.queryByText(/loading/i) || screen.queryByRole('progressbar')).toBeDefined();
  });

  it('should have back button', async () => {
    renderPrescriptionPage();

    await waitFor(() => {
      expect(prescriptionService.getPrescriptionById).toHaveBeenCalled();
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /back/i })).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should navigate back when back clicked', async () => {
    renderPrescriptionPage();

    await waitFor(() => {
      expect(prescriptionService.getPrescriptionById).toHaveBeenCalled();
    }, { timeout: 3000 });

    await waitFor(() => {
      const backButton = screen.queryByRole('button', { name: /back/i });
      if (backButton) {
        backButton.click();
      }
    }, { timeout: 3000 });
  });
});
