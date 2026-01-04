/**
 * Video Model
 * Represents uploaded videos with metadata and processing status
 */

import mongoose from 'mongoose';
import { VIDEO_STATUS, SENSITIVITY_LEVELS } from '../config/constants.js';

const VideoSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      unique: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true, // in bytes
    },
    duration: {
      type: Number,
      default: 0, // in seconds
    },
    filePath: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [VIDEO_STATUS.UPLOADED, VIDEO_STATUS.PROCESSING, VIDEO_STATUS.COMPLETED, VIDEO_STATUS.FAILED],
      default: VIDEO_STATUS.UPLOADED,
    },
    sensitivity: {
      type: String,
      enum: [SENSITIVITY_LEVELS.SAFE, SENSITIVITY_LEVELS.FLAGGED],
      default: null,
    },
    progress: {
      type: Number,
      default: 0, // 0-100
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    processingStartedAt: {
      type: Date,
      default: null,
    },
    processingCompletedAt: {
      type: Date,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    metadata: {
      width: Number,
      height: Number,
      frameRate: Number,
      bitrate: String,
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    tags: [String],
  },
  {
    timestamps: true,
    indexes: [
      { tenantId: 1, uploadedBy: 1 },
      { tenantId: 1, status: 1 },
    ],
  }
);

// Compound index for tenant and status queries
VideoSchema.index({ tenantId: 1, status: 1 });

const Video = mongoose.model('Video', VideoSchema);

export default Video;
