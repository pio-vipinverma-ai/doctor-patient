import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConsultationTable } from '../ConsultationTable';
import * as consultationService from '../../services/consultationService';

// Mock consultation service
jest.mock('../../services/consultationService');
const mockGetConsultationById = consultationService.getConsultationById as jest.MockedFunction<typeof consultationService.getConsultationById>;

describe('ConsultationTable', () => {
  const mockConsultations = [
    {
      id: 'c1',
      date: '2024-01-15T10:00:00Z',
      temperature: 98.6,
      bp: '120/80',
      pulse: 75,
      diagnosis: 'Common cold with mild fever symptoms',
      medicationCount: 2,
      prescriptionId: 'p1'
    },
    {
      id: 'c2',
      date: '2024-02-20T14:30:00Z',
      temperature: 100.2,
      bp: '130/85',
      pulse: 82,
      diagnosis: 'Flu',
      medicationCount: 3,
      prescriptionId: 'p2'
    }
  ];

  const mockFullConsultation = {
    id: 'c1',
    patientId: 'pt1',
    date: '2024-01-15T10:00:00Z',
    temperature: 98.6,
    bp: '120/80',
    pulse: 75,
    complaints: 'Cough and fever',
    diagnosis: 'Common cold with mild fever symptoms',
    medications: [
      {
        name: 'Paracetamol',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '5 days',
        instructions: 'Take after meals'
      }
    ],
    vitalsWarnings: {
      temperature: 'Temperature is slightly elevated'
    },
    prescriptionId: 'p1',
    createdAt: '2024-01-15T10:00:00Z'
  };

  const mockOnPrintPrescription = jest.fn();
  const mockOnReuseDiagnosis = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render consultation table with data', () => {
      render(
        <ConsultationTable
          consultations={mockConsultations}
          patientId="pt1"
          onPrintPrescription={mockOnPrintPrescription}
          onReuseDiagnosis={mockOnReuseDiagnosis}
        />
      );

      expect(screen.getByText(/15 Jan 2024/)).toBeInTheDocument();
      expect(screen.getByText('98.6')).toBeInTheDocument();
      expect(screen.getByText('120/80')).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();
      expect(screen.getByText(/Common cold/)).toBeInTheDocument();
    });

    it('should render empty state when no consultations', () => {
      render(
        <ConsultationTable
          consultations={[]}
          patientId="pt1"
          onPrintPrescription={mockOnPrintPrescription}
          onReuseDiagnosis={mockOnReuseDiagnosis}
        />
      );

      expect(screen.getByText('No consultations found')).toBeInTheDocument();
    });

    it('should not render empty state when loading', () => {
      render(
        <ConsultationTable
          consultations={[]}
          patientId="pt1"
          onPrintPrescription={mockOnPrintPrescription}
          onReuseDiagnosis={mockOnReuseDiagnosis}
          isLoading={true}
        />
      );

      expect(screen.queryByText('No consultations found')).not.toBeInTheDocument();
    });

    it('should render print buttons for all consultations', () => {
      render(
        <ConsultationTable
          consultations={mockConsultations}
          patientId="pt1"
          onPrintPrescription={mockOnPrintPrescription}
          onReuseDiagnosis={mockOnReuseDiagnosis}
        />
      );

      const printButtons = screen.getAllByText('Print');
      expect(printButtons).toHaveLength(2);
    });

    it('should render expand buttons for all consultations', () => {
      render(
        <ConsultationTable
          consultations={mockConsultations}
          patientId="pt1"
          onPrintPrescription={mockOnPrintPrescription}
          onReuseDiagnosis={mockOnReuseDiagnosis}
        />
      );

      const expandButtons = screen.getAllByText('▶');
      expect(expandButtons).toHaveLength(2);
    });
  });

  describe('Row Expansion', () => {
    it('should expand row when clicked', async () => {
      mockGetConsultationById.mockResolvedValue(mockFullConsultation);

      render(
        <ConsultationTable
          consultations={[mockConsultations[0]]}
          patientId="pt1"
          onPrintPrescription={mockOnPrintPrescription}
          onReuseDiagnosis={mockOnReuseDiagnosis}
        />
      );

      const expandButton = screen.getByText('▶');
      fireEvent.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText('▼')).toBeInTheDocument();
      });
    });

    it('should collapse row when clicked again', async () => {
      mockGetConsultationById.mockResolvedValue(mockFullConsultation);

      render(
        <ConsultationTable
          consultations={[mockConsultations[0]]}
          patientId="pt1"
          onPrintPrescription={mockOnPrintPrescription}
          onReuseDiagnosis={mockOnReuseDiagnosis}
        />
      );

      const expandButton = screen.getByText('▶');
      
      // Expand
      fireEvent.click(expandButton);
      await waitFor(() => {
        expect(screen.getByText('▼')).toBeInTheDocument();
      });

      // Collapse
      const collapseButton = screen.getByText('▼');
      fireEvent.click(collapseButton);

      await waitFor(() => {
        expect(screen.getByText('▶')).toBeInTheDocument();
      });
    });

    it('should load consultation details when expanding', async () => {
      mockGetConsultationById.mockResolvedValue(mockFullConsultation);

      render(
        <ConsultationTable
          consultations={[mockConsultations[0]]}
          patientId="pt1"
          onPrintPrescription={mockOnPrintPrescription}
          onReuseDiagnosis={mockOnReuseDiagnosis}
        />
      );

      const expandButton = screen.getByText('▶');
      fireEvent.click(expandButton);

      await waitFor(() => {
        expect(mockGetConsultationById).toHaveBeenCalledWith('c1');
      });
    });

    it.skip('should show loading state while fetching details', async () => {
      // Use a delayed promise to ensure loading state is visible
      mockGetConsultationById.mockImplementation(() => 
        new Promise((resolve) => {
          setTimeout(() => resolve(mockFullConsultation), 50);
        })
      );

      render(
        <ConsultationTable
          consultations={[mockConsultations[0]]}
          patientId="pt1"
          onPrintPrescription={mockOnPrintPrescription}
          onReuseDiagnosis={mockOnReuseDiagnosis}
        />
      );

      const expandButton = screen.getByText('▶');
      fireEvent.click(expandButton);

      // Check loading state appears
      await waitFor(() => {
        expect(screen.getByText('Loading details...')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should handle error when loading details fails', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockGetConsultationById.mockRejectedValue(new Error('Failed to load'));

      render(
        <ConsultationTable
          consultations={[mockConsultations[0]]}
          patientId="pt1"
          onPrintPrescription={mockOnPrintPrescription}
          onReuseDiagnosis={mockOnReuseDiagnosis}
        />
      );

      const expandButton = screen.getByText('▶');
      fireEvent.click(expandButton);

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(
          'Failed to load consultation details:',
          expect.any(Error)
        );
      });

      consoleError.mockRestore();
    });

    it('should not fetch details if already loaded', async () => {
      mockGetConsultationById.mockResolvedValue(mockFullConsultation);

      render(
        <ConsultationTable
          consultations={[mockConsultations[0]]}
          patientId="pt1"
          onPrintPrescription={mockOnPrintPrescription}
          onReuseDiagnosis={mockOnReuseDiagnosis}
        />
      );

      const expandButton = screen.getByText('▶');
      
      // Expand first time
      fireEvent.click(expandButton);
      await waitFor(() => {
        expect(screen.getByText('▼')).toBeInTheDocument();
      });

      // Collapse
      const collapseButton = screen.getByText('▼');
      fireEvent.click(collapseButton);

      // Expand again
      const expandButtonAgain = screen.getByText('▶');
      fireEvent.click(expandButtonAgain);

      // Should only be called once
      expect(mockGetConsultationById).toHaveBeenCalledTimes(1);
    });
  });

  describe('Consultation Details', () => {
    it('should display full consultation details when expanded', async () => {
      mockGetConsultationById.mockResolvedValue(mockFullConsultation);

      render(
        <ConsultationTable
          consultations={[mockConsultations[0]]}
          patientId="pt1"
          onPrintPrescription={mockOnPrintPrescription}
          onReuseDiagnosis={mockOnReuseDiagnosis}
        />
      );

      const expandButton = screen.getByText('▶');
      fireEvent.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText('Vitals')).toBeInTheDocument();
        expect(screen.getByText(/98.6°F/)).toBeInTheDocument();
        expect(screen.getByText('Complaints')).toBeInTheDocument();
        expect(screen.getByText('Cough and fever')).toBeInTheDocument();
      });
    });

    it('should display medications list', async () => {
      mockGetConsultationById.mockResolvedValue(mockFullConsultation);

      render(
        <ConsultationTable
          consultations={[mockConsultations[0]]}
          patientId="pt1"
          onPrintPrescription={mockOnPrintPrescription}
          onReuseDiagnosis={mockOnReuseDiagnosis}
        />
      );

      const expandButton = screen.getByText('▶');
      fireEvent.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText(/Medications \(1\)/)).toBeInTheDocument();
        expect(screen.getByText('Paracetamol')).toBeInTheDocument();
        expect(screen.getByText(/500mg/)).toBeInTheDocument();
        expect(screen.getByText(/Twice daily/)).toBeInTheDocument();
      });
    });

    it('should display vitals warnings when present', async () => {
      mockGetConsultationById.mockResolvedValue(mockFullConsultation);

      render(
        <ConsultationTable
          consultations={[mockConsultations[0]]}
          patientId="pt1"
          onPrintPrescription={mockOnPrintPrescription}
          onReuseDiagnosis={mockOnReuseDiagnosis}
        />
      );

      const expandButton = screen.getByText('▶');
      fireEvent.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText(/⚠️ Vital Warnings/)).toBeInTheDocument();
        expect(screen.getByText('Temperature is slightly elevated')).toBeInTheDocument();
      });
    });

    it('should not display warnings when none present', async () => {
      const consultationWithoutWarnings = {
        ...mockFullConsultation,
        vitalsWarnings: {}
      };
      mockGetConsultationById.mockResolvedValue(consultationWithoutWarnings);

      render(
        <ConsultationTable
          consultations={[mockConsultations[0]]}
          patientId="pt1"
          onPrintPrescription={mockOnPrintPrescription}
          onReuseDiagnosis={mockOnReuseDiagnosis}
        />
      );

      const expandButton = screen.getByText('▶');
      fireEvent.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText('Vitals')).toBeInTheDocument();
      });

      expect(screen.queryByText(/⚠️ Vital Warnings/)).not.toBeInTheDocument();
    });

    it('should show message when no complaints recorded', async () => {
      const consultationNoComplaints = {
        ...mockFullConsultation,
        complaints: ''
      };
      mockGetConsultationById.mockResolvedValue(consultationNoComplaints);

      render(
        <ConsultationTable
          consultations={[mockConsultations[0]]}
          patientId="pt1"
          onPrintPrescription={mockOnPrintPrescription}
          onReuseDiagnosis={mockOnReuseDiagnosis}
        />
      );

      const expandButton = screen.getByText('▶');
      fireEvent.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText('No complaints recorded')).toBeInTheDocument();
      });
    });

    it('should show message when no diagnosis recorded', async () => {
      const consultationNoDiagnosis = {
        ...mockFullConsultation,
        diagnosis: ''
      };
      mockGetConsultationById.mockResolvedValue(consultationNoDiagnosis);

      render(
        <ConsultationTable
          consultations={[mockConsultations[0]]}
          patientId="pt1"
          onPrintPrescription={mockOnPrintPrescription}
          onReuseDiagnosis={mockOnReuseDiagnosis}
        />
      );

      const expandButton = screen.getByText('▶');
      fireEvent.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText('No diagnosis recorded')).toBeInTheDocument();
      });
    });

    it('should display no details message when consultation is undefined', async () => {
      mockGetConsultationById.mockResolvedValue(undefined as any);

      render(
        <ConsultationTable
          consultations={[mockConsultations[0]]}
          patientId="pt1"
          onPrintPrescription={mockOnPrintPrescription}
          onReuseDiagnosis={mockOnReuseDiagnosis}
        />
      );

      const expandButton = screen.getByText('▶');
      fireEvent.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText('No details available')).toBeInTheDocument();
      });
    });
  });

  describe('Actions', () => {
    it('should call onPrintPrescription when print button clicked', () => {
      render(
        <ConsultationTable
          consultations={[mockConsultations[0]]}
          patientId="pt1"
          onPrintPrescription={mockOnPrintPrescription}
          onReuseDiagnosis={mockOnReuseDiagnosis}
        />
      );

      const printButton = screen.getAllByText('Print')[0];
      fireEvent.click(printButton);

      expect(mockOnPrintPrescription).toHaveBeenCalledWith('c1', 'p1');
    });

    it('should disable print button when no prescription ID', () => {
      const consultationNoPrescription = {
        ...mockConsultations[0],
        prescriptionId: ''
      };

      render(
        <ConsultationTable
          consultations={[consultationNoPrescription]}
          patientId="pt1"
          onPrintPrescription={mockOnPrintPrescription}
          onReuseDiagnosis={mockOnReuseDiagnosis}
        />
      );

      const printButton = screen.getByText('Print');
      expect(printButton).toBeDisabled();
    });

    it('should call onReuseDiagnosis when reuse button clicked', async () => {
      mockGetConsultationById.mockResolvedValue(mockFullConsultation);

      render(
        <ConsultationTable
          consultations={[mockConsultations[0]]}
          patientId="pt1"
          onPrintPrescription={mockOnPrintPrescription}
          onReuseDiagnosis={mockOnReuseDiagnosis}
        />
      );

      const expandButton = screen.getByText('▶');
      fireEvent.click(expandButton);

      const reuseButton = await screen.findByText('Reuse Diagnosis');
      fireEvent.click(reuseButton);

      expect(mockOnReuseDiagnosis).toHaveBeenCalledWith('Common cold with mild fever symptoms');
    });

    it('should stop propagation when print button clicked', () => {
      render(
        <ConsultationTable
          consultations={[mockConsultations[0]]}
          patientId="pt1"
          onPrintPrescription={mockOnPrintPrescription}
          onReuseDiagnosis={mockOnReuseDiagnosis}
        />
      );

      const printButton = screen.getAllByText('Print')[0];
      const stopPropagation = jest.fn();
      
      fireEvent.click(printButton, { stopPropagation });

      // Verify row doesn't expand
      expect(screen.getByText('▶')).toBeInTheDocument();
    });
  });

  describe('Text Formatting', () => {
    it('should truncate long diagnosis text', () => {
      const longDiagnosis = 'A'.repeat(60);
      const consultationLongDiagnosis = {
        ...mockConsultations[0],
        diagnosis: longDiagnosis
      };

      render(
        <ConsultationTable
          consultations={[consultationLongDiagnosis]}
          patientId="pt1"
          onPrintPrescription={mockOnPrintPrescription}
          onReuseDiagnosis={mockOnReuseDiagnosis}
        />
      );

      const truncatedText = 'A'.repeat(40) + '...';
      expect(screen.getByText(truncatedText)).toBeInTheDocument();
    });

    it('should show dash for empty diagnosis', () => {
      const consultationEmptyDiagnosis = {
        ...mockConsultations[0],
        diagnosis: ''
      };

      render(
        <ConsultationTable
          consultations={[consultationEmptyDiagnosis]}
          patientId="pt1"
          onPrintPrescription={mockOnPrintPrescription}
          onReuseDiagnosis={mockOnReuseDiagnosis}
        />
      );

      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });
});
