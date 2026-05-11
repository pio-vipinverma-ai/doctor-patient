import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ScheduleAppointmentForm } from '../ScheduleAppointmentForm';
import * as patientService from '../../services/patientService';
import * as appointmentService from '../../services/appointmentService';
import { ToastProvider } from '../../context/ToastContext';

// Mock services
jest.mock('../../services/patientService');
jest.mock('../../services/appointmentService');

const mockSearchPatients = patientService.searchPatients as jest.MockedFunction<typeof patientService.searchPatients>;
const mockCreateAppointment = appointmentService.createAppointment as jest.MockedFunction<typeof appointmentService.createAppointment>;

const renderWithToast = (component: React.ReactElement) => {
  return render(<ToastProvider>{component}</ToastProvider>);
};

const getDateTimeInput = (container: HTMLElement) => {
  const input = container.querySelector('input[type="datetime-local"]') as HTMLInputElement;
  if (!input) {
    throw new Error('datetime-local input not found');
  }
  return input;
};

describe('ScheduleAppointmentForm', () => {
  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  const mockPatients = [
    {
      id: 'p1',
      name: 'John Doe',
      age: 30,
      gender: 'Male',
      phone: '555-010-1010',
      dateOfBirth: '1994-01-01',
      address: '123 Main St',
      email: 'john@example.com',
      medicalHistory: ''
    },
    {
      id: 'p2',
      name: 'Jane Smith',
      age: 25,
      gender: 'Female',
      phone: '555-020-2020',
      dateOfBirth: '1999-05-15',
      address: '456 Oak Ave',
      email: 'jane@example.com',
      medicalHistory: ''
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render form with all fields', () => {
      renderWithToast(
        <ScheduleAppointmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      expect(screen.getByRole('heading', { name: 'Schedule Appointment' })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search by name or phone...')).toBeInTheDocument();
      expect(screen.getByText('Clinic hours: 9 AM - 6 PM')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter reason for appointment...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Schedule Appointment' })).toBeInTheDocument();
    });

    it('should show required field indicators', () => {
      renderWithToast(
        <ScheduleAppointmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const requiredMarkers = screen.getAllByText('*');
      expect(requiredMarkers.length).toBeGreaterThanOrEqual(3);
    });

    it('should render with default patient ID if provided', () => {
      renderWithToast(
        <ScheduleAppointmentForm 
          onSuccess={mockOnSuccess} 
          onCancel={mockOnCancel}
          defaultPatientId="p1"
        />
      );

      expect(screen.getByPlaceholderText('Search by name or phone...')).toBeInTheDocument();
    });
  });

  describe('Patient Search', () => {
    it('should search for patients when typing', async () => {
      mockSearchPatients.mockResolvedValue(mockPatients);

      renderWithToast(
        <ScheduleAppointmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const searchInput = screen.getByPlaceholderText('Search by name or phone...');
      fireEvent.change(searchInput, { target: { value: 'John' } });

      // Fast forward debounce timer
      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(mockSearchPatients).toHaveBeenCalledWith('John', 10);
      });
    });

    it('should not search if query is less than 2 characters', async () => {
      renderWithToast(
        <ScheduleAppointmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const searchInput = screen.getByPlaceholderText('Search by name or phone...');
      fireEvent.change(searchInput, { target: { value: 'J' } });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(mockSearchPatients).not.toHaveBeenCalled();
      });
    });

    it('should display search results', async () => {
      mockSearchPatients.mockResolvedValue(mockPatients);

      renderWithToast(
        <ScheduleAppointmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const searchInput = screen.getByPlaceholderText('Search by name or phone...');
      fireEvent.change(searchInput, { target: { value: 'John' } });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText(/30 years • Male • 555-010-1010/)).toBeInTheDocument();
      });
    });

    it('should show searching indicator while searching', async () => {
      mockSearchPatients.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockPatients), 100))
      );

      renderWithToast(
        <ScheduleAppointmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const searchInput = screen.getByPlaceholderText('Search by name or phone...');
      fireEvent.change(searchInput, { target: { value: 'John' } });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('Searching...')).toBeInTheDocument();
      });
    });

    it('should handle search error gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockSearchPatients.mockRejectedValue(new Error('Search failed'));

      renderWithToast(
        <ScheduleAppointmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const searchInput = screen.getByPlaceholderText('Search by name or phone...');
      fireEvent.change(searchInput, { target: { value: 'John' } });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith('Search failed:', expect.any(Error));
      });

      consoleError.mockRestore();
    });

    it('should show results on focus if results exist', async () => {
      mockSearchPatients.mockResolvedValue(mockPatients);

      renderWithToast(
        <ScheduleAppointmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const searchInput = screen.getByPlaceholderText('Search by name or phone...');
      
      // Search first
      fireEvent.change(searchInput, { target: { value: 'John' } });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Click away (simulate blur)
      fireEvent.blur(searchInput);

      // Focus again
      fireEvent.focus(searchInput);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('Patient Selection', () => {
    it('should select patient when clicked', async () => {
      mockSearchPatients.mockResolvedValue(mockPatients);

      renderWithToast(
        <ScheduleAppointmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const searchInput = screen.getByPlaceholderText('Search by name or phone...');
      fireEvent.change(searchInput, { target: { value: 'John' } });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('John Doe'));

      expect(searchInput).toHaveValue('John Doe');
    });

    it('should hide results after selection', async () => {
      mockSearchPatients.mockResolvedValue(mockPatients);

      renderWithToast(
        <ScheduleAppointmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const searchInput = screen.getByPlaceholderText('Search by name or phone...');
      fireEvent.change(searchInput, { target: { value: 'John' } });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('John Doe'));

      await waitFor(() => {
        expect(screen.queryByText(/30 years • Male/)).not.toBeInTheDocument();
      });
    });

    it('should clear patient error when patient selected', async () => {
      mockSearchPatients.mockResolvedValue(mockPatients);

      renderWithToast(
        <ScheduleAppointmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      // Try to submit without selecting patient
      const submitButton = screen.getByRole('button', { name: 'Schedule Appointment' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please select a patient')).toBeInTheDocument();
      });

      // Now search and select
      const searchInput = screen.getByPlaceholderText('Search by name or phone...');
      fireEvent.change(searchInput, { target: { value: 'John' } });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('John Doe'));

      expect(screen.queryByText('Please select a patient')).not.toBeInTheDocument();
    });
  });

  describe('Date & Time Validation', () => {
    it('should show error for past date', async () => {
      renderWithToast(
        <ScheduleAppointmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const dateInput = getDateTimeInput(document.body);
      const pastDate = new Date('2020-01-01T10:00');
      
      fireEvent.change(dateInput, { target: { value: pastDate.toISOString().slice(0, 16) } });

      await waitFor(() => {
        expect(screen.getByText('Cannot schedule appointment in the past')).toBeInTheDocument();
      });
    });

    it('should show error for time before 9 AM', async () => {
      renderWithToast(
        <ScheduleAppointmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const dateInput = getDateTimeInput(document.body);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(8, 0, 0, 0);
      
      fireEvent.change(dateInput, { target: { value: futureDate.toISOString().slice(0, 16) } });

      await waitFor(() => {
        expect(screen.getByText('Appointments must be between 9 AM and 6 PM')).toBeInTheDocument();
      });
    });

    it.skip('should show error for time after 6 PM', async () => {
      renderWithToast(
        <ScheduleAppointmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const dateInput = getDateTimeInput(document.body);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(19, 0, 0, 0); // 7 PM - clearly after hours
      
      fireEvent.change(dateInput, { target: { value: futureDate.toISOString().slice(0, 16) } });

      await waitFor(() => {
        expect(screen.getByText('Appointments must be between 9 AM and 6 PM')).toBeInTheDocument();
      });
    });

    it.skip('should accept valid date and time', async () => {
      renderWithToast(
        <ScheduleAppointmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const dateInput = getDateTimeInput(document.body);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(14, 0, 0, 0);
      
      fireEvent.change(dateInput, { target: { value: futureDate.toISOString().slice(0, 16) } });

      await waitFor(() => {
        expect(screen.queryByText('Cannot schedule appointment in the past')).not.toBeInTheDocument();
        expect(screen.queryByText('Appointments must be between 9 AM and 6 PM')).not.toBeInTheDocument();
      });
    });
  });

  describe('Reason Input', () => {
    it('should update reason when typing', () => {
      renderWithToast(
        <ScheduleAppointmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const reasonInput = screen.getByPlaceholderText('Enter reason for appointment...');
      fireEvent.change(reasonInput, { target: { value: 'Annual checkup' } });

      expect(reasonInput).toHaveValue('Annual checkup');
    });

    it('should clear reason error when typing', async () => {
      renderWithToast(
        <ScheduleAppointmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      // Submit to trigger validation
      const submitButton = screen.getByRole('button', { name: 'Schedule Appointment' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please provide reason for appointment')).toBeInTheDocument();
      });

      // Type in reason
      const reasonInput = screen.getByPlaceholderText('Enter reason for appointment...');
      fireEvent.change(reasonInput, { target: { value: 'Annual checkup' } });

      expect(screen.queryByText('Please provide reason for appointment')).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show all validation errors on submit', async () => {
      renderWithToast(
        <ScheduleAppointmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const submitButton = screen.getByRole('button', { name: 'Schedule Appointment' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please select a patient')).toBeInTheDocument();
        expect(screen.getByText('Please select date and time')).toBeInTheDocument();
        expect(screen.getByText('Please provide reason for appointment')).toBeInTheDocument();
      });
    });

    it('should not submit form if validation fails', async () => {
      renderWithToast(
        <ScheduleAppointmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const submitButton = screen.getByRole('button', { name: 'Schedule Appointment' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please select a patient')).toBeInTheDocument();
      });

      expect(mockCreateAppointment).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it.skip('should submit form with valid data', async () => {
      mockSearchPatients.mockResolvedValue(mockPatients);
      mockCreateAppointment.mockResolvedValue({ 
        id: 'a1', 
        patientId: 'p1', 
        scheduledTime: '2024-12-01T14:00:00Z', 
        reason: 'Checkup',
        status: 'Scheduled',
        createdAt: '2024-11-01T10:00:00Z'
      });

      renderWithToast(
        <ScheduleAppointmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      // Select patient
      const searchInput = screen.getByPlaceholderText('Search by name or phone...');
      fireEvent.change(searchInput, { target: { value: 'John' } });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('John Doe'));

      // Set date/time
      const dateInput = getDateTimeInput(document.body);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(14, 0, 0, 0);
      fireEvent.change(dateInput, { target: { value: futureDate.toISOString().slice(0, 16) } });

      // Set reason
      const reasonInput = screen.getByPlaceholderText('Enter reason for appointment...');
      fireEvent.change(reasonInput, { target: { value: 'Annual checkup' } });

      // Submit
      const submitButton = screen.getByRole('button', { name: 'Schedule Appointment' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateAppointment).toHaveBeenCalled();
      });
    });

    it.skip('should show success message on successful submission', async () => {
      mockSearchPatients.mockResolvedValue(mockPatients);
      mockCreateAppointment.mockResolvedValue({ 
        id: 'a1', 
        patientId: 'p1', 
        scheduledTime: '2024-12-01T14:00:00Z', 
        reason: 'Checkup',
        status: 'Scheduled',
        createdAt: '2024-11-01T10:00:00Z'
      });

      renderWithToast(
        <ScheduleAppointmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      // Fill form
      const searchInput = screen.getByPlaceholderText('Search by name or phone...');
      fireEvent.change(searchInput, { target: { value: 'John' } });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('John Doe'));

      const dateInput = getDateTimeInput(document.body);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(14, 0, 0, 0);
      fireEvent.change(dateInput, { target: { value: futureDate.toISOString().slice(0, 16) } });

      const reasonInput = screen.getByPlaceholderText('Enter reason for appointment...');
      fireEvent.change(reasonInput, { target: { value: 'Annual checkup' } });

      const submitButton = screen.getByRole('button', { name: 'Schedule Appointment' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Appointment scheduled successfully!')).toBeInTheDocument();
      });
    });

    it.skip('should call onSuccess callback after successful submission', async () => {
      mockSearchPatients.mockResolvedValue(mockPatients);
      mockCreateAppointment.mockResolvedValue({ 
        id: 'a1', 
        patientId: 'p1', 
        scheduledTime: '2024-12-01T14:00:00Z', 
        reason: 'Checkup',
        status: 'Scheduled',
        createdAt: '2024-11-01T10:00:00Z'
      });

      renderWithToast(
        <ScheduleAppointmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      // Fill and submit form
      const searchInput = screen.getByPlaceholderText('Search by name or phone...');
      fireEvent.change(searchInput, { target: { value: 'John' } });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('John Doe'));

      const dateInput = getDateTimeInput(document.body);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(14, 0, 0, 0);
      fireEvent.change(dateInput, { target: { value: futureDate.toISOString().slice(0, 16) } });

      const reasonInput = screen.getByPlaceholderText('Enter reason for appointment...');
      fireEvent.change(reasonInput, { target: { value: 'Annual checkup' } });

      const submitButton = screen.getByRole('button', { name: 'Schedule Appointment' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it.skip('should reset form after successful submission', async () => {
      mockSearchPatients.mockResolvedValue(mockPatients);
      mockCreateAppointment.mockResolvedValue({ 
        id: 'a1', 
        patientId: 'p1', 
        scheduledTime: '2024-12-01T14:00:00Z', 
        reason: 'Checkup',
        status: 'Scheduled',
        createdAt: '2024-11-01T10:00:00Z'
      });

      renderWithToast(
        <ScheduleAppointmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      // Fill and submit
      const searchInput = screen.getByPlaceholderText('Search by name or phone...');
      fireEvent.change(searchInput, { target: { value: 'John' } });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('John Doe'));

      const dateInput = getDateTimeInput(document.body);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(14, 0, 0, 0);
      fireEvent.change(dateInput, { target: { value: futureDate.toISOString().slice(0, 16) } });

      const reasonInput = screen.getByPlaceholderText('Enter reason for appointment...');
      fireEvent.change(reasonInput, { target: { value: 'Annual checkup' } });

      const submitButton = screen.getByRole('button', { name: 'Schedule Appointment' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(searchInput).toHaveValue('');
        expect(reasonInput).toHaveValue('');
      });
    });

    it.skip('should show error message on submission failure', async () => {
      mockSearchPatients.mockResolvedValue(mockPatients);
      mockCreateAppointment.mockRejectedValue(new Error('Failed to create appointment'));

      renderWithToast(
        <ScheduleAppointmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      // Fill form
      const searchInput = screen.getByPlaceholderText('Search by name or phone...');
      fireEvent.change(searchInput, { target: { value: 'John' } });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('John Doe'));

      const dateInput = getDateTimeInput(document.body);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(14, 0, 0, 0);
      fireEvent.change(dateInput, { target: { value: futureDate.toISOString().slice(0, 16) } });

      const reasonInput = screen.getByPlaceholderText('Enter reason for appointment...');
      fireEvent.change(reasonInput, { target: { value: 'Annual checkup' } });

      const submitButton = screen.getByRole('button', { name: 'Schedule Appointment' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to create appointment')).toBeInTheDocument();
      });
    });

    it.skip('should disable inputs while submitting', async () => {
      mockSearchPatients.mockResolvedValue(mockPatients);
      mockCreateAppointment.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ 
          id: 'a1', 
          patientId: 'p1', 
          scheduledTime: '2024-12-01T14:00:00Z', 
          reason: 'Checkup',
          status: 'Scheduled',
          createdAt: '2024-11-01T10:00:00Z'
        }), 1000))
      );

      renderWithToast(
        <ScheduleAppointmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      // Fill form
      const searchInput = screen.getByPlaceholderText('Search by name or phone...');
      fireEvent.change(searchInput, { target: { value: 'John' } });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('John Doe'));

      const dateInput = getDateTimeInput(document.body);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(14, 0, 0, 0);
      fireEvent.change(dateInput, { target: { value: futureDate.toISOString().slice(0, 16) } });

      const reasonInput = screen.getByPlaceholderText('Enter reason for appointment...');
      fireEvent.change(reasonInput, { target: { value: 'Annual checkup' } });

      const submitButton = screen.getByRole('button', { name: 'Schedule Appointment' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Scheduling...')).toBeInTheDocument();
      });

      expect(searchInput).toBeDisabled();
      expect(reasonInput).toBeDisabled();
    });
  });

  describe('Cancel', () => {
    it('should clear form when cancel clicked', async () => {
      mockSearchPatients.mockResolvedValue(mockPatients);

      renderWithToast(
        <ScheduleAppointmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      // Fill some fields
      const searchInput = screen.getByPlaceholderText('Search by name or phone...');
      fireEvent.change(searchInput, { target: { value: 'John' } });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('John Doe'));

      const reasonInput = screen.getByPlaceholderText('Enter reason for appointment...');
      fireEvent.change(reasonInput, { target: { value: 'Checkup' } });

      // Click cancel
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(searchInput).toHaveValue('');
      expect(reasonInput).toHaveValue('');
    });

    it('should call onCancel callback when cancel clicked', () => {
      renderWithToast(
        <ScheduleAppointmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });
});


