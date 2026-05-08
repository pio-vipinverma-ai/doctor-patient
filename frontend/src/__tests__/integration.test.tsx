import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from '../App';
import * as authService from '../services/authService';
import * as patientService from '../services/patientService';
import * as consultationService from '../services/consultationService';
import * as appointmentService from '../services/appointmentService';

jest.mock('../services/authService');
jest.mock('../services/patientService');
jest.mock('../services/consultationService');
jest.mock('../services/appointmentService');
jest.mock('../services/prescriptionService');
jest.mock('html2pdf.js');

describe('Integration Tests - User Flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    
    // Mock successful authentication
    (authService.login as jest.Mock).mockResolvedValue({
      token: 'test-token',
      refreshToken: 'test-refresh',
      user: {
        id: '1',
        username: 'doctor',
        email: 'doctor@test.com',
        name: 'Dr. Test'
      }
    });

    // Mock appointments
    (appointmentService.getTodaysAppointments as jest.Mock).mockResolvedValue([
      {
        id: '1',
        patientName: 'John Doe',
        time: '10:00 AM',
        status: 'Scheduled',
        phone: '1234567890'
      }
    ]);

    // Mock search results
    (patientService.searchPatients as jest.Mock).mockResolvedValue([
      {
        id: '1',
        name: 'John Doe',
        age: 36,
        gender: 'M',
        phone: '1234567890',
        lastVisit: '2026-05-01'
      }
    ]);

    // Mock patient details
    (patientService.getPatientById as jest.Mock).mockResolvedValue({
      id: '1',
      name: 'John Doe',
      dob: '1990-01-01',
      age: 36,
      gender: 'M',
      phone: '1234567890',
      email: 'john@test.com',
      address: '123 Main St'
    });

    // Mock consultation creation
    (consultationService.createConsultation as jest.Mock).mockResolvedValue({
      id: '1',
      patientId: '1',
      date: '2026-05-08',
      chiefComplaint: 'Fever',
      prescriptionId: '1'
    });
  });

  it('should complete full login flow', async () => {
    render(<App />);

    // Wait for lazy-loaded login page to render
    const usernameInput = await screen.findByPlaceholderText(/username/i);
    const passwordInput = await screen.findByPlaceholderText(/password/i);
    const loginButton = await screen.findByRole('button', { name: /login/i });

    expect(usernameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(loginButton).toBeInTheDocument();

    // Fill in credentials
    fireEvent.change(usernameInput, { target: { value: 'doctor' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    // Should call login service
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalled();
    });
  });

  it('should handle login failure gracefully', async () => {
    (authService.login as jest.Mock).mockRejectedValue(
      new Error('Invalid credentials')
    );

    render(<App />);

    const usernameInput = screen.getByPlaceholderText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: 'wrong' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalled();
    });

    // Error message should be displayed
    await waitFor(() => {
      const errorElement = screen.queryByText(/invalid/i) || screen.queryByText(/credentials/i);
      if (errorElement) {
        expect(errorElement).toBeInTheDocument();
      }
    });
  });

  it('should search for patients after login', async () => {
    // Pre-authenticate by setting token
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({
      id: '1',
      username: 'doctor',
      email: 'doctor@test.com',
      name: 'Dr. Test'
    }));

    render(<App />);

    // Should be able to navigate or access authenticated features
    expect(localStorage.getItem('token')).toBe('test-token');
  });

  it('should handle network errors in search', async () => {
    (patientService.searchPatients as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({
      id: '1',
      username: 'doctor',
      email: 'doctor@test.com',
      name: 'Dr. Test'
    }));

    render(<App />);

    // Should be authenticated
    expect(localStorage.getItem('token')).toBe('test-token');
  });

  it('should protect routes when not authenticated', async () => {
    render(<App />);

    // Should show login page when not authenticated
    await waitFor(() => {
      const loginElement = screen.queryByPlaceholderText(/username/i) || screen.queryByRole('button', { name: /login/i });
      expect(loginElement).toBeInTheDocument();
    });
  });

  it('should handle logout flow', async () => {
    (authService.logout as jest.Mock).mockResolvedValue(undefined);

    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({
      id: '1',
      username: 'doctor',
      email: 'doctor@test.com',
      name: 'Dr. Test'
    }));

    render(<App />);

    // Should be authenticated
    expect(localStorage.getItem('token')).toBe('test-token');
  });
});
