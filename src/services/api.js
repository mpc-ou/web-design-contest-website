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
  submitRegistrationForm: (formData) => api.post('/api/forms/submit', formData),
  getMyRegistrationForms: () => api.get('/api/forms/my'),

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
  
  // Generic admin requests
  get: (url, config = {}) => api.get(url, config),
  post: (url, data, config = {}) => api.post(url, data, config),
  put: (url, data, config = {}) => api.put(url, data, config),
  patch: (url, data, config = {}) => api.patch(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),
  
  // Admin Stats
  getAdminStatsOverview: () => api.get('/api/admin/stats/overview'),
  getAdminStatsUsers: () => api.get('/api/admin/stats/users'),
  getAdminStatsContests: () => api.get('/api/admin/stats/contests'),
  getAdminStatsTeams: () => api.get('/api/admin/stats/teams'),
  getAdminStatsMinigames: () => api.get('/api/admin/stats/minigames'),
  getAdminStatsSystem: () => api.get('/api/admin/stats/system'),
  
  // Admin Users
  getAdminUsers: (params = {}) => api.get('/api/admin/users', { params }),
  getAdminUser: (userId) => api.get(`/api/admin/users/${userId}`),
  getAdminUserLoginHistory: (userId) => api.get(`/api/admin/users/${userId}/login-history`),
  updateAdminUser: (userId, userData) => api.patch(`/api/admin/users/${userId}`, userData),
  deleteAdminUser: (userId) => api.delete(`/api/admin/users/${userId}`),
  
  // Admin Contests
  getAdminContests: (params = {}) => api.get('/api/admin/contests', { params }),
  getAdminContest: (code) => api.get(`/api/admin/contests/${code}`),
  createAdminContest: (contestData) => api.post('/api/admin/contests', contestData),
  updateAdminContest: (code, contestData) => api.patch(`/api/admin/contests/${code}`, contestData),
  deleteAdminContest: (code) => api.delete(`/api/admin/contests/${code}`),
  
  // Admin Forms/Registrations
  getAdminForms: (params = {}) => api.get('/api/admin/forms', { params }),
  getAdminForm: (formId) => api.get(`/api/admin/forms/${formId}`),
  approveAdminForm: (formId, data = {}) => api.post(`/api/admin/forms/${formId}/approve`, data),
  rejectAdminForm: (formId, data = {}) => api.post(`/api/admin/forms/${formId}/reject`, data),
  deleteAdminForm: (formId) => api.delete(`/api/admin/forms/${formId}`),
  
  // Admin Teams
  getAdminTeams: (params = {}) => api.get('/api/admin/teams', { params }),
  getAdminTeam: (teamId) => api.get(`/api/admin/teams/${teamId}`),
  createAdminTeam: (teamData) => api.post('/api/admin/teams', teamData),
  deleteAdminTeam: (teamId) => api.delete(`/api/admin/teams/${teamId}`),
  
  // Admin Submissions
  getAdminSubmissions: (params = {}) => api.get('/api/admin/submissions', { params }),
  getAdminSubmission: (submissionId) => api.get(`/api/admin/submissions/${submissionId}`),
  getAdminSubmissionsByTeam: (teamId) => api.get(`/api/admin/submissions/team/${teamId}`),
  deleteAdminSubmission: (submissionId) => api.delete(`/api/admin/submissions/${submissionId}`),
  
  // Admin Exhibitions
  getAdminExhibitions: (params = {}) => api.get('/api/admin/exhibitions', { params }),
  getAdminExhibition: (exhibitionId) => api.get(`/api/admin/exhibitions/${exhibitionId}`),
  createAdminExhibition: (exhibitionData) => api.post('/api/admin/exhibitions', exhibitionData),
  updateAdminExhibition: (exhibitionId, exhibitionData) => api.put(`/api/admin/exhibitions/${exhibitionId}`, exhibitionData),
  deleteAdminExhibition: (exhibitionId) => api.delete(`/api/admin/exhibitions/${exhibitionId}`),
  
  // Admin Minigames
  getAdminMinigames: (params = {}) => api.get('/api/admin/minigames', { params }),
  getAdminMinigame: (minigameId) => api.get(`/api/admin/minigames/${minigameId}`),
  createAdminMinigame: (minigameData) => api.post('/api/admin/minigames', minigameData),
  updateAdminMinigame: (minigameId, minigameData) => api.put(`/api/admin/minigames/${minigameId}`, minigameData),
  closeAdminMinigame: (minigameId) => api.patch(`/api/admin/minigames/close/${minigameId}`),
  deleteAdminMinigame: (minigameId) => api.delete(`/api/admin/minigames/${minigameId}`),
  
  // Admin Lucky Tickets
  getAdminLucky: (params = {}) => api.get('/api/admin/lucky', { params }),
  drawAdminLucky: (minigameId, confirm = false) => api.post(`/api/admin/lucky/draw/${minigameId}?confirm=${confirm}`),
  invalidateAdminLucky: (luckyId) => api.post(`/api/admin/lucky/invalidate/${luckyId}`),
  deleteAdminLucky: (luckyId) => api.delete(`/api/admin/lucky/${luckyId}`),
  resetAdminLuckyWinners: (minigameId) => api.post(`/api/admin/lucky/reset-winners/${minigameId}`),
  getAdminLuckyWinners: (minigameId) => api.get(`/api/admin/lucky/winners/${minigameId}`),
  
  // Admin Notifications
  getAdminNotifications: (params = {}) => api.get('/api/admin/notifications', { params }),
  getAdminNotification: (notificationId) => api.get(`/api/admin/notifications/${notificationId}`),
  createAdminNotification: (notificationData) => api.post('/api/admin/notifications', notificationData),
  updateAdminNotification: (notificationId, notificationData) => api.put(`/api/admin/notifications/${notificationId}`, notificationData),
  deleteAdminNotification: (notificationId) => api.delete(`/api/admin/notifications/${notificationId}`),
  
  // Admin FAQs
  getAdminFAQs: (params = {}) => api.get('/api/admin/faqs', { params }),
  createAdminFAQ: (faqData) => api.post('/api/admin/faqs', faqData),
  updateAdminFAQ: (faqId, faqData) => api.put(`/api/admin/faqs/${faqId}`, faqData),
  deleteAdminFAQ: (faqId) => api.delete(`/api/admin/faqs/${faqId}`),
  
  // Admin Sponsors
  getAdminSponsors: (params = {}) => api.get('/api/admin/sponsors', { params }),
  getAdminSponsor: (sponsorId) => api.get(`/api/admin/sponsors/${sponsorId}`),
  createAdminSponsor: (sponsorData) => api.post('/api/admin/sponsors', sponsorData),
  updateAdminSponsor: (sponsorId, sponsorData) => api.put(`/api/admin/sponsors/${sponsorId}`, sponsorData),
  addAdminSponsorHistory: (sponsorId, historyData) => api.post(`/api/admin/sponsors/${sponsorId}/history`, historyData),
  deleteAdminSponsorHistory: (sponsorId, historyData) => api.delete(`/api/admin/sponsors/${sponsorId}/history`, { data: historyData }),
  deleteAdminSponsor: (sponsorId) => api.delete(`/api/admin/sponsors/${sponsorId}`),
  
  // Admin Common Data
  getAdminCommon: () => api.get('/api/admin/common'),
  createAdminCommon: (commonData) => api.post('/api/admin/common', commonData),
  updateAdminCommon: (code, commonData) => api.patch(`/api/admin/common/${code}`, commonData),
  deleteAdminCommon: (code) => api.delete(`/api/admin/common/${code}`),
  
  // Admin Reports
  exportParticipantsReport: (contestId) => api.get(`/api/reports/participants/${contestId}`, { responseType: 'blob' }),
  exportTeamsReport: (params = {}) => api.get('/api/reports/teams', { params, responseType: 'blob' }),
  exportSubmissionsReport: (params = {}) => api.get('/api/reports/submissions', { params, responseType: 'blob' }),
  exportRegistrationFormsReport: (params = {}) => api.get('/api/reports/registration-forms', { params, responseType: 'blob' }),
  exportUsersReport: () => api.get('/api/reports/users', { responseType: 'blob' }),
  exportLoginHistoryReport: (params = {}) => api.get('/api/reports/login-history', { params, responseType: 'blob' }),
  exportSponsorsReport: (params = {}) => api.get('/api/reports/sponsors', { params, responseType: 'blob' }),
};