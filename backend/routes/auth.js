const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');

// Fix: Destructure auth from the middleware export
const { auth } = require('../middleware/auth');

const router = express.Router();

// Registration route with validation
router.post('/register', [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters.')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores.'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.')
], authController.register);

// Login route with validation
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address.'),
  body('password')
    .notEmpty()
    .withMessage('Password is required.')
], authController.login);

// Get user profile (protected route)
router.get('/profile', auth, authController.getProfile);

// Update user profile (protected route)
router.put('/profile', auth, authController.updateProfile);

// Verify token route
router.get('/verify', auth, authController.verifyToken);

module.exports = router;