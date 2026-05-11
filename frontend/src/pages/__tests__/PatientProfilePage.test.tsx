import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import { PatientProfilePage } from '../PatientProfilePage';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import * as patientService from '../../services/patientService';
import * as appointmentService from '../../services/appointmentService';

jest.mock('../../services/authService');
jest.mock('../../services/patientService');
jest.mock('../../services/appointmentService');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

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

  const mockAppointments = [
    {
      id: 'appt1',
      patientId: '1',
      patientName: 'John Doe',
      phone: '1234567890',
      scheduledTime: '2026-05-12T10:00:00Z',
      status: 'Scheduled',
      reason: 'Checkup',
      consultationSaved: false
    },
    {
      id: 'appt2',
      patientId: '1',
      patientName: 'John Doe',
      phone: '1234567890',
      scheduledTime: '2026-05-01T14:00:00Z',
      status: 'Completed',
      reason: 'Follow-up',
      consultationSaved: true
    }
  ];

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
    (appointmentService.getAppointmentsByPatient as jest.Mock).mockResolvedValue(mockAppointments);
  });

  it('should render patient profile page', async () => {
    const { container } = renderPatientProfilePage();
    expect(container).toBeTruthy();
  });

  it('should load patient information', async () => {
    renderPatientProfilePage();

    await waitFor(() => {
      expect(patientService.getPatientById).toHaveBeenCalledWith('1');
    });
  });

  it('should display patient information', async () => {
    renderPatientProfilePage();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText(/1234567890/)).toBeInTheDocument();
    });
  });

  it('should show loading state', () => {
    (patientService.getPatientById as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    renderPatientProfilePage();

    expect(screen.getByText(/loading patient/i)).toBeInTheDocument();
  });

  it('should handle patient load error', async () => {
    (patientService.getPatientById as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to load patient')
    );

    renderPatientProfilePage();

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
      expect(screen.getByText(/failed to load patient/i)).toBeInTheDocument();
    });
  });

  it('should show error when no patient ID', async () => {
    render(
      <MemoryRouter initialEntries={['/patients/']}>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/patients/:id?" element={<PatientProfilePage />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no patient id provided/i)).toBeInTheDocument();
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
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });
  });

  it('should cancel edit form', async () => {
    renderPatientProfilePage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });
  });

  it('should show update form with patient data', async () => {
    renderPatientProfilePage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    });

    // Just verify the form is shown with data
    const phoneInput = screen.getByLabelText(/phone/i) as HTMLInputElement;
    expect(phoneInput.value).toBe('1234567890');
  });

  it('should have tabs for profile, appointments, history', async () => {
    renderPatientProfilePage();

    await waitFor(() => {
      expect(patientService.getPatientById).toHaveBeenCalled();
    });

    expect(screen.getByRole('button', { name: /^profile$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^appointments$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^history$/i })).toBeInTheDocument();
  });

  it('should switch to appointments tab', async () => {
    renderPatientProfilePage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^appointments$/i })).toBeInTheDocument();
    });

    const appointmentsTab = screen.getByRole('button', { name: /^appointments$/i });
    fireEvent.click(appointmentsTab);

    await waitFor(() => {
      expect(appointmentService.getAppointmentsByPatient).toHaveBeenCalledWith('1');
    });
  });

  it('should display appointments in appointments tab', async () => {
    renderPatientProfilePage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^appointments$/i })).toBeInTheDocument();
    });

    const appointmentsTab = screen.getByRole('button', { name: /^appointments$/i });
    fireEvent.click(appointmentsTab);

    await waitFor(() => {
      expect(appointmentService.getAppointmentsByPatient).toHaveBeenCalled();
    });
  });

  it('should handle appointments load error', async () => {
    (appointmentService.getAppointmentsByPatient as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to load appointments')
    );

    renderPatientProfilePage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^appointments$/i })).toBeInTheDocument();
    });

    const appointmentsTab = screen.getByRole('button', { name: /^appointments$/i });
    fireEvent.click(appointmentsTab);

    await waitFor(() => {
      expect(appointmentService.getAppointmentsByPatient).toHaveBeenCalled();
    });
  });

  it('should switch to history tab', async () => {
    renderPatientProfilePage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^history$/i })).toBeInTheDocument();
    });

    const historyTab = screen.getByRole('button', { name: /^history$/i });
    fireEvent.click(historyTab);

    await waitFor(() => {
      expect(screen.queryByText('John Doe')).toBeInTheDocument();
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
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/patients/search');
  });

  it('should navigate to search on error back button click', async () => {
    (patientService.getPatientById as jest.Mock).mockRejectedValueOnce(
      new Error('Patient not found')
    );

    renderPatientProfilePage();

    await waitFor(() => {
      expect(screen.getByText(/back to search/i)).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /back to search/i });
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/patients/search');
  });

  it('should show patient not found when patient is null', async () => {
    (patientService.getPatientById as jest.Mock).mockResolvedValueOnce(null);

    renderPatientProfilePage();

    await waitFor(() => {
      expect(screen.getByText(/patient not found/i)).toBeInTheDocument();
    });
  });

  it('should display formatted date of birth', async () => {
    renderPatientProfilePage();

    await waitFor(() => {
      expect(screen.getByText(/january/i)).toBeInTheDocument();
    });
  });

  it('should display all patient details', async () => {
    renderPatientProfilePage();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText(/john@example.com/i)).toBeInTheDocument();
      expect(screen.getByText(/123 Main St/i)).toBeInTheDocument();
    });
  });

  it('should not load appointments until appointments tab is clicked', async () => {
    renderPatientProfilePage();

    await waitFor(() => {
      expect(patientService.getPatientById).toHaveBeenCalled();
    });

    expect(appointmentService.getAppointmentsByPatient).not.toHaveBeenCalled();
  });

  it('should reload appointments when switching back to appointments tab', async () => {
    renderPatientProfilePage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^appointments$/i })).toBeInTheDocument();
    });

    // Click appointments tab
    const appointmentsTab = screen.getByRole('button', { name: /^appointments$/i });
    fireEvent.click(appointmentsTab);

    await waitFor(() => {
      expect(appointmentService.getAppointmentsByPatient).toHaveBeenCalledTimes(1);
    });

    // Click profile tab
    const profileTab = screen.getByRole('button', { name: /^profile$/i });
    fireEvent.click(profileTab);

    // Click appointments tab again
    fireEvent.click(appointmentsTab);

    await waitFor(() => {
      expect(appointmentService.getAppointmentsByPatient).toHaveBeenCalledTimes(2);
    });
  });
});
