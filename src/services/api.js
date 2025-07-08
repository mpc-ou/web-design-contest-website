import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors
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

  // Users
  getUsers: () => api.get('/api/users'),
  updateUser: (id, data) => api.patch(`/api/users/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteUser: (id) => api.delete(`/api/users/${id}`),

  // Contests
  getContests: () => api.get('/api/contests'),
  createContest: (data) => api.post('/api/contests', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  updateContest: (id, data) => api.patch(`/api/contests/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteContest: (id) => api.delete(`/api/contests/${id}`),
  registerForContest: (data) => api.post('/api/contests/register', data),

  // Teams
  getMyTeams: () => api.get('/api/teams/my'),
  getAllTeams: () => api.get('/api/teams'),
  updateTeam: (id, data) => api.put(`/api/teams/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteTeam: (id) => api.delete(`/api/teams/${id}`),

  // Submissions
  submitProject: (data) => api.post('/api/submissions/submit', data),
  getSubmissions: () => api.get('/api/submissions'),
  updateSubmission: (id, data) => api.put(`/api/submissions/${id}`, data),
  deleteSubmission: (id) => api.delete(`/api/submissions/${id}`),

  // Exhibitions
  createExhibition: (data) => api.post('/api/exhibitions', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getExhibitions: () => api.get('/api/exhibitions'),
  getExhibitionByTeam: (teamId) => api.get(`/api/exhibitions/by-team/${teamId}`),
  getExhibitionsByContest: (contestId) => api.get(`/api/exhibitions/by-contest/${contestId}`),
  getExhibition: (id) => api.get(`/api/exhibitions/${id}`),
  updateExhibition: (id, data) => api.put(`/api/exhibitions/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteExhibition: (id) => api.delete(`/api/exhibitions/${id}`),

  // Minigames
  createMinigame: (data) => api.post('/api/minigames', data),
  getMinigames: () => api.get('/api/minigames'),
  getMinigamesByContest: (contestId) => api.get(`/api/minigames/by-contest/${contestId}`),
  getMinigameTicketInfo: (minigameId) => api.get(`/api/minigames/ticket-info/${minigameId}`),
  updateMinigame: (id, data) => api.put(`/api/minigames/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteMinigame: (id) => api.delete(`/api/minigames/${id}`),

  // Lucky Draw
  registerLuckyTicket: (data) => api.post('/api/lucky/register', data),
  getLuckyTickets: () => api.get('/api/lucky'),
  getLuckyTicketsByMinigame: (minigameId) => api.get(`/api/lucky/by-minigame/${minigameId}`),
  drawWinner: (minigameId) => api.post(`/api/lucky/draw/${minigameId}`),
  getWinners: (minigameId) => api.get(`/api/lucky/winners/${minigameId}`),
  resetWinners: (minigameId) => api.post(`/api/lucky/reset-winners/${minigameId}`),
  deleteLuckyTicket: (id) => api.delete(`/api/lucky/${id}`),

  // Common Data
  getCommonData: (code) => api.get(`/api/common?code=${code}`),
  createCommonData: (data) => api.post('/api/common', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  updateCommonData: (code, data) => api.patch(`/api/common/${code}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteCommonData: (code) => api.delete(`/api/common/${code}`),

  // Admin Stats
  getAdminStats: () => api.get('/api/admin/stats'),
  performLuckyDraw: (minigameId) => api.get(`/api/admin/lucky-draw/${minigameId}`),
  resetWinnersAdmin: (minigameId) => api.post(`/api/admin/reset-winners/${minigameId}`),
  rollbackLuckyDraw: (minigameId) => api.post(`/api/admin/rollback-lucky-draw/${minigameId}`),
  endContest: (contestId) => api.post(`/api/admin/end-contest/${contestId}`),
};

export default api;
