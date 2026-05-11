import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import { PatientHistoryPage } from '../PatientHistoryPage';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import * as consultationService from '../../services/consultationService';
import * as patientService from '../../services/patientService';

jest.mock('../../services/authService');
jest.mock('../../services/consultationService');
jest.mock('../../services/patientService');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('PatientHistoryPage', () => {
  const mockPatient = {
    id: '1',
    name: 'John Doe',
    dob: '1990-01-01',
    age: 36,
    gender: 'M' as const,
    phone: '1234567890'
  };

  const mockConsultations = {
    consultations: [
      {
        id: 'cons1',
        patientId: '1',
        date: '2026-05-01T10:00:00Z',
        diagnosis: 'Viral infection',
        temperature: 98.6,
        bp: '120/80',
        pulse: 72,
        medicationCount: 2,
        prescriptionId: 'presc1'
      }
    ],
    total: 1,
    pages: 1,
    currentPage: 1
  };

  const mockMultipleConsultations = {
    consultations: [
      {
        id: 'cons1',
        patientId: '1',
        date: '2026-05-01T10:00:00Z',
        diagnosis: 'Viral infection',
        temperature: 98.6,
        bp: '120/80',
        pulse: 72,
        medicationCount: 2,
        prescriptionId: 'presc1'
      },
      {
        id: 'cons2',
        patientId: '1',
        date: '2026-04-25T14:00:00Z',
        diagnosis: 'Allergy',
        temperature: 98.4,
        bp: '118/78',
        pulse: 70,
        medicationCount: 1,
        prescriptionId: 'presc2'
      }
    ],
    total: 25,
    pages: 3,
    currentPage: 1
  };

  const renderPatientHistoryPage = () => {
    return render(
      <MemoryRouter initialEntries={['/patients/1/history']}>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/patients/:id/history" element={<PatientHistoryPage />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (patientService.getPatientById as jest.Mock).mockResolvedValue(mockPatient);
    (consultationService.getPatientConsultations as jest.Mock).mockResolvedValue(mockConsultations);
  });

  it('should render patient history page', async () => {
    const { container } = renderPatientHistoryPage();
    expect(container).toBeTruthy();
  });

  it('should load patient information', async () => {
    renderPatientHistoryPage();

    await waitFor(() => {
      expect(patientService.getPatientById).toHaveBeenCalledWith('1');
    });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('should load consultations on mount', async () => {
    renderPatientHistoryPage();

    await waitFor(() => {
      expect(consultationService.getPatientConsultations).toHaveBeenCalled();
    });
  });

  it('should display patient info when loaded', async () => {
    renderPatientHistoryPage();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText(/36/)).toBeInTheDocument();
      expect(screen.getByText(/1234567890/)).toBeInTheDocument();
    });
  });

  it('should show loading state initially', () => {
    (consultationService.getPatientConsultations as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    renderPatientHistoryPage();

    expect(screen.getByText(/loading consultation history/i)).toBeInTheDocument();
  });

  it('should handle patient load error', async () => {
    (patientService.getPatientById as jest.Mock).mockRejectedValueOnce(
      new Error('Patient not found')
    );

    renderPatientHistoryPage();

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('should handle consultations load error', async () => {
    (consultationService.getPatientConsultations as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to load consultations')
    );

    renderPatientHistoryPage();

    await waitFor(() => {
      expect(consultationService.getPatientConsultations).toHaveBeenCalled();
    });
  });

  it('should show empty state when no consultations', async () => {
    (consultationService.getPatientConsultations as jest.Mock).mockResolvedValueOnce({
      consultations: [],
      total: 0,
      pages: 0,
      currentPage: 1
    });

    renderPatientHistoryPage();

    await waitFor(() => {
      expect(screen.getByText(/no consultations found/i)).toBeInTheDocument();
    });
  });

  it('should have back button that navigates', async () => {
    renderPatientHistoryPage();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('should have date range filter', async () => {
    renderPatientHistoryPage();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/from/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/to/i)).toBeInTheDocument();
  });

  it('should apply date filter', async () => {
    renderPatientHistoryPage();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const fromInput = screen.getByLabelText(/from/i);
    const toInput = screen.getByLabelText(/to/i);
    const applyButton = screen.getByRole('button', { name: /apply/i });

    fireEvent.change(fromInput, { target: { value: '2026-01-01' } });
    fireEvent.change(toInput, { target: { value: '2026-12-31' } });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(consultationService.getPatientConsultations).toHaveBeenCalledWith(
        '1',
        10,
        0,
        '2026-01-01',
        '2026-12-31'
      );
    });
  });

  it('should reset date filter', async () => {
    renderPatientHistoryPage();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const resetButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(consultationService.getPatientConsultations).toHaveBeenCalled();
    });
  });

  it('should show pagination when multiple pages', async () => {
    (consultationService.getPatientConsultations as jest.Mock).mockResolvedValueOnce(
      mockMultipleConsultations
    );

    renderPatientHistoryPage();

    await waitFor(() => {
      expect(screen.getByText(/page 1 of 3/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('should navigate to next page', async () => {
    (consultationService.getPatientConsultations as jest.Mock).mockResolvedValueOnce(
      mockMultipleConsultations
    );

    renderPatientHistoryPage();

    await waitFor(() => {
      expect(screen.getByText(/page 1 of 3/i)).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(consultationService.getPatientConsultations).toHaveBeenCalledWith(
        '1',
        10,
        10, // offset for page 2
        expect.any(String),
        expect.any(String)
      );
    });
  });

  it('should disable previous button on first page', async () => {
    (consultationService.getPatientConsultations as jest.Mock).mockResolvedValueOnce(
      mockMultipleConsultations
    );

    renderPatientHistoryPage();

    await waitFor(() => {
      expect(screen.getByText(/page 1 of 3/i)).toBeInTheDocument();
    });

    const prevButton = screen.getByRole('button', { name: /previous/i });
    expect(prevButton).toBeDisabled();
  });

  it('should handle print prescription navigation', async () => {
    renderPatientHistoryPage();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const printButton = screen.getByRole('button', { name: /print/i });
    fireEvent.click(printButton);

    expect(mockNavigate).toHaveBeenCalledWith('/prescription/presc1');
  });

  it('should handle missing patient ID', async () => {
    render(
      <MemoryRouter initialEntries={['/patients//history']}>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/patients/:id?/history" element={<PatientHistoryPage />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(patientService.getPatientById).not.toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('should reset to page 1 when applying filter', async () => {
    (consultationService.getPatientConsultations as jest.Mock).mockResolvedValue(
      mockMultipleConsultations
    );

    renderPatientHistoryPage();

    await waitFor(() => {
      expect(screen.getByText(/page 1 of 3/i)).toBeInTheDocument();
    });

    // Go to page 2
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(consultationService.getPatientConsultations).toHaveBeenCalled();
    });

    // Apply filter - should reset to page 1
    const applyButton = screen.getByRole('button', { name: /apply/i });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(consultationService.getPatientConsultations).toHaveBeenCalledWith(
        '1',
        10,
        0, // offset 0 = page 1
        expect.any(String),
        expect.any(String)
      );
    });
  });

  it('should show total consultations count', async () => {
    (consultationService.getPatientConsultations as jest.Mock).mockResolvedValueOnce(
      mockMultipleConsultations
    );

    renderPatientHistoryPage();

    await waitFor(() => {
      expect(screen.getByText(/25 total consultations/i)).toBeInTheDocument();
    });
  });

  it('should not show pagination for single page', async () => {
    renderPatientHistoryPage();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
  });
});
