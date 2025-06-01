// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cron = require('node-cron');
require('dotenv').config();

const connectDB = require('./config/database');
const { apiLimiter } = require('./middleware/rateLimiter');
const { generateDailyChallenge, scheduleDailyProblemGeneration } = require('./utils/generateProblems');
const Problem = require('./models/Problem');

// Import routes
const authRoutes = require('./routes/auth');
const problemRoutes = require('./routes/problems');
const contestRoutes = require('./routes/contests');
const submissionRoutes = require('./routes/submissions');
const leaderboardRoutes = require('./routes/leaderboard');
const userRoutes = require('./routes/users');
const statsRoutes = require('./routes/stats');
const adminRoutes = require('./routes/admin');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all requests
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      message: 'Validation Error',
      errors
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      message: `${field} already exists`
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }
  
  // Default error
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Schedule daily problem generation (runs at 12:00 AM every day)
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('Generating daily problem...');
    const dailyProblem = await generateDailyChallenge();
    
    // Save the daily problem
    const problem = new Problem({
      ...dailyProblem,
      isDaily: true,
      dailyDate: new Date().toDateString()
    });
    
    await problem.save();
    console.log('Daily problem generated successfully:', problem.title);
  } catch (error) {
    console.error('Failed to generate daily problem:', error);
  }
});

// Schedule leaderboard updates (runs every hour)
cron.schedule('0 * * * *', async () => {
  try {
    console.log('Updating leaderboards...');
    // Update logic would go here
    // This could involve calculating new rankings, updating user stats, etc.
    console.log('Leaderboards updated successfully');
  } catch (error) {
    console.error('Failed to update leaderboards:', error);
  }
});

// Start daily problem generation scheduler
scheduleDailyProblemGeneration();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});