/**
 * Application Constants
 */

export const ROLES = {
  VIEWER: 'viewer',
  EDITOR: 'editor',
  ADMIN: 'admin',
};

export const ROLE_PERMISSIONS = {
  viewer: ['view_videos', 'stream_videos'],
  editor: ['view_videos', 'stream_videos', 'upload_videos', 'manage_videos'],
  admin: ['view_videos', 'stream_videos', 'upload_videos', 'manage_videos', 'manage_users', 'manage_organization'],
};

export const VIDEO_STATUS = {
  UPLOADED: 'uploaded',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

export const SENSITIVITY_LEVELS = {
  SAFE: 'safe',
  FLAGGED: 'flagged',
};

export const ALLOWED_VIDEO_TYPES = ['mp4', 'mkv', 'webm'];
export const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 500000000; // 500MB

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_EXISTS: 'User already exists',
  USER_NOT_FOUND: 'User not found',
  VIDEO_NOT_FOUND: 'Video not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden - Insufficient permissions',
  INVALID_FILE_TYPE: 'Invalid file type. Only mp4, mkv, webm are allowed',
  FILE_TOO_LARGE: 'File size exceeds maximum limit',
  INVALID_TOKEN: 'Invalid or expired token',
  INTERNAL_ERROR: 'Internal server error',
};

export const SOCKET_EVENTS = {
  VIDEO_PROGRESS: 'video:progress',
  VIDEO_COMPLETED: 'video:completed',
  VIDEO_FAILED: 'video:failed',
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
};
