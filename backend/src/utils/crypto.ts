import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10; // bcrypt salt rounds (10 is recommended balance of speed and security)

/**
 * Hash a plain text password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password string
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.error('[Crypto] Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
};

/**
 * Compare plain text password with hashed password
 * @param password - Plain text password to check
 * @param hashedPassword - Hashed password from database
 * @returns True if passwords match, false otherwise
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error('[Crypto] Error comparing password:', error);
    throw new Error('Failed to compare password');
  }
};

/**
 * Validate password meets minimum requirements
 * @param password - Password to validate
 * @returns Object with valid flag and error message
 */
export const validatePassword = (
  password: string
): { valid: boolean; error?: string } => {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < 6) {
    return {
      valid: false,
      error: 'Password must be at least 6 characters long',
    };
  }

  if (password.length > 100) {
    return { valid: false, error: 'Password must be less than 100 characters' };
  }

  return { valid: true };
};
