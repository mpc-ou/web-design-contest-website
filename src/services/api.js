import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service object
export const apiService = {
  // Auth
  login: (credentials) => api.post('/api/auth/login', credentials),

  // Contest
  getContests: () => api.get('/api/admin/contests'),
  createContest: (data) => api.post('/api/contest/', data),
  updateContest: (id, data) => api.put(`/api/contest/${id}`, data),
  deleteContest: (id) => api.delete(`/api/contest/${id}`),
  registerTeam: (data) => api.post('/api/contest/register', data),

  // Team
  getMyTeams: () => api.get('/api/team/my'),
  getAllTeams: () => api.get('/api/admin/teams'),
  registerTeam: (data) => api.post('/api/team/register', data),
  updateTeam: (id, data) => api.put(`/api/team/${id}`, data),
  deleteTeam: (id) => api.delete(`/api/team/${id}`),

  // Submission
  submitProject: (data) => api.post('/api/submission/submit', data),
  getSubmissions: () => api.get('/api/admin/submissions'),
  updateSubmission: (id, data) => api.put(`/api/submission/${id}`, data),
  deleteSubmission: (id) => api.delete(`/api/submission/${id}`),

  // Exhibition
  uploadExhibition: (data) => api.post('/api/exhibition/upload', data),
  getExhibitions: () => api.get('/api/admin/exhibitions'),
  updateExhibition: (id, data) => api.put(`/api/exhibition/${id}`, data),
  deleteExhibition: (id) => api.delete(`/api/exhibition/${id}`),

  // Minigame
  createMinigame: (data) => api.post('/api/minigame/', data),
  getMinigamesByContest: (contestId) => api.get(`/api/minigame/by-contest/${contestId}`),
  getAllMinigames: () => api.get('/api/admin/minigames'),
  updateMinigame: (id, data) => api.put(`/api/minigame/${id}`, data),
  deleteMinigame: (id) => api.delete(`/api/minigame/${id}`),

  // Lucky Ticket
  getMinigameTicketInfo: (minigameId) => api.get(`/api/lucky/by-minigame/${minigameId}`),
  getLuckyTickets: () => api.get('/api/admin/lucky-tickets'),
  registerLuckyTicket: (data) => api.post('/api/lucky/register', data),
  deleteLuckyTicket: (id) => api.delete(`/api/admin/lucky-tickets/${id}`),

  // Lucky Draw Features
  drawWinner: (minigameId) => api.post(`/api/admin/lucky-draw/${minigameId}/draw`),
  getWinners: (minigameId) => api.get(`/api/admin/lucky-draw/${minigameId}/winners`),
  resetWinners: (minigameId) => api.delete(`/api/admin/lucky-draw/${minigameId}/reset`),

  // Admin
  getUsers: () => api.get('/api/admin/users'),
  updateUserRole: (userId, role) => api.put(`/api/admin/users/${userId}/role`, { role }),
};

export default api;
