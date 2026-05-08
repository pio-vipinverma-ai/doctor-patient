import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { AuthProvider } from '../../context/AuthContext';
import * as authService from '../../services/authService';

jest.mock('../../services/authService');

describe('useAuth hook', () => {
  const mockLocalStorage: Record<string, string> = {};

  beforeAll(() => {
    // Mock localStorage
    global.Storage.prototype.getItem = jest.fn((key) => mockLocalStorage[key] || null);
    global.Storage.prototype.setItem = jest.fn((key, value) => {
      mockLocalStorage[key] = value;
    });
    global.Storage.prototype.removeItem = jest.fn((key) => {
      delete mockLocalStorage[key];
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]);
  });

  it('should initialize with no user when not authenticated', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should login successfully and set user', async () => {
    const mockLoginResponse = {
      success: true,
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

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await act(async () => {
      await result.current.login('doctor', 'password123');
    });

    expect(result.current.user).toEqual(mockLoginResponse.user);
    expect(authService.login).toHaveBeenCalledWith('doctor', 'password123');
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'test-token');
    expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'test-refresh-token');
  });

  it('should throw error on login failure', async () => {
    (authService.login as jest.Mock).mockRejectedValueOnce(
      new Error('Invalid credentials')
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await expect(
      act(async () => {
        await result.current.login('wronguser', 'wrongpass');
      })
    ).rejects.toThrow('Invalid credentials');

    expect(result.current.user).toBeNull();
  });

  it('should logout and clear user data', async () => {
    const mockLoginResponse = {
      success: true,
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

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    // Login first
    await act(async () => {
      await result.current.login('doctor', 'password123');
    });

    expect(result.current.user).not.toBeNull();

    // Now logout
    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
  });

  it('should restore user from localStorage on mount', () => {
    const storedUser = {
      id: '1',
      username: 'doctor',
      email: 'doctor@clinic.com',
      name: 'Dr. Smith'
    };

    mockLocalStorage['user'] = JSON.stringify(storedUser);
    mockLocalStorage['token'] = 'stored-token';

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    expect(result.current.user).toEqual(storedUser);
  });

  it('should set loading state during login', async () => {
    (authService.login as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        success: true,
        token: 'test-token',
        refreshToken: 'test-refresh-token',
        user: { id: '1', username: 'doctor', email: 'doctor@clinic.com', name: 'Dr. Smith' }
      }), 100))
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    act(() => {
      result.current.login('doctor', 'password123');
    });

    // Check loading state immediately
    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    // Wait for login to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
