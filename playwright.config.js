const { devices } = require('@playwright/test');

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: './tests',
  timeout: 30000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  use: {
    actionTimeout: 15000,
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    video: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    // E2E Testing Projects
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      }
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox']
      }
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari']
      }
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5']
      }
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12']
      }
    },
    // Visual Testing Project
    {
      name: 'visual',
      testMatch: /.*\.visual\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        screenshot: 'on',
        video: 'off',
        // Visual comparison settings
        _comparator: {
          maxDiffPixels: 100,
          threshold: 0.1,
          allowSizeMismatch: false
        }
      }
    }
  ],
  // Web server configuration
  webServer: {
    command: 'npm run start:test',
    port: 3000,
    timeout: 120000,
    reuseExistingServer: !process.env.CI
  },
  // Global setup
  globalSetup: require.resolve('./tests/global-setup'),
  globalTeardown: require.resolve('./tests/global-teardown'),
  // Output configuration
  outputDir: 'test-results',
  snapshotDir: 'test-snapshots',
  // Test patterns
  testMatch: '**/?(*.)@(spec|test).*',
  testIgnore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
  // Parallel execution
  fullyParallel: true,
  // Artifacts
  preserveOutput: 'failures-only',
  // Custom options for visual testing
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.1
    },
    toMatchSnapshot: {
      threshold: 0.1
    }
  },
  // Custom reporters
  metadata: {
    platform: process.platform,
    headless: !!process.env.CI,
    browserName: 'chromium',
    device: 'Desktop Chrome',
    viewport: '1280x720'
  }
};

module.exports = config; 