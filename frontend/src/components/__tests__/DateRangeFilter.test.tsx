import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateRangeFilter } from '../DateRangeFilter';

describe('DateRangeFilter Component', () => {
  const mockOnApply = jest.fn();
  const mockOnReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render date inputs', () => {
    render(
      <DateRangeFilter
        fromDate="2026-01-01"
        toDate="2026-05-31"
        onApply={mockOnApply}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByLabelText(/from date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/to date/i)).toBeInTheDocument();
  });

  it('should display initial date values', () => {
    render(
      <DateRangeFilter
        fromDate="2026-01-01"
        toDate="2026-05-31"
        onApply={mockOnApply}
        onReset={mockOnReset}
      />
    );

    const fromInput = screen.getByLabelText(/from date/i) as HTMLInputElement;
    const toInput = screen.getByLabelText(/to date/i) as HTMLInputElement;

    expect(fromInput.value).toBe('2026-01-01');
    expect(toInput.value).toBe('2026-05-31');
  });

  it('should update local state when dates change', () => {
    render(
      <DateRangeFilter
        fromDate="2026-01-01"
        toDate="2026-05-31"
        onApply={mockOnApply}
        onReset={mockOnReset}
      />
    );

    const fromInput = screen.getByLabelText(/from date/i) as HTMLInputElement;
    fireEvent.change(fromInput, { target: { value: '2026-02-01' } });

    expect(fromInput.value).toBe('2026-02-01');
  });

  it('should call onApply with valid dates', () => {
    render(
      <DateRangeFilter
        fromDate="2026-01-01"
        toDate="2026-05-31"
        onApply={mockOnApply}
        onReset={mockOnReset}
      />
    );

    const applyButton = screen.getByText(/apply filter/i);
    fireEvent.click(applyButton);

    expect(mockOnApply).toHaveBeenCalledWith('2026-01-01', '2026-05-31');
  });

  it('should call onReset when reset button clicked', () => {
    render(
      <DateRangeFilter
        fromDate="2026-01-01"
        toDate="2026-05-31"
        onApply={mockOnApply}
        onReset={mockOnReset}
      />
    );

    const resetButton = screen.getByText(/reset/i);
    fireEvent.click(resetButton);

    expect(mockOnReset).toHaveBeenCalled();
  });

  it('should show alert when from date is after to date', () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <DateRangeFilter
        fromDate="2026-05-31"
        toDate="2026-01-01"
        onApply={mockOnApply}
        onReset={mockOnReset}
      />
    );

    const applyButton = screen.getByText(/apply filter/i);
    fireEvent.click(applyButton);

    expect(alertMock).toHaveBeenCalledWith('From date cannot be after To date');
    expect(mockOnApply).not.toHaveBeenCalled();

    alertMock.mockRestore();
  });

  it('should disable inputs when loading', () => {
    render(
      <DateRangeFilter
        fromDate="2026-01-01"
        toDate="2026-05-31"
        onApply={mockOnApply}
        onReset={mockOnReset}
        isLoading={true}
      />
    );

    const fromInput = screen.getByLabelText(/from date/i);
    const toInput = screen.getByLabelText(/to date/i);
    const applyButton = screen.getByText(/filtering/i);

    expect(fromInput).toBeDisabled();
    expect(toInput).toBeDisabled();
    expect(applyButton).toBeDisabled();
  });

  it('should show "Filtering..." text when loading', () => {
    render(
      <DateRangeFilter
        fromDate="2026-01-01"
        toDate="2026-05-31"
        onApply={mockOnApply}
        onReset={mockOnReset}
        isLoading={true}
      />
    );

    expect(screen.getByText('Filtering...')).toBeInTheDocument();
  });

  it('should update local dates when props change', () => {
    const { rerender } = render(
      <DateRangeFilter
        fromDate="2026-01-01"
        toDate="2026-05-31"
        onApply={mockOnApply}
        onReset={mockOnReset}
      />
    );

    const fromInput = screen.getByLabelText(/from date/i) as HTMLInputElement;
    expect(fromInput.value).toBe('2026-01-01');

    rerender(
      <DateRangeFilter
        fromDate="2026-02-01"
        toDate="2026-06-30"
        onApply={mockOnApply}
        onReset={mockOnReset}
      />
    );

    expect(fromInput.value).toBe('2026-02-01');
  });
});
