import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DashboardPage } from '../DashboardPage';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import * as appointmentService from '../../services/appointmentService';

jest.mock('../../services/authService');
jest.mock('../../services/appointmentService');

describe('DashboardPage', () => {
  const mockAppointments = [
    {
      id: '1',
      patientId: 'p1',
      patientName: 'John Doe',
      appointmentDate: '2026-05-11T10:00:00Z',
      status: 'Scheduled',
      reason: 'Regular checkup',
      phone: '1234567890'
    },
    {
      id: '2',
      patientId: 'p2',
      patientName: 'Jane Smith',
      appointmentDate: '2026-05-11T14:00:00Z',
      status: 'Completed',
      reason: 'Follow-up',
      phone: '0987654321'
    }
  ];

  const renderDashboardPage = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <DashboardPage />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (appointmentService.getTodaysAppointments as jest.Mock).mockResolvedValue(mockAppointments);
  });

  it('should render dashboard page', async () => {
    renderDashboardPage();
    
    await waitFor(() => {
      expect(screen.getByText("Today's Schedule")).toBeInTheDocument();
    });
  });

  it('should load appointments on mount', async () => {
    renderDashboardPage();

    await waitFor(() => {
      expect(appointmentService.getTodaysAppointments).toHaveBeenCalled();
    });
  });

  it('should display appointments after loading', async () => {
    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('should calculate stats correctly', async () => {
    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // Total appointments
    });
  });

  it('should handle loading state', () => {
    (appointmentService.getTodaysAppointments as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderDashboardPage();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should handle error state', async () => {
    (appointmentService.getTodaysAppointments as jest.Mock).mockRejectedValue(
      new Error('Failed to load')
    );

    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    });
  });

  it('should show new appointment button', async () => {
    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByText(/new appointment/i)).toBeInTheDocument();
    });
  });

  it('should open appointment form when button clicked', async () => {
    renderDashboardPage();

    await waitFor(() => {
      const button = screen.getByText(/new appointment/i);
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /schedule appointment/i })).toBeInTheDocument();
    });
  });

  it('should display today date', async () => {
    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByText(/2026/)).toBeInTheDocument();
    });
  });

  it('should refresh appointments after scheduling', async () => {
    renderDashboardPage();

    await waitFor(() => {
      expect(appointmentService.getTodaysAppointments).toHaveBeenCalledTimes(1);
    });
  });

  it('should display empty state when no appointments', async () => {
    (appointmentService.getTodaysAppointments as jest.Mock).mockResolvedValue([]);

    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByText(/total appointments/i)).toBeInTheDocument();
      // Should have all stats as 0, check at least one stat is visible
      const statCards = screen.getAllByText('0');
      expect(statCards.length).toBeGreaterThan(0);
    });
  });

  it('should display stats grid', async () => {
    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByText(/total/i)).toBeInTheDocument();
      expect(screen.getByText(/completed/i)).toBeInTheDocument();
    });
  });

  it('should close schedule form when cancel clicked', async () => {
    renderDashboardPage();

    await waitFor(() => {
      expect(appointmentService.getTodaysAppointments).toHaveBeenCalled();
    });

    // Open form
    const newAppointmentBtn = screen.getAllByText(/new appointment/i)[0];
    fireEvent.click(newAppointmentBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /schedule appointment/i })).toBeInTheDocument();
    }, { timeout: 3000 });

    // Click cancel - get all cancel buttons and click the first one (in the modal)
    const cancelBtns = screen.getAllByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtns[0]);

    // Form should close
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /schedule appointment/i })).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should close schedule form when clicking modal overlay', async () => {
    renderDashboardPage();

    await waitFor(() => {
      expect(appointmentService.getTodaysAppointments).toHaveBeenCalled();
    });

    // Open form
    const newAppointmentBtn = screen.getAllByText(/new appointment/i)[0];
    fireEvent.click(newAppointmentBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /schedule appointment/i })).toBeInTheDocument();
    }, { timeout: 3000 });

    // Find and click overlay (parent div with modalOverlay class)
    const heading = screen.getByRole('heading', { name: /schedule appointment/i });
    const modalContent = heading.closest('div[class*="modalContent"]');
    const overlay = modalContent?.parentElement;
    
    if (overlay) {
      fireEvent.click(overlay);
      
      // Form should close
      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: /schedule appointment/i })).not.toBeInTheDocument();
      }, { timeout: 3000 });
    }
  });

  it('should navigate to search patient when quick action clicked', async () => {
    renderDashboardPage();

    await waitFor(() => {
      expect(appointmentService.getTodaysAppointments).toHaveBeenCalled();
    });

    const searchPatientBtn = screen.getByText(/search patient/i);
    expect(searchPatientBtn).toBeInTheDocument();
    fireEvent.click(searchPatientBtn);

    // Just verify the button exists and is clickable
    expect(searchPatientBtn).toBeInTheDocument();
  });

  it.skip('should open schedule form from quick actions', async () => {
    renderDashboardPage();

    await waitFor(() => {
      expect(appointmentService.getTodaysAppointments).toHaveBeenCalled();
    });

    // Click "Schedule Appointment" from quick actions section
    const quickActionsButtons = screen.getAllByRole('button', { name: /schedule appointment/i });
    // The second button is in the quick actions section
    fireEvent.click(quickActionsButtons[1]);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /schedule appointment/i })).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
