import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Just clear the tokens
      localStorage.removeItem('authToken');
      localStorage.removeItem('backendToken');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('userInfoTimestamp');
    }
    return Promise.reject(error);
  }
);

// API service object
export const apiService = {
  // Auth
  login: (userData) => api.post('/api/auth/login', userData),
  getCurrentUser: () => api.get('/api/users/me'),
};

export default api;
