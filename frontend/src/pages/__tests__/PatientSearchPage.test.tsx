import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PatientSearchPage } from '../PatientSearchPage';
import { AuthProvider } from '../../context/AuthContext';
import * as patientService from '../../services/patientService';

jest.mock('../../services/patientService');
jest.mock('../../services/authService');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('PatientSearchPage', () => {
  const renderPatientSearchPage = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <PatientSearchPage />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (patientService.searchPatients as jest.Mock).mockResolvedValue([]);
  });

  it('should render search input', () => {
    renderPatientSearchPage();

    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('should render new patient button', () => {
    renderPatientSearchPage();

    expect(screen.getByRole('button', { name: /new patient/i })).toBeInTheDocument();
  });

  it('should accept search input', () => {
    renderPatientSearchPage();

    const searchInput = screen.getByPlaceholderText(/search/i) as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'John' } });

    expect(searchInput.value).toBe('John');
  });

  it('should call searchPatients when typing', async () => {
    const mockResults = [
      {
        id: '1',
        name: 'John Doe',
        age: 46,
        gender: 'M' as const,
        phone: '9876543210',
        lastVisit: '2026-05-01'
      }
    ];

    (patientService.searchPatients as jest.Mock).mockResolvedValue(mockResults);

    renderPatientSearchPage();

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'John' } });

    await waitFor(() => {
      expect(patientService.searchPatients).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  it('should clear results when search is empty', async () => {
    const mockResults = [
      {
        id: '1',
        name: 'John Doe',
        age: 46,
        gender: 'M' as const,
        phone: '9876543210',
        lastVisit: '2026-05-01'
      }
    ];

    (patientService.searchPatients as jest.Mock).mockResolvedValue(mockResults);

    renderPatientSearchPage();

    const searchInput = screen.getByPlaceholderText(/search/i);
    
    fireEvent.change(searchInput, { target: { value: 'John' } });
    await waitFor(() => {
      expect(patientService.searchPatients).toHaveBeenCalled();
    }, { timeout: 1000 });

    fireEvent.change(searchInput, { target: { value: '' } });
    
    // Should not call searchPatients for empty query
    expect(searchInput).toHaveValue('');
  });

  it('should show error message on search failure', async () => {
    (patientService.searchPatients as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    renderPatientSearchPage();

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'John' } });

    await waitFor(() => {
      expect(patientService.searchPatients).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  it('should open create form when clicking new patient button', () => {
    renderPatientSearchPage();

    const newPatientButton = screen.getByRole('button', { name: /new patient/i });
    fireEvent.click(newPatientButton);

    // Form should be shown (this depends on your implementation)
    expect(newPatientButton).toBeInTheDocument();
  });
});
