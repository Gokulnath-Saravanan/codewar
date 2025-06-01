module.exports = {
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text', 'text-summary'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/config/',
    '/scripts/',
    '/temp/'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/config/',
    '/scripts/',
    '/temp/'
  ],
  setupFilesAfterEnv: ['./jest.setup.js'],
  testTimeout: 30000,
  detectOpenHandles: true,
  forceExit: true
}; 