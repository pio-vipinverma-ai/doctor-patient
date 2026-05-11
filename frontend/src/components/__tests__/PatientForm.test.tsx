import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PatientForm } from '../PatientForm';
import { Patient, PatientInput } from '../../services/patientService';

describe('PatientForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  const mockPatient: Patient = {
    id: 'p1',
    name: 'John Doe',
    dob: '1990-01-15',
    gender: 'M',
    phone: '555-0101',
    email: 'john@example.com',
    address: '123 Main St',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render form for new patient', () => {
      render(<PatientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByText('New Patient')).toBeInTheDocument();
      expect(screen.getByLabelText(/Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Date of Birth/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Gender/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Phone/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Address/)).toBeInTheDocument();
    });

    it('should render form for editing patient', () => {
      render(<PatientForm patient={mockPatient} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByText('Edit Patient')).toBeInTheDocument();
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1990-01-15')).toBeInTheDocument();
      expect(screen.getByDisplayValue('555-0101')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('123 Main St')).toBeInTheDocument();
    });

    it('should show Create button for new patient', () => {
      render(<PatientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
    });

    it('should show Update button for existing patient', () => {
      render(<PatientForm patient={mockPatient} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
    });

    it('should show required field indicators', () => {
      render(<PatientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const requiredLabels = screen.getAllByText('*');
      expect(requiredLabels.length).toBeGreaterThan(0);
    });
  });

  describe('Form Input', () => {
    it('should allow typing in name field', () => {
      render(<PatientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const nameInput = screen.getByLabelText(/Name/) as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: 'Jane Smith' } });

      expect(nameInput.value).toBe('Jane Smith');
    });

    it('should allow selecting date of birth', () => {
      render(<PatientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const dobInput = screen.getByLabelText(/Date of Birth/) as HTMLInputElement;
      fireEvent.change(dobInput, { target: { value: '1995-06-20' } });

      expect(dobInput.value).toBe('1995-06-20');
    });

    it('should allow selecting gender', () => {
      render(<PatientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const genderSelect = screen.getByLabelText(/Gender/) as HTMLSelectElement;
      fireEvent.change(genderSelect, { target: { value: 'F' } });

      expect(genderSelect.value).toBe('F');
    });

    it('should allow typing in phone field', () => {
      render(<PatientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const phoneInput = screen.getByLabelText(/Phone/) as HTMLInputElement;
      fireEvent.change(phoneInput, { target: { value: '555-0202' } });

      expect(phoneInput.value).toBe('555-0202');
    });

    it('should allow typing in email field', () => {
      render(<PatientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const emailInput = screen.getByLabelText(/Email/) as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect(emailInput.value).toBe('test@example.com');
    });

    it('should allow typing in address field', () => {
      render(<PatientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const addressInput = screen.getByLabelText(/Address/) as HTMLTextAreaElement;
      fireEvent.change(addressInput, { target: { value: '456 Elm St' } });

      expect(addressInput.value).toBe('456 Elm St');
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors when submitting empty form', async () => {
      render(<PatientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const submitButton = screen.getByRole('button', { name: 'Create' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate name field on blur', async () => {
      render(<PatientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const nameInput = screen.getByLabelText(/Name/);
      fireEvent.focus(nameInput);
      fireEvent.blur(nameInput);

      await waitFor(() => {
        expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
      });
    });

    it('should clear error when user starts typing', async () => {
      render(<PatientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      // First trigger validation error
      const nameInput = screen.getByLabelText(/Name/);
      fireEvent.blur(nameInput);

      await waitFor(() => {
        expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
      });

      // Then type to clear error
      fireEvent.change(nameInput, { target: { value: 'John' } });

      await waitFor(() => {
        expect(screen.queryByText(/Name is required/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with valid data', async () => {
      mockOnSubmit.mockResolvedValue(undefined);

      render(<PatientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'Jane Smith' } });
      fireEvent.change(screen.getByLabelText(/Date of Birth/), { target: { value: '1995-06-20' } });
      fireEvent.change(screen.getByLabelText(/Gender/), { target: { value: 'F' } });
      fireEvent.change(screen.getByLabelText(/Phone/), { target: { value: '555-020-2020' } });
      fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'jane@example.com' } });
      fireEvent.change(screen.getByLabelText(/Address/), { target: { value: '456 Elm St' } });

      const submitButton = screen.getByRole('button', { name: 'Create' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    it('should handle server-side phone duplicate error', async () => {
      mockOnSubmit.mockRejectedValue(new Error('Phone number already exists'));

      render(<PatientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'Jane Smith' } });
      fireEvent.change(screen.getByLabelText(/Date of Birth/), { target: { value: '1995-06-20' } });
      fireEvent.change(screen.getByLabelText(/Phone/), { target: { value: '555-010-1010' } });

      const submitButton = screen.getByRole('button', { name: 'Create' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      // After error, the error should be displayed
      await waitFor(() => {
        const phoneError = screen.queryByText(/Phone number already exists/i);
        expect(phoneError).toBeTruthy();
      });
    });

    it('should handle generic server error', async () => {
      mockOnSubmit.mockRejectedValue(new Error('Server error'));

      render(<PatientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'Jane Smith' } });
      fireEvent.change(screen.getByLabelText(/Date of Birth/), { target: { value: '1995-06-20' } });
      fireEvent.change(screen.getByLabelText(/Phone/), { target: { value: '555-020-2020' } });

      const submitButton = screen.getByRole('button', { name: 'Create' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      // After error, the error should be displayed
      await waitFor(() => {
        const formError = screen.queryByText(/Server error/i);
        expect(formError).toBeTruthy();
      });
    });
  });

  describe('Loading State', () => {
    it('should disable all inputs when loading', () => {
      render(<PatientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={true} />);

      expect(screen.getByLabelText(/Name/)).toBeDisabled();
      expect(screen.getByLabelText(/Date of Birth/)).toBeDisabled();
      expect(screen.getByLabelText(/Gender/)).toBeDisabled();
      expect(screen.getByLabelText(/Phone/)).toBeDisabled();
      expect(screen.getByLabelText(/Email/)).toBeDisabled();
      expect(screen.getByLabelText(/Address/)).toBeDisabled();
    });

    it('should disable submit button when loading', () => {
      render(<PatientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={true} />);

      expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
    });

    it('should disable cancel button when loading', () => {
      render(<PatientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={true} />);

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    });

    it('should show Saving... text on submit button when loading', () => {
      render(<PatientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={true} />);

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });

  describe('Cancel Button', () => {
    it('should call onCancel when cancel button clicked', () => {
      render(<PatientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Gender Options', () => {
    it('should have all gender options', () => {
      render(<PatientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const genderSelect = screen.getByLabelText(/Gender/);
      expect(genderSelect).toHaveTextContent('Male');
      expect(genderSelect).toHaveTextContent('Female');
      expect(genderSelect).toHaveTextContent('Other');
    });

    it('should default to Male for new patient', () => {
      render(<PatientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const genderSelect = screen.getByLabelText(/Gender/) as HTMLSelectElement;
      expect(genderSelect.value).toBe('M');
    });
  });

  describe('Date Input Constraints', () => {
    it('should not allow future dates for date of birth', () => {
      render(<PatientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const dobInput = screen.getByLabelText(/Date of Birth/) as HTMLInputElement;
      const today = new Date().toISOString().split('T')[0];
      
      expect(dobInput.max).toBe(today);
    });
  });

  describe('Form Data Population', () => {
    it('should populate form with patient data when editing', () => {
      render(<PatientForm patient={mockPatient} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect((screen.getByLabelText(/Name/) as HTMLInputElement).value).toBe('John Doe');
      expect((screen.getByLabelText(/Date of Birth/) as HTMLInputElement).value).toBe('1990-01-15');
      expect((screen.getByLabelText(/Gender/) as HTMLSelectElement).value).toBe('M');
      expect((screen.getByLabelText(/Phone/) as HTMLInputElement).value).toBe('555-0101');
      expect((screen.getByLabelText(/Email/) as HTMLInputElement).value).toBe('john@example.com');
      expect((screen.getByLabelText(/Address/) as HTMLTextAreaElement).value).toBe('123 Main St');
    });

    it('should handle patient data without optional fields', () => {
      const patientWithoutOptionals: Patient = {
        ...mockPatient,
        email: undefined,
        address: undefined,
      };

      render(<PatientForm patient={patientWithoutOptionals} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect((screen.getByLabelText(/Email/) as HTMLInputElement).value).toBe('');
      expect((screen.getByLabelText(/Address/) as HTMLTextAreaElement).value).toBe('');
    });
  });
});
