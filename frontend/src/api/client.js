/**
 * Axios API Client
 * Handles all API requests with interceptors
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const client = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Request headers set with token');
    } else {
      console.warn('No token found in localStorage');
    }
    console.log(`${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
client.interceptors.response.use(
  (response) => {
    console.log(`Response ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.status, error.message);
    if (error.response?.status === 401) {
      console.warn('Unauthorized - clearing auth and redirecting to login');
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
