const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');
const codeExecutionService = require('../services/codeExecutionService');
const { validationResult } = require('express-validator');
const Contest = require('../models/Contest');

exports.submitSolution = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { problemId, code, language, contestId } = req.body;
    const userId = req.user.userId;

    // Get the problem with test cases
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Create submission
    const submission = new Submission({
      userId,
      problemId,
      contestId,
      code,
      language,
      totalTestCases: problem.testCases.length
    });

    await submission.save();

    // Execute code against test cases
    try {
      const results = await codeExecutionService.executeCode(
        code,
        language,
        problem.testCases,
        problem.timeLimit,
        problem.memoryLimit
      );

      // Update submission with results
      submission.testResults = results.testResults;
      submission.passedTestCases = results.passedTestCases;
      submission.status = results.status;
      submission.executionTime = results.executionTime;
      submission.memoryUsed = results.memoryUsed;
      submission.errorMessage = results.errorMessage;

      // Calculate points
      if (results.status === 'accepted') {
        submission.points = problem.points;
        
        // Update user stats
        await User.findByIdAndUpdate(userId, {
          $inc: {
            'stats.problemsSolved': 1,
            'stats.totalSubmissions': 1,
            'stats.successfulSubmissions': 1,
            'stats.totalPoints': problem.points
          },
          $set: {
            'stats.lastSolvedDate': new Date()
          }
        });

        // Update problem stats
        await Problem.findByIdAndUpdate(problemId, {
          $inc: { solvedCount: 1, totalAttempts: 1 }
        });
      } else {
        // Just increment total submissions
        await User.findByIdAndUpdate(userId, {
          $inc: { 'stats.totalSubmissions': 1 }
        });
        
        await Problem.findByIdAndUpdate(problemId, {
          $inc: { totalAttempts: 1 }
        });
      }

      await submission.save();

      res.json({
        message: 'Solution submitted successfully',
        submission: {
          id: submission._id,
          status: submission.status,
          passedTestCases: submission.passedTestCases,
          totalTestCases: submission.totalTestCases,
          executionTime: submission.executionTime,
          memoryUsed: submission.memoryUsed,
          points: submission.points,
          testResults: submission.testResults.map(result => ({
            passed: result.passed,
            input: result.input,
            expectedOutput: result.expectedOutput,
            actualOutput: result.actualOutput,
            executionTime: result.executionTime
          }))
        }
      });
    } catch (executionError) {
      console.error('Code execution error:', executionError);
      
      submission.status = 'runtime_error';
      submission.errorMessage = executionError.message;
      await submission.save();

      res.json({
        message: 'Solution submitted but execution failed',
        submission: {
          id: submission._id,
          status: submission.status,
          errorMessage: submission.errorMessage
        }
      });
    }
  } catch (error) {
    console.error('Submit solution error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSubmissions = async (req, res) => {
  try {
    const { page = 1, limit = 10, problemId, status } = req.query;
    const userId = req.user.userId;

    const query = { userId };
    if (problemId) query.problemId = problemId;
    if (status) query.status = status;

    const submissions = await Submission.find(query)
      .populate('problemId', 'title difficulty')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-code -testResults');

    const total = await Submission.countDocuments(query);

    res.json({
      submissions,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('problemId', 'title')
      .populate('userId', 'username');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if user owns this submission or is admin
    if (submission.userId._id.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(submission);
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Run code without submitting
const runCode = async (req, res) => {
  try {
    const { code, language, testCases } = req.body;
    
    // Here you would integrate with your code execution service
    // For now, we'll just return a mock response
    res.json({
      status: 'success',
      results: testCases.map(test => ({
        passed: true,
        output: 'Mock output',
        expectedOutput: test.expectedOutput,
        executionTime: '100ms'
      }))
    });
  } catch (error) {
    console.error('Run code error:', error);
    res.status(500).json({ message: 'Error running code' });
  }
};

// Get user's submissions
const getUserSubmissions = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;
    const submissions = await Submission.find({ userId })
      .populate('problemId', 'title difficulty')
      .populate('contestId', 'title')
      .sort({ createdAt: -1 });
    
    res.json(submissions);
  } catch (error) {
    console.error('Get user submissions error:', error);
    res.status(500).json({ message: 'Error fetching user submissions' });
  }
};

const getRecentSubmissions = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const limit = parseInt(req.query.limit) || 5;
    const userId = req.user._id;

    const submissions = await Submission.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({
        path: 'problemId',
        select: 'title difficulty'
      })
      .lean();

    const formattedSubmissions = submissions.map(sub => ({
      _id: sub._id,
      problemTitle: sub.problemId?.title || 'Unknown Problem',
      difficulty: sub.problemId?.difficulty || 'unknown',
      status: sub.status,
      submittedAt: sub.createdAt,
      language: sub.language,
      executionTime: sub.executionTime,
      memory: sub.memoryUsed
    }));

    res.json(formattedSubmissions);
  } catch (error) {
    console.error('Error getting recent submissions:', error);
    res.status(500).json({ 
      message: 'Error getting recent submissions', 
      error: error.message 
    });
  }
};

module.exports = {
  submitSolution: exports.submitSolution,
  getSubmissions: exports.getSubmissions,
  getSubmission: exports.getSubmissionById,
  runCode,
  getUserSubmissions,
  getRecentSubmissions
};