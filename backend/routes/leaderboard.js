// backend/routes/leaderboard.js
const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const { auth } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

// Debug log to see what's available
console.log('Leaderboard controller exports:', {
  getGlobalLeaderboard: typeof leaderboardController.getGlobalLeaderboard,
  getWeeklyLeaderboard: typeof leaderboardController.getWeeklyLeaderboard,
  getMonthlyLeaderboard: typeof leaderboardController.getMonthlyLeaderboard,
  getUserRanking: typeof leaderboardController.getUserRanking
});

// @route   GET /api/leaderboard/global
// @desc    Get global leaderboard
// @access  Public
router.get('/global', apiLimiter, leaderboardController.getGlobalLeaderboard || ((req, res) => {
  res.status(501).json({ message: 'getGlobalLeaderboard not implemented yet' });
}));

// @route   GET /api/leaderboard/weekly
// @desc    Get weekly leaderboard
// @access  Public
router.get('/weekly', apiLimiter, leaderboardController.getWeeklyLeaderboard || ((req, res) => {
  res.status(501).json({ message: 'getWeeklyLeaderboard not implemented yet' });
}));

// @route   GET /api/leaderboard/monthly
// @desc    Get monthly leaderboard
// @access  Public
router.get('/monthly', apiLimiter, leaderboardController.getMonthlyLeaderboard || ((req, res) => {
  res.status(501).json({ message: 'getMonthlyLeaderboard not implemented yet' });
}));

// @route   GET /api/leaderboard/user/:userId
// @desc    Get user ranking and stats
// @access  Private
router.get('/user/:userId', auth, apiLimiter, leaderboardController.getUserRanking || ((req, res) => {
  res.status(501).json({ message: 'getUserRanking not implemented yet' });
}));

module.exports = router;