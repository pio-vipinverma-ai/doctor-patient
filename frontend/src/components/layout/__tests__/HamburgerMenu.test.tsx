import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { HamburgerMenu } from '../HamburgerMenu';

describe('HamburgerMenu Component', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render hamburger button', () => {
    render(<HamburgerMenu isOpen={false} onClick={mockOnClick} />);

    const button = screen.getByRole('button', { name: /menu/i });
    expect(button).toBeInTheDocument();
  });

  it('should show "Open menu" label when closed', () => {
    render(<HamburgerMenu isOpen={false} onClick={mockOnClick} />);

    expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
  });

  it('should show "Close menu" label when open', () => {
    render(<HamburgerMenu isOpen={true} onClick={mockOnClick} />);

    expect(screen.getByLabelText('Close menu')).toBeInTheDocument();
  });

  it('should have aria-expanded false when closed', () => {
    render(<HamburgerMenu isOpen={false} onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('should have aria-expanded true when open', () => {
    render(<HamburgerMenu isOpen={true} onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('should call onClick when clicked', () => {
    render(<HamburgerMenu isOpen={false} onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should apply open class when isOpen is true', () => {
    const { container } = render(<HamburgerMenu isOpen={true} onClick={mockOnClick} />);

    const button = container.querySelector('button');
    expect(button?.className).toContain('open');
  });

  it('should not apply open class when isOpen is false', () => {
    const { container } = render(<HamburgerMenu isOpen={false} onClick={mockOnClick} />);

    const button = container.querySelector('button');
    expect(button?.className).not.toContain('open');
  });

  it('should render three lines for hamburger icon', () => {
    const { container } = render(<HamburgerMenu isOpen={false} onClick={mockOnClick} />);

    const lines = container.querySelectorAll('.line');
    expect(lines.length).toBe(3);
  });

  it('should be accessible via keyboard', () => {
    render(<HamburgerMenu isOpen={false} onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    button.focus();
    expect(button).toHaveFocus();
  });
});
