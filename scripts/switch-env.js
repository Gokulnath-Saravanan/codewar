#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');
const validateEnv = require('./validate-env');

const ENVIRONMENTS = ['development', 'test', 'staging', 'production'];

function switchEnvironment(targetEnv) {
  if (!ENVIRONMENTS.includes(targetEnv)) {
    console.error(chalk.red(`Invalid environment. Choose from: ${ENVIRONMENTS.join(', ')}`));
    process.exit(1);
  }

  console.log(chalk.blue(`Switching to ${targetEnv} environment...\n`));

  // Load environment-specific variables
  const envFile = path.join(process.cwd(), `.env.${targetEnv}`);
  if (!fs.existsSync(envFile)) {
    console.error(chalk.red(`Environment file not found: ${envFile}`));
    process.exit(1);
  }

  try {
    // Backup current .env if exists
    if (fs.existsSync('.env')) {
      fs.copyFileSync('.env', '.env.backup');
    }

    // Copy new environment file
    fs.copyFileSync(envFile, '.env');

    // Set NODE_ENV
    process.env.NODE_ENV = targetEnv;

    // Validate environment
    validateEnv(targetEnv);

    // Clear environment caches
    if (fs.existsSync('./node_modules')) {
      console.log(chalk.yellow('Clearing module cache...'));
      execSync('npm cache clean --force');
    }

    console.log(chalk.green(`\n✓ Successfully switched to ${targetEnv} environment`));
    console.log(chalk.blue('\nEnvironment-specific configurations:'));
    
    // Load and display non-sensitive configs
    const envConfig = require('dotenv').config().parsed;
    const safeKeys = ['NODE_ENV', 'PORT', 'API_URL', 'FRONTEND_URL', 'LOG_LEVEL'];
    safeKeys.forEach(key => {
      if (envConfig[key]) {
        console.log(chalk.cyan(`${key}=${envConfig[key]}`));
      }
    });

    // Security check
    console.log(chalk.yellow('\nSecurity Checks:'));
    if (targetEnv === 'production') {
      console.log(chalk.yellow('⚠️  Running in production mode - extra security measures active'));
      
      // Verify SSL/TLS settings
      if (process.env.NODE_ENV === 'production' && !process.env.SSL_KEY_PATH) {
        console.warn(chalk.red('Warning: SSL configuration missing in production'));
      }

      // Check security headers
      if (!process.env.SECURE_HEADERS === 'true') {
        console.warn(chalk.red('Warning: Secure headers not enabled in production'));
      }
    }

  } catch (error) {
    console.error(chalk.red('Error switching environments:'), error);
    
    // Restore backup if exists
    if (fs.existsSync('.env.backup')) {
      fs.copyFileSync('.env.backup', '.env');
      console.log(chalk.yellow('Restored previous environment configuration'));
    }
    
    process.exit(1);
  } finally {
    // Cleanup backup
    if (fs.existsSync('.env.backup')) {
      fs.unlinkSync('.env.backup');
    }
  }
}

// Handle command line arguments
const targetEnv = process.argv[2];
if (!targetEnv) {
  console.error(chalk.red('Please specify an environment'));
  console.log(chalk.yellow(`Usage: node switch-env.js [${ENVIRONMENTS.join('|')}]`));
  process.exit(1);
}

switchEnvironment(targetEnv); 