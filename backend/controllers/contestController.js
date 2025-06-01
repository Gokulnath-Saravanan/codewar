const Contest = require('../models/Contest');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Get all contests with optional filtering
const getContests = async (req, res) => {
  try {
    const { featured, limit = 10, page = 1, status } = req.query;
    const query = { isActive: true };
    
    if (featured === 'true') {
      query.featured = true;
    }

    const now = new Date();
    if (status === 'upcoming') {
      query.startTime = { $gt: now };
    } else if (status === 'ongoing') {
      query.startTime = { $lte: now };
      query.endTime = { $gt: now };
    } else if (status === 'ended') {
      query.endTime = { $lte: now };
    }

    const contests = await Contest.find(query)
      .populate('createdBy', 'username')
      .populate('problems', 'title difficulty')
      .sort({ startTime: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Contest.countDocuments(query);

    res.json({
      contests,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching contests:', error);
    res.status(500).json({ message: 'Error fetching contests' });
  }
};

// Get single contest by ID
const getContest = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate('problems', 'title difficulty points')
      .populate('participants.userId', 'username');

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    const now = new Date();
    let status;
    if (now < contest.startTime) {
      status = 'upcoming';
    } else if (now >= contest.startTime && now <= contest.endTime) {
      status = 'ongoing';
    } else {
      status = 'ended';
    }

    res.json({
      ...contest.toObject(),
      status,
      participantCount: contest.participants.length
    });
  } catch (error) {
    console.error('Error fetching contest:', error);
    res.status(500).json({ message: 'Error fetching contest' });
  }
};

// Create a new contest
const createContest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const contestData = {
      ...req.body,
      createdBy: req.user.userId
    };

    const contest = new Contest(contestData);
    await contest.save();

    await contest.populate('problems', 'title difficulty points');
    await contest.populate('createdBy', 'username');

    res.status(201).json({
      message: 'Contest created successfully',
      contest
    });
  } catch (error) {
    console.error('Create contest error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a contest
const updateContest = async (req, res) => {
  try {
    const contest = await Contest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('problems', 'title difficulty points');

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    res.json({
      message: 'Contest updated successfully',
      contest
    });
  } catch (error) {
    console.error('Update contest error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a contest
const deleteContest = async (req, res) => {
  try {
    const contest = await Contest.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    res.json({ message: 'Contest deleted successfully' });
  } catch (error) {
    console.error('Delete contest error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Join a contest
const joinContest = async (req, res) => {
  try {
    const contestId = req.params.id;
    const userId = req.user.userId;

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Check if contest is still accepting registrations
    const now = new Date();
    if (now >= contest.startTime) {
      return res.status(400).json({ message: 'Contest has already started' });
    }

    // Check if user is already registered
    const isAlreadyRegistered = contest.participants.some(
      p => p.userId.toString() === userId
    );

    if (isAlreadyRegistered) {
      return res.status(400).json({ message: 'Already registered for this contest' });
    }

    contest.participants.push({ userId });
    await contest.save();

    res.json({ message: 'Successfully registered for contest' });
  } catch (error) {
    console.error('Join contest error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Leave a contest
const leaveContest = async (req, res) => {
  try {
    const contestId = req.params.id;
    const userId = req.user.userId;

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Remove user from participants
    contest.participants = contest.participants.filter(
      p => p.userId.toString() !== userId
    );
    
    await contest.save();

    res.json({ message: 'Successfully left the contest' });
  } catch (error) {
    console.error('Leave contest error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get contest leaderboard
const getContestLeaderboard = async (req, res) => {
  try {
    const contestId = req.params.id;

    const contest = await Contest.findById(contestId)
      .populate('problems', '_id points');

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Get all submissions for this contest
    const submissions = await Submission.find({
      contestId,
      status: 'accepted'
    }).populate('userId', 'username profile.firstName profile.lastName');

    // Calculate scores and create leaderboard
    const participantScores = {};
    submissions.forEach(submission => {
      const userId = submission.userId._id.toString();
      if (!participantScores[userId]) {
        participantScores[userId] = {
          user: submission.userId,
          totalScore: 0,
          problemsSolved: new Set()
        };
      }
      participantScores[userId].problemsSolved.add(submission.problemId.toString());
      participantScores[userId].totalScore += submission.points;
    });

    const leaderboard = Object.values(participantScores)
      .map(entry => ({
        ...entry,
        problemsSolved: entry.problemsSolved.size
      }))
      .sort((a, b) => b.totalScore - a.totalScore);

    res.json({
      contest: {
        title: contest.title,
        startTime: contest.startTime,
        endTime: contest.endTime
      },
      leaderboard
    });
  } catch (error) {
    console.error('Get contest leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Export all functions
module.exports = {
  getContests,
  getContest,
  createContest,
  updateContest,
  deleteContest,
  joinContest,
  leaveContest,
  getContestLeaderboard
};