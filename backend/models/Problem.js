const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: false }
});

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  tags: [String],
  testCases: [testCaseSchema],
  constraints: String,
  timeLimit: {
    type: Number,
    default: 2000 // milliseconds
  },
  memoryLimit: {
    type: Number,
    default: 128 // MB
  },
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  hints: [String],
  points: {
    type: Number,
    default: 100
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  solvedCount: {
    type: Number,
    default: 0
  },
  totalAttempts: {
    type: Number,
    default: 0
  },
  aiGenerated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

problemSchema.index({ difficulty: 1, category: 1 });
problemSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Problem', problemSchema);