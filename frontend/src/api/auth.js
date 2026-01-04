/**
 * Authentication API
 */

import client from './client.js';

export const authAPI = {
  register: (data) => client.post('/auth/register', data),
  login: (email, password) => client.post('/auth/login', { email, password }),
  getProfile: () => client.get('/auth/me'),
  logout: () => client.post('/auth/logout'),
};
