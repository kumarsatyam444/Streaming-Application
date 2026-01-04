/**
 * Error Handling Middleware
 * Catches and processes errors globally
 */

import { errorHandler } from '../utils/errorHandler.js';

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * 404 Not Found middleware
 */
export const notFoundMiddleware = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global error handling middleware
 */
export const globalErrorHandler = (err, req, res, next) => {
  errorHandler(err, req, res, next);
};
