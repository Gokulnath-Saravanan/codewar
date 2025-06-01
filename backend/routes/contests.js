// backend/routes/contests.js
const express = require('express');
const router = express.Router();
const contestController = require('../controllers/contestController');
const { auth, adminAuth } = require('../middleware/auth');
// Removed apiLimiter and validateContest imports since they're causing issues
// const { validateContest } = require('../middleware/validation');

// @route   GET /api/contests
// @desc    Get all contests
// @access  Public
router.get('/', contestController.getContests);

// @route   GET /api/contests/:id
// @desc    Get single contest by ID
// @access  Public
router.get('/:id', contestController.getContest);

// @route   POST /api/contests
// @desc    Create a new contest
// @access  Private (Admin only)
router.post('/', adminAuth, contestController.createContest);

// @route   PUT /api/contests/:id
// @desc    Update a contest
// @access  Private (Admin only)
router.put('/:id', adminAuth, contestController.updateContest);

// @route   DELETE /api/contests/:id
// @desc    Delete a contest
// @access  Private (Admin only)
router.delete('/:id', adminAuth, contestController.deleteContest);

// @route   POST /api/contests/:id/join
// @desc    Join a contest
// @access  Private
router.post('/:id/join', auth, contestController.joinContest);

// @route   POST /api/contests/:id/leave
// @desc    Leave a contest
// @access  Private
router.post('/:id/leave', auth, contestController.leaveContest);

// @route   GET /api/contests/:id/leaderboard
// @desc    Get contest leaderboard
// @access  Public
router.get('/:id/leaderboard', contestController.getContestLeaderboard);

module.exports = router;