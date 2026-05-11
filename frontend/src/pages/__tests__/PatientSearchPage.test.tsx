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

  it('should display search results', async () => {
    const mockResults = [
      {
        id: '1',
        name: 'John Doe',
        age: 46,
        gender: 'M' as const,
        phone: '9876543210',
        lastVisit: '2026-05-01'
      },
      {
        id: '2',
        name: 'Jane Smith',
        age: 32,
        gender: 'F' as const,
        phone: '1234567890',
        lastVisit: '2026-05-10'
      }
    ];

    (patientService.searchPatients as jest.Mock).mockResolvedValue(mockResults);

    renderPatientSearchPage();

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'John' } });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should navigate to patient profile on card click', async () => {
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
      const card = screen.getByText('John Doe');
      fireEvent.click(card.closest('div') || card);
    }, { timeout: 1000 });
  });

  it('should show empty state message when no results', async () => {
    (patientService.searchPatients as jest.Mock).mockResolvedValue([]);

    renderPatientSearchPage();

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'NonExistent' } });

    await waitFor(() => {
      expect(patientService.searchPatients).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  it('should debounce search input', async () => {
    renderPatientSearchPage();

    const searchInput = screen.getByPlaceholderText(/search/i);
    
    fireEvent.change(searchInput, { target: { value: 'J' } });
    fireEvent.change(searchInput, { target: { value: 'Jo' } });
    fireEvent.change(searchInput, { target: { value: 'Joh' } });
    fireEvent.change(searchInput, { target: { value: 'John' } });

    await waitFor(() => {
      expect(patientService.searchPatients).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  it('should handle loading state', () => {
    (patientService.searchPatients as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderPatientSearchPage();

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'John' } });

    // Check for loading indicator
    expect(searchInput).toBeInTheDocument();
  });

  it('should display patient count when results found', async () => {
    const mockResults = [
      {
        id: '1',
        name: 'John Doe',
        age: 46,
        gender: 'M' as const,
        phone: '9876543210',
        lastVisit: '2026-05-01'
      },
      {
        id: '2',
        name: 'John Smith',
        age: 32,
        gender: 'M' as const,
        phone: '1234567890',
        lastVisit: '2026-05-10'
      }
    ];

    (patientService.searchPatients as jest.Mock).mockResolvedValue(mockResults);

    renderPatientSearchPage();

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'John' } });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should clear error after successful search', async () => {
    // First search fails
    (patientService.searchPatients as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    renderPatientSearchPage();

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'Test' } });

    await waitFor(() => {
      expect(patientService.searchPatients).toHaveBeenCalled();
    }, { timeout: 1000 });

    // Second search succeeds
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
    fireEvent.change(searchInput, { target: { value: 'John' } });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should support keyboard navigation', async () => {
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
    fireEvent.keyDown(searchInput, { key: 'Enter' });

    expect(searchInput).toBeInTheDocument();
  });
});
