/**
 * Video Card Component
 * Displays video information and controls
 */

import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/VideoCard.module.css';
import { formatFileSize, formatDuration } from '../utils/helpers.js';

export const VideoCard = ({ video, onDelete, userRole }) => {
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      onDelete(video._id);
    }
  };

  const getSensitivityBadgeColor = (sensitivity) => {
    switch (sensitivity) {
      case 'safe':
        return '#10b981';
      case 'flagged':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#3b82f6';
      case 'processing':
        return '#f59e0b';
      case 'uploaded':
        return '#6b7280';
      case 'failed':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{video.originalName}</h3>
        {userRole === 'admin' || userRole === 'editor' ? (
          <button onClick={handleDelete} className={styles.deleteBtn} title="Delete video">
            ✕
          </button>
        ) : null}
      </div>

      <div className={styles.metadata}>
        <span className={styles.metaItem}>
          Size: <strong>{formatFileSize(video.size)}</strong>
        </span>
        <span className={styles.metaItem}>
          Duration: <strong>{formatDuration(video.duration)}</strong>
        </span>
      </div>

      <div className={styles.badges}>
        <span
          className={styles.badge}
          style={{ backgroundColor: getStatusColor(video.status) }}
        >
          {video.status}
        </span>
        {video.sensitivity ? (
          <span
            className={styles.badge}
            style={{ backgroundColor: getSensitivityBadgeColor(video.sensitivity) }}
          >
            {video.sensitivity}
          </span>
        ) : (
          <span className={styles.badge} style={{ backgroundColor: '#6b7280' }}>
            pending
          </span>
        )}
      </div>

      {video.status === 'processing' ? (
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${video.progress}%` }} />
          <span className={styles.progressText}>{video.progress}%</span>
        </div>
      ) : null}

      {video.errorMessage ? (
        <div className={styles.error}>Error: {video.errorMessage}</div>
      ) : null}

      <div className={styles.actions}>
        <Link to={`/video/${video._id}`} className={styles.viewBtn}>
          View Details
        </Link>
      </div>
    </div>
  );
};
