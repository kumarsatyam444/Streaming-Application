/**
 * User Service
 * Handles user management for admin operations
 */

import User from '../models/User.js';
import { NotFoundError, ValidationError, AuthorizationError } from '../utils/errorHandler.js';
import { ROLES } from '../config/constants.js';

/**
 * Get all users in a tenant
 */
export const getUsersByTenant = async (tenantId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const users = await User.find({ tenantId })
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments({ tenantId });

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Update user role
 */
export const updateUserRole = async (userId, newRole, tenantId, requesterRole) => {
  // Only admin can update roles
  if (requesterRole !== ROLES.ADMIN) {
    throw new AuthorizationError('Only admins can update user roles');
  }

  // Validate role
  if (!Object.values(ROLES).includes(newRole)) {
    throw new ValidationError(`Invalid role: ${newRole}`);
  }

  const user = await User.findOneAndUpdate(
    { _id: userId, tenantId },
    { role: newRole },
    { new: true }
  );

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
};

/**
 * Deactivate user
 */
export const deactivateUser = async (userId, tenantId, requesterRole) => {
  if (requesterRole !== ROLES.ADMIN) {
    throw new AuthorizationError('Only admins can deactivate users');
  }

  const user = await User.findOneAndUpdate(
    { _id: userId, tenantId },
    { isActive: false },
    { new: true }
  );

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
};

/**
 * Activate user
 */
export const activateUser = async (userId, tenantId, requesterRole) => {
  if (requesterRole !== ROLES.ADMIN) {
    throw new AuthorizationError('Only admins can activate users');
  }

  const user = await User.findOneAndUpdate(
    { _id: userId, tenantId },
    { isActive: true },
    { new: true }
  );

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
};

/**
 * Get user details
 */
export const getUserDetails = async (userId) => {
  const user = await User.findById(userId)
    .select('-password')
    .populate('tenantId', 'name slug');

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
};
