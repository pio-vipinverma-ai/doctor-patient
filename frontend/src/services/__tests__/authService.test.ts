import axios from 'axios';
import {
  login,
  logout,
  getProfile,
  storeToken,
  getToken,
  getRefreshToken,
  removeTokens,
  isTokenExpired
} from '../authService';

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

  describe('getProfile', () => {
    it('should fetch user profile with token', async () => {
      const mockUser = {
        id: '1',
        username: 'doctor',
        email: 'doctor@clinic.com',
        name: 'Dr. Smith'
      };

      mockedAxios.get.mockResolvedValueOnce({ data: { user: mockUser } });

      const result = await getProfile('test-token');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:5000/api/auth/profile',
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token' }
        })
      );

      expect(result).toEqual(mockUser);
    });

    it('should throw error on 401 unauthorized', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 401, data: { error: 'Unauthorized' } }
      });

      await expect(getProfile('invalid-token'))
        .rejects.toThrow('Unauthorized');
    });

    it('should throw generic error on non-401 failures', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 500, data: { error: 'Server error' } }
      });

      await expect(getProfile('test-token'))
        .rejects.toThrow('Failed to fetch profile');
    });
  });

  describe('token storage utilities', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

    describe('storeToken', () => {
      it('should store token in localStorage', () => {
        storeToken('test-token', 'test-refresh-token');

        expect(localStorage.getItem('token')).toBe('test-token');
        expect(localStorage.getItem('refreshToken')).toBe('test-refresh-token');
      });

      it('should overwrite existing tokens', () => {
        localStorage.setItem('token', 'old-token');
        localStorage.setItem('refreshToken', 'old-refresh-token');

        storeToken('new-token', 'new-refresh-token');

        expect(localStorage.getItem('token')).toBe('new-token');
        expect(localStorage.getItem('refreshToken')).toBe('new-refresh-token');
      });
    });

    describe('getToken', () => {
      it('should retrieve token from localStorage', () => {
        localStorage.setItem('token', 'test-token');

        const token = getToken();

        expect(token).toBe('test-token');
      });

      it('should return null if token does not exist', () => {
        const token = getToken();

        expect(token).toBeNull();
      });
    });

    describe('getRefreshToken', () => {
      it('should retrieve refresh token from localStorage', () => {
        localStorage.setItem('refreshToken', 'test-refresh-token');

        const refreshToken = getRefreshToken();

        expect(refreshToken).toBe('test-refresh-token');
      });

      it('should return null if refresh token does not exist', () => {
        const refreshToken = getRefreshToken();

        expect(refreshToken).toBeNull();
      });
    });

    describe('removeTokens', () => {
      it('should remove both tokens from localStorage', () => {
        localStorage.setItem('token', 'test-token');
        localStorage.setItem('refreshToken', 'test-refresh-token');

        removeTokens();

        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('refreshToken')).toBeNull();
      });

      it('should not throw error if tokens do not exist', () => {
        expect(() => removeTokens()).not.toThrow();
      });
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for valid token', () => {
      // Create a token that expires in 1 hour
      const futureTimestamp = Math.floor(Date.now() / 1000) + 3600;
      const validToken = `header.${btoa(JSON.stringify({ exp: futureTimestamp }))}.signature`;

      const expired = isTokenExpired(validToken);

      expect(expired).toBe(false);
    });

    it('should return true for expired token', () => {
      // Create a token that expired 1 hour ago
      const pastTimestamp = Math.floor(Date.now() / 1000) - 3600;
      const expiredToken = `header.${btoa(JSON.stringify({ exp: pastTimestamp }))}.signature`;

      const expired = isTokenExpired(expiredToken);

      expect(expired).toBe(true);
    });

    it('should return true for malformed token', () => {
      const malformedToken = 'not-a-valid-jwt';

      const expired = isTokenExpired(malformedToken);

      expect(expired).toBe(true);
    });

    it('should return false for token without exp field', () => {
      // Token without exp field: payload.exp * 1000 = NaN, Date.now() >= NaN = false
      const tokenWithoutExp = `header.${btoa(JSON.stringify({ sub: 'user123' }))}.signature`;

      const expired = isTokenExpired(tokenWithoutExp);

      expect(expired).toBe(false);
    });

    it('should return true for empty token', () => {
      const expired = isTokenExpired('');

      expect(expired).toBe(true);
    });
  });
});
