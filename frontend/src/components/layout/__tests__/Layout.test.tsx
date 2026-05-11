import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Layout } from '../Layout';
import { AuthProvider } from '../../../context/AuthContext';

// Mock the child components to simplify testing
jest.mock('../Header', () => ({
  Header: ({ onMenuClick }: { onMenuClick: () => void }) => (
    <div data-testid="header">
      <button onClick={onMenuClick}>Toggle Menu</button>
    </div>
  ),
}));

jest.mock('../Sidebar', () => ({
  Sidebar: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    <div data-testid="sidebar" data-open={isOpen}>
      <button onClick={onClose}>Close Sidebar</button>
    </div>
  ),
}));

describe('Layout Component', () => {
  const renderLayout = (children: React.ReactNode = <div>Test Content</div>) => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <Layout>{children}</Layout>
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('should render layout with children', () => {
    renderLayout(<div>Test Child Content</div>);

    expect(screen.getByText('Test Child Content')).toBeInTheDocument();
  });

  it('should render header component', () => {
    renderLayout();

    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('should render sidebar component', () => {
    renderLayout();

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('should render skip to content link', () => {
    renderLayout();

    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('should have main content with proper id and role', () => {
    renderLayout();

    const mainContent = screen.getByRole('main');
    expect(mainContent).toBeInTheDocument();
    expect(mainContent).toHaveAttribute('id', 'main-content');
  });

  it('should start with sidebar closed', () => {
    renderLayout();

    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveAttribute('data-open', 'false');
  });

  it('should open sidebar when header menu is clicked', () => {
    renderLayout();

    const toggleButton = screen.getByText('Toggle Menu');
    fireEvent.click(toggleButton);

    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveAttribute('data-open', 'true');
  });

  it('should close sidebar when close button is clicked', () => {
    renderLayout();

    // Open sidebar first
    const toggleButton = screen.getByText('Toggle Menu');
    fireEvent.click(toggleButton);

    // Verify it's open
    let sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveAttribute('data-open', 'true');

    // Close it
    const closeButton = screen.getByText('Close Sidebar');
    fireEvent.click(closeButton);

    // Verify it's closed
    sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveAttribute('data-open', 'false');
  });

  it('should show overlay when sidebar is open', () => {
    const { container } = renderLayout();

    // Open sidebar
    const toggleButton = screen.getByText('Toggle Menu');
    fireEvent.click(toggleButton);

    // Check for overlay
    const overlay = container.querySelector('[aria-hidden="true"]');
    expect(overlay).toBeInTheDocument();
  });

  it('should not show overlay when sidebar is closed', () => {
    const { container } = renderLayout();

    // Sidebar starts closed
    const overlay = container.querySelector('[aria-hidden="true"]');
    expect(overlay).not.toBeInTheDocument();
  });

  it('should close sidebar when overlay is clicked', () => {
    const { container } = renderLayout();

    // Open sidebar
    const toggleButton = screen.getByText('Toggle Menu');
    fireEvent.click(toggleButton);

    // Click overlay
    const overlay = container.querySelector('[aria-hidden="true"]');
    if (overlay) {
      fireEvent.click(overlay);
    }

    // Verify sidebar is closed
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveAttribute('data-open', 'false');
  });

  it('should toggle sidebar on and off multiple times', () => {
    renderLayout();

    const toggleButton = screen.getByText('Toggle Menu');
    const sidebar = screen.getByTestId('sidebar');

    // Initially closed
    expect(sidebar).toHaveAttribute('data-open', 'false');

    // Open
    fireEvent.click(toggleButton);
    expect(sidebar).toHaveAttribute('data-open', 'true');

    // Close
    fireEvent.click(toggleButton);
    expect(sidebar).toHaveAttribute('data-open', 'false');

    // Open again
    fireEvent.click(toggleButton);
    expect(sidebar).toHaveAttribute('data-open', 'true');
  });
});
