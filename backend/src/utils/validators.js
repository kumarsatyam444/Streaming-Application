/**
 * Input Validation Utilities
 * Provides reusable validation functions
 */

import { ValidationError } from './errorHandler.js';
import { ALLOWED_VIDEO_TYPES, MAX_FILE_SIZE } from '../config/constants.js';

export const validateEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  if (!password || password.length < 6) {
    throw new ValidationError('Password must be at least 6 characters long');
  }
  return true;
};

export const validateVideoFile = (file) => {
  if (!file) {
    throw new ValidationError('No file provided');
  }

  const fileExtension = file.originalname.split('.').pop().toLowerCase();

  if (!ALLOWED_VIDEO_TYPES.includes(fileExtension)) {
    throw new ValidationError(
      `Invalid file type. Only ${ALLOWED_VIDEO_TYPES.join(', ')} are allowed`
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new ValidationError(
      `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024 * 1024)}GB`
    );
  }

  return true;
};

export const validatePagination = (page, limit) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;

  if (pageNum < 1 || limitNum < 1) {
    throw new ValidationError('Page and limit must be positive integers');
  }

  if (limitNum > 100) {
    throw new ValidationError('Limit cannot exceed 100');
  }

  return { page: pageNum, limit: limitNum };
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};
