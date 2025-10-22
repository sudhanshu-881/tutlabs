#!/usr/bin/env node

/**
 * Force Vercel Deployment Script
 * This script creates a deployment trigger file to force Vercel to rebuild
 */

import { writeFileSync, readFileSync } from 'fs';
import { execSync } from 'child_process';

console.log('🚀 Force Vercel Deployment Script\n');

// Create a deployment trigger file
const triggerContent = {
  timestamp: new Date().toISOString(),
  version: '1.0.1',
  buildId: `build-${Date.now()}`,
  message: 'Force deployment trigger - CSP and Tailwind fixes applied'
};

writeFileSync('.vercel-deploy-trigger', JSON.stringify(triggerContent, null, 2));
console.log('✅ Created deployment trigger file');

// Update package.json with a new build command
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
packageJson.scripts['vercel-build'] = 'vite build';
writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('✅ Updated package.json with vercel-build script');

// Create a simple deployment status file
const statusContent = `
# Vercel Deployment Status

## Last Update: ${new Date().toISOString()}
## Version: 1.0.1
## Status: Ready for deployment

## Changes Made:
- Fixed CSP to allow Google Fonts
- Removed Tailwind CDN from production
- Added proper PostCSS configuration
- Fixed placeholder image loading
- Updated build process

## Next Steps:
1. Commit and push these changes
2. Go to Vercel dashboard
3. Manually trigger deployment
4. Verify fixes are applied

## Build Command:
\`npm run vercel-build\`
`;

writeFileSync('DEPLOYMENT_STATUS.md', statusContent);
console.log('✅ Created deployment status file');

console.log('\n🔧 Manual Deployment Steps:');
console.log('1. Go to Vercel Dashboard: https://vercel.com/dashboard');
console.log('2. Find your tutlabs project');
console.log('3. Click on the project');
console.log('4. Go to "Deployments" tab');
console.log('5. Click "Redeploy" on the latest deployment');
console.log('6. Or click "Deploy" to create a new deployment');

console.log('\n📋 Alternative: Use Vercel CLI');
console.log('1. Install Vercel CLI: npm i -g vercel');
console.log('2. Run: vercel --prod');
console.log('3. Follow the prompts');

console.log('\n🔍 Check GitHub Integration:');
console.log('1. Go to Vercel project settings');
console.log('2. Check "Git" tab');
console.log('3. Verify GitHub repository is connected');
console.log('4. Check if auto-deploy is enabled');

console.log('\n✨ Deployment trigger created! Now commit and push these changes.');