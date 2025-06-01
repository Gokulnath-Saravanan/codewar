const config = {
  // Production API URL - this will be replaced during build
  apiUrl: process.env.REACT_APP_API_URL || 'https://codewar-backend.onrender.com',
  
  // Build configuration
  build: {
    outputPath: 'build',
    publicPath: '/',
    sourceMap: false,
    optimization: true
  },
  
  // Static file configuration
  static: {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  }
};

module.exports = config; 