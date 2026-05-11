import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { Sidebar } from '../Sidebar';

describe('Sidebar Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all navigation items', () => {
    render(
      <BrowserRouter>
        <Sidebar isOpen={true} onClose={mockOnClose} />
      </BrowserRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Patients')).toBeInTheDocument();
    expect(screen.getByText('Appointments')).toBeInTheDocument();
    expect(screen.getByText('Consultations')).toBeInTheDocument();
    expect(screen.getByText('Export Data')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('should apply open class when isOpen is true', () => {
    const { container } = render(
      <BrowserRouter>
        <Sidebar isOpen={true} onClose={mockOnClose} />
      </BrowserRouter>
    );

    const sidebar = container.querySelector('aside');
    expect(sidebar?.className).toContain('open');
  });

  it('should not apply open class when isOpen is false', () => {
    const { container } = render(
      <BrowserRouter>
        <Sidebar isOpen={false} onClose={mockOnClose} />
      </BrowserRouter>
    );

    const sidebar = container.querySelector('aside');
    expect(sidebar?.className).not.toContain('open');
  });

  it('should highlight active route', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Sidebar isOpen={true} onClose={mockOnClose} />
      </MemoryRouter>
    );

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveAttribute('aria-current', 'page');
    expect(dashboardLink?.className).toContain('active');
  });

  it('should highlight active route when pathname starts with route', () => {
    render(
      <MemoryRouter initialEntries={['/patients/search?query=test']}>
        <Sidebar isOpen={true} onClose={mockOnClose} />
      </MemoryRouter>
    );

    const patientsLink = screen.getByText('Patients').closest('a');
    expect(patientsLink?.className).toContain('active');
  });

  it('should call onClose when a nav item is clicked', () => {
    render(
      <BrowserRouter>
        <Sidebar isOpen={true} onClose={mockOnClose} />
      </BrowserRouter>
    );

    const dashboardLink = screen.getByText('Dashboard');
    fireEvent.click(dashboardLink);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should have proper navigation roles and labels', () => {
    render(
      <BrowserRouter>
        <Sidebar isOpen={true} onClose={mockOnClose} />
      </BrowserRouter>
    );

    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
    expect(screen.getByLabelText('Primary')).toBeInTheDocument();
  });

  it('should render icons for each nav item', () => {
    const { container } = render(
      <BrowserRouter>
        <Sidebar isOpen={true} onClose={mockOnClose} />
      </BrowserRouter>
    );

    // Check that icons are rendered (they should have aria-hidden="true")
    const icons = container.querySelectorAll('[aria-hidden="true"]');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('should not have aria-current on non-active routes', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Sidebar isOpen={true} onClose={mockOnClose} />
      </MemoryRouter>
    );

    const patientsLink = screen.getByText('Patients').closest('a');
    expect(patientsLink).not.toHaveAttribute('aria-current');
  });

  it('should render correct link paths', () => {
    render(
      <BrowserRouter>
        <Sidebar isOpen={true} onClose={mockOnClose} />
      </BrowserRouter>
    );

    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/dashboard');
    expect(screen.getByText('Patients').closest('a')).toHaveAttribute('href', '/patients/search');
    expect(screen.getByText('Appointments').closest('a')).toHaveAttribute('href', '/appointments');
    expect(screen.getByText('Consultations').closest('a')).toHaveAttribute('href', '/consultations');
    expect(screen.getByText('Export Data').closest('a')).toHaveAttribute('href', '/export');
    expect(screen.getByText('Reports').closest('a')).toHaveAttribute('href', '/reports');
  });
});
