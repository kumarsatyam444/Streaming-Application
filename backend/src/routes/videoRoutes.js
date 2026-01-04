/**
 * Video Routes
 */

import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  uploadVideo,
  getVideos,
  getVideo,
  getVideoDebug,
  streamVideo,
  deleteVideoHandler,
  getVideoStats,
} from '../controllers/videoController.js';
import { upload } from '../utils/fileUpload.js';

const router = express.Router();

// All video routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/videos/upload
 * @desc    Upload a new video
 * @access  Private - Editor, Admin
 */
router.post('/upload', authorize('editor', 'admin'), upload.single('video'), uploadVideo);

/**
 * @route   GET /api/videos
 * @desc    Get all videos for tenant with pagination
 * @access  Private - All users
 */
router.get('/', getVideos);

/**
 * @route   GET /api/videos/stats
 * @desc    Get video statistics
 * @access  Private - All users
 */
router.get('/stats', getVideoStats);

/**
 * @route   GET /api/videos/:id/debug
 * @desc    Get debug info for video (file path, existence, etc)
 * @access  Private - All users
 */
router.get('/:id/debug', getVideoDebug);

/**
 * @route   GET /api/videos/:id/stream
 * @desc    Stream video with range request support
 * @access  Private - All users
 */
router.get('/:id/stream', streamVideo);

/**
 * @route   GET /api/videos/:id
 * @desc    Get video details
 * @access  Private - All users
 */
router.get('/:id', getVideo);

/**
 * @route   DELETE /api/videos/:id
 * @desc    Delete video
 * @access  Private - Editor, Admin
 */
router.delete('/:id', authorize('editor', 'admin'), deleteVideoHandler);

export default router;
