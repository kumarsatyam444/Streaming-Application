/**
 * Video Controller
 * Handles video endpoints
 */

import path from 'path';
import fs from 'fs';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import {
  createVideo,
  getVideosByTenant,
  getVideoById,
  deleteVideo,
  searchVideos,
  processVideo,
} from '../services/videoService.js';
import { validateVideoFile } from '../utils/validators.js';
import { NotFoundError, ValidationError } from '../utils/errorHandler.js';

/**
 * Upload video
 * POST /api/videos/upload
 */
export const uploadVideo = asyncHandler(async (req, res) => {
  console.log('[UPLOAD] Upload request received');
  console.log('[UPLOAD] User:', req.user?.userId, 'Tenant:', req.user?.tenantId);
  console.log('[UPLOAD] File info:', req.file ? { 
    filename: req.file.filename,
    originalname: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
    path: req.file.path
  } : 'NO FILE');

  if (!req.file) {
    console.error('[UPLOAD] No file provided in request');
    throw new ValidationError('No file provided');
  }

  // Validate file
  try {
    validateVideoFile(req.file);
    console.log('[UPLOAD] File validation passed');
  } catch (error) {
    console.error('[UPLOAD] File validation failed:', error.message);
    throw error;
  }

  const { description, tags } = req.body;

  // Create video record
  const videoData = {
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    filePath: req.file.path,
    mimeType: req.file.mimetype,
    tenantId: req.user.tenantId,
    uploadedBy: req.user.userId,
    description: description || '',
    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
  };

  console.log('[UPLOAD] Creating video record in database...');
  const video = await createVideo(videoData);
  console.log('[UPLOAD] Video record created:', video._id);

  // Start processing asynchronously in background
  console.log('[UPLOAD] Starting background processing...');
  setImmediate(() => {
    console.log('[UPLOAD] Background processing initiated for video:', video._id);
    processVideo(video._id, video.filePath, video.tenantId, req.io, null)
      .catch(error => console.error('[UPLOAD] Background video processing error:', error));
  });

  console.log('[UPLOAD] Upload handler complete, sending response');
  res.status(201).json({
    success: true,
    message: 'Video uploaded successfully',
    data: {
      videoId: video._id,
      filename: video.filename,
      originalName: video.originalName,
      status: video.status,
    },
  });
});

/**
 * Get all videos for tenant
 * GET /api/videos
 */
export const getVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, sensitivity, search } = req.query;

  let filters = {};
  if (status) filters.status = status;
  if (sensitivity) filters.sensitivity = sensitivity;

  let result;

  if (search) {
    result = await searchVideos(req.user.tenantId, search, parseInt(page), parseInt(limit));
  } else {
    result = await getVideosByTenant(req.user.tenantId, parseInt(page), parseInt(limit), filters);
  }

  res.status(200).json({
    success: true,
    data: result.videos,
    pagination: result.pagination,
  });
});

/**
 * Get single video details
 * GET /api/videos/:id
 */
export const getVideo = asyncHandler(async (req, res) => {
  const video = await getVideoById(req.params.id, req.user.tenantId);

  res.status(200).json({
    success: true,
    data: video,
  });
});

/**
 * Debug: Get video info including file path
 * GET /api/videos/:id/debug
 */
export const getVideoDebug = asyncHandler(async (req, res) => {
  const video = await getVideoById(req.params.id, req.user.tenantId);
  const fileExists = fs.existsSync(video.filePath);
  
  res.status(200).json({
    success: true,
    data: {
      id: video._id,
      filename: video.filename,
      filePath: video.filePath,
      fileExists,
      fileSize: fileExists ? fs.statSync(video.filePath).size : null,
    },
  });
});

/**
 * Stream video with range request support
 * GET /api/videos/:id/stream
 */
export const streamVideo = asyncHandler(async (req, res) => {
  // At this point, req.user is already set by the authenticate middleware
  // which now checks both Authorization header and query parameter token
  
  const video = await getVideoById(req.params.id, req.user.tenantId);
  const filePath = video.filePath;
  
  console.log('[STREAM] Video stream requested for:', {
    videoId: req.params.id,
    filePath: filePath,
    exists: fs.existsSync(filePath),
  });

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error('[STREAM] Video file not found at:', filePath);
    throw new NotFoundError('Video file not found on disk');
  }

  const fileSize = fs.statSync(filePath).size;
  const range = req.headers.range;

  // Set response headers
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Content-Type', video.mimeType || 'video/mp4');

  let startByte = 0;
  let endByte = fileSize - 1;

  // Handle range requests
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    startByte = parseInt(parts[0], 10);
    endByte = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (startByte >= fileSize || endByte >= fileSize || startByte > endByte) {
      res.status(416).setHeader('Content-Range', `bytes */${fileSize}`);
      return res.end();
    }

    const chunkSize = endByte - startByte + 1;
    res.status(206);
    res.setHeader('Content-Range', `bytes ${startByte}-${endByte}/${fileSize}`);
    res.setHeader('Content-Length', chunkSize);
  } else {
    res.status(200);
    res.setHeader('Content-Length', fileSize);
  }

  // Create and pipe the read stream
  const stream = fs.createReadStream(filePath, {
    start: startByte,
    end: endByte,
  });

  stream.on('error', (error) => {
    console.error('[STREAM] Read stream error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Error streaming video' });
    } else {
      // If headers were already sent, just end the response
      res.end();
    }
  });

  res.on('error', (error) => {
    console.error('[STREAM] Response stream error:', error);
    stream.destroy();
  });

  stream.pipe(res);
});

/**
 * Delete video
 * DELETE /api/videos/:id
 */
export const deleteVideoHandler = asyncHandler(async (req, res) => {
  const video = await deleteVideo(req.params.id, req.user.tenantId);

  // Delete file from disk
  if (fs.existsSync(video.filePath)) {
    fs.unlinkSync(video.filePath);
  }

  res.status(200).json({
    success: true,
    message: 'Video deleted successfully',
    data: { videoId: video._id },
  });
});

/**
 * Get video statistics
 * GET /api/videos/stats
 */
export const getVideoStats = asyncHandler(async (req, res) => {
  const videos = await getVideosByTenant(req.user.tenantId, 1, 1000);

  const stats = {
    totalVideos: videos.pagination.total,
    byStatus: {
      uploaded: videos.videos.filter(v => v.status === 'uploaded').length,
      processing: videos.videos.filter(v => v.status === 'processing').length,
      completed: videos.videos.filter(v => v.status === 'completed').length,
      failed: videos.videos.filter(v => v.status === 'failed').length,
    },
    bySensitivity: {
      safe: videos.videos.filter(v => v.sensitivity === 'safe').length,
      flagged: videos.videos.filter(v => v.sensitivity === 'flagged').length,
      unknown: videos.videos.filter(v => v.sensitivity === null).length,
    },
    totalSize: videos.videos.reduce((sum, v) => sum + v.size, 0),
  };

  res.status(200).json({
    success: true,
    data: stats,
  });
});
