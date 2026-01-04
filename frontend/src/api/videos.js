/**
 * Video API
 */

import client from './client.js';

export const videoAPI = {
  upload: (formData, onUploadProgress) =>
    client.post('/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    }),
  getVideos: (page = 1, limit = 10, filters = {}) =>
    client.get('/videos', {
      params: { page, limit, ...filters },
    }),
  getVideo: (id) => client.get(`/videos/${id}`),
  streamVideo: (id) => {
    const token = localStorage.getItem('token');
    const url = `${client.defaults.baseURL}/videos/${id}/stream`;
    // Append token as query parameter for video streaming (since HTML video tag doesn't support headers)
    return token ? `${url}?token=${token}` : url;
  },
  deleteVideo: (id) => client.delete(`/videos/${id}`),
  getStats: () => client.get('/videos/stats'),
};
