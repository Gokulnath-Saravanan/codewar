#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const requiredEnvVars = {
  development: [
    'NODE_ENV',
    'PORT',
    'MONGODB_URI',
    'JWT_SECRET',
    'API_URL',
    'FRONTEND_URL'
  ],
  test: [
    'NODE_ENV',
    'MONGODB_URI',
    'JWT_SECRET'
  ],
  staging: [
    'NODE_ENV',
    'MONGODB_URI',
    'JWT_SECRET',
    'RAILWAY_TOKEN',
    'DOCKER_REGISTRY',
    'SNYK_TOKEN',
    'SLACK_WEBHOOK_URL'
  ],
  production: [
    'NODE_ENV',
    'MONGODB_URI',
    'MONGODB_USER',
    'MONGODB_PASSWORD',
    'JWT_SECRET',
    'REFRESH_TOKEN_SECRET',
    'HEROKU_API_KEY',
    'HEROKU_EMAIL',
    'SENTRY_DSN',
    'REDIS_URL'
  ]
};

const validateEnv = (environment) => {
  console.log(chalk.blue(`Validating ${environment} environment variables...\n`));
  
  const missing = [];
  const required = requiredEnvVars[environment];

  if (!required) {
    console.error(chalk.red(`Unknown environment: ${environment}`));
    process.exit(1);
  }

  required.forEach(variable => {
    if (!process.env[variable]) {
      missing.push(variable);
    }
  });

  if (missing.length > 0) {
    console.error(chalk.red('Missing required environment variables:'));
    missing.forEach(variable => {
      console.error(chalk.red(`  - ${variable}`));
    });
    process.exit(1);
  }

  // Validate specific variables
  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.startsWith('mongodb')) {
    console.error(chalk.red('Invalid MONGODB_URI format'));
    process.exit(1);
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn(chalk.yellow('Warning: JWT_SECRET should be at least 32 characters long'));
  }

  console.log(chalk.green('✓ Environment validation passed\n'));
};

const environment = process.env.NODE_ENV || 'development';
validateEnv(environment);

// Export for use in other files
module.exports = validateEnv; 