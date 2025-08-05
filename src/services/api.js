import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor để thêm token
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

// Response interceptor để xử lý lỗi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('backendToken');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('userInfoTimestamp');
    }
    return Promise.reject(error);
  }
);

// Export API service
export const apiService = {
  // Auth
  login: (userData) => api.post('/api/auth/login', userData),
  getCurrentUser: () => api.get('/api/users/me'),

  // Contests
  getContests: (params = {}) => api.get('/api/contests', { params }),
  getContest: (contestId) => api.get(`/api/contests/${contestId}`),
  getCurrentContest: () => api.get('/api/contests/current'),

  // Registration
  submitRegistration: (formData) => api.post('/api/forms/submit', formData),

  // Exhibitions
  getExhibitions: (params = {}) => api.get('/api/exhibitions', { params }),

  // Sponsors
  getSponsors: () => api.get('/api/sponsors'),

  // Common data (gallery, settings, etc.)
  getCommonData: (code = 'test') => api.get(`/api/common?code=${code}`),

  // Teams
  getTeams: (params = {}) => api.get('/api/teams', { params }),
  getTeam: (teamId) => api.get(`/api/teams/${teamId}`),
  getMyTeams: () => api.get('/api/teams/my'),
  registerTeam: (teamData) => api.post('/api/teams/register', teamData),
  updateTeam: (teamId, teamData) => api.put(`/api/teams/${teamId}`, teamData),
  deleteTeam: (teamId) => api.delete(`/api/teams/${teamId}`),

  // Minigames
  getMinigames: (params = {}) => api.get('/api/minigames', { params }),
  getMinigame: (minigameId) => api.get(`/api/minigames/${minigameId}`),
  getMinigameTicketInfo: (minigameId) => api.get(`/api/minigames/ticket-info/${minigameId}`),

  // Lucky tickets
  registerLuckyTicket: (ticketData) => api.post('/api/lucky/register', ticketData),
  updateLuckyTicket: (ticketId, ticketData) => api.put(`/api/lucky/${ticketId}`, ticketData),
  getLuckyTicketsByMinigame: (minigameId) => api.get(`/api/lucky/by-minigame/${minigameId}`),

  // Notifications
  getNotifications: (params = {}) => api.get('/api/notifications', { params }),
  getNotification: (notificationId) => api.get(`/api/notifications/${notificationId}`),
  markNotificationAsRead: (notificationId) => api.post(`/api/notifications/${notificationId}/read`),

  // FAQ
  getFAQs: (params = {}) => api.get('/api/faqs', { params }),

  // ====================== ADMIN =========================
};