// Set test timeout
jest.setTimeout(30000);

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.PORT = '5001';

// Silence console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global teardown
afterAll(async () => {
  // Add any cleanup needed after all tests
  await new Promise(resolve => setTimeout(resolve, 500)); // Add a small delay for cleanup
}); 