/**
 * Video Player Page
 * Displays video details and streaming player
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { videoAPI } from '../api/videos.js';
import styles from '../styles/VideoPlayer.module.css';
import { formatFileSize, formatDuration } from '../utils/helpers.js';

export const VideoPlayerPage = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVideo();
  }, [id]);

  const fetchVideo = async () => {
    try {
      setLoading(true);
      const response = await videoAPI.getVideo(id);
      setVideo(response.data.data);
    } catch (err) {
      setError('Failed to load video');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading video...</div>;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
        <Link to="/dashboard" className={styles.backLink}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!video) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Video not found</div>
        <Link to="/dashboard" className={styles.backLink}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const streamUrl = videoAPI.streamVideo(video._id);

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

  const getSensitivityColor = (sensitivity) => {
    switch (sensitivity) {
      case 'safe':
        return '#10b981';
      case 'flagged':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className={styles.container}>
      <Link to="/dashboard" className={styles.backLink}>
        ← Back to Dashboard
      </Link>

      <div className={styles.content}>
        <div className={styles.playerContainer}>
          {video.status === 'completed' ? (
            <video controls className={styles.video} key={streamUrl}>
              <source src={streamUrl} type={video.mimeType} />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className={styles.placeholderVideo}>
              <div className={styles.placeholderContent}>
                <div className={styles.icon}>📹</div>
                <p>
                  {video.status === 'processing'
                    ? 'Video is being processed...'
                    : 'Video processing will start shortly'}
                </p>
                {video.status === 'processing' && (
                  <div className={styles.progressSmall}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${video.progress}%` }}
                    />
                    <span>{video.progress}%</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={styles.details}>
          <h1 className={styles.title}>{video.originalName}</h1>

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
                style={{ backgroundColor: getSensitivityColor(video.sensitivity) }}
              >
                {video.sensitivity}
              </span>
            ) : null}
          </div>

          {video.description && (
            <div className={styles.description}>
              <h3>Description</h3>
              <p>{video.description}</p>
            </div>
          )}

          <div className={styles.metadata}>
            <h3>Video Information</h3>
            <div className={styles.metadataGrid}>
              <div className={styles.metaItem}>
                <span className={styles.label}>File Size:</span>
                <span className={styles.value}>{formatFileSize(video.size)}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.label}>Duration:</span>
                <span className={styles.value}>{formatDuration(video.duration)}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.label}>Resolution:</span>
                <span className={styles.value}>
                  {video.metadata?.width}x{video.metadata?.height || 'N/A'}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.label}>Frame Rate:</span>
                <span className={styles.value}>
                  {Math.round(video.metadata?.frameRate || 0)} fps
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.label}>Uploaded:</span>
                <span className={styles.value}>
                  {new Date(video.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.label}>Uploaded By:</span>
                <span className={styles.value}>{video.uploadedBy?.name}</span>
              </div>
            </div>
          </div>

          {video.tags && video.tags.length > 0 && (
            <div className={styles.tags}>
              <h3>Tags</h3>
              <div className={styles.tagList}>
                {video.tags.map((tag, idx) => (
                  <span key={idx} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {video.errorMessage && (
            <div className={styles.errorMessage}>
              <strong>Error:</strong> {video.errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
