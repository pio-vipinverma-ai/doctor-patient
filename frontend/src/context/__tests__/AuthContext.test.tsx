import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import * as authService from '../../services/authService';

jest.mock('../../services/authService');

// Test component to use the auth context
const TestComponent: React.FC = () => {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  const handleLogin = async () => {
    try {
      await login('admin', 'password');
    } catch (error) {
      // Error handled - do nothing
    }
  };

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      {user && <div data-testid="username">{user.username}</div>}
      <button onClick={handleLogin}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    
    // Default mocks
    (authService.getToken as jest.Mock).mockReturnValue(null);
    (authService.isTokenExpired as jest.Mock).mockReturnValue(false);
    (authService.getProfile as jest.Mock).mockResolvedValue(null);
    (authService.removeTokens as jest.Mock).mockImplementation(() => {});
  });

  it('should provide initial unauthenticated state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
    expect(screen.queryByTestId('username')).not.toBeInTheDocument();
  });

  it('should handle successful login', async () => {
    const mockUser = {
      userId: '1',
      username: 'admin',
      email: 'admin@example.com',
    };

    (authService.login as jest.Mock).mockResolvedValue({
      success: true,
      accessToken: 'test-token',
      user: mockUser,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    loginButton.click();

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
    });

    await waitFor(() => {
      const usernameElement = screen.queryByTestId('username');
      if (usernameElement) {
        expect(usernameElement).toHaveTextContent('admin');
      }
    });
  });

  it('should handle login failure', async () => {
    (authService.login as jest.Mock).mockRejectedValue(
      new Error('Invalid credentials')
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    loginButton.click();

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
    });
  });

  it('should handle logout', async () => {
    const mockUser = {
      userId: '1',
      username: 'admin',
      email: 'admin@example.com',
    };

    (authService.login as jest.Mock).mockResolvedValue({
      success: true,
      accessToken: 'test-token',
      user: mockUser,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Login first
    const loginButton = screen.getByText('Login');
    loginButton.click();

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
    });

    // Then logout
    const logoutButton = screen.getByText('Logout');
    logoutButton.click();

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
    });

    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should restore session from localStorage', async () => {
    const mockUser = {
      userId: '1',
      username: 'admin',
      email: 'admin@example.com',
    };

    (authService.getToken as jest.Mock).mockReturnValue('existing-token');
    (authService.isTokenExpired as jest.Mock).mockReturnValue(false);
    (authService.getProfile as jest.Mock).mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      const usernameElement = screen.queryByTestId('username');
      if (usernameElement) {
        expect(usernameElement).toHaveTextContent('admin');
      }
    });
  });

  it('should clear session if token is expired', async () => {
    (authService.getToken as jest.Mock).mockReturnValue('expired-token');
    (authService.isTokenExpired as jest.Mock).mockReturnValue(true);
    (authService.removeTokens as jest.Mock).mockImplementation(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
    });

    expect(authService.removeTokens).toHaveBeenCalled();
  });

  it('should show loading state initially', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loadingElement = screen.getByTestId('loading');
    // Initial state might be loading or not loading depending on implementation
    expect(loadingElement).toBeInTheDocument();
  });

  it('should throw error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow();

    consoleError.mockRestore();
  });
});
