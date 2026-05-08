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

      const result = await login({ username: 'doctor', password: 'password123' });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:5000/api/auth/login',
        { username: 'doctor', password: 'password123' },
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' }
        })
      );

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

      await expect(login({ username: 'wronguser', password: 'wrongpass' }))
        .rejects.toThrow('Invalid credentials');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      mockedAxios.post.mockRejectedValueOnce(networkError);

      await expect(login({ username: 'doctor', password: 'password123' }))
        .rejects.toThrow('Login failed. Please try again.');
    });
  });

  describe('logout', () => {
    it('should send POST request to logout endpoint with token', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

      await logout('test-token');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:5000/api/auth/logout',
        {},
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token' }
        })
      );
    });

    it('should not throw error even if logout fails', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

      await expect(logout('test-token')).resolves.not.toThrow();
    });

    it('should handle empty token in logout', async () => {
      await expect(logout('')).resolves.not.toThrow();
    });

    it('should handle null token in logout', async () => {
      await expect(logout(null as any)).resolves.not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle malformed error response', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: { data: null }
      });

      await expect(login({ username: 'test', password: 'test' }))
        .rejects.toThrow();
    });

    it('should handle timeout error', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        code: 'ECONNABORTED',
        message: 'timeout exceeded'
      });

      await expect(login({ username: 'test', password: 'test' }))
        .rejects.toThrow();
    });

    it('should handle 401 unauthorized', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          status: 401,
          data: { error: 'Unauthorized' }
        }
      });

      await expect(login({ username: 'test', password: 'test' }))
        .rejects.toThrow('Unauthorized');
    });

    it('should handle 500 server error', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          status: 500,
          data: { error: 'Internal server error' }
        }
      });

      await expect(login({ username: 'test', password: 'test' }))
        .rejects.toThrow();
    });
  });
});
