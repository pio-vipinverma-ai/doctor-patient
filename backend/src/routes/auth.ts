import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * POST /api/auth/login
 * Login with username/password
 */
router.post('/login', authController.loginController);

/**
 * POST /api/auth/logout
 * Logout current user (protected)
 */
router.post('/logout', authenticate, authController.logoutController);

/**
 * GET /api/auth/profile
 * Get current user profile (protected)
 */
router.get('/profile', authenticate, authController.getProfileController);

export default router;
