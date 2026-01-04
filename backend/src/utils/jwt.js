/**
 * JWT Utilities
 * Handles token generation and verification
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

/**
 * Generate JWT token
 * @param {string} userId - User ID
 * @param {string} tenantId - Tenant ID
 * @returns {string} JWT token
 */
export const generateToken = (userId, tenantId) => {
  return jwt.sign(
    {
      userId,
      tenantId,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRE,
    }
  );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {object} Decoded token
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error(`Invalid token: ${error.message}`);
  }
};

/**
 * Extract token from request
 * @param {object} req - Express request object
 * @returns {string} Token or null
 */
export const extractTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.slice(7);
};
