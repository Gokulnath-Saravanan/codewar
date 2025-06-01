const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// Function to generate a JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'secretKey', {
    expiresIn: '7d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
const register = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, role = 'student' } = req.body;

    // Check for existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'User with this email or username already exists' });
    }

    // Create and save user
    const user = new User({ username, email, password, role });
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        stats: user.stats
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @route   POST /api/auth/login
// @desc    Login user
const login = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        stats: user.stats,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @route   GET /api/auth/profile
// @desc    Get current user's profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId || req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.profile?.fullName || '',
      bio: user.profile?.bio || '',
      college: user.profile?.college || '',
      graduationYear: user.profile?.year || '',
      skills: user.profile?.skills || [],
      socialLinks: user.profile?.socialLinks || {
        github: '',
        linkedin: '',
        portfolio: ''
      },
      stats: user.stats || {},
      role: user.role,
      preferences: user.preferences || {}
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   PUT /api/auth/profile
// @desc    Update current user's profile
const updateProfile = async (req, res) => {
  try {
    const { profile, preferences } = req.body;

    const updateData = {};
    if (profile) updateData.profile = profile;
    if (preferences) updateData.preferences = preferences;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   GET /api/auth/verify
// @desc    Verify JWT token and return user data
const verifyToken = async (req, res) => {
  try {
    // If we get here, it means the auth middleware has already verified the token
    // and attached the user to the request
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        stats: user.stats,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ success: false, message: 'Error verifying token' });
  }
};

// ✅ Export all functions
module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  verifyToken
};
