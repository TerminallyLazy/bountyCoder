#!/usr/bin/env node

/**
 * Database migration script for production environments
 * This script handles database migrations safely in production
 */

const { execSync } = require('child_process');
const path = require('path');

process.chdir(path.join(__dirname, '..'));

console.log('Starting database migration...');

try {
  console.log('Running Prisma migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('Migration completed successfully!');
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exit(1);
}
