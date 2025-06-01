// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',

  // User Management
  PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
  USERS: '/users',
  USER_STATS: '/users/stats',

  // Contests
  CONTESTS: '/contests',
  ACTIVE_CONTESTS: '/contests/active',
  UPCOMING_CONTESTS: '/contests/upcoming',
  PAST_CONTESTS: '/contests/past',
  JOIN_CONTEST: '/contests/join',
  LEAVE_CONTEST: '/contests/leave',

  // Problems
  PROBLEMS: '/problems',
  DAILY_PROBLEM: '/problems/daily',
  PROBLEM_BY_ID: (id) => `/problems/${id}`,
  RANDOM_PROBLEM: '/problems/random',

  // Submissions
  SUBMISSIONS: '/submissions',
  SUBMIT_CODE: '/submissions/submit',
  SUBMISSION_BY_ID: (id) => `/submissions/${id}`,
  USER_SUBMISSIONS: '/submissions/user',

  // Leaderboard
  GLOBAL_LEADERBOARD: '/leaderboard/global',
  WEEKLY_LEADERBOARD: '/leaderboard/weekly',
  CONTEST_LEADERBOARD: (contestId) => `/leaderboard/contest/${contestId}`,
  MONTHLY_LEADERBOARD: '/leaderboard/monthly',

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_CONTESTS: '/admin/contests',
  ADMIN_PROBLEMS: '/admin/problems',
  ADMIN_SUBMISSIONS: '/admin/submissions'
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator'
};

// Contest Status
export const CONTEST_STATUS = {
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  ENDED: 'ended',
  CANCELLED: 'cancelled'
};

// Problem Difficulty Levels
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

// Programming Languages
export const PROGRAMMING_LANGUAGES = {
  JAVASCRIPT: 'javascript',
  PYTHON: 'python',
  JAVA: 'java',
  CPP: 'cpp',
  C: 'c',
  CSHARP: 'csharp',
  GO: 'go',
  RUST: 'rust',
  PHP: 'php',
  RUBY: 'ruby'
};

// Language Display Names
export const LANGUAGE_DISPLAY_NAMES = {
  [PROGRAMMING_LANGUAGES.JAVASCRIPT]: 'JavaScript',
  [PROGRAMMING_LANGUAGES.PYTHON]: 'Python',
  [PROGRAMMING_LANGUAGES.JAVA]: 'Java',
  [PROGRAMMING_LANGUAGES.CPP]: 'C++',
  [PROGRAMMING_LANGUAGES.C]: 'C',
  [PROGRAMMING_LANGUAGES.CSHARP]: 'C#',
  [PROGRAMMING_LANGUAGES.GO]: 'Go',
  [PROGRAMMING_LANGUAGES.RUST]: 'Rust',
  [PROGRAMMING_LANGUAGES.PHP]: 'PHP',
  [PROGRAMMING_LANGUAGES.RUBY]: 'Ruby'
};

// Submission Status
export const SUBMISSION_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  ACCEPTED: 'accepted',
  WRONG_ANSWER: 'wrong_answer',
  TIME_LIMIT_EXCEEDED: 'time_limit_exceeded',
  MEMORY_LIMIT_EXCEEDED: 'memory_limit_exceeded',
  RUNTIME_ERROR: 'runtime_error',
  COMPILATION_ERROR: 'compilation_error',
  INTERNAL_ERROR: 'internal_error'
};

// Submission Status Display Names
export const SUBMISSION_STATUS_DISPLAY = {
  [SUBMISSION_STATUS.PENDING]: 'Pending',
  [SUBMISSION_STATUS.RUNNING]: 'Running',
  [SUBMISSION_STATUS.ACCEPTED]: 'Accepted',
  [SUBMISSION_STATUS.WRONG_ANSWER]: 'Wrong Answer',
  [SUBMISSION_STATUS.TIME_LIMIT_EXCEEDED]: 'Time Limit Exceeded',
  [SUBMISSION_STATUS.MEMORY_LIMIT_EXCEEDED]: 'Memory Limit Exceeded',
  [SUBMISSION_STATUS.RUNTIME_ERROR]: 'Runtime Error',
  [SUBMISSION_STATUS.COMPILATION_ERROR]: 'Compilation Error',
  [SUBMISSION_STATUS.INTERNAL_ERROR]: 'Internal Error'
};

// Status Colors for UI
export const STATUS_COLORS = {
  [SUBMISSION_STATUS.PENDING]: 'text-yellow-600 bg-yellow-100',
  [SUBMISSION_STATUS.RUNNING]: 'text-blue-600 bg-blue-100',
  [SUBMISSION_STATUS.ACCEPTED]: 'text-green-600 bg-green-100',
  [SUBMISSION_STATUS.WRONG_ANSWER]: 'text-red-600 bg-red-100',
  [SUBMISSION_STATUS.TIME_LIMIT_EXCEEDED]: 'text-orange-600 bg-orange-100',
  [SUBMISSION_STATUS.MEMORY_LIMIT_EXCEEDED]: 'text-purple-600 bg-purple-100',
  [SUBMISSION_STATUS.RUNTIME_ERROR]: 'text-red-600 bg-red-100',
  [SUBMISSION_STATUS.COMPILATION_ERROR]: 'text-red-600 bg-red-100',
  [SUBMISSION_STATUS.INTERNAL_ERROR]: 'text-gray-600 bg-gray-100'
};

// Difficulty Colors
export const DIFFICULTY_COLORS = {
  [DIFFICULTY_LEVELS.EASY]: 'text-green-600 bg-green-100',
  [DIFFICULTY_LEVELS.MEDIUM]: 'text-yellow-600 bg-yellow-100',
  [DIFFICULTY_LEVELS.HARD]: 'text-red-600 bg-red-100'
};

// Time Constants
export const TIME_CONSTANTS = {
  ONE_MINUTE: 60 * 1000,
  FIVE_MINUTES: 5 * 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  LEADERBOARD_PAGE_SIZE: 20,
  SUBMISSIONS_PAGE_SIZE: 15
};

// Contest Types
export const CONTEST_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  SPECIAL: 'special',
  PRACTICE: 'practice'
};

// Points System
export const POINTS = {
  EASY_PROBLEM: 100,
  MEDIUM_PROBLEM: 200,
  HARD_PROBLEM: 300,
  FIRST_SUBMISSION_BONUS: 50,
  DAILY_CONTEST_BONUS: 25,
  WEEKLY_CONTEST_BONUS: 100
};

// Code Editor Themes
export const EDITOR_THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  MONOKAI: 'monokai',
  GITHUB: 'github',
  TOMORROW: 'tomorrow'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme',
  EDITOR_PREFERENCES: 'editorPreferences',
  LANGUAGE_PREFERENCE: 'languagePreference'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Unauthorized. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  INTERNAL_SERVER_ERROR: 'Internal server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  REGISTER_SUCCESS: 'Account created successfully!',
  LOGOUT_SUCCESS: 'Successfully logged out!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  SUBMISSION_SUCCESS: 'Code submitted successfully!',
  CONTEST_JOINED: 'Successfully joined the contest!',
  PROBLEM_CREATED: 'Problem created successfully!',
  CONTEST_CREATED: 'Contest created successfully!'
};

// Application Limits
export const LIMITS = {
  MAX_CODE_LENGTH: 50000,
  MAX_PROBLEM_TITLE_LENGTH: 200,
  MAX_PROBLEM_DESCRIPTION_LENGTH: 10000,
  MAX_USERNAME_LENGTH: 50,
  MIN_PASSWORD_LENGTH: 8,
  MAX_CONTEST_DURATION: 24 * 60, // 24 hours in minutes
  MAX_SUBMISSIONS_PER_PROBLEM: 100,
  RATE_LIMIT_REQUESTS: 100,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000 // 15 minutes
};

// WebSocket Events
export const WEBSOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_CONTEST: 'join_contest',
  LEAVE_CONTEST: 'leave_contest',
  SUBMISSION_UPDATE: 'submission_update',
  LEADERBOARD_UPDATE: 'leaderboard_update',
  CONTEST_UPDATE: 'contest_update',
  NOTIFICATION: 'notification'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  CONTESTS: '/contests',
  CONTEST_DETAIL: '/contests/:id',
  PROBLEMS: '/problems',
  PROBLEM_DETAIL: '/problems/:id',
  SUBMISSIONS: '/submissions',
  LEADERBOARD: '/leaderboard',
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_CONTESTS: '/admin/contests',
  ADMIN_PROBLEMS: '/admin/problems'
};

const constants = {
  API_BASE_URL,
  API_ENDPOINTS,
  USER_ROLES,
  CONTEST_STATUS,
  DIFFICULTY_LEVELS,
  PROGRAMMING_LANGUAGES,
  LANGUAGE_DISPLAY_NAMES,
  SUBMISSION_STATUS,
  SUBMISSION_STATUS_DISPLAY,
  STATUS_COLORS,
  DIFFICULTY_COLORS,
  TIME_CONSTANTS,
  PAGINATION,
  CONTEST_TYPES,
  POINTS,
  EDITOR_THEMES,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LIMITS,
  WEBSOCKET_EVENTS,
  NOTIFICATION_TYPES,
  ROUTES
};

export default constants;