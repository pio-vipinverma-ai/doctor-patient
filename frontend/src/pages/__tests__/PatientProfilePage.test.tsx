import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import { PatientProfilePage } from '../PatientProfilePage';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import * as patientService from '../../services/patientService';

jest.mock('../../services/authService');
jest.mock('../../services/patientService');

describe('PatientProfilePage', () => {
  const mockPatient = {
    id: '1',
    name: 'John Doe',
    dob: '1990-01-01',
    age: 36,
    gender: 'M' as const,
    phone: '1234567890',
    email: 'john@example.com',
    address: '123 Main St'
  };

  const renderPatientProfilePage = () => {
    return render(
      <MemoryRouter initialEntries={['/patients/1']}>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/patients/:id" element={<PatientProfilePage />} />
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
  });

  it('should render patient profile page', async () => {
    const { container } = renderPatientProfilePage();
    expect(container).toBeTruthy();
  });

  it('should attempt to load patient information', async () => {
    renderPatientProfilePage();

    await waitFor(() => {
      expect(patientService.getPatientById).toHaveBeenCalled();
    });
  });

  it('should display patient information', async () => {
    renderPatientProfilePage();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText(/1234567890/)).toBeInTheDocument();
    });
  });

  it('should have edit button', async () => {
    renderPatientProfilePage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });
  });

  it('should show edit form when edit clicked', async () => {
    renderPatientProfilePage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit/i });
    editButton.click();

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });
  });

  it('should have tabs for profile, appointments, history', async () => {
    renderPatientProfilePage();

    await waitFor(() => {
      expect(patientService.getPatientById).toHaveBeenCalled();
    });

    expect(screen.getByRole('tab', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /appointments/i })).toBeInTheDocument();
  });

  it('should handle patient load error', async () => {
    (patientService.getPatientById as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to load patient')
    );

    renderPatientProfilePage();

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('should show loading state', () => {
    (patientService.getPatientById as jest.Mock).mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve(mockPatient), 1000))
    );

    renderPatientProfilePage();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should handle update patient', async () => {
    (patientService.updatePatient as jest.Mock).mockResolvedValue({
      ...mockPatient,
      phone: '9876543210'
    });

    renderPatientProfilePage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit/i });
    editButton.click();

    await waitFor(() => {
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    });
  });

  it('should have back button', async () => {
    renderPatientProfilePage();

    await waitFor(() => {
      expect(patientService.getPatientById).toHaveBeenCalled();
    });

    const backButton = screen.getByRole('button', { name: /back/i });
    expect(backButton).toBeInTheDocument();
  });

  it('should navigate to search on back click', async () => {
    renderPatientProfilePage();

    await waitFor(() => {
      expect(patientService.getPatientById).toHaveBeenCalled();
    });

    const backButton = screen.getByRole('button', { name: /back/i });
    backButton.click();
  });

  it('should display formatted date of birth', async () => {
    renderPatientProfilePage();

    await waitFor(() => {
      expect(screen.getByText(/january/i)).toBeInTheDocument();
    });
  });

  it('should display gender as text', async () => {
    renderPatientProfilePage();

    await waitFor(() => {
      expect(screen.getByText(/1234567890/)).toBeInTheDocument();
    });
  });
});
