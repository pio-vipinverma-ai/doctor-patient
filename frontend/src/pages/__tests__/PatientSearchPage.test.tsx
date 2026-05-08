import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PatientSearchPage } from '../PatientSearchPage';
import * as patientService from '../../services/patientService';

jest.mock('../../services/patientService');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('PatientSearchPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render search input', () => {
    render(
      <BrowserRouter>
        <PatientSearchPage />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText(/search by name or phone/i)).toBeInTheDocument();
  });

  it('should display search results after typing', async () => {
    const mockResults = [
      {
        id: '1',
        name: 'John Doe',
        age: 46,
        gender: 'M',
        phone: '9876543210',
        lastVisit: '2026-05-01T10:00:00.000Z'
      },
      {
        id: '2',
        name: 'Johnny Smith',
        age: 35,
        gender: 'M',
        phone: '9876543211',
        lastVisit: null
      }
    ];

    (patientService.searchPatients as jest.Mock).mockResolvedValueOnce(mockResults);

    render(
      <BrowserRouter>
        <PatientSearchPage />
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText(/search by name or phone/i);
    fireEvent.change(searchInput, { target: { value: 'john' } });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Johnny Smith')).toBeInTheDocument();
    });
  });

  it('should navigate to patient profile on click', async () => {
    const mockResults = [
      {
        id: '1',
        name: 'John Doe',
        age: 46,
        gender: 'M',
        phone: '9876543210',
        lastVisit: null
      }
    ];

    (patientService.searchPatients as jest.Mock).mockResolvedValueOnce(mockResults);

    render(
      <BrowserRouter>
        <PatientSearchPage />
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText(/search by name or phone/i);
    fireEvent.change(searchInput, { target: { value: 'john' } });

    await waitFor(() => {
      const patientCard = screen.getByText('John Doe');
      fireEvent.click(patientCard);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/patients/1');
  });

  it('should show "No patients found" message when search returns empty', async () => {
    (patientService.searchPatients as jest.Mock).mockResolvedValueOnce([]);

    render(
      <BrowserRouter>
        <PatientSearchPage />
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText(/search by name or phone/i);
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.getByText(/no patients found/i)).toBeInTheDocument();
    });
  });

  it('should debounce search input', async () => {
    (patientService.searchPatients as jest.Mock).mockResolvedValue([]);

    render(
      <BrowserRouter>
        <PatientSearchPage />
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText(/search by name or phone/i);
    
    // Type multiple characters quickly
    fireEvent.change(searchInput, { target: { value: 'j' } });
    fireEvent.change(searchInput, { target: { value: 'jo' } });
    fireEvent.change(searchInput, { target: { value: 'joh' } });
    fireEvent.change(searchInput, { target: { value: 'john' } });

    // Wait for debounce
    await waitFor(() => {
      // Should only be called once after debounce delay
      expect(patientService.searchPatients).toHaveBeenCalledTimes(1);
    });
  });

  it('should display loading state during search', async () => {
    (patientService.searchPatients as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <BrowserRouter>
        <PatientSearchPage />
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText(/search by name or phone/i);
    fireEvent.change(searchInput, { target: { value: 'john' } });

    await waitFor(() => {
      expect(screen.getByText(/searching/i)).toBeInTheDocument();
    });
  });

  it('should display error message on search failure', async () => {
    (patientService.searchPatients as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    render(
      <BrowserRouter>
        <PatientSearchPage />
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText(/search by name or phone/i);
    fireEvent.change(searchInput, { target: { value: 'john' } });

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
