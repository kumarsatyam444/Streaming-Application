/**
 * User Controller
 * Handles user management endpoints
 */

import { asyncHandler } from '../middleware/errorMiddleware.js';
import {
  getUsersByTenant,
  updateUserRole,
  deactivateUser,
  activateUser,
  getUserDetails,
} from '../services/userService.js';

/**
 * Get all users in tenant
 * GET /api/users
 */
export const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const result = await getUsersByTenant(req.user.tenantId, parseInt(page), parseInt(limit));

  res.status(200).json({
    success: true,
    data: result.users,
    pagination: result.pagination,
  });
});

/**
 * Get user by ID
 * GET /api/users/:id
 */
export const getUser = asyncHandler(async (req, res) => {
  const user = await getUserDetails(req.params.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * Update user role
 * PATCH /api/users/:id/role
 */
export const updateRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  const user = await updateUserRole(req.params.id, role, req.user.tenantId, req.user.role);

  res.status(200).json({
    success: true,
    message: 'User role updated successfully',
    data: user,
  });
});

/**
 * Deactivate user
 * PATCH /api/users/:id/deactivate
 */
export const deactivateUserHandler = asyncHandler(async (req, res) => {
  const user = await deactivateUser(req.params.id, req.user.tenantId, req.user.role);

  res.status(200).json({
    success: true,
    message: 'User deactivated successfully',
    data: user,
  });
});

/**
 * Activate user
 * PATCH /api/users/:id/activate
 */
export const activateUserHandler = asyncHandler(async (req, res) => {
  const user = await activateUser(req.params.id, req.user.tenantId, req.user.role);

  res.status(200).json({
    success: true,
    message: 'User activated successfully',
    data: user,
  });
});
