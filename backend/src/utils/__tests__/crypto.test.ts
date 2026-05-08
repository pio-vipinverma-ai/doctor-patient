import * as crypto from '../crypto';
import bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('Crypto Utils', () => {
  const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash password successfully', async () => {
      const password = 'testPassword123';
      const salt = '$2a$10$abcdefghijklmnopqrstuv';
      const hashedPassword = '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890';

      mockBcrypt.genSalt = jest.fn().mockResolvedValue(salt);
      mockBcrypt.hash = jest.fn().mockResolvedValue(hashedPassword);

      const result = await crypto.hashPassword(password);

      expect(result).toBe(hashedPassword);
      expect(mockBcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, salt);
    });

    it('should throw error when hashing fails', async () => {
      mockBcrypt.genSalt = jest.fn().mockRejectedValue(new Error('Bcrypt error'));

      await expect(crypto.hashPassword('testPassword123')).rejects.toThrow('Failed to hash password');
    });

    it('should handle bcrypt.hash errors', async () => {
      const password = 'testPassword123';
      const salt = '$2a$10$abcdefghijklmnopqrstuv';

      mockBcrypt.genSalt = jest.fn().mockResolvedValue(salt);
      mockBcrypt.hash = jest.fn().mockRejectedValue(new Error('Hash error'));

      await expect(crypto.hashPassword(password)).rejects.toThrow('Failed to hash password');
    });
  });

  describe('comparePassword', () => {
    it('should return true when passwords match', async () => {
      const password = 'testPassword123';
      const hashedPassword = '$2a$10$hashedpassword';

      mockBcrypt.compare = jest.fn().mockResolvedValue(true as never);

      const result = await crypto.comparePassword(password, hashedPassword);

      expect(result).toBe(true);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('should return false when passwords do not match', async () => {
      const password = 'wrongPassword';
      const hashedPassword = '$2a$10$hashedpassword';

      mockBcrypt.compare = jest.fn().mockResolvedValue(false as never);

      const result = await crypto.comparePassword(password, hashedPassword);

      expect(result).toBe(false);
    });

    it('should throw error when comparison fails', async () => {
      const password = 'testPassword123';
      const hashedPassword = '$2a$10$hashedpassword';

      mockBcrypt.compare = jest.fn().mockRejectedValue(new Error('Comparison error'));

      await expect(crypto.comparePassword(password, hashedPassword)).rejects.toThrow('Failed to compare password');
    });
  });

  describe('validatePassword', () => {
    it('should return valid for strong password', () => {
      const result = crypto.validatePassword('StrongPass123');

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty password', () => {
      const result = crypto.validatePassword('');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Password is required');
    });

    it('should reject password shorter than 6 characters', () => {
      const result = crypto.validatePassword('12345');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Password must be at least 6 characters long');
    });

    it('should reject password longer than 100 characters', () => {
      const longPassword = 'a'.repeat(101);
      const result = crypto.validatePassword(longPassword);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Password must be less than 100 characters');
    });

    it('should accept password with exactly 6 characters', () => {
      const result = crypto.validatePassword('123456');

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept password with exactly 100 characters', () => {
      const password = 'a'.repeat(100);
      const result = crypto.validatePassword(password);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
});
