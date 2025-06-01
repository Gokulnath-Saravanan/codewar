const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const { adminLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

// Get admin dashboard stats
router.get('/stats', [auth, adminAuth, adminLimiter], async (req, res) => {
  try {
    // TODO: Replace with actual stats from database
    const stats = {
      totalUsers: await require('../models/User').countDocuments(),
      totalProblems: await require('../models/Problem').countDocuments(),
      totalContests: await require('../models/Contest').countDocuments(),
      totalSubmissions: await require('../models/Submission').countDocuments(),
      activeUsers: await require('../models/User').countDocuments({ lastActive: { $gte: new Date(Date.now() - 24*60*60*1000) } }),
      successRate: 75, // TODO: Calculate from submissions
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Error fetching admin stats' });
  }
});

// Get recent activities
router.get('/activities', [auth, adminAuth, adminLimiter], async (req, res) => {
  try {
    const activities = await require('../models/Activity')
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'username')
      .lean();
    
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Error fetching activities' });
  }
});

// Get system health
router.get('/health', [auth, adminAuth], async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: Date.now()
    };
    
    res.json(health);
  } catch (error) {
    console.error('Error checking system health:', error);
    res.status(500).json({ message: 'Error checking system health' });
  }
});

module.exports = router; 