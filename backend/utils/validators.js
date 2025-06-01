// backend/utils/validators.js
const mongoose = require('mongoose');

// Validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate username format
const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

// Validate password strength
const isStrongPassword = (password) => {
  // At least 6 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return passwordRegex.test(password);
};

// Validate programming language
const isValidLanguage = (language) => {
  const supportedLanguages = ['javascript', 'python', 'java', 'cpp', 'c'];
  return supportedLanguages.includes(language.toLowerCase());
};

// Validate difficulty level
const isValidDifficulty = (difficulty) => {
  const difficulties = ['easy', 'medium', 'hard'];
  return difficulties.includes(difficulty.toLowerCase());
};

// Validate contest status
const isValidContestStatus = (status) => {
  const statuses = ['upcoming', 'active', 'completed'];
  return statuses.includes(status.toLowerCase());
};

// Validate test case format
const isValidTestCase = (testCase) => {
  return (
    testCase &&
    typeof testCase.input === 'string' &&
    typeof testCase.output === 'string'
  );
};

// Validate time range
const isValidTimeRange = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return start < end && start > new Date();
};

// Sanitize HTML content
const sanitizeHtml = (html) => {
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+="[^"]*"/gi, '');
};

// Validate file upload
const isValidFileUpload = (file, allowedTypes = [], maxSize = 5 * 1024 * 1024) => {
  if (!file) return false;
  
  const isValidType = allowedTypes.length === 0 || allowedTypes.includes(file.mimetype);
  const isValidSize = file.size <= maxSize;
  
  return isValidType && isValidSize;
};

// Validate pagination parameters
const validatePagination = (page, limit) => {
  const parsedPage = parseInt(page) || 1;
  const parsedLimit = parseInt(limit) || 10;
  
  return {
    page: Math.max(1, parsedPage),
    limit: Math.min(Math.max(1, parsedLimit), 100) // Max 100 items per page
  };
};

module.exports = {
  isValidObjectId,
  isValidEmail,
  isValidUsername,
  isStrongPassword,
  isValidLanguage,
  isValidDifficulty,
  isValidContestStatus,
  isValidTestCase,
  isValidTimeRange,
  sanitizeHtml,
  isValidFileUpload,
  validatePagination
};