import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '3m', target: 50 },   // Stay at 50 users
    { duration: '1m', target: 100 },  // Ramp up to 100 users
    { duration: '3m', target: 100 },  // Stay at 100 users
    { duration: '1m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% of requests should fail
    errors: ['rate<0.05'],            // Less than 5% error rate
  },
};

// Test data
const testData = {
  validUser: {
    email: 'test@example.com',
    password: 'testPassword123',
  },
  contestSubmission: {
    code: 'function solution(input) { return input; }',
    language: 'javascript',
  },
};

// Main test scenario
export default function () {
  // Group 1: Authentication
  const authGroup = group('Authentication', () => {
    // Login request
    const loginRes = http.post('http://localhost:3000/api/auth/login', {
      json: testData.validUser,
    });

    check(loginRes, {
      'login successful': (r) => r.status === 200,
      'has access token': (r) => r.json('token') !== undefined,
    });

    if (loginRes.status !== 200) {
      errorRate.add(1);
      return false;
    }

    return loginRes.json('token');
  });

  // Skip other tests if authentication failed
  if (!authGroup) {
    sleep(1);
    return;
  }

  // Group 2: Contest Operations
  group('Contest Operations', () => {
    // Get active contests
    const contestsRes = http.get('http://localhost:3000/api/contests/active');
    
    check(contestsRes, {
      'get contests successful': (r) => r.status === 200,
      'has contests data': (r) => Array.isArray(r.json()),
    });

    if (contestsRes.status === 200 && contestsRes.json().length > 0) {
      const contestId = contestsRes.json()[0].id;

      // Submit solution
      const submissionRes = http.post(
        `http://localhost:3000/api/contests/${contestId}/submit`,
        {
          json: testData.contestSubmission,
        }
      );

      check(submissionRes, {
        'submission accepted': (r) => r.status === 202,
        'has submission id': (r) => r.json('submissionId') !== undefined,
      });

      if (submissionRes.status === 202) {
        // Check submission status
        const statusRes = http.get(
          `http://localhost:3000/api/submissions/${submissionRes.json('submissionId')}`
        );

        check(statusRes, {
          'status check successful': (r) => r.status === 200,
          'has valid status': (r) => ['pending', 'processing', 'completed'].includes(r.json('status')),
        });
      }
    }
  });

  // Group 3: Leaderboard Access
  group('Leaderboard', () => {
    const leaderboardRes = http.get('http://localhost:3000/api/leaderboard');
    
    check(leaderboardRes, {
      'leaderboard accessible': (r) => r.status === 200,
      'has rankings': (r) => Array.isArray(r.json('rankings')),
    });
  });

  // Sleep between iterations
  sleep(Math.random() * 3 + 2); // Random sleep between 2-5 seconds
}

// Setup code
export function setup() {
  // Verify API health before starting tests
  const healthCheck = http.get('http://localhost:3000/api/health');
  if (healthCheck.status !== 200) {
    throw new Error('API is not healthy');
  }
}

// Teardown code
export function teardown(data) {
  // Cleanup test data if needed
  console.log('Test completed. Cleaning up...');
}

// Handle test lifecycle
export function handleSummary(data) {
  return {
    'performance-results/summary.json': JSON.stringify(data),
    'performance-results/summary.html': generateHtmlReport(data),
  };
}

// Helper function to generate HTML report
function generateHtmlReport(data) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Performance Test Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .metric-good { color: green; }
          .metric-bad { color: red; }
        </style>
      </head>
      <body>
        <h1>Performance Test Report</h1>
        <h2>Summary</h2>
        <table>
          <tr>
            <th>Metric</th>
            <th>Value</th>
            <th>Threshold</th>
            <th>Status</th>
          </tr>
          ${Object.entries(data.metrics)
            .map(([metric, values]) => `
              <tr>
                <td>${metric}</td>
                <td>${values.values.rate.toFixed(2)}</td>
                <td>${options.thresholds[metric] || 'N/A'}</td>
                <td class="metric-${values.passes ? 'good' : 'bad'}">
                  ${values.passes ? 'PASS' : 'FAIL'}
                </td>
              </tr>
            `)
            .join('')}
        </table>
      </body>
    </html>
  `;
} 