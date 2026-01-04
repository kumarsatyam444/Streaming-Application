/**
 * FFmpeg Helper Utilities
 * Handles video metadata extraction and processing
 */

import ffmpeg from 'fluent-ffmpeg';

// Set FFmpeg path (optional, if ffmpeg is in PATH)
// ffmpeg.setFfmpegPath('/usr/bin/ffmpeg');

/**
 * Extract video metadata
 * @param {string} filePath - Path to video file
 * @returns {Promise<object>} Metadata object
 */
export const getVideoMetadata = (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          console.warn('FFmpeg not available or probe failed, using default metadata:', err.message);
          // Return default metadata if ffprobe fails
          resolve({
            duration: 0,
            width: 1920,
            height: 1080,
            frameRate: 30,
            bitrate: '5000k',
            hasAudio: true,
            format: 'h264',
          });
          return;
        }

        try {
          const video = metadata.streams.find(s => s.codec_type === 'video');
          const audio = metadata.streams.find(s => s.codec_type === 'audio');

          const duration = metadata.format.duration || 0;

          resolve({
            duration: Math.round(duration),
            width: video?.width || 1920,
            height: video?.height || 1080,
            frameRate: video?.avg_frame_rate ? eval(video.avg_frame_rate) : 30,
            bitrate: metadata.format.bit_rate || '5000k',
            hasAudio: !!audio,
            format: metadata.format.format_name || 'h264',
          });
        } catch (error) {
          console.warn('Error parsing metadata:', error.message);
          resolve({
            duration: 0,
            width: 1920,
            height: 1080,
            frameRate: 30,
            bitrate: '5000k',
            hasAudio: true,
            format: 'h264',
          });
        }
      });
    } catch (error) {
      console.warn('FFmpeg probe error:', error.message);
      resolve({
        duration: 0,
        width: 1920,
        height: 1080,
        frameRate: 30,
        bitrate: '5000k',
        hasAudio: true,
        format: 'h264',
      });
    }
  });
};

/**
 * Simulate video processing (sensitivity analysis)
 * In production, this would call an actual AI/ML service
 * @param {string} filePath - Path to video file
 * @returns {Promise<string>} 'safe' or 'flagged'
 */
export const processVideoSensitivity = async (filePath) => {
  try {
    // Cross-platform way to check file exists and get stats
    // This works on both Windows and Unix-like systems
    const fs = await import('fs').then(m => m.promises);
    const stats = await fs.stat(filePath);
    
    // Simulate processing time based on file size
    const fileSizeMB = stats.size / (1024 * 1024);
    const processingTime = Math.min(2000, fileSizeMB * 50); // Simulate processing
    
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // Random simulation: 80% chance of 'safe', 20% chance of 'flagged'
    const isSafe = Math.random() < 0.8;
    
    return isSafe ? 'safe' : 'flagged';
  } catch (error) {
    console.error('Error processing video:', error);
    throw error;
  }
};

/**
 * Get thumbnail from video at specified time
 * @param {string} filePath - Path to video file
 * @param {string} outputPath - Path to save thumbnail
 * @param {number} time - Time in seconds to capture (default: 5s)
 * @returns {Promise<void>}
 */
export const generateThumbnail = (filePath, outputPath, time = 5) => {
  return new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .on('error', reject)
      .on('end', resolve)
      .screenshots({
        timestamps: [time],
        filename: 'thumbnail.png',
        folder: outputPath,
        size: '320x240',
      });
  });
};
