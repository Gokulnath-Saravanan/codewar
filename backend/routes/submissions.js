// backend/routes/submissions.js
const express = require('express');
const router = express.Router();
const {
  submitSolution,
  getSubmissions,
  getSubmission,
  runCode,
  getUserSubmissions,
  getRecentSubmissions
} = require('../controllers/submissionController');
const { auth } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
// Removed rate limiter and validation imports since they're causing issues
// const { submissionLimiter, executionLimiter, apiLimiter } = require('../middleware/rateLimiter');
// const { validateSubmission } = require('../middleware/validation');

// Debug: Check which controller functions are undefined
console.log('Submission Controller functions check:');
console.log('submitSolution:', typeof submitSolution);
console.log('getSubmissions:', typeof getSubmissions);
console.log('getSubmission:', typeof getSubmission);
console.log('runCode:', typeof runCode);
console.log('getUserSubmissions:', typeof getUserSubmissions);
console.log('getRecentSubmissions:', typeof getRecentSubmissions);

// Create placeholder functions for any that might be undefined
const placeholderFunction = (name) => (req, res) => {
  res.status(501).json({ message: `${name} function not implemented yet` });
};

// Use actual functions if they exist, otherwise use placeholders
const safeSubmitSolution = typeof submitSolution === 'function' ? submitSolution : placeholderFunction('submitSolution');
const safeGetSubmissions = typeof getSubmissions === 'function' ? getSubmissions : placeholderFunction('getSubmissions');
const safeGetSubmission = typeof getSubmission === 'function' ? getSubmission : placeholderFunction('getSubmission');
const safeRunCode = typeof runCode === 'function' ? runCode : placeholderFunction('runCode');
const safeGetUserSubmissions = typeof getUserSubmissions === 'function' ? getUserSubmissions : placeholderFunction('getUserSubmissions');
const safeGetRecentSubmissions = typeof getRecentSubmissions === 'function' ? getRecentSubmissions : placeholderFunction('getRecentSubmissions');

// @route   POST /api/submissions
// @desc    Submit a solution for a problem
// @access  Private
router.post('/', auth, safeSubmitSolution);

// @route   GET /api/submissions
// @desc    Get all submissions (with pagination)
// @access  Private
router.get('/', auth, safeGetSubmissions);

// @route   GET /api/submissions/user/:userId
// @desc    Get submissions by user
// @access  Private
router.get('/user/:userId', auth, safeGetUserSubmissions);

// @route   GET /api/submissions/recent
// @desc    Get recent submissions
// @access  Private
router.get('/recent', auth, apiLimiter, safeGetRecentSubmissions);

// @route   GET /api/submissions/:id
// @desc    Get single submission by ID
// @access  Private
router.get('/:id', auth, safeGetSubmission);

// @route   POST /api/submissions/run
// @desc    Run code without submitting (for testing)
// @access  Private
router.post('/run', auth, safeRunCode);

module.exports = router;