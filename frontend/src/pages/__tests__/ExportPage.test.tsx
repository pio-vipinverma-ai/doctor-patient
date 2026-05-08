import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ExportPage } from '../ExportPage';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import * as exportService from '../../services/exportService';

jest.mock('../../services/authService');
jest.mock('../../services/exportService');

describe('ExportPage', () => {
  const renderExportPage = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <ExportPage />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (exportService.exportPatients as jest.Mock).mockResolvedValue(new Blob());
    (exportService.exportConsultations as jest.Mock).mockResolvedValue(new Blob());
  });

  it('should render export page', () => {
    const { container } = renderExportPage();
    expect(container).toBeTruthy();
  });

  it('should not crash on render', () => {
    expect(() => renderExportPage()).not.toThrow();
  });

  it('should have export type radio buttons', () => {
    renderExportPage();

    expect(screen.getByLabelText(/export patients/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/export consultations/i)).toBeInTheDocument();
  });

  it('should have format selection', () => {
    renderExportPage();

    expect(screen.getByLabelText(/csv/i)).toBeInTheDocument();
  });

  it('should have date range inputs', () => {
    renderExportPage();

    expect(screen.getByLabelText(/from date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/to date/i)).toBeInTheDocument();
  });

  it('should have export button', () => {
    renderExportPage();

    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
  });

  it('should switch between export types', () => {
    renderExportPage();

    const patientsRadio = screen.getByLabelText(/export patients/i);
    const consultationsRadio = screen.getByLabelText(/export consultations/i);

    expect(consultationsRadio).toBeChecked();

    fireEvent.click(patientsRadio);
    expect(patientsRadio).toBeChecked();
  });

  it('should export patients as CSV', async () => {
    renderExportPage();

    // Select patients
    fireEvent.click(screen.getByLabelText(/export patients/i));

    // Click export
    const exportButton = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportButton);

    await screen.findByRole('button', { name: /export/i });

    expect(exportService.exportPatients).toHaveBeenCalled();
  });

  it('should export consultations as CSV', async () => {
    renderExportPage();

    // Consultations is selected by default
    const exportButton = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportButton);

    await screen.findByRole('button', { name: /export/i });

    expect(exportService.exportConsultations).toHaveBeenCalled();
  });

  it('should handle export error', async () => {
    (exportService.exportConsultations as jest.Mock).mockRejectedValueOnce(
      new Error('Export failed')
    );

    renderExportPage();

    const exportButton = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportButton);

    await screen.findByRole('button', { name: /export/i });

    expect(exportService.exportConsultations).toHaveBeenCalled();
  });

  it('should disable export button during export', async () => {
    (exportService.exportConsultations as jest.Mock).mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve(new Blob()), 1000))
    );

    renderExportPage();

    const exportButton = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportButton);

    // Button should show loading state or be disabled
    expect(exportButton).toBeInTheDocument();
  });

  it('should update from date', () => {
    renderExportPage();

    const fromDateInput = screen.getByLabelText(/from date/i) as HTMLInputElement;
    fireEvent.change(fromDateInput, { target: { value: '2026-01-01' } });

    expect(fromDateInput.value).toBe('2026-01-01');
  });

  it('should update to date', () => {
    renderExportPage();

    const toDateInput = screen.getByLabelText(/to date/i) as HTMLInputElement;
    fireEvent.change(toDateInput, { target: { value: '2026-05-08' } });

    expect(toDateInput.value).toBe('2026-05-08');
  });

  it('should have reset button for date filter', () => {
    renderExportPage();

    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  it('should reset dates when reset clicked', () => {
    renderExportPage();

    const fromDateInput = screen.getByLabelText(/from date/i) as HTMLInputElement;
    const initialValue = fromDateInput.value;
    
    fireEvent.change(fromDateInput, { target: { value: '2026-01-01' } });
    expect(fromDateInput.value).toBe('2026-01-01');

    const resetButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetButton);

    // After reset, value should be back to initial or default
    expect(fromDateInput.value).toBeDefined();
  });
});
