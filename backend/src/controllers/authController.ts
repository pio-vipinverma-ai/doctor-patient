/// <reference path="../types/express.d.ts" />
import { Request, Response } from 'express';
import * as authService from '../services/authService';

/**
 * POST /api/auth/login
 * Authenticate user and return JWT tokens
 */
export const loginController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Validate input
    const validation = authService.validateLoginCredentials(username, password);
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        error: validation.error,
      });
      return;
    }

    // Authenticate user
    const loginResponse = await authService.login(username, password);

    res.status(200).json(loginResponse);
  } catch (error) {
    console.error('[AuthController] Login error:', error);

    if (error instanceof Error && error.message === 'Invalid username or password') {
      res.status(401).json({
        success: false,
        error: 'Invalid username or password',
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to authenticate user',
    });
  }
};

/**
 * POST /api/auth/logout
 * Logout user (clear session)
 * Note: With JWT, logout is typically handled client-side by removing token
 */
export const logoutController = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // The client should remove/delete the token from storage
    // Server can optionally maintain a blacklist of tokens (advanced)

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('[AuthController] Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to logout',
    });
  }
};

/**
 * GET /api/auth/profile
 * Get current user profile (protected route)
 */
export const getProfileController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
      return;
    }

    // Fetch full user data from database
    const user = await authService.getUserById(req.user.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('[AuthController] Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch user profile',
    });
  }
};
