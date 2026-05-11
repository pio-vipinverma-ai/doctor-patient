import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: ({ to }: { to: string }) => {
    mockNavigate(to);
    return <div>Navigating to {to}</div>;
  },
}));

jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from '../../hooks/useAuth';

describe('ProtectedRoute Component', () => {
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children when authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { userId: '1', username: 'admin', email: 'admin@example.com' },
      login: jest.fn(),
      logout: jest.fn(),
      loading: false,
    });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      loading: false,
    });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText(/navigating to \/login/i)).toBeInTheDocument();
  });

  it('should show loading state while checking authentication', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      loading: true,
    });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should not render protected content when loading', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: true,
      user: { userId: '1', username: 'admin', email: 'admin@example.com' },
      login: jest.fn(),
      logout: jest.fn(),
      loading: true,
    });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
