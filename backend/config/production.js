module.exports = {
  mongoURI: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  port: process.env.PORT || 5000,
  clientURL: process.env.CLIENT_URL,
  nodeEnv: 'production',
  corsOptions: {
    origin: process.env.CLIENT_URL,
    credentials: true,
    optionsSuccessStatus: 200
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }
}; 