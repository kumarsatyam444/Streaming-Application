/**
 * File Upload Utilities
 * Handles multer configuration and file processing
 */

import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const uploadDir = process.env.UPLOAD_DIR || './uploads';

// Ensure uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tenantId = req.user?.tenantId;
    const tenantDir = path.join(uploadDir, String(tenantId));

    // Create tenant-specific directory
    if (!fs.existsSync(tenantDir)) {
      fs.mkdirSync(tenantDir, { recursive: true });
    }

    cb(null, tenantDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with UUID
    const uniqueFilename = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  },
});

const fileFilter = (req, file, cb) => {
  // Only allow video files
  const allowedMimes = ['video/mp4', 'video/x-matroska', 'video/webm'];
  const allowedExtensions = ['.mp4', '.mkv', '.webm'];

  const fileExt = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error('Only video files (mp4, mkv, webm) are allowed'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 500000000, // 500MB
  },
});

/**
 * Delete uploaded file
 * @param {string} filePath - Full path to file
 */
export const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
  }
  return false;
};

/**
 * Get file size
 * @param {string} filePath - Full path to file
 * @returns {number} File size in bytes
 */
export const getFileSize = (filePath) => {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    console.error(`Error getting file size for ${filePath}:`, error);
    return 0;
  }
};
