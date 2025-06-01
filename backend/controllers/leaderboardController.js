const User = require('../models/User');
const Submission = require('../models/Submission');

// Get global leaderboard
const getGlobalLeaderboard = async (req, res) => {
  try {
    const users = await User.find()
      .sort({ 'stats.totalPoints': -1 })
      .limit(100)
      .select('username stats profile');
    
    res.json(users);
  } catch (error) {
    console.error('Get global leaderboard error:', error);
    res.status(500).json({ message: 'Error fetching global leaderboard' });
  }
};

// Get weekly leaderboard
const getWeeklyLeaderboard = async (req, res) => {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const submissions = await Submission.aggregate([
      {
        $match: {
          createdAt: { $gte: weekAgo },
          status: 'accepted'
        }
      },
      {
        $group: {
          _id: '$userId',
          totalPoints: { $sum: '$points' },
          problemsSolved: { $addToSet: '$problemId' }
        }
      },
      {
        $sort: { totalPoints: -1 }
      },
      {
        $limit: 100
      }
    ]);

    const userIds = submissions.map(s => s._id);
    const users = await User.find({ _id: { $in: userIds } })
      .select('username profile');

    const leaderboard = submissions.map(submission => {
      const user = users.find(u => u._id.toString() === submission._id.toString());
      return {
        user: {
          _id: user._id,
          username: user.username,
          profile: user.profile
        },
        totalPoints: submission.totalPoints,
        problemsSolved: submission.problemsSolved.length
      };
    });

    res.json(leaderboard);
  } catch (error) {
    console.error('Get weekly leaderboard error:', error);
    res.status(500).json({ message: 'Error fetching weekly leaderboard' });
  }
};

// Get monthly leaderboard
const getMonthlyLeaderboard = async (req, res) => {
  try {
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    const submissions = await Submission.aggregate([
      {
        $match: {
          createdAt: { $gte: monthAgo },
          status: 'accepted'
        }
      },
      {
        $group: {
          _id: '$userId',
          totalPoints: { $sum: '$points' },
          problemsSolved: { $addToSet: '$problemId' }
        }
      },
      {
        $sort: { totalPoints: -1 }
      },
      {
        $limit: 100
      }
    ]);

    const userIds = submissions.map(s => s._id);
    const users = await User.find({ _id: { $in: userIds } })
      .select('username profile');

    const leaderboard = submissions.map(submission => {
      const user = users.find(u => u._id.toString() === submission._id.toString());
      return {
        user: {
          _id: user._id,
          username: user.username,
          profile: user.profile
        },
        totalPoints: submission.totalPoints,
        problemsSolved: submission.problemsSolved.length
      };
    });

    res.json(leaderboard);
  } catch (error) {
    console.error('Get monthly leaderboard error:', error);
    res.status(500).json({ message: 'Error fetching monthly leaderboard' });
  }
};

// Get user ranking
const getUserRanking = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;
    
    // Get global ranking
    const globalRank = await User.countDocuments({
      'stats.totalPoints': { 
        $gt: (await User.findById(userId)).stats.totalPoints 
      }
    }) + 1;

    // Get weekly ranking
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyStats = await Submission.aggregate([
      {
        $match: {
          createdAt: { $gte: weekAgo },
          status: 'accepted'
        }
      },
      {
        $group: {
          _id: '$userId',
          totalPoints: { $sum: '$points' }
        }
      },
      {
        $sort: { totalPoints: -1 }
      }
    ]);

    const weeklyRank = weeklyStats.findIndex(stat => 
      stat._id.toString() === userId.toString()
    ) + 1;

    // Get monthly ranking
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    
    const monthlyStats = await Submission.aggregate([
      {
        $match: {
          createdAt: { $gte: monthAgo },
          status: 'accepted'
        }
      },
      {
        $group: {
          _id: '$userId',
          totalPoints: { $sum: '$points' }
        }
      },
      {
        $sort: { totalPoints: -1 }
      }
    ]);

    const monthlyRank = monthlyStats.findIndex(stat => 
      stat._id.toString() === userId.toString()
    ) + 1;

    res.json({
      global: globalRank,
      weekly: weeklyRank || 0,
      monthly: monthlyRank || 0
    });
  } catch (error) {
    console.error('Get user ranking error:', error);
    res.status(500).json({ message: 'Error fetching user ranking' });
  }
};

module.exports = {
  getGlobalLeaderboard,
  getWeeklyLeaderboard,
  getMonthlyLeaderboard,
  getUserRanking
};