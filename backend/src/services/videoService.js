/**
 * Video Service
 * Handles video upload, retrieval, and processing
 */

import Video from '../models/Video.js';
import { NotFoundError, ValidationError } from '../utils/errorHandler.js';
import { getVideoMetadata, processVideoSensitivity } from '../utils/ffmpegHelper.js';
import path from 'path';
import { VIDEO_STATUS } from '../config/constants.js';

/**
 * Create a new video record after upload
 */
export const createVideo = async (videoData) => {
  console.log('[VIDEO SERVICE] Creating video with data:', {
    ...videoData,
    filePath: videoData.filePath.substring(0, 100), // Log path truncated
  });
  
  const video = await Video.create(videoData);
  
  console.log('[VIDEO SERVICE] Video created successfully:', {
    _id: video._id,
    tenantId: video.tenantId,
    originalName: video.originalName,
    status: video.status,
  });
  
  return video;
};

/**
 * Get all videos for a tenant with pagination
 */
export const getVideosByTenant = async (tenantId, page = 1, limit = 10, filters = {}) => {
  const skip = (page - 1) * limit;

  const query = { tenantId, ...filters };
  
  console.log('[VIDEO SERVICE] getVideosByTenant called with:', {
    tenantId: tenantId.toString(),
    page,
    limit,
    filters,
  });

  const videos = await Video.find(query)
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Video.countDocuments(query);
  
  console.log(`[VIDEO SERVICE] Found ${total} videos matching query`);

  return {
    videos,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get single video by ID
 */
export const getVideoById = async (videoId, tenantId) => {
  const video = await Video.findOne({
    _id: videoId,
    tenantId,
  }).populate('uploadedBy', 'name email');

  if (!video) {
    throw new NotFoundError('Video not found');
  }

  return video;
};

/**
 * Update video progress
 */
export const updateVideoProgress = async (videoId, progress, tenantId) => {
  if (progress < 0 || progress > 100) {
    throw new ValidationError('Progress must be between 0 and 100');
  }

  const video = await Video.findOneAndUpdate(
    { _id: videoId, tenantId },
    { progress },
    { new: true }
  );

  if (!video) {
    throw new NotFoundError('Video not found');
  }

  return video;
};

/**
 * Update video status and metadata
 */
export const updateVideoStatus = async (videoId, status, data = {}, tenantId) => {
  const updateData = { status, ...data };

  if (status === VIDEO_STATUS.PROCESSING) {
    updateData.processingStartedAt = new Date();
  }

  if (status === VIDEO_STATUS.COMPLETED) {
    updateData.processingCompletedAt = new Date();
  }

  const video = await Video.findOneAndUpdate(
    { _id: videoId, tenantId },
    updateData,
    { new: true }
  );

  if (!video) {
    throw new NotFoundError('Video not found');
  }

  return video;
};

/**
 * Delete video
 */
export const deleteVideo = async (videoId, tenantId) => {
  const video = await Video.findOneAndDelete({
    _id: videoId,
    tenantId,
  });

  if (!video) {
    throw new NotFoundError('Video not found');
  }

  return video;
};

/**
 * Process video (extract metadata and analyze sensitivity)
 * This is called asynchronously
 */
export const processVideo = async (videoId, filePath, tenantId, io, socket) => {
  try {
    console.log(`[VIDEO PROCESSING] Starting processing for video: ${videoId}`);
    
    // Update status to processing
    await updateVideoStatus(videoId, VIDEO_STATUS.PROCESSING, { progress: 0 }, tenantId);
    console.log(`[VIDEO PROCESSING] Status updated to PROCESSING`);

    // Emit progress to all clients (broadcast to all connected sockets)
    if (io) {
      io.emit('video:progress', {
        videoId,
        progress: 10,
        message: 'Extracting metadata...',
      });
      console.log(`[VIDEO PROCESSING] Broadcast progress: 10%`);
    }

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Extract metadata (simulates 20-40% progress)
    console.log(`[VIDEO PROCESSING] Extracting metadata...`);
    const metadata = await getVideoMetadata(filePath);
    console.log(`[VIDEO PROCESSING] Metadata extracted:`, metadata);

    await updateVideoStatus(
      videoId,
      VIDEO_STATUS.PROCESSING,
      { progress: 40, metadata },
      tenantId
    );

    if (io) {
      io.emit('video:progress', {
        videoId,
        progress: 40,
        message: 'Analyzing sensitivity...',
      });
      console.log(`[VIDEO PROCESSING] Broadcast progress: 40%`);
    }

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Process sensitivity (simulates 40-90% progress)
    console.log(`[VIDEO PROCESSING] Processing sensitivity...`);
    const sensitivity = await processVideoSensitivity(filePath);
    console.log(`[VIDEO PROCESSING] Sensitivity result:`, sensitivity);

    await updateVideoStatus(
      videoId,
      VIDEO_STATUS.PROCESSING,
      { progress: 90, sensitivity },
      tenantId
    );

    if (io) {
      io.emit('video:progress', {
        videoId,
        progress: 90,
        message: 'Finalizing...',
      });
      console.log(`[VIDEO PROCESSING] Broadcast progress: 90%`);
    }

    // Mark as completed
    console.log(`[VIDEO PROCESSING] Marking video as COMPLETED`);
    const completedVideo = await updateVideoStatus(
      videoId,
      VIDEO_STATUS.COMPLETED,
      {
        progress: 100,
        sensitivity,
        metadata,
      },
      tenantId
    );

    // Emit completion event to all clients
    if (io) {
      io.emit('video:completed', {
        videoId,
        video: completedVideo,
        message: 'Video processing completed',
      });
      console.log(`[VIDEO PROCESSING] Broadcast completion event`);
    }

    console.log(`[VIDEO PROCESSING] Video ${videoId} processing completed successfully`);
    return completedVideo;
  } catch (error) {
    console.error(`[VIDEO PROCESSING] Error processing video ${videoId}:`, error);

    await updateVideoStatus(
      videoId,
      VIDEO_STATUS.FAILED,
      {
        errorMessage: error.message,
      },
      tenantId
    );
    console.log(`[VIDEO PROCESSING] Status updated to FAILED`);

    if (io) {
      io.emit('video:failed', {
        videoId,
        error: error.message,
      });
      console.log(`[VIDEO PROCESSING] Broadcast failure event`);
    }

    throw error;
  }
};

/**
 * Search videos by title or description
 */
export const searchVideos = async (tenantId, searchTerm, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const query = {
    tenantId,
    $or: [
      { originalName: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { tags: { $regex: searchTerm, $options: 'i' } },
    ],
  };

  const videos = await Video.find(query)
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Video.countDocuments(query);

  return {
    videos,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
