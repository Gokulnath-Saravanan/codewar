const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // MongoDB Connection Errors
  if (err.name === 'MongoServerSelectionError') {
    return res.status(503).json({
      message: 'Database connection error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // MongoDB Operation Errors
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    return res.status(500).json({
      message: 'Database operation failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Invalid input data',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  // Default Error
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler; 