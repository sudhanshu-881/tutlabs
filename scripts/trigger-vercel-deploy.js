#!/usr/bin/env node

/**
 * Vercel Deployment Trigger Script
 * This script helps trigger a new Vercel deployment
 */

import { readFileSync } from 'fs';

console.log('🚀 Vercel Deployment Trigger\n');

// Read package.json to get current version
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
console.log(`📦 Current Version: ${packageJson.version}`);

console.log('\n🔧 Vercel Deployment Steps:');
console.log('1. Go to Vercel Dashboard: https://vercel.com/dashboard');
console.log('2. Select your tutlabs project');
console.log('3. Go to "Deployments" tab');
console.log('4. Click "Redeploy" on the latest deployment');
console.log('5. Or click "Deploy" to create a new deployment');

console.log('\n📋 Alternative: Trigger via Git Push');
console.log('1. Make sure all changes are committed to main branch');
console.log('2. Push to GitHub: git push origin main');
console.log('3. Vercel should automatically detect and deploy');

console.log('\n🔍 Check Deployment Status:');
console.log('1. Look for the latest deployment in Vercel dashboard');
console.log('2. Check build logs for any errors');
console.log('3. Verify the deployment URL shows updated content');

console.log('\n⚠️  If Vercel is not deploying automatically:');
console.log('1. Check Vercel project settings');
console.log('2. Verify GitHub integration is working');
console.log('3. Check if there are any build errors');
console.log('4. Try manual redeploy from Vercel dashboard');

console.log('\n✨ Your latest changes should be deployed now!');