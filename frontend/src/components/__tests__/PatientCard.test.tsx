import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PatientCard } from '../PatientCard';
import { PatientSearchResult } from '../../services/patientService';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('PatientCard Component', () => {
  const mockPatient: PatientSearchResult = {
    id: '1',
    name: 'John Doe',
    phone: '1234567890',
    gender: 'M',
    age: 35,
    lastVisit: '2026-05-01T10:00:00Z',
  };

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('should render patient information correctly', () => {
    render(
      <BrowserRouter>
        <PatientCard patient={mockPatient} />
      </BrowserRouter>
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('M')).toBeInTheDocument();
    expect(screen.getByText('35 years')).toBeInTheDocument();
    expect(screen.getByText('1234567890')).toBeInTheDocument();
  });

  it('should format last visit date correctly', () => {
    render(
      <BrowserRouter>
        <PatientCard patient={mockPatient} />
      </BrowserRouter>
    );

    expect(screen.getByText(/May 1, 2026/)).toBeInTheDocument();
  });

  it('should display "No visits yet" when lastVisit is null', () => {
    const patientNoVisit = { ...mockPatient, lastVisit: null };
    
    render(
      <BrowserRouter>
        <PatientCard patient={patientNoVisit} />
      </BrowserRouter>
    );

    expect(screen.getByText('No visits yet')).toBeInTheDocument();
  });

  it('should navigate to patient profile on click', () => {
    render(
      <BrowserRouter>
        <PatientCard patient={mockPatient} />
      </BrowserRouter>
    );

    const card = screen.getByText('John Doe').closest('div');
    if (card?.parentElement) {
      fireEvent.click(card.parentElement);
      expect(mockNavigate).toHaveBeenCalledWith('/patients/1');
    }
  });

  it('should render female patient correctly', () => {
    const femalePatient = { ...mockPatient, gender: 'F' as const };
    
    render(
      <BrowserRouter>
        <PatientCard patient={femalePatient} />
      </BrowserRouter>
    );

    expect(screen.getByText('F')).toBeInTheDocument();
  });

  it('should display correct age for different patients', () => {
    const youngPatient = { ...mockPatient, age: 22 };
    
    render(
      <BrowserRouter>
        <PatientCard patient={youngPatient} />
      </BrowserRouter>
    );

    expect(screen.getByText('22 years')).toBeInTheDocument();
  });

  it('should handle different phone formats', () => {
    const patientWithPhone = { ...mockPatient, phone: '9876543210' };
    
    render(
      <BrowserRouter>
        <PatientCard patient={patientWithPhone} />
      </BrowserRouter>
    );

    expect(screen.getByText('9876543210')).toBeInTheDocument();
  });
});
