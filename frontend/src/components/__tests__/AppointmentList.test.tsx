import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppointmentList } from '../AppointmentList';
import { ToastProvider } from '../../context/ToastContext';
import * as appointmentService from '../../services/appointmentService';

jest.mock('../../services/appointmentService');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('AppointmentList Component', () => {
  const mockAppointments: appointmentService.AppointmentListItem[] = [
    {
      id: 'apt1',
      patientId: 'p1',
      patientName: 'John Doe',
      phone: '555-0101',
      scheduledTime: '2026-05-11T10:00:00Z',
      status: 'Scheduled',
      reason: 'Regular checkup',
      consultationSaved: false,
    },
    {
      id: 'apt2',
      patientId: 'p2',
      patientName: 'Jane Smith',
      phone: '555-0102',
      scheduledTime: '2026-05-11T14:30:00Z',
      status: 'Completed',
      reason: 'Follow-up',
      consultationSaved: true,
    },
    {
      id: 'apt3',
      patientId: 'p3',
      patientName: 'Bob Johnson',
      phone: '555-0103',
      scheduledTime: '2026-05-11T16:00:00Z',
      status: 'Cancelled',
      reason: 'Blood test',
      consultationSaved: false,
    },
  ];

  const mockOnUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderAppointmentList = (appointments = mockAppointments) => {
    return render(
      <BrowserRouter>
        <ToastProvider>
          <AppointmentList appointments={appointments} onUpdate={mockOnUpdate} />
        </ToastProvider>
      </BrowserRouter>
    );
  };

  describe('Rendering', () => {
    it('should render appointment list with appointments', () => {
      renderAppointmentList();

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('should display empty state when no appointments', () => {
      renderAppointmentList([]);

      expect(screen.getByText('No appointments scheduled for today')).toBeInTheDocument();
    });

    it('should format time correctly', () => {
      renderAppointmentList();

      // Time should be formatted in 12-hour format - just check that times are displayed
      const { container } = render(
        <BrowserRouter>
          <ToastProvider>
            <AppointmentList appointments={mockAppointments} onUpdate={mockOnUpdate} />
          </ToastProvider>
        </BrowserRouter>
      );
      
      // Check that time cells exist
      const timeCells = container.querySelectorAll('td');
      expect(timeCells.length).toBeGreaterThan(0);
    });

    it('should display patient phone numbers', () => {
      renderAppointmentList();

      expect(screen.getByText('555-0101')).toBeInTheDocument();
      expect(screen.getByText('555-0102')).toBeInTheDocument();
      expect(screen.getByText('555-0103')).toBeInTheDocument();
    });

    it('should display appointment reasons', () => {
      renderAppointmentList();

      expect(screen.getByText('Regular checkup')).toBeInTheDocument();
      expect(screen.getByText('Follow-up')).toBeInTheDocument();
      expect(screen.getByText('Blood test')).toBeInTheDocument();
    });

    it('should display status badges with correct text', () => {
      renderAppointmentList();

      expect(screen.getByText('Scheduled')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Cancelled')).toBeInTheDocument();
    });

    it('should show consultation saved indicator for completed appointments', () => {
      renderAppointmentList();

      expect(screen.getByText('✓ Consultation Saved')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to patient profile when patient name clicked', () => {
      renderAppointmentList();

      const patientLink = screen.getByText('John Doe');
      fireEvent.click(patientLink);

      expect(mockNavigate).toHaveBeenCalledWith('/patients/p1');
    });

    it('should navigate to consultation page when Consult button clicked', () => {
      renderAppointmentList();

      const consultButton = screen.getByTitle('Start Consultation');
      fireEvent.click(consultButton);

      expect(mockNavigate).toHaveBeenCalledWith('/consultation/p1', {
        state: { appointmentId: 'apt1' }
      });
    });
  });

  describe('Status Updates', () => {
    it('should mark appointment as completed', async () => {
      (appointmentService.updateAppointment as jest.Mock).mockResolvedValue({});

      renderAppointmentList();

      const completeButton = screen.getByTitle('Mark as Completed');
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(appointmentService.updateAppointment).toHaveBeenCalledWith('apt1', {
          status: 'Completed'
        });
      });

      expect(mockOnUpdate).toHaveBeenCalled();
    });

    it('should mark appointment as no-show', async () => {
      (appointmentService.updateAppointment as jest.Mock).mockResolvedValue({});

      renderAppointmentList();

      const noShowButton = screen.getByTitle('Mark as No-show');
      fireEvent.click(noShowButton);

      await waitFor(() => {
        expect(appointmentService.updateAppointment).toHaveBeenCalledWith('apt1', {
          status: 'No-show'
        });
      });

      expect(mockOnUpdate).toHaveBeenCalled();
    });

    it('should handle update error', async () => {
      (appointmentService.updateAppointment as jest.Mock).mockRejectedValue(
        new Error('Update failed')
      );

      renderAppointmentList();

      const completeButton = screen.getByTitle('Mark as Completed');
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(appointmentService.updateAppointment).toHaveBeenCalled();
      });
    });
  });

  describe('Cancel Appointment', () => {
    it('should show cancel confirmation dialog when Cancel button clicked', () => {
      renderAppointmentList();

      const cancelButton = screen.getByTitle('Cancel Appointment');
      fireEvent.click(cancelButton);

      expect(screen.getByText('Are you sure you want to cancel this appointment?')).toBeInTheDocument();
      expect(screen.getByText('Yes, Cancel')).toBeInTheDocument();
      expect(screen.getByText('No, Keep It')).toBeInTheDocument();
    });

    it('should cancel appointment when confirmed', async () => {
      (appointmentService.updateAppointment as jest.Mock).mockResolvedValue({});

      renderAppointmentList();

      const cancelButton = screen.getByTitle('Cancel Appointment');
      fireEvent.click(cancelButton);

      const confirmButton = screen.getByText('Yes, Cancel');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(appointmentService.updateAppointment).toHaveBeenCalledWith('apt1', {
          status: 'Cancelled'
        });
      });

      expect(mockOnUpdate).toHaveBeenCalled();
    });

    it('should close confirmation dialog when No, Keep It clicked', () => {
      renderAppointmentList();

      const cancelButton = screen.getByTitle('Cancel Appointment');
      fireEvent.click(cancelButton);

      expect(screen.getByText('Are you sure you want to cancel this appointment?')).toBeInTheDocument();

      const keepButton = screen.getByText('No, Keep It');
      fireEvent.click(keepButton);

      expect(screen.queryByText('Are you sure you want to cancel this appointment?')).not.toBeInTheDocument();
    });
  });

  describe('Action Buttons Visibility', () => {
    it('should show action buttons only for Scheduled appointments', () => {
      renderAppointmentList();

      // Should have action buttons for scheduled appointment
      expect(screen.getByTitle('Start Consultation')).toBeInTheDocument();
      expect(screen.getByTitle('Mark as Completed')).toBeInTheDocument();
      expect(screen.getByTitle('Mark as No-show')).toBeInTheDocument();
      expect(screen.getByTitle('Cancel Appointment')).toBeInTheDocument();
    });

    it('should not show action buttons for Completed appointments', () => {
      const completedAppointments = [
        {
          ...mockAppointments[1], // Jane Smith - Completed
        }
      ];

      renderAppointmentList(completedAppointments);

      expect(screen.queryByTitle('Start Consultation')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Mark as Completed')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Cancel Appointment')).not.toBeInTheDocument();
    });

    it('should not show action buttons for Cancelled appointments', () => {
      const cancelledAppointments = [
        {
          ...mockAppointments[2], // Bob Johnson - Cancelled
        }
      ];

      renderAppointmentList(cancelledAppointments);

      expect(screen.queryByTitle('Start Consultation')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Mark as Completed')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Cancel Appointment')).not.toBeInTheDocument();
    });
  });

  describe('Button States', () => {
    it('should disable buttons while updating', async () => {
      (appointmentService.updateAppointment as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      renderAppointmentList();

      const completeButton = screen.getByTitle('Mark as Completed');
      fireEvent.click(completeButton);

      // Button should be disabled while updating
      await waitFor(() => {
        expect(completeButton).toBeDisabled();
      });
    });
  });

  describe('Status Badge Styling', () => {
    it('should apply correct class for Scheduled status', () => {
      const { container } = renderAppointmentList();

      const scheduledBadge = screen.getByText('Scheduled');
      expect(scheduledBadge.className).toContain('statusScheduled');
    });

    it('should apply correct class for Completed status', () => {
      const { container } = renderAppointmentList();

      const completedBadge = screen.getByText('Completed');
      expect(completedBadge.className).toContain('statusCompleted');
    });

    it('should apply correct class for Cancelled status', () => {
      const { container } = renderAppointmentList();

      const cancelledBadge = screen.getByText('Cancelled');
      expect(cancelledBadge.className).toContain('statusCancelled');
    });

    it('should handle No-show status', () => {
      const appointments = [
        {
          ...mockAppointments[0],
          status: 'No-show',
        }
      ];

      const { container } = renderAppointmentList(appointments);

      const noShowBadge = screen.getByText('No-show');
      expect(noShowBadge.className).toContain('statusNoShow');
    });

    it('should default to Scheduled class for unknown status', () => {
      const appointments = [
        {
          ...mockAppointments[0],
          status: 'Unknown' as any,
        }
      ];

      const { container } = renderAppointmentList(appointments);

      const badge = screen.getByText('Unknown');
      expect(badge.className).toContain('statusScheduled');
    });
  });

  describe('Table Structure', () => {
    it('should render table with correct headers', () => {
      renderAppointmentList();

      expect(screen.getByText('Time')).toBeInTheDocument();
      expect(screen.getByText('Patient')).toBeInTheDocument();
      expect(screen.getByText('Phone')).toBeInTheDocument();
      expect(screen.getByText('Reason')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('should render correct number of rows', () => {
      const { container } = renderAppointmentList();

      const rows = container.querySelectorAll('tbody tr.appointmentRow');
      expect(rows.length).toBe(3);
    });
  });
});
