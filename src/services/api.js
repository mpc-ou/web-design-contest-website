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

// Helper: build FormData for multipart requests
const buildMultipartFormData = (data = {}) => {
  const formData = new FormData();
  const append = (key, value) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((v) => append(key, v));
      return;
    }
    // Only append File/Blob or primitives/strings
    if (value instanceof File || value instanceof Blob) {
      formData.append(key, value);
    } else if (typeof value === 'object') {
      // Stringify nested objects
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  };

  Object.entries(data).forEach(([key, value]) => {
    // Special handling for known array file fields: images, gallery
    if ((key === 'images' || key === 'gallery') && Array.isArray(value)) {
      value.forEach((file) => {
        if (file instanceof File || file instanceof Blob) {
          formData.append(key, file);
        }
      });
      return;
    }
    append(key, value);
  });

  return formData;
};

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
  getExhibition: (exhibitionId) => api.get(`/api/exhibitions/${exhibitionId}`),
  // Public Exhibition Items (separate collection)
  getExhibitionItems: (exhibitionId, params = {}) => api.get(`/api/exhibition-items/exhibition/${exhibitionId}`, { params }),
  getExhibitionItem: (itemId) => api.get(`/api/exhibition-items/${itemId}`),

  // Sponsors
  getSponsors: () => api.get('/api/sponsors'),

  // Common data (gallery, settings, etc.)
  getCommonData: (code = 'main') => api.get(`/api/common?code=${code}`),
  updateCommonData: (code, formData) => api.patch(`/api/admin/common/${code}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

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
  getSelectedNumbers: (minigameId) => api.get(`/api/lucky/selected-numbers/${minigameId}`),

  // Lucky tickets
  registerLuckyTicket: (ticketData) => api.post('/api/lucky/register', ticketData),
  updateLuckyTicket: (ticketId, ticketData) => api.put(`/api/lucky/${ticketId}`, ticketData),
  getLuckyTicketsByMinigame: (minigameId) => api.get(`/api/lucky/by-minigame/${minigameId}`),

  // Notifications
  getNotifications: (params = {}) => api.get('/api/notifications', { params }),
  getNotification: (notificationId) => api.get(`/api/notifications/${notificationId}`),
  markNotificationAsRead: (notificationId) => api.post(`/api/notifications/${notificationId}/read`),
  getUnreadNotificationsCount: (params = {}) => api.get('/api/notifications/unread-count', { params }),
  markAllNotificationsAsRead: (params = {}) => api.post('/api/notifications/mark-all-read', null, { params }),

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
  createAdminExhibition: (exhibitionData) => {
    const formData = buildMultipartFormData(exhibitionData);
    return api.post('/api/admin/exhibitions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateAdminExhibition: (exhibitionId, exhibitionData) => {
    const formData = buildMultipartFormData(exhibitionData);
    return api.put(`/api/admin/exhibitions/${exhibitionId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteAdminExhibition: (exhibitionId) => api.delete(`/api/admin/exhibitions/${exhibitionId}`),

  // Admin Exhibition Items
  addAdminExhibitionItem: (exhibitionId, itemData) => {
    const formData = buildMultipartFormData(itemData);
    return api.post(`/api/admin/exhibitions/${exhibitionId}/items`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateAdminExhibitionItem: (exhibitionId, itemId, itemData) => {
    const formData = buildMultipartFormData(itemData);
    return api.put(`/api/admin/exhibitions/${exhibitionId}/items/${itemId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteAdminExhibitionItem: (exhibitionId, itemId) => api.delete(`/api/admin/exhibitions/${exhibitionId}/items/${itemId}`),
  
  // Admin Minigames - API đầy đủ theo backend
  getAdminMinigames: (params = {}) => api.get('/api/admin/minigames', { params }),
  getAdminMinigame: (minigameId) => api.get(`/api/admin/minigames/${minigameId}`),
  createAdminMinigame: (minigameData) => {
    const formData = buildMultipartFormData(minigameData);
    return api.post('/api/admin/minigames', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateAdminMinigame: (minigameId, minigameData) => {
    const formData = buildMultipartFormData(minigameData);
    return api.put(`/api/admin/minigames/${minigameId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  closeAdminMinigame: (minigameId) => api.patch(`/api/admin/minigames/close/${minigameId}`),
  deleteAdminMinigame: (minigameId) => api.delete(`/api/admin/minigames/${minigameId}`),
  
  // Admin Lucky Tickets - API từ backend
  getAdminLucky: (params = {}) => api.get('/api/admin/lucky', { params }),
  getAdminLuckyByMinigame: (minigameId, params = {}) => api.get(`/api/admin/lucky/by-minigame/${minigameId}`, { params }),
  drawAdminLucky: (minigameId, confirm = false) => api.post(`/api/admin/lucky/draw/${minigameId}`, { confirm }),
  getAdminLuckyWinners: (minigameId, params = {}) => api.get(`/api/admin/lucky/winners/${minigameId}`, { params }),
  resetAdminLuckyWinners: (minigameId) => api.post(`/api/admin/lucky/reset-winners/${minigameId}`),
  invalidateAdminLucky: (luckyId) => api.post(`/api/admin/lucky/invalidate/${luckyId}`),
  deleteAdminLucky: (luckyId) => api.delete(`/api/admin/lucky/${luckyId}`),
  
  // Admin Notifications
  getAdminNotifications: (params = {}) => api.get('/api/admin/notifications', { params }),
  getAdminNotification: (notificationId) => api.get(`/api/admin/notifications/${notificationId}`),
  createAdminNotification: (notificationData) => api.post('/api/admin/notifications', notificationData),
  updateAdminNotification: (notificationId, notificationData) => api.put(`/api/admin/notifications/${notificationId}`, notificationData),
  deleteAdminNotification: (notificationId) => api.delete(`/api/admin/notifications/${notificationId}`),
  
  // Admin FAQs
  getAdminFAQs: (params = {}) => api.get('/api/admin/faqs', { params }),
  getAdminFAQ: (faqId) => api.get(`/api/admin/faqs/${faqId}`),
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