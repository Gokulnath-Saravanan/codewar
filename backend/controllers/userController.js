const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const Submission = require('../models/Submission');
const Contest = require('../models/Contest');
const Problem = require('../models/Problem');
const mongoose = require('mongoose');

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private (Admin)
const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const users = await User.find({})
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments();

  res.json({
    users,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if user is requesting their own profile or is admin
  if (req.user.id !== req.params.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Access denied');
  }

  res.json(user);
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if user is updating their own profile or is admin
  if (req.user.id !== req.params.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Access denied');
  }

  const { username, email, bio, avatar, preferences } = req.body;

  // Check if username is taken (if being changed)
  if (username && username !== user.username) {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(400);
      throw new Error('Username already taken');
    }
  }

  // Check if email is taken (if being changed)
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      throw new Error('Email already taken');
    }
  }

  // Update fields
  user.username = username || user.username;
  user.email = email || user.email;
  user.bio = bio || user.bio;
  user.avatar = avatar || user.avatar;
  user.preferences = { ...user.preferences, ...preferences };
  user.updatedAt = Date.now();

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    username: updatedUser.username,
    email: updatedUser.email,
    bio: updatedUser.bio,
    avatar: updatedUser.avatar,
    preferences: updatedUser.preferences,
    role: updatedUser.role,
    stats: updatedUser.stats
  });
});

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent admin from deleting themselves
  if (req.user.id === req.params.id) {
    res.status(400);
    throw new Error('Cannot delete your own account');
  }

  await User.findByIdAndDelete(req.params.id);

  res.json({ message: 'User deleted successfully' });
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user's submissions
    const submissions = await Submission.find({ user: userId });
    const acceptedSubmissions = submissions.filter(s => s.status === 'accepted');
    
    // Get user's contest participations
    const contestParticipations = await Contest.find({ participants: userId });
    
    // Calculate stats
    const stats = {
      problemsSolved: new Set(acceptedSubmissions.map(s => s.problem.toString())).size,
      totalSubmissions: submissions.length,
      successRate: submissions.length > 0 
        ? Math.round((acceptedSubmissions.length / submissions.length) * 100) 
        : 0,
      contestsParticipated: contestParticipations.length
    };

    // Get global rank (simplified version - can be enhanced)
    const allUsers = await User.find({});
    const userRanks = allUsers.map(user => ({
      id: user._id,
      score: user.score || 0
    })).sort((a, b) => b.score - a.score);
    
    const userRank = userRanks.findIndex(u => u.id.toString() === userId.toString()) + 1;
    stats.globalRank = userRank;

    res.json(stats);
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ message: 'Error getting user statistics' });
  }
};

// @desc    Get user performance data
// @route   GET /api/users/performance
// @access  Private
const getUserPerformance = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = req.user._id;
    const days = 30; // Get last 30 days of performance
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get submissions grouped by day
    const submissions = await Submission.aggregate([
      {
        $match: {
          userId: userId, // MongoDB will automatically convert string to ObjectId
          createdAt: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'problems',
          localField: 'problemId',
          foreignField: '_id',
          as: 'problem'
        }
      },
      {
        $unwind: {
          path: '$problem',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          totalSubmissions: { $sum: 1 },
          acceptedSubmissions: {
            $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] }
          },
          rating: {
            $sum: {
              $cond: [
                { $eq: ["$status", "accepted"] },
                { 
                  $switch: {
                    branches: [
                      { case: { $eq: ["$problem.difficulty", "easy"] }, then: 100 },
                      { case: { $eq: ["$problem.difficulty", "medium"] }, then: 200 },
                      { case: { $eq: ["$problem.difficulty", "hard"] }, then: 300 }
                    ],
                    default: 0
                  }
                },
                0
              ]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in missing dates with zero values
    const performanceData = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = submissions.find(s => s._id === dateStr) || {
        _id: dateStr,
        totalSubmissions: 0,
        acceptedSubmissions: 0,
        rating: 0
      };
      performanceData.push({
        date: dayData._id,
        rating: dayData.rating,
        submissions: dayData.totalSubmissions,
        accepted: dayData.acceptedSubmissions
      });
    }

    res.json(performanceData);
  } catch (error) {
    console.error('Error getting user performance:', error);
    res.status(500).json({ message: 'Error getting user performance data', error: error.message });
  }
};

// @desc    Get user achievements
// @route   GET /api/users/achievements
// @access  Private
const getUserAchievements = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await User.findById(userId).select('achievements');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return empty array if no achievements
    res.json(user.achievements || []);
  } catch (error) {
    console.error('Error getting user achievements:', error);
    res.status(500).json({ message: 'Error getting user achievements', error: error.message });
  }
};

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserStats,
  getUserPerformance,
  getUserAchievements
};