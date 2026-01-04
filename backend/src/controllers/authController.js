/**
 * Authentication Controller
 * Handles auth endpoints
 */

import { asyncHandler } from '../middleware/errorMiddleware.js';
import { registerUser, loginUser, getUserById } from '../services/authService.js';

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, organizationName } = req.body;

  const result = await registerUser(name, email, password, organizationName);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: result,
  });
});

/**
 * Login user
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await loginUser(email, password);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result,
  });
});

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user.userId);

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId._id,
        createdAt: user.createdAt,
      },
      organization: {
        id: user.tenantId._id,
        name: user.tenantId.name,
      },
    },
  });
});

/**
 * Logout user (client-side handling)
 * POST /api/auth/logout
 */
export const logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});
