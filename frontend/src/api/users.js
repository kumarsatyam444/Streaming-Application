/**
 * User Management API
 */

import client from './client.js';

export const userAPI = {
  getUsers: (page = 1, limit = 10) =>
    client.get('/users', {
      params: { page, limit },
    }),
  getUser: (id) => client.get(`/users/${id}`),
  updateRole: (id, role) => client.patch(`/users/${id}/role`, { role }),
  deactivateUser: (id) => client.patch(`/users/${id}/deactivate`),
  activateUser: (id) => client.patch(`/users/${id}/activate`),
};
