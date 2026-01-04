/**
 * User Routes
 */

import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getUsers,
  getUser,
  updateRole,
  deactivateUserHandler,
  activateUserHandler,
} from '../controllers/userController.js';

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/users
 * @desc    Get all users in tenant
 * @access  Private - Admin
 */
router.get('/', authorize('admin'), getUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private - Admin
 */
router.get('/:id', authorize('admin'), getUser);

/**
 * @route   PATCH /api/users/:id/role
 * @desc    Update user role
 * @access  Private - Admin
 */
router.patch('/:id/role', authorize('admin'), updateRole);

/**
 * @route   PATCH /api/users/:id/deactivate
 * @desc    Deactivate user
 * @access  Private - Admin
 */
router.patch('/:id/deactivate', authorize('admin'), deactivateUserHandler);

/**
 * @route   PATCH /api/users/:id/activate
 * @desc    Activate user
 * @access  Private - Admin
 */
router.patch('/:id/activate', authorize('admin'), activateUserHandler);

export default router;
