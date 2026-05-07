import { pool } from '../config/database';
import { comparePassword } from '../utils/crypto';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    email: string;
    name: string;
  };
}

/**
 * Authenticate user with username/password
 * @param username - Username or email
 * @param password - Plain text password
 * @returns Login response with tokens and user data
 */
export const login = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  try {
    // Find user by username or email
    const query = `
      SELECT id, username, email, password_hash, name, created_at, updated_at
      FROM users
      WHERE username = $1 OR email = $1
      LIMIT 1
    `;

    const result = await pool.query(query, [username]);

    if (result.rows.length === 0) {
      throw new Error('Invalid username or password');
    }

    const user: User = result.rows[0];

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);

    if (!isValidPassword) {
      throw new Error('Invalid username or password');
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
    };

    const token = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Return user data (without password)
    return {
      success: true,
      token,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
      },
    };
  } catch (error) {
    console.error('[AuthService] Login error:', error);
    throw error;
  }
};

/**
 * Get user by ID
 * @param userId - User ID
 * @returns User data without password
 */
export const getUserById = async (
  userId: string
): Promise<Omit<User, 'password_hash'> | null> => {
  try {
    const query = `
      SELECT id, username, email, name, created_at, updated_at
      FROM users
      WHERE id = $1
      LIMIT 1
    `;

    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('[AuthService] Get user error:', error);
    throw error;
  }
};

/**
 * Validate login credentials
 * @param username - Username or email
 * @param password - Password
 * @returns Validation result with error message if invalid
 */
export const validateLoginCredentials = (
  username: string,
  password: string
): { valid: boolean; error?: string } => {
  if (!username || username.trim() === '') {
    return { valid: false, error: 'Username is required' };
  }

  if (!password || password.trim() === '') {
    return { valid: false, error: 'Password is required' };
  }

  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }

  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters' };
  }

  return { valid: true };
};
