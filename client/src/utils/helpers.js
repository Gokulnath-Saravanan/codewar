import { format } from 'date-fns';

// Authentication Helpers
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const calculateSuccessRate = (submissions) => {
  if (!submissions || submissions.length === 0) return 0;
  const successful = submissions.filter(s => s.status === 'accepted').length;
  return Math.round((successful / submissions.length) * 100);
};

export const validatePassword = (password) => {
  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validateUsername = (username) => {
  // 3-20 characters, alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

// Storage Helpers
export const getFromStorage = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error parsing storage item:', error);
    return null;
  }
};

export const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error setting storage item:', error);
  }
};

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing storage item:', error);
  }
};

// Time Helpers
export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const formatDuration = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
};

export const getTimeUntil = (targetDate) => {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const difference = target - now;
  
  if (difference <= 0) {
    return { expired: true, timeString: 'Expired' };
  }
  
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return { expired: false, timeString: `${days}d ${hours}h ${minutes}m` };
  } else if (hours > 0) {
    return { expired: false, timeString: `${hours}h ${minutes}m` };
  }
  return { expired: false, timeString: `${minutes}m` };
};

export const formatDate = (date) => {
  return format(new Date(date), 'MMM dd, yyyy');
};

export function isAdmin(user) {
  return user?.role === 'admin';
}

// Contest Helpers
export const getContestStatus = (startTime, endTime) => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  if (now < start) {
    return 'upcoming';
  } else if (now >= start && now <= end) {
    return 'active';
  }
  return 'ended';
};

export const getDifficultyColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return 'text-green-600 bg-green-100';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100';
    case 'hard':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'accepted':
    case 'correct':
      return 'text-green-600 bg-green-100';
    case 'wrong answer':
    case 'incorrect':
      return 'text-red-600 bg-red-100';
    case 'time limit exceeded':
    case 'timeout':
      return 'text-orange-600 bg-orange-100';
    case 'compile error':
    case 'runtime error':
      return 'text-purple-600 bg-purple-100';
    case 'pending':
    case 'running':
      return 'text-blue-600 bg-blue-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

// Data Formatting Helpers
export const formatScore = (score) => {
  if (score === null || score === undefined) return '0';
  return Math.round(score).toLocaleString();
};

export const formatRank = (rank) => {
  if (!rank) return '-';
  const suffix = getRankSuffix(rank);
  return `${rank}${suffix}`;
};

export const getRankSuffix = (rank) => {
  if (rank % 100 >= 11 && rank % 100 <= 13) {
    return 'th';
  }
  switch (rank % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// API Response Helpers
export const handleApiError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  } else if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export const isValidResponse = (response) => {
  return response && response.data && response.data.success;
};

// Utility Functions
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const generateRandomId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

// Code Editor Helpers
export const getLanguageFromExtension = (filename) => {
  const extension = filename.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'js':
      return 'javascript';
    case 'py':
      return 'python';
    case 'java':
      return 'java';
    case 'cpp':
    case 'cc':
      return 'cpp';
    case 'c':
      return 'c';
    default:
      return 'javascript';
  }
};

export const formatCodeSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};
