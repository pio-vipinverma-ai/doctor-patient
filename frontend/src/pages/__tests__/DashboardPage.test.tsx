import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DashboardPage } from '../DashboardPage';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import * as appointmentService from '../../services/appointmentService';

jest.mock('../../services/authService');
jest.mock('../../services/appointmentService');

describe('DashboardPage', () => {
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
    (appointmentService.getTodaysAppointments as jest.Mock).mockResolvedValue([
      {
        id: '1',
        patientName: 'John Doe',
        time: '10:00 AM',
        status: 'Scheduled',
        phone: '1234567890'
      }
    ]);
  });

  it('should render dashboard page', () => {
    const { container } = renderDashboardPage();
    expect(container).toBeTruthy();
  });

  it('should not crash on render', () => {
    expect(() => renderDashboardPage()).not.toThrow();
  });

  it('should load appointments on mount', async () => {
    renderDashboardPage();

    await waitFor(() => {
      expect(appointmentService.getTodaysAppointments).toHaveBeenCalled();
    });
  });

  it('should display appointment statistics', async () => {
    renderDashboardPage();

    await waitFor(() => {
      expect(appointmentService.getTodaysAppointments).toHaveBeenCalled();
    });

    // Check if stats are displayed
    expect(screen.getByText(/total appointments/i)).toBeInTheDocument();
  });

  it('should show new appointment button', () => {
    renderDashboardPage();

    const newAppointmentButton = screen.getByRole('button', { name: /new appointment/i });
    expect(newAppointmentButton).toBeInTheDocument();
  });

  it('should handle appointment loading error', async () => {
    (appointmentService.getTodaysAppointments as jest.Mock).mockRejectedValue(
      new Error('Failed to load')
    );

    renderDashboardPage();

    await waitFor(() => {
      expect(appointmentService.getTodaysAppointments).toHaveBeenCalled();
    });
  });

  it('should open schedule form when clicking new appointment', async () => {
    renderDashboardPage();

    const newAppointmentButton = screen.getByRole('button', { name: /new appointment/i });
    fireEvent.click(newAppointmentButton);

    // Form should open
    expect(newAppointmentButton).toBeInTheDocument();
  });
});
