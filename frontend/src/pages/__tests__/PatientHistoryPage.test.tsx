import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import { PatientHistoryPage } from '../PatientHistoryPage';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import * as consultationService from '../../services/consultationService';
import * as patientService from '../../services/patientService';

jest.mock('../../services/authService');
jest.mock('../../services/consultationService');
jest.mock('../../services/patientService');

describe('PatientHistoryPage', () => {
  const mockPatient = {
    id: '1',
    name: 'John Doe',
    dob: '1990-01-01',
    age: 36,
    gender: 'M' as const,
    phone: '1234567890'
  };

  const mockConsultations = {
    consultations: [
      {
        id: '1',
        patientId: '1',
        date: '2026-05-01',
        chiefComplaint: 'Fever',
        diagnosis: 'Viral infection',
        temperature: 98.6,
        bp: '120/80',
        pulse: 72,
        medications: []
      }
    ],
    total: 1,
    page: 1,
    totalPages: 1
  };

  const renderPatientHistoryPage = () => {
    return render(
      <MemoryRouter initialEntries={['/patients/1/history']}>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/patients/:id/history" element={<PatientHistoryPage />} />
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
    (consultationService.getPatientConsultations as jest.Mock).mockResolvedValue(mockConsultations);
  });

  it('should render patient history page', async () => {
    const { container } = renderPatientHistoryPage();
    expect(container).toBeTruthy();
  });

  it('should attempt to load patient information', async () => {
    renderPatientHistoryPage();

    await waitFor(() => {
      expect(patientService.getPatientById).toHaveBeenCalled();
    });
  });
});
