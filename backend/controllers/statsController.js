const User = require('../models/User');
const Problem = require('../models/Problem');
const Contest = require('../models/Contest');
const Submission = require('../models/Submission');

const getPlatformStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProblems,
      totalContests,
      totalSubmissions,
      successfulSubmissions
    ] = await Promise.all([
      User.countDocuments(),
      Problem.countDocuments(),
      Contest.countDocuments(),
      Submission.countDocuments(),
      Submission.countDocuments({ status: 'accepted' })
    ]);

    res.json({
      users: totalUsers,
      problems: totalProblems,
      contests: totalContests,
      submissions: {
        total: totalSubmissions,
        successful: successfulSubmissions,
        successRate: totalSubmissions ? (successfulSubmissions / totalSubmissions * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({ message: 'Error fetching platform statistics' });
  }
};

module.exports = {
  getPlatformStats
}; 