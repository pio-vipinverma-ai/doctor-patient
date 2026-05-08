import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { useAuth } from '../useAuth';
import { AuthProvider } from '../../context/AuthContext';
import * as authService from '../../services/authService';

jest.mock('../../services/authService');

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should provide auth context', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('login');
    expect(result.current).toHaveProperty('logout');
    expect(result.current).toHaveProperty('isLoading');
  });

  it('should login successfully', async () => {
    const mockLoginResponse = {
      token: 'test-token',
      refreshToken: 'test-refresh-token',
      user: {
        id: '1',
        username: 'doctor',
        email: 'doctor@clinic.com',
        name: 'Dr. Smith'
      }
    };

    (authService.login as jest.Mock).mockResolvedValueOnce(mockLoginResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login({ username: 'doctor', password: 'password123' });
    });

    await waitFor(() => {
      expect(result.current.user).toBeTruthy();
    });

    expect(authService.login).toHaveBeenCalled();
  });

  it('should handle login failure', async () => {
    (authService.login as jest.Mock).mockRejectedValueOnce(
      new Error('Invalid credentials')
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      try {
        await result.current.login({ username: 'wrong', password: 'wrong' });
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.user).toBeNull();
  });

  it('should logout successfully', async () => {
    const mockLoginResponse = {
      token: 'test-token',
      refreshToken: 'test-refresh-token',
      user: {
        id: '1',
        username: 'doctor',
        email: 'doctor@clinic.com',
        name: 'Dr. Smith'
      }
    };

    (authService.login as jest.Mock).mockResolvedValueOnce(mockLoginResponse);
    (authService.logout as jest.Mock).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });


    // Login first
    await act(async () => {
      await result.current.login({ username: 'doctor', password: 'password123' });
    });

    await waitFor(() => {
      expect(result.current.user).toBeTruthy();
    });

    // Now logout
    await act(async () => {
      result.current.logout();
    });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
    });
  });
});
