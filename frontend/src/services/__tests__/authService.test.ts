import axios from 'axios';
import { login, logout } from '../authService';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should send POST request with credentials', async () => {
      const mockResponse = {
        data: {
          success: true,
          token: 'test-token',
          refreshToken: 'test-refresh-token',
          user: {
            id: '1',
            username: 'doctor',
            email: 'doctor@clinic.com',
            name: 'Dr. Smith'
          }
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await login('doctor', 'password123');

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/login', {
        username: 'doctor',
        password: 'password123'
      });

      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error on failed login', async () => {
      const mockError = {
        response: {
          data: {
            success: false,
            error: 'Invalid credentials'
          }
        }
      };

      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(login('wronguser', 'wrongpass')).rejects.toEqual(mockError);
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      mockedAxios.post.mockRejectedValueOnce(networkError);

      await expect(login('doctor', 'password123')).rejects.toThrow('Network Error');
    });
  });

  describe('logout', () => {
    it('should send POST request to logout endpoint', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Logged out successfully'
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await logout();

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/logout');
      expect(result).toEqual(mockResponse.data);
    });

    it('should include authorization header if token exists', async () => {
      const mockToken = 'test-token';
      localStorage.setItem('token', mockToken);

      mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

      await logout();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/auth/logout',
        undefined,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`
          })
        })
      );
    });
  });
});
