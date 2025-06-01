const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  contestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest'
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ['javascript', 'python', 'java', 'cpp', 'c']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'runtime_error', 'compilation_error'],
    default: 'pending'
  },
  testResults: [{
    input: String,
    expectedOutput: String,
    actualOutput: String,
    passed: Boolean,
    executionTime: Number,
    memoryUsed: Number
  }],
  totalTestCases: Number,
  passedTestCases: Number,
  executionTime: Number,
  memoryUsed: Number,
  points: {
    type: Number,
    default: 0
  },
  errorMessage: String
}, {
  timestamps: true
});

submissionSchema.index({ userId: 1, problemId: 1 });
submissionSchema.index({ contestId: 1, createdAt: -1 });
submissionSchema.index({ status: 1 });

module.exports = mongoose.model('Submission', submissionSchema);