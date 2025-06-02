import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verifyToken: () => api.get('/auth/verify'),
  refreshToken: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  getUserStats: (userId) => api.get(`/users/${userId}/stats`),
  getUsers: (params) => api.get('/users', { params }),
  deleteUser: (userId) => api.delete(`/users/${userId}`),
  updateUserRole: (userId, role) => api.patch(`/users/${userId}/role`, { role }),
  getAchievements: () => api.get('/users/achievements'),
};

// Contest API
export const contestAPI = {
  getContests: (params) => api.get('/contests', { params }),
  getContest: (contestId) => api.get(`/contests/${contestId}`),
  createContest: (contestData) => api.post('/contests', contestData),
  updateContest: (contestId, contestData) => api.put(`/contests/${contestId}`, contestData),
  deleteContest: (contestId) => api.delete(`/contests/${contestId}`),
  joinContest: (contestId) => api.post(`/contests/${contestId}/join`),
  leaveContest: (contestId) => api.delete(`/contests/${contestId}/leave`),
  getContestLeaderboard: (contestId) => api.get(`/contests/${contestId}/leaderboard`),
  getContestProblems: (contestId) => api.get(`/contests/${contestId}/problems`),
};

// Problem API
export const problemAPI = {
  getProblems: (params) => api.get('/problems', { params }),
  getProblem: (problemId) => api.get(`/problems/${problemId}`),
  createProblem: (problemData) => api.post('/problems', problemData),
  updateProblem: (problemId, problemData) => api.put(`/problems/${problemId}`, problemData),
  deleteProblem: (problemId) => api.delete(`/problems/${problemId}`),
  generateProblem: (difficulty, topic) => api.post('/problems/generate', { difficulty, topic }),
  getProblemStats: (problemId) => api.get(`/problems/${problemId}/stats`),
  getProblemSubmissions: (problemId, params) => api.get(`/problems/${problemId}/submissions`, { params }),
  getDailySettings: () => api.get('/problems/daily-settings'),
  updateDailySettings: (settings) => api.put('/problems/daily-settings', settings),
  generateDailyProblems: () => api.post('/problems/generate-daily'),
};

// Submission API
export const submissionAPI = {
  submitSolution: (problemId, submissionData) =>
    api.post(`/problems/${problemId}/submit`, submissionData),
  getSubmission: (submissionId) => api.get(`/submissions/${submissionId}`),
  getSubmissions: (params) => api.get('/submissions', { params }),
  getUserSubmissions: (userId, params) => api.get(`/users/${userId}/submissions`, { params }),
  runCode: (code, language, input) =>
    api.post('/submissions/run', { code, language, input }),
  getSubmissionDetails: (submissionId) => api.get(`/submissions/${submissionId}/details`),
};

// Leaderboard API
export const leaderboardAPI = {
  getGlobalLeaderboard: (params) => api.get('/leaderboard/global', { params }),
  getWeeklyLeaderboard: (params) => api.get('/leaderboard/weekly', { params }),
  getContestLeaderboard: (contestId, params) =>
    api.get(`/leaderboard/contest/${contestId}`, { params }),
  getUserRank: (userId) => api.get(`/leaderboard/user/${userId}/rank`),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/stats'),
  getSystemHealth: () => api.get('/admin/health'),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  updateSystemSettings: (settings) => api.put('/admin/settings', settings),
  getSystemSettings: () => api.get('/admin/settings'),
  backupDatabase: () => api.post('/admin/backup'),
  clearCache: () => api.post('/admin/clear-cache'),
  getActivities: () => api.get('/admin/activities'),
};

// AI Service API
export const aiAPI = {
  generateHint: (problemId, userCode) =>
    api.post('/ai/hint', { problemId, userCode }),
  explainSolution: (problemId, solution) =>
    api.post('/ai/explain', { problemId, solution }),
  reviewCode: (code, language) =>
    api.post('/ai/review', { code, language }),
  generateTestCases: (problemId) =>
    api.post(`/ai/test-cases/${problemId}`),
};

// File Upload API
export const uploadAPI = {
  uploadFile: (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteFile: (fileId) => api.delete(`/upload/${fileId}`),
};

// Stats API
export const statsAPI = {
  getPlatformStats: () => api.get('/stats/platform'),
  getUserStats: (userId) => api.get(`/stats/user/${userId}`),
  getContestStats: (contestId) => api.get(`/stats/contest/${contestId}`)
};

// Default export for backward compatibility
export default api;