import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToastContainer } from '../ToastContainer';
import { ToastProvider, useToast } from '../../context/ToastContext';

// Test component to trigger toasts
const TestComponent: React.FC = () => {
  const { showToast } = useToast();

  return (
    <div>
      <button onClick={() => showToast('Success message', 'success')}>
        Add Success
      </button>
      <button onClick={() => showToast('Error message', 'error')}>
        Add Error
      </button>
      <button onClick={() => showToast('Warning message', 'warning')}>
        Add Warning
      </button>
      <button onClick={() => showToast('Info message', 'info')}>
        Add Info
      </button>
    </div>
  );
};

describe('ToastContainer Component', () => {
  it('should render toast container', () => {
    render(
      <ToastProvider>
        <ToastContainer />
      </ToastProvider>
    );

    const container = screen.getByRole('region', { name: /notifications/i });
    expect(container).toBeInTheDocument();
  });

  it('should display success toast', () => {
    render(
      <ToastProvider>
        <ToastContainer />
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Add Success'));
    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('should display error toast', () => {
    render(
      <ToastProvider>
        <ToastContainer />
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Add Error'));
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getByText('✕')).toBeInTheDocument();
  });

  it('should display warning toast', () => {
    render(
      <ToastProvider>
        <ToastContainer />
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Add Warning'));
    expect(screen.getByText('Warning message')).toBeInTheDocument();
    expect(screen.getByText('⚠')).toBeInTheDocument();
  });

  it('should display info toast', () => {
    render(
      <ToastProvider>
        <ToastContainer />
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Add Info'));
    expect(screen.getByText('Info message')).toBeInTheDocument();
    expect(screen.getByText('ℹ')).toBeInTheDocument();
  });

  it('should display multiple toasts', () => {
    render(
      <ToastProvider>
        <ToastContainer />
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Add Success'));
    fireEvent.click(screen.getByText('Add Error'));

    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('should close toast when close button clicked', () => {
    render(
      <ToastProvider>
        <ToastContainer />
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Add Success'));
    expect(screen.getByText('Success message')).toBeInTheDocument();

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
  });

  it('should have correct ARIA attributes', () => {
    render(
      <ToastProvider>
        <ToastContainer />
      </ToastProvider>
    );

    const container = screen.getByRole('region', { name: /notifications/i });
    expect(container).toHaveAttribute('aria-live', 'polite');
    expect(container).toHaveAttribute('aria-label', 'Notifications');
  });

  it('should handle rapid toast additions', () => {
    render(
      <ToastProvider>
        <ToastContainer />
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Add Success'));
    fireEvent.click(screen.getByText('Add Error'));
    fireEvent.click(screen.getByText('Add Warning'));

    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getByText('Warning message')).toBeInTheDocument();
  });

  it('should close correct toast when multiple are shown', () => {
    render(
      <ToastProvider>
        <ToastContainer />
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Add Success'));
    fireEvent.click(screen.getByText('Add Error'));

    const closeButtons = screen.getAllByLabelText('Close');
    fireEvent.click(closeButtons[0]);

    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });
});
