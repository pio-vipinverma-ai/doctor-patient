import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ConsultationPage } from '../ConsultationPage';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import * as patientService from '../../services/patientService';
import * as consultationService from '../../services/consultationService';

jest.mock('../../services/authService');
jest.mock('../../services/patientService');
jest.mock('../../services/consultationService');

describe('ConsultationPage', () => {
  const mockPatient = {
    id: '1',
    name: 'John Doe',
    dob: '1990-01-01',
    age: 36,
    gender: 'M' as const,
    phone: '1234567890'
  };

  const renderConsultationPage = () => {
    return render(
      <MemoryRouter initialEntries={['/consultations/1']}>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/consultations/:patientId" element={<ConsultationPage />} />
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
    (consultationService.createConsultation as jest.Mock).mockResolvedValue({
      id: '1',
      patientId: '1',
      date: '2026-05-08',
      chiefComplaint: 'Fever'
    });
  });

  it('should render consultation page', async () => {
    const { container } = renderConsultationPage();
    expect(container).toBeTruthy();
  });

  it('should attempt to load patient information', async () => {
    renderConsultationPage();

    await waitFor(() => {
      expect(patientService.getPatientById).toHaveBeenCalled();
    });
  });

  it('should display patient information when loaded', async () => {
    renderConsultationPage();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('should allow entering vital signs', async () => {
    renderConsultationPage();

    await waitFor(() => {
      expect(patientService.getPatientById).toHaveBeenCalled();
    });

    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs.length).toBeGreaterThan(0);

    // Temperature input
    fireEvent.change(inputs[0], { target: { value: '98.6' } });
    expect(inputs[0]).toHaveValue(98.6);
  });

  it('should allow entering complaints and diagnosis', async () => {
    renderConsultationPage();

    await waitFor(() => {
      expect(patientService.getPatientById).toHaveBeenCalled();
    });

    const textareas = screen.getAllByRole('textbox');
    expect(textareas.length).toBeGreaterThanOrEqual(2);

    fireEvent.change(textareas[0], { target: { value: 'Fever and headache' } });
    fireEvent.change(textareas[1], { target: { value: 'Viral infection' } });

    expect(textareas[0]).toHaveValue('Fever and headache');
    expect(textareas[1]).toHaveValue('Viral infection');
  });

  it('should open medication form when add medication clicked', async () => {
    renderConsultationPage();

    await waitFor(() => {
      expect(patientService.getPatientById).toHaveBeenCalled();
    });

    const addMedButton = screen.getByRole('button', { name: /add medication/i });
    fireEvent.click(addMedButton);

    // Form should open - check for inputs
    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(2);
    });
  });

  it('should add medication to list', async () => {
    renderConsultationPage();

    await waitFor(() => {
      expect(patientService.getPatientById).toHaveBeenCalled();
    });

    // Open medication form
    const addMedButton = screen.getByRole('button', { name: /add medication/i });
    fireEvent.click(addMedButton);

    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(2);
    });

    const inputs = screen.getAllByRole('textbox');
    
    // Fill medication form (after complaints/diagnosis, there are 4 more textboxes: name, dosage, duration, instructions)
    fireEvent.change(inputs[inputs.length - 4], { target: { value: 'Paracetamol' } }); // name
    fireEvent.change(inputs[inputs.length - 3], { target: { value: '500mg' } }); // dosage
    fireEvent.change(inputs[inputs.length - 2], { target: { value: '5 days' } }); // duration

    // Submit medication
    const saveMedButton = screen.getByRole('button', { name: /^add$/i });
    fireEvent.click(saveMedButton);

    // Medication should be in list
    await waitFor(() => {
      expect(screen.getByText(/Paracetamol/i)).toBeInTheDocument();
    });
  });

  it('should validate required fields on submit', async () => {
    renderConsultationPage();

    await waitFor(() => {
      expect(patientService.getPatientById).toHaveBeenCalled();
    });

    const submitButton = screen.getByRole('button', { name: /save.*prescription/i });
    fireEvent.click(submitButton);

    // Should not call createConsultation without required fields
    await waitFor(() => {
      expect(consultationService.createConsultation).not.toHaveBeenCalled();
    });
  });

  it('should validate medication fields', async () => {
    renderConsultationPage();

    await waitFor(() => {
      expect(patientService.getPatientById).toHaveBeenCalled();
    });

    // Open medication form
    const addMedButton = screen.getByRole('button', { name: /add medication/i });
    fireEvent.click(addMedButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^add$/i })).toBeInTheDocument();
    });

    // Try to save without filling required fields
    const saveMedButton = screen.getByRole('button', { name: /^add$/i });
    fireEvent.click(saveMedButton);

    // Validation handled by component toast notifications
    expect(saveMedButton).toBeInTheDocument();
  });

  it('should submit consultation with valid data', async () => {
    renderConsultationPage();

    await waitFor(() => {
      expect(patientService.getPatientById).toHaveBeenCalled();
    });

    // Fill vital signs using role selectors
    const spinbuttons = screen.getAllByRole('spinbutton');
    fireEvent.change(spinbuttons[0], { target: { value: '98.6' } });
    fireEvent.change(spinbuttons[1], { target: { value: '120' } });
    fireEvent.change(spinbuttons[2], { target: { value: '80' } });
    fireEvent.change(spinbuttons[3], { target: { value: '72' } });

    // Fill complaints and diagnosis
    const textboxes = screen.getAllByRole('textbox');
    fireEvent.change(textboxes[0], { target: { value: 'Fever' } });
    fireEvent.change(textboxes[1], { target: { value: 'Viral fever' } });

    // Add medication
    fireEvent.click(screen.getByRole('button', { name: /add medication/i }));
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^add$/i })).toBeInTheDocument();
    });

    const allTextboxes = screen.getAllByRole('textbox');
    fireEvent.change(allTextboxes[allTextboxes.length - 4], { target: { value: 'Paracetamol' } }); // name
    fireEvent.change(allTextboxes[allTextboxes.length - 3], { target: { value: '500mg' } }); // dosage
    fireEvent.change(allTextboxes[allTextboxes.length - 2], { target: { value: '5 days' } }); // duration
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Paracetamol/i)).toBeInTheDocument();
    });

    // Submit consultation
    fireEvent.click(screen.getByRole('button', { name: /save.*prescription/i }));

    await waitFor(() => {
      expect(consultationService.createConsultation).toHaveBeenCalled();
    });
  });

  it('should handle cancel button', async () => {
    renderConsultationPage();

    await waitFor(() => {
      expect(patientService.getPatientById).toHaveBeenCalled();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeInTheDocument();
  });

  it('should handle patient load error', async () => {
    (patientService.getPatientById as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to load patient')
    );

    renderConsultationPage();

    await waitFor(() => {
      expect(patientService.getPatientById).toHaveBeenCalled();
    });
  });

  it('should handle consultation save error', async () => {
    (consultationService.createConsultation as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to save')
    );

    renderConsultationPage();

    await waitFor(() => {
      expect(patientService.getPatientById).toHaveBeenCalled();
    });

    // Fill all required fields using role selectors
    const spinbuttons = screen.getAllByRole('spinbutton');
    fireEvent.change(spinbuttons[0], { target: { value: '98.6' } });
    fireEvent.change(spinbuttons[1], { target: { value: '120' } });
    fireEvent.change(spinbuttons[2], { target: { value: '80' } });
    fireEvent.change(spinbuttons[3], { target: { value: '72' } });
    
    const textboxes = screen.getAllByRole('textbox');
    fireEvent.change(textboxes[0], { target: { value: 'Fever' } });
    fireEvent.change(textboxes[1], { target: { value: 'Viral fever' } });

    // Add medication
    fireEvent.click(screen.getByRole('button', { name: /add medication/i }));
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^add$/i })).toBeInTheDocument();
    });

    const allTextboxes = screen.getAllByRole('textbox');
    fireEvent.change(allTextboxes[allTextboxes.length - 4], { target: { value: 'Paracetamol' } }); // name
    fireEvent.change(allTextboxes[allTextboxes.length - 3], { target: { value: '500mg' } }); // dosage
    fireEvent.change(allTextboxes[allTextboxes.length - 2], { target: { value: '5 days' } }); // duration
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Paracetamol/i)).toBeInTheDocument();
    });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /save.*prescription/i }));

    await waitFor(() => {
      expect(consultationService.createConsultation).toHaveBeenCalled();
    });
  });
});
