const { test, expect } = require('@playwright/test');
const { ZapClient } = require('zaproxy');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Security test configuration
const config = {
  baseUrl: 'http://localhost:3000',
  zapOptions: {
    apiKey: process.env.ZAP_API_KEY || 'zap-api-key',
    proxy: {
      host: 'localhost',
      port: 8080
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'test-secret',
    expiresIn: '1h'
  },
  vulnerabilities: {
    highRiskThreshold: 0,
    mediumRiskThreshold: 2,
    lowRiskThreshold: 5
  }
};

// Initialize ZAP client
const zap = new ZapClient(config.zapOptions);

// Security test utilities
class SecurityTestUtils {
  static generateToken(payload, options = {}) {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
      ...options
    });
  }

  static async scanEndpoint(url, method = 'GET', data = null) {
    const scanId = await zap.ascan.scan({
      url,
      method,
      postData: data ? JSON.stringify(data) : undefined
    });
    return scanId;
  }

  static async waitForScanCompletion(scanId, timeout = 300000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const status = await zap.ascan.status(scanId);
      if (status === 100) return true;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    throw new Error('Scan timeout');
  }

  static generateRandomString(length = 16) {
    return crypto.randomBytes(length).toString('hex');
  }
}

// Security test suites
test.describe('Security Tests', () => {
  test.beforeAll(async () => {
    // Start ZAP proxy
    await zap.core.newSession();
    await zap.core.setMode('attack');
  });

  test.afterAll(async () => {
    // Generate security report
    const report = await zap.core.htmlreport();
    require('fs').writeFileSync('security-results/zap-report.html', report);
  });

  // Authentication Tests
  test.describe('Authentication Security', () => {
    test('should prevent brute force attacks', async ({ request }) => {
      const attempts = [];
      for (let i = 0; i < 10; i++) {
        const response = await request.post(`${config.baseUrl}/api/auth/login`, {
          data: {
            email: 'test@example.com',
            password: SecurityTestUtils.generateRandomString()
          }
        });
        attempts.push(response.status());
      }

      // Check rate limiting
      expect(attempts.filter(status => status === 429).length).toBeGreaterThan(0);
    });

    test('should validate JWT tokens properly', async ({ request }) => {
      // Test with expired token
      const expiredToken = SecurityTestUtils.generateToken({ id: 1 }, { expiresIn: 0 });
      const response = await request.get(`${config.baseUrl}/api/protected`, {
        headers: { Authorization: `Bearer ${expiredToken}` }
      });
      expect(response.status()).toBe(401);

      // Test with tampered token
      const tamperedToken = expiredToken.slice(0, -1) + '1';
      const response2 = await request.get(`${config.baseUrl}/api/protected`, {
        headers: { Authorization: `Bearer ${tamperedToken}` }
      });
      expect(response2.status()).toBe(401);
    });
  });

  // Input Validation Tests
  test.describe('Input Validation Security', () => {
    test('should prevent XSS attacks', async ({ page }) => {
      const xssPayload = '<script>alert(1)</script>';
      await page.goto(`${config.baseUrl}/search?q=${encodeURIComponent(xssPayload)}`);
      const content = await page.content();
      expect(content).not.toContain(xssPayload);
    });

    test('should prevent SQL injection', async ({ request }) => {
      const sqlInjectionPayload = "' OR '1'='1";
      const response = await request.post(`${config.baseUrl}/api/auth/login`, {
        data: {
          email: sqlInjectionPayload,
          password: sqlInjectionPayload
        }
      });
      expect(response.status()).toBe(400);
    });

    test('should prevent NoSQL injection', async ({ request }) => {
      const nosqlPayload = { $gt: '' };
      const response = await request.post(`${config.baseUrl}/api/auth/login`, {
        data: {
          email: nosqlPayload,
          password: 'password'
        }
      });
      expect(response.status()).toBe(400);
    });
  });

  // API Security Tests
  test.describe('API Security', () => {
    test('should have secure headers', async ({ request }) => {
      const response = await request.get(config.baseUrl);
      const headers = response.headers();

      expect(headers['x-frame-options']).toBeDefined();
      expect(headers['x-xss-protection']).toBeDefined();
      expect(headers['x-content-type-options']).toBeDefined();
      expect(headers['strict-transport-security']).toBeDefined();
      expect(headers['content-security-policy']).toBeDefined();
    });

    test('should prevent CSRF attacks', async ({ request }) => {
      const response = await request.post(`${config.baseUrl}/api/protected`, {
        headers: { 'Content-Type': 'application/json' }
      });
      expect(response.status()).toBe(403);
    });
  });

  // File Upload Security Tests
  test.describe('File Upload Security', () => {
    test('should prevent malicious file uploads', async ({ request }) => {
      const maliciousFile = {
        name: 'malicious.js',
        content: '<?php echo "malicious"; ?>'
      };

      const response = await request.post(`${config.baseUrl}/api/upload`, {
        multipart: {
          file: {
            name: maliciousFile.name,
            content: Buffer.from(maliciousFile.content)
          }
        }
      });

      expect(response.status()).toBe(400);
    });
  });

  // Vulnerability Scanning
  test.describe('Vulnerability Scanning', () => {
    test('should not have critical vulnerabilities', async () => {
      // Run ZAP scan
      const scanId = await SecurityTestUtils.scanEndpoint(config.baseUrl);
      await SecurityTestUtils.waitForScanCompletion(scanId);

      // Get alerts
      const alerts = await zap.core.alerts();
      const highRisks = alerts.filter(alert => alert.risk === 'High');
      const mediumRisks = alerts.filter(alert => alert.risk === 'Medium');
      const lowRisks = alerts.filter(alert => alert.risk === 'Low');

      // Assert against thresholds
      expect(highRisks.length).toBeLessThanOrEqual(config.vulnerabilities.highRiskThreshold);
      expect(mediumRisks.length).toBeLessThanOrEqual(config.vulnerabilities.mediumRiskThreshold);
      expect(lowRisks.length).toBeLessThanOrEqual(config.vulnerabilities.lowRiskThreshold);
    });
  });
});

// Export utilities for use in other tests
module.exports = {
  SecurityTestUtils,
  config
}; 