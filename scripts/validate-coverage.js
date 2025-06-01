#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const COVERAGE_THRESHOLD = 80;
const COVERAGE_FILES = [
  'frontend/coverage/coverage-summary.json',
  'backend/coverage/coverage-summary.json',
  'e2e/coverage/coverage-summary.json'
];

function readCoverageFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(chalk.yellow(`Warning: Could not read coverage file: ${filePath}`));
    return null;
  }
}

function calculateAggregatedCoverage(coverageReports) {
  const totals = {
    lines: { total: 0, covered: 0 },
    statements: { total: 0, covered: 0 },
    functions: { total: 0, covered: 0 },
    branches: { total: 0, covered: 0 }
  };

  coverageReports.forEach(report => {
    if (!report || !report.total) return;

    Object.keys(totals).forEach(metric => {
      totals[metric].total += report.total[metric].total || 0;
      totals[metric].covered += report.total[metric].covered || 0;
    });
  });

  return {
    lines: (totals.lines.covered / totals.lines.total) * 100,
    statements: (totals.statements.covered / totals.statements.total) * 100,
    functions: (totals.functions.covered / totals.functions.total) * 100,
    branches: (totals.branches.covered / totals.branches.total) * 100
  };
}

function validateCoverage() {
  console.log(chalk.blue('Validating test coverage...\n'));

  // Read all coverage reports
  const coverageReports = COVERAGE_FILES.map(file => readCoverageFile(file));
  const aggregatedCoverage = calculateAggregatedCoverage(coverageReports.filter(Boolean));

  // Print coverage report
  console.log(chalk.white('Coverage Summary:'));
  console.log('----------------');

  Object.entries(aggregatedCoverage).forEach(([metric, value]) => {
    const formattedValue = value.toFixed(2);
    const color = value >= COVERAGE_THRESHOLD ? 'green' : 'red';
    console.log(chalk[color](`${metric}: ${formattedValue}%`));
  });

  // Validate against threshold
  const failedMetrics = Object.entries(aggregatedCoverage)
    .filter(([_, value]) => value < COVERAGE_THRESHOLD)
    .map(([metric, value]) => `${metric} (${value.toFixed(2)}%)`);

  if (failedMetrics.length > 0) {
    console.error(chalk.red('\nCoverage threshold not met for:'));
    failedMetrics.forEach(metric => {
      console.error(chalk.red(`- ${metric} < ${COVERAGE_THRESHOLD}%`));
    });
    process.exit(1);
  }

  // Generate coverage badge data
  const overallCoverage = (
    Object.values(aggregatedCoverage).reduce((sum, value) => sum + value, 0) /
    Object.keys(aggregatedCoverage).length
  ).toFixed(2);

  const badgeColor = overallCoverage >= COVERAGE_THRESHOLD ? 'brightgreen' : 'red';
  const badgeData = {
    schemaVersion: 1,
    label: 'coverage',
    message: `${overallCoverage}%`,
    color: badgeColor
  };

  // Save badge data
  fs.writeFileSync(
    path.join(process.cwd(), 'coverage-badge.json'),
    JSON.stringify(badgeData, null, 2)
  );

  console.log(chalk.green('\n✓ Coverage validation passed'));
  console.log(chalk.blue(`Overall coverage: ${overallCoverage}%`));
}

// Generate detailed HTML report
function generateDetailedReport() {
  const reportData = {
    timestamp: new Date().toISOString(),
    coverage: {},
    files: []
  };

  COVERAGE_FILES.forEach(file => {
    const coverage = readCoverageFile(file);
    if (!coverage) return;

    const projectName = file.split('/')[0];
    reportData.coverage[projectName] = coverage.total;

    Object.entries(coverage).forEach(([filePath, metrics]) => {
      if (filePath === 'total') return;
      reportData.files.push({
        project: projectName,
        file: filePath,
        metrics
      });
    });
  });

  const htmlReport = generateHtmlReport(reportData);
  fs.writeFileSync(path.join(process.cwd(), 'coverage-report.html'), htmlReport);
}

function generateHtmlReport(data) {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>CodeWar Coverage Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { background: #f4f4f4; padding: 20px; border-radius: 5px; }
    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
    .metric-card { background: white; padding: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .files-table { width: 100%; border-collapse: collapse; }
    .files-table th, .files-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    .coverage-good { color: green; }
    .coverage-bad { color: red; }
  </style>
</head>
<body>
  <div class="header">
    <h1>CodeWar Coverage Report</h1>
    <p>Generated on: ${data.timestamp}</p>
  </div>

  <h2>Project Coverage</h2>
  <div class="metrics">
    ${Object.entries(data.coverage)
      .map(([project, metrics]) => `
        <div class="metric-card">
          <h3>${project}</h3>
          <p>Lines: ${metrics.lines.pct.toFixed(2)}%</p>
          <p>Functions: ${metrics.functions.pct.toFixed(2)}%</p>
          <p>Branches: ${metrics.branches.pct.toFixed(2)}%</p>
        </div>
      `)
      .join('')}
  </div>

  <h2>File Coverage Details</h2>
  <table class="files-table">
    <thead>
      <tr>
        <th>Project</th>
        <th>File</th>
        <th>Lines</th>
        <th>Functions</th>
        <th>Branches</th>
      </tr>
    </thead>
    <tbody>
      ${data.files
        .map(
          ({ project, file, metrics }) => `
        <tr>
          <td>${project}</td>
          <td>${file}</td>
          <td class="${metrics.lines.pct >= COVERAGE_THRESHOLD ? 'coverage-good' : 'coverage-bad'}">
            ${metrics.lines.pct.toFixed(2)}%
          </td>
          <td class="${metrics.functions.pct >= COVERAGE_THRESHOLD ? 'coverage-good' : 'coverage-bad'}">
            ${metrics.functions.pct.toFixed(2)}%
          </td>
          <td class="${metrics.branches.pct >= COVERAGE_THRESHOLD ? 'coverage-good' : 'coverage-bad'}">
            ${metrics.branches.pct.toFixed(2)}%
          </td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>
</body>
</html>`;
}

// Run validation and report generation
validateCoverage();
generateDetailedReport(); 