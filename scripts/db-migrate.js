#!/usr/bin/env node

const mongoose = require('mongoose');
const { program } = require('commander');
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

// Configuration
const MIGRATIONS_DIR = path.join(__dirname, '../backend/migrations');
const MIGRATIONS_COLLECTION = 'migrations';

// CLI setup
program
  .version('1.0.0')
  .description('Database migration tool for CodeWar application')
  .option('-e, --env <environment>', 'target environment', 'development')
  .option('-u, --up [migration]', 'run all pending migrations or a specific one')
  .option('-d, --down <migration>', 'rollback a specific migration')
  .option('-s, --status', 'show migration status')
  .option('-c, --create <name>', 'create a new migration')
  .parse(process.argv);

const options = program.opts();

// Environment configurations
const envConfigs = {
  development: {
    uri: 'mongodb://localhost:27017/codewar_dev',
    options: { useNewUrlParser: true, useUnifiedTopology: true }
  },
  staging: {
    uri: process.env.STAGING_MONGODB_URI,
    options: { useNewUrlParser: true, useUnifiedTopology: true, ssl: true }
  },
  production: {
    uri: process.env.PRODUCTION_MONGODB_URI,
    options: { useNewUrlParser: true, useUnifiedTopology: true, ssl: true }
  }
};

// Migration template
const migrationTemplate = `
module.exports = {
  up: async (db) => {
    // Migration up logic
    try {
      // Add your migration code here
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  },

  down: async (db) => {
    // Migration down logic
    try {
      // Add your rollback code here
    } catch (error) {
      console.error('Rollback failed:', error);
      throw error;
    }
  }
};
`;

// Utility functions
const log = {
  info: (msg) => console.log(chalk.blue(msg)),
  success: (msg) => console.log(chalk.green(msg)),
  error: (msg) => console.log(chalk.red(msg)),
  warn: (msg) => console.log(chalk.yellow(msg))
};

async function connectDatabase(env) {
  const config = envConfigs[env];
  if (!config) {
    throw new Error(`Invalid environment: ${env}`);
  }

  if (!config.uri) {
    throw new Error(`MongoDB URI not configured for environment: ${env}`);
  }

  try {
    await mongoose.connect(config.uri, config.options);
    log.success(`Connected to ${env} database`);
  } catch (error) {
    log.error(`Failed to connect to database: ${error.message}`);
    throw error;
  }
}

async function getMigrationModel() {
  const schema = new mongoose.Schema({
    name: String,
    appliedAt: Date
  });

  return mongoose.model('Migration', schema, MIGRATIONS_COLLECTION);
}

async function loadMigrations() {
  try {
    const files = await fs.readdir(MIGRATIONS_DIR);
    return files
      .filter(f => f.endsWith('.js'))
      .sort()
      .map(f => ({
        name: f.replace('.js', ''),
        path: path.join(MIGRATIONS_DIR, f)
      }));
  } catch (error) {
    log.error(`Failed to load migrations: ${error.message}`);
    throw error;
  }
}

async function createMigration(name) {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const fileName = `${timestamp}_${name}.js`;
  const filePath = path.join(MIGRATIONS_DIR, fileName);

  try {
    await fs.writeFile(filePath, migrationTemplate.trim());
    log.success(`Created migration: ${fileName}`);
  } catch (error) {
    log.error(`Failed to create migration: ${error.message}`);
    throw error;
  }
}

async function getMigrationStatus() {
  const Migration = await getMigrationModel();
  const appliedMigrations = await Migration.find().sort('name');
  const allMigrations = await loadMigrations();

  log.info('\nMigration Status:');
  console.log('----------------');

  for (const migration of allMigrations) {
    const applied = appliedMigrations.find(m => m.name === migration.name);
    const status = applied ? 
      chalk.green(`✓ Applied at ${applied.appliedAt.toISOString()}`) :
      chalk.yellow('⨯ Pending');
    console.log(`${migration.name}: ${status}`);
  }
}

async function runMigration(migration, direction = 'up') {
  const Migration = await getMigrationModel();
  const migrationModule = require(migration.path);

  try {
    if (direction === 'up') {
      await migrationModule.up(mongoose.connection.db);
      await Migration.create({ name: migration.name, appliedAt: new Date() });
      log.success(`Applied migration: ${migration.name}`);
    } else {
      await migrationModule.down(mongoose.connection.db);
      await Migration.deleteOne({ name: migration.name });
      log.success(`Rolled back migration: ${migration.name}`);
    }
  } catch (error) {
    log.error(`Migration ${direction} failed: ${error.message}`);
    throw error;
  }
}

async function runMigrations(targetMigration = null) {
  const Migration = await getMigrationModel();
  const appliedMigrations = await Migration.find().sort('name');
  const allMigrations = await loadMigrations();

  for (const migration of allMigrations) {
    if (targetMigration && migration.name !== targetMigration) continue;
    if (appliedMigrations.find(m => m.name === migration.name)) continue;

    await runMigration(migration, 'up');
    
    if (targetMigration) break;
  }
}

async function rollbackMigration(migrationName) {
  const Migration = await getMigrationModel();
  const migration = (await loadMigrations())
    .find(m => m.name === migrationName);

  if (!migration) {
    throw new Error(`Migration not found: ${migrationName}`);
  }

  const applied = await Migration.findOne({ name: migrationName });
  if (!applied) {
    throw new Error(`Migration not applied: ${migrationName}`);
  }

  await runMigration(migration, 'down');
}

// Main execution
async function main() {
  try {
    await connectDatabase(options.env);

    if (options.create) {
      await createMigration(options.create);
    } else if (options.status) {
      await getMigrationStatus();
    } else if (options.up) {
      await runMigrations(options.up === true ? null : options.up);
    } else if (options.down) {
      await rollbackMigration(options.down);
    } else {
      program.help();
    }

    await mongoose.disconnect();
  } catch (error) {
    log.error(`Migration failed: ${error.message}`);
    process.exit(1);
  }
}

main(); 