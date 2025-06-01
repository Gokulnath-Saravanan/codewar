const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const { validationResult } = require('express-validator');

// @desc    Create a new problem
// @route   POST /api/problems
exports.createProblem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const problemData = {
      ...req.body,
      createdBy: req.user.userId
    };

    const problem = new Problem(problemData);
    await problem.save();

    res.status(201).json({
      message: 'Problem created successfully',
      problem
    });
  } catch (error) {
    console.error('Create problem error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all problems
// @route   GET /api/problems
exports.getAllProblems = async (req, res) => {
  try {
    const { page = 1, limit = 10, difficulty, category, search } = req.query;
    
    const query = { isActive: true };
    
    if (difficulty) query.difficulty = difficulty;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const problems = await Problem.find(query)
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-testCases');

    const total = await Problem.countDocuments(query);

    res.json({
      problems,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get problem by ID
// @route   GET /api/problems/:id
exports.getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id)
      .populate('createdBy', 'username');

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Don't send hidden test cases to non-admin users
    if (req.user.role !== 'admin') {
      problem.testCases = problem.testCases.filter(tc => !tc.isHidden);
    }

    res.json(problem);
  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update problem
// @route   PUT /api/problems/:id
exports.updateProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    res.json({
      message: 'Problem updated successfully',
      problem
    });
  } catch (error) {
    console.error('Update problem error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete problem
// @route   DELETE /api/problems/:id
exports.deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    res.json({ message: 'Problem deleted successfully' });
  } catch (error) {
    console.error('Delete problem error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get daily problem
// @route   GET /api/problems/daily
exports.getDailyProblem = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Try to find today's problem first
    let dailyProblem = await Problem.findOne({
      createdAt: { $gte: today, $lt: tomorrow },
      aiGenerated: true,
      isActive: true
    });

    // If no problem for today, get a random one
    if (!dailyProblem) {
      const randomProblems = await Problem.aggregate([
        { $match: { isActive: true } },
        { $sample: { size: 1 } }
      ]);
      dailyProblem = randomProblems[0];
    }

    if (!dailyProblem) {
      return res.status(404).json({ message: 'No daily problem available' });
    }

    res.json(dailyProblem);
  } catch (error) {
    console.error('Get daily problem error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Generate a problem using AI
// @route   POST /api/problems/generate
// @access  Private (Admin only)
exports.generateProblem = async (req, res) => {
  try {
    const { difficulty, topics, preferredLanguages = ['javascript', 'python'] } = req.body;

    // Validate input
    if (!difficulty || !topics || topics.length === 0) {
      return res.status(400).json({
        message: 'Difficulty and at least one topic are required'
      });
    }

    // TODO: Integrate with OpenAI API to generate problem
    // For now, return a mock problem
    const mockProblem = {
      title: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Problem on ${topics[0]}`,
      description: `This is a ${difficulty} level problem focusing on ${topics.join(', ')}.`,
      difficulty,
      category: topics[0],
      tags: topics,
      testCases: [
        {
          input: 'test input 1',
          expectedOutput: 'test output 1',
          isHidden: false
        },
        {
          input: 'test input 2',
          expectedOutput: 'test output 2',
          isHidden: true
        }
      ],
      constraints: 'Time Limit: 1000ms, Memory Limit: 256MB',
      timeLimit: 1000,
      memoryLimit: 256,
      examples: [
        {
          input: 'Example input',
          output: 'Example output',
          explanation: 'Explanation of the example'
        }
      ],
      hints: ['Try to solve it step by step', 'Consider edge cases'],
      points: difficulty === 'easy' ? 100 : difficulty === 'medium' ? 200 : 300,
      solutions: preferredLanguages.map(lang => ({
        language: lang,
        code: `// Solution template for ${lang}`
      }))
    };

    // Save the generated problem
    const problem = new Problem({
      ...mockProblem,
      createdBy: req.user.userId,
      aiGenerated: true
    });
    await problem.save();

    res.status(201).json({
      message: 'Problem generated successfully',
      problem
    });
  } catch (error) {
    console.error('Error generating problem:', error);
    res.status(500).json({ message: 'Error generating problem' });
  }
};

// @desc    Get daily problem settings
// @route   GET /api/problems/daily-settings
// @access  Private (Admin only)
exports.getDailySettings = async (req, res) => {
  try {
    // Get settings from database or use defaults
    const settings = {
      generateTime: '00:00',
      difficulties: {
        easy: true,
        medium: true,
        hard: true
      },
      topics: {
        arrays: true,
        strings: true,
        'dynamic-programming': true,
        trees: true,
        graphs: true
      },
      retentionDays: 7
    };

    res.json(settings);
  } catch (error) {
    console.error('Error getting daily settings:', error);
    res.status(500).json({ message: 'Error getting daily settings' });
  }
};

// @desc    Update daily problem settings
// @route   PUT /api/problems/daily-settings
// @access  Private (Admin only)
exports.updateDailySettings = async (req, res) => {
  try {
    const settings = req.body;
    // TODO: Validate settings
    // TODO: Save settings to database
    
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('Error updating daily settings:', error);
    res.status(500).json({ message: 'Error updating daily settings' });
  }
};

// @desc    Generate daily problems
// @route   POST /api/problems/generate-daily
// @access  Private (Admin only)
exports.generateDailyProblems = async (req, res) => {
  try {
    const difficulties = ['easy', 'medium', 'hard'];
    const topics = ['arrays', 'strings', 'dynamic-programming', 'trees', 'graphs'];
    
    const problems = [];
    
    for (const difficulty of difficulties) {
      const randomTopics = topics
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);

      // Create a mock request and response for generateProblem
      const mockReq = {
        body: {
          difficulty,
          topics: randomTopics,
          preferredLanguages: ['javascript', 'python', 'java']
        },
        user: req.user
      };

      const mockRes = {
        status: (code) => ({
          json: (data) => {
            if (code === 201) {
              problems.push(data.problem);
            }
            return data;
          }
        })
      };

      await exports.generateProblem(mockReq, mockRes);
    }
    
    res.json({
      message: 'Daily problems generated successfully',
      problems
    });
  } catch (error) {
    console.error('Error generating daily problems:', error);
    res.status(500).json({ message: 'Error generating daily problems' });
  }
};