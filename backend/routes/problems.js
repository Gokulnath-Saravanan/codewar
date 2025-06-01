const express = require('express');
const { body } = require('express-validator');
const problemController = require('../controllers/problemController');
// Fix: Destructure both auth and adminAuth from middleware
const { auth, adminAuth } = require('../middleware/auth');
const { apiLimiter, adminLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Get all problems
router.get('/', auth, apiLimiter, problemController.getAllProblems);

// Get daily problem
router.get('/daily', auth, apiLimiter, problemController.getDailyProblem);

// Get daily problem settings
router.get('/daily-settings', [auth, adminAuth, adminLimiter], problemController.getDailySettings);

// Update daily problem settings
router.put('/daily-settings', [auth, adminAuth, adminLimiter], problemController.updateDailySettings);

// Generate daily problems
router.post('/generate-daily', [auth, adminAuth, adminLimiter], problemController.generateDailyProblems);

// Get problem by ID
router.get('/:id', auth, apiLimiter, problemController.getProblemById);

// Create problem (admin only) - Fix: Separate validation array from middleware array
router.post('/', [
  auth, 
  adminAuth,
  adminLimiter,
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty'),
  body('category').notEmpty().withMessage('Category is required'),
  body('testCases').isArray({ min: 1 }).withMessage('At least one test case is required')
], problemController.createProblem);

// Update problem (admin only) - Use adminAuth instead of isAdmin
router.put('/:id', [auth, adminAuth, adminLimiter], problemController.updateProblem);

// Delete problem (admin only) - Use adminAuth instead of isAdmin
router.delete('/:id', [auth, adminAuth, adminLimiter], problemController.deleteProblem);

// @route   POST /api/problems/generate
// @desc    Generate a problem using AI
// @access  Private (Admin only)
router.post('/generate', [auth, adminAuth, adminLimiter], problemController.generateProblem);

module.exports = router;