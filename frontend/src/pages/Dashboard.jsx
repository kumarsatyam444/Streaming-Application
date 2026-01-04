/**
 * Dashboard Page
 * Displays user's videos with filters and search
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { videoAPI } from '../api/videos.js';
import { VideoCard } from '../components/VideoCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getSocket, initSocket } from '../socket/socketClient.js';
import styles from '../styles/Dashboard.module.css';

export const DashboardPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    sensitivity: '',
  });
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState(null);

  const { user } = useAuth();

  // Initialize socket and fetch videos
  useEffect(() => {
    initSocket();
    fetchVideos();
    fetchStats();

    const socket = getSocket();
    if (socket) {
      socket.on('video:progress', handleVideoProgress);
      socket.on('video:completed', handleVideoCompleted);
      socket.on('video:failed', handleVideoFailed);

      return () => {
        socket.off('video:progress', handleVideoProgress);
        socket.off('video:completed', handleVideoCompleted);
        socket.off('video:failed', handleVideoFailed);
      };
    }
  }, []);

  // Fetch videos when page or filters change
  useEffect(() => {
    fetchVideos();
  }, [page, filters, search]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await videoAPI.getVideos(page, 10, {
        ...filters,
        search,
      });
      setVideos(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (err) {
      setError('Failed to fetch videos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await videoAPI.getStats();
      setStats(response.data.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleVideoProgress = (data) => {
    setVideos((prev) =>
      prev.map((video) =>
        video._id === data.videoId
          ? { ...video, progress: data.progress, status: 'processing' }
          : video
      )
    );
  };

  const handleVideoCompleted = (data) => {
    setVideos((prev) =>
      prev.map((video) =>
        video._id === data.videoId
          ? {
              ...video,
              status: 'completed',
              sensitivity: data.video.sensitivity,
              progress: 100,
              metadata: data.video.metadata,
            }
          : video
      )
    );
    fetchStats();
  };

  const handleVideoFailed = (data) => {
    setVideos((prev) =>
      prev.map((video) =>
        video._id === data.videoId
          ? { ...video, status: 'failed', errorMessage: data.error }
          : video
      )
    );
  };

  const handleDelete = async (videoId) => {
    try {
      await videoAPI.deleteVideo(videoId);
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
      fetchStats();
    } catch (err) {
      setError('Failed to delete video');
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
    setPage(1);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Dashboard</h1>
        {user?.role === 'editor' || user?.role === 'admin' ? (
          <Link to="/upload" className={styles.uploadBtn}>
            Upload Video
          </Link>
        ) : null}
      </div>

      {stats ? (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.totalVideos}</div>
            <div className={styles.statLabel}>Total Videos</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.byStatus.completed}</div>
            <div className={styles.statLabel}>Processed</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.bySensitivity.safe}</div>
            <div className={styles.statLabel}>Safe</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.bySensitivity.flagged}</div>
            <div className={styles.statLabel}>Flagged</div>
          </div>
        </div>
      ) : null}

      <div className={styles.controls}>
        <input
          type="text"
          placeholder="Search videos..."
          value={search}
          onChange={handleSearch}
          className={styles.searchInput}
        />

        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className={styles.select}
        >
          <option value="">All Status</option>
          <option value="uploaded">Uploaded</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>

        <select
          value={filters.sensitivity}
          onChange={(e) => handleFilterChange('sensitivity', e.target.value)}
          className={styles.select}
        >
          <option value="">All Sensitivity</option>
          <option value="safe">Safe</option>
          <option value="flagged">Flagged</option>
        </select>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className={styles.loading}>Loading videos...</div>
      ) : videos.length === 0 ? (
        <div className={styles.empty}>
          <p>No videos found</p>
          {user?.role === 'editor' || user?.role === 'admin' ? (
            <Link to="/upload">Upload your first video</Link>
          ) : null}
        </div>
      ) : (
        <>
          <div className={styles.videosGrid}>
            {videos.map((video) => (
              <VideoCard
                key={video._id}
                video={video}
                onDelete={handleDelete}
                userRole={user?.role}
              />
            ))}
          </div>

          {totalPages > 1 ? (
            <div className={styles.pagination}>
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className={styles.paginationBtn}
              >
                Previous
              </button>
              <span className={styles.pageInfo}>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className={styles.paginationBtn}
              >
                Next
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};
