/**
 * Helper Utilities
 */

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return '00:00:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const pad = (num) => String(num).padStart(2, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
};

export const getStatusLabel = (status) => {
  const labels = {
    uploaded: 'Uploaded',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
  };
  return labels[status] || status;
};

export const getSensitivityLabel = (sensitivity) => {
  const labels = {
    safe: 'Safe',
    flagged: 'Flagged',
  };
  return labels[sensitivity] || 'Pending';
};
