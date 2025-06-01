// backend/routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, adminAuth } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

// Debug log to see what's available
console.log('User controller exports:', {
  getUsers: typeof userController.getUsers,
  getUser: typeof userController.getUser,
  updateUser: typeof userController.updateUser,
  deleteUser: typeof userController.deleteUser,
  getUserStats: typeof userController.getUserStats,
  getUserAchievements: typeof userController.getUserAchievements
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, apiLimiter, userController.getUserStats || ((req, res) => {
  res.status(501).json({ message: 'getUserStats not implemented yet' });
}));

// @route   GET /api/users/performance
// @desc    Get user performance data
// @access  Private
router.get('/performance', auth, apiLimiter, userController.getUserPerformance || ((req, res) => {
  res.status(501).json({ message: 'getUserPerformance not implemented yet' });
}));

// @route   GET /api/users/achievements
// @desc    Get user achievements
// @access  Private
router.get('/achievements', auth, apiLimiter, userController.getUserAchievements || ((req, res) => {
  res.status(501).json({ message: 'getUserAchievements not implemented yet' });
}));

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private (Admin only)
router.get('/', adminAuth, apiLimiter, userController.getUsers || ((req, res) => {
  res.status(501).json({ message: 'getUsers not implemented yet' });
}));

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', auth, apiLimiter, userController.getUser || ((req, res) => {
  res.status(501).json({ message: 'getUser not implemented yet' });
}));

// @route   PUT /api/users/:id
// @desc    Update user (admin or self)
// @access  Private
router.put('/:id', auth, userController.updateUser || ((req, res) => {
  res.status(501).json({ message: 'updateUser not implemented yet' });
}));

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private (Admin only)
router.delete('/:id', adminAuth, userController.deleteUser || ((req, res) => {
  res.status(501).json({ message: 'deleteUser not implemented yet' });
}));

module.exports = router;