# Contest Management Guide

This guide covers the process of creating, managing, and maintaining contests on the CodeWar platform.

## Table of Contents
- [Contest Creation](#contest-creation)
- [Contest Structure](#contest-structure)
- [Test Case Management](#test-case-management)
- [Validation Rules](#validation-rules)
- [Scoring System](#scoring-system)
- [Security Considerations](#security-considerations)

## Contest Creation

### 1. Initialize Contest

```bash
# Create new contest
npm run create-contest -- --name="My New Contest"
```

This creates the following structure:
```
contests/
└── my-new-contest/
    ├── config.json
    ├── description.md
    ├── test-cases/
    │   ├── sample/
    │   └── hidden/
    ├── solutions/
    └── validators/
```

### 2. Configure Contest

```json
// config.json
{
  "id": "my-new-contest",
  "title": "My New Contest",
  "description": "Contest description",
  "startDate": "2024-03-01T00:00:00Z",
  "endDate": "2024-03-02T00:00:00Z",
  "timeLimit": 2000,
  "memoryLimit": 256,
  "maxParticipants": 1000,
  "scoring": {
    "type": "points",
    "maxPoints": 100,
    "testCaseWeights": {
      "basic": 20,
      "edge": 30,
      "performance": 50
    }
  },
  "languages": [
    {
      "id": "javascript",
      "version": "20.x",
      "compiler": "node",
      "template": "solutions/template.js"
    },
    {
      "id": "python",
      "version": "3.11",
      "compiler": "python3",
      "template": "solutions/template.py"
    }
  ]
}
```

### 3. Write Problem Description

```markdown
// description.md
# My New Contest

## Problem Statement
Describe the problem here...

## Input Format
- Line 1: Integer N (1 ≤ N ≤ 10⁵)
- Line 2: N space-separated integers

## Output Format
- Single line with the answer

## Constraints
- Time Limit: 2 seconds
- Memory Limit: 256 MB
- 1 ≤ N ≤ 10⁵
- -10⁹ ≤ Ai ≤ 10⁹

## Sample Test Cases
Input:
```
5
1 2 3 4 5
```

Output:
```
15
```

## Test Case Management

### 1. Generate Test Cases

```bash
# Generate test cases
npm run generate-tests -- --contest="my-new-contest"
```

### 2. Test Case Structure

```
test-cases/
├── sample/
│   ├── input1.txt
│   ├── output1.txt
│   ├── input2.txt
│   └── output2.txt
└── hidden/
    ├── basic/
    │   ├── input1.txt
    │   └── output1.txt
    ├── edge/
    │   ├── input1.txt
    │   └── output1.txt
    └── performance/
        ├── input1.txt
        └── output1.txt
```

### 3. Test Case Generator

```javascript
// generators/test-generator.js
const generateTestCase = (size) => {
  const n = Math.floor(Math.random() * size) + 1;
  const array = Array.from(
    { length: n },
    () => Math.floor(Math.random() * 1e9)
  );
  
  return {
    input: `${n}\n${array.join(' ')}`,
    output: `${array.reduce((a, b) => a + b, 0)}`
  };
};

module.exports = {
  basic: () => generateTestCase(100),
  edge: () => generateTestCase(1e4),
  performance: () => generateTestCase(1e5)
};
```

## Validation Rules

### 1. Input Validation

```javascript
// validators/input-validator.js
const validateInput = (input) => {
  const lines = input.trim().split('\n');
  const n = parseInt(lines[0]);
  const array = lines[1].split(' ').map(Number);
  
  if (n !== array.length) {
    throw new Error('Invalid input format');
  }
  
  if (n < 1 || n > 1e5) {
    throw new Error('N out of range');
  }
  
  for (const num of array) {
    if (num < -1e9 || num > 1e9) {
      throw new Error('Array element out of range');
    }
  }
  
  return true;
};
```

### 2. Output Validation

```javascript
// validators/output-validator.js
const validateOutput = (input, output, expected) => {
  const result = output.trim();
  const answer = expected.trim();
  
  if (!/^\d+$/.test(result)) {
    throw new Error('Invalid output format');
  }
  
  return result === answer;
};
```

## Scoring System

### 1. Point-based Scoring

```javascript
// scoring/point-scorer.js
const calculateScore = (testResults) => {
  const weights = {
    basic: 20,
    edge: 30,
    performance: 50
  };
  
  let totalScore = 0;
  for (const [type, results] of Object.entries(testResults)) {
    const typeScore = results.reduce(
      (score, result) => score + (result.passed ? 1 : 0),
      0
    ) / results.length * weights[type];
    
    totalScore += typeScore;
  }
  
  return Math.round(totalScore);
};
```

### 2. Time-based Bonuses

```javascript
// scoring/time-scorer.js
const calculateTimeBonus = (executionTime, timeLimit) => {
  if (executionTime <= timeLimit * 0.5) {
    return 10;
  } else if (executionTime <= timeLimit * 0.75) {
    return 5;
  }
  return 0;
};
```

## Security Considerations

### 1. Code Execution Sandbox

```javascript
// security/sandbox.js
const { Worker } = require('worker_threads');

const runInSandbox = async (code, input, limits) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./sandbox-worker.js', {
      workerData: { code, input, limits }
    });
    
    const timeout = setTimeout(() => {
      worker.terminate();
      reject(new Error('Time limit exceeded'));
    }, limits.timeLimit);
    
    worker.on('message', (result) => {
      clearTimeout(timeout);
      resolve(result);
    });
    
    worker.on('error', reject);
  });
};
```

### 2. Resource Monitoring

```javascript
// security/resource-monitor.js
const monitor = {
  memory: () => {
    const used = process.memoryUsage();
    return used.heapUsed / 1024 / 1024;
  },
  
  cpu: async (pid) => {
    const usage = await pidusage(pid);
    return usage.cpu;
  }
};
```

## Contest Lifecycle

### 1. Pre-contest Checklist

- [ ] Problem statement reviewed
- [ ] Test cases generated and validated
- [ ] Solution templates prepared
- [ ] Resource limits verified
- [ ] Scoring system tested
- [ ] Security measures implemented

### 2. During Contest

```javascript
// monitoring/contest-monitor.js
const monitorContest = async (contestId) => {
  const metrics = {
    activeParticipants: 0,
    submissionCount: 0,
    averageScore: 0,
    systemLoad: 0
  };
  
  // Update metrics every minute
  setInterval(async () => {
    metrics.activeParticipants = await getActiveParticipants(contestId);
    metrics.submissionCount = await getSubmissionCount(contestId);
    metrics.averageScore = await calculateAverageScore(contestId);
    metrics.systemLoad = await getSystemLoad();
    
    await updateMetrics(contestId, metrics);
  }, 60000);
};
```

### 3. Post-contest Analysis

```javascript
// analysis/contest-analyzer.js
const analyzeContest = async (contestId) => {
  const stats = {
    participantCount: 0,
    submissionStats: {
      total: 0,
      successful: 0,
      failed: 0
    },
    scoreDistribution: [],
    performanceMetrics: {
      averageExecutionTime: 0,
      averageMemoryUsage: 0
    }
  };
  
  // Generate comprehensive report
  await generateContestReport(contestId, stats);
};
```

## Maintenance

### 1. Regular Tasks

```bash
# Update test cases
npm run update-tests -- --contest="my-new-contest"

# Validate all contests
npm run validate-all-contests

# Clean up old contests
npm run cleanup-contests -- --older-than=30d
```

### 2. Backup Procedures

```bash
# Backup contest data
npm run backup-contests -- --output="backups/"

# Restore contest data
npm run restore-contest -- --contest="my-new-contest" --backup="backups/my-new-contest.zip"
```

## Support

### Contact Information

For contest-related issues:
- Contest Team: contests@codewar.example.com
- Technical Support: support@codewar.example.com
- Emergency: +1-xxx-xxx-xxxx

### Documentation

- [Contest API Documentation](./API.md#contests)
- [Scoring System Documentation](./SCORING.md)
- [Security Guidelines](./SECURITY.md#contests) 