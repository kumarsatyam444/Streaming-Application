/**
 * Authentication Middleware
 * Protects routes and validates JWT tokens
 */

import { verifyToken, extractTokenFromRequest } from '../utils/jwt.js';
import { AuthenticationError, AuthorizationError } from '../utils/errorHandler.js';
import { ROLE_PERMISSIONS } from '../config/constants.js';
import User from '../models/User.js';

/**
 * Authenticate user with JWT
 */
export const authenticate = async (req, res, next) => {
  try {
    let token = extractTokenFromRequest(req);
    
    // Check for token in query parameter (for video streaming)
    if (!token && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      throw new AuthenticationError('No token provided. Please log in.');
    }

    const decoded = verifyToken(token);

    // Fetch user from database to ensure they still exist
    const user = await User.findById(decoded.userId).populate('tenantId');

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    if (!user.isActive) {
      throw new AuthenticationError('User account is deactivated');
    }

    // Attach user info to request
    req.user = {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId._id,
    };

    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return res.status(401).json({ success: false, message: error.message });
    }

    return res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

/**
 * Authorize user based on role
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource',
      });
    }

    next();
  };
};

/**
 * Check if user has specific permission
 */
export const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];

    if (!userPermissions.includes(requiredPermission)) {
      throw new AuthorizationError('Insufficient permissions for this action');
    }

    next();
  };
};

/**
 * Verify tenant access
 * Ensures user can only access resources from their tenant
 */
export const verifyTenantAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AuthenticationError('User not authenticated');
    }

    const tenantIdFromParam = req.params.tenantId || req.query.tenantId;

    if (tenantIdFromParam && tenantIdFromParam !== String(req.user.tenantId)) {
      throw new AuthorizationError('Cannot access resources from another tenant');
    }

    next();
  } catch (error) {
    if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }

    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
