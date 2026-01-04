/**
 * Authentication Service
 * Handles user registration, login, and token generation
 */

import User from '../models/User.js';
import Organization from '../models/Organization.js';
import { generateToken } from '../utils/jwt.js';
import { validateEmail, validatePassword } from '../utils/validators.js';
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
} from '../utils/errorHandler.js';

/**
 * Register a new user
 */
export const registerUser = async (name, email, password, organizationName) => {
  // Validate input
  if (!name || !email || !password) {
    throw new Error('Name, email, and password are required');
  }

  if (!validateEmail(email)) {
    throw new Error('Invalid email format');
  }

  validatePassword(password);

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  // Create organization
  let organization = await Organization.findOne({ slug: organizationName?.toLowerCase().replace(/\s+/g, '-') });
  
  if (!organization) {
    organization = await Organization.create({
      name: organizationName || `${name}'s Organization`,
    });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    tenantId: organization._id,
    role: 'admin', // First user is admin
  });

  // Update organization owner if not set
  if (!organization.owner) {
    organization.owner = user._id;
    await organization.save();
  }

  // Generate token
  const token = generateToken(user._id, organization._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: organization._id,
    },
    token,
    organization: {
      id: organization._id,
      name: organization.name,
    },
  };
};

/**
 * Login user
 */
export const loginUser = async (email, password) => {
  // Validate input
  if (!email || !password) {
    throw new AuthenticationError('Email and password are required');
  }

  if (!validateEmail(email)) {
    throw new AuthenticationError('Invalid email format');
  }

  // Find user and select password field
  const user = await User.findOne({ email }).select('+password').populate('tenantId');

  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Check password
  const isPasswordValid = await user.matchPassword(password);
  if (!isPasswordValid) {
    throw new AuthenticationError('Invalid email or password');
  }

  if (!user.isActive) {
    throw new AuthenticationError('User account is deactivated');
  }

  // Generate token
  const token = generateToken(user._id, user.tenantId._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId._id,
    },
    token,
    organization: {
      id: user.tenantId._id,
      name: user.tenantId.name,
    },
  };
};

/**
 * Get user by ID
 */
export const getUserById = async (userId) => {
  const user = await User.findById(userId).populate('tenantId');

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
};
