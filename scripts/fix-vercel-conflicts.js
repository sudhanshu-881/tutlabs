#!/usr/bin/env node

/**
 * Vercel Configuration Conflict Resolver
 * This script helps resolve Vercel configuration conflicts
 */

import { readFileSync, existsSync, unlinkSync, readdirSync } from 'fs';
import { join } from 'path';

console.log('🔧 Vercel Configuration Conflict Resolver\n');

let conflictsFound = false;

// Check for conflicting files
console.log('📋 Checking for conflicting configuration files...\n');

// 1. Check for now.json
if (existsSync('now.json')) {
  console.log('❌ Found now.json - this conflicts with vercel.json');
  console.log('   Solution: Deleting now.json...');
  try {
    unlinkSync('now.json');
    console.log('   ✅ now.json deleted successfully');
    conflictsFound = true;
  } catch (error) {
    console.log('   ❌ Error deleting now.json:', error.message);
  }
} else {
  console.log('✅ No now.json found');
}

// 2. Check for .nowignore
if (existsSync('.nowignore')) {
  console.log('❌ Found .nowignore - this conflicts with .vercelignore');
  console.log('   Solution: Deleting .nowignore...');
  try {
    unlinkSync('.nowignore');
    console.log('   ✅ .nowignore deleted successfully');
    conflictsFound = true;
  } catch (error) {
    console.log('   ❌ Error deleting .nowignore:', error.message);
  }
} else {
  console.log('✅ No .nowignore found');
}

// 3. Check for .now directory
if (existsSync('.now')) {
  console.log('❌ Found .now directory - this conflicts with .vercel directory');
  console.log('   Solution: Deleting .now directory...');
  try {
    const { rmSync } = await import('fs');
    rmSync('.now', { recursive: true, force: true });
    console.log('   ✅ .now directory deleted successfully');
    conflictsFound = true;
  } catch (error) {
    console.log('   ❌ Error deleting .now directory:', error.message);
  }
} else {
  console.log('✅ No .now directory found');
}

// 4. Check current configuration files
console.log('\n📄 Current Configuration Files:');

if (existsSync('vercel.json')) {
  console.log('✅ vercel.json exists');
  try {
    const vercelConfig = JSON.parse(readFileSync('vercel.json', 'utf8'));
    console.log('   Configuration looks valid');
  } catch (error) {
    console.log('   ❌ vercel.json has invalid JSON:', error.message);
  }
} else {
  console.log('❌ vercel.json not found');
}

if (existsSync('.vercelignore')) {
  console.log('✅ .vercelignore exists');
} else {
  console.log('❌ .vercelignore not found');
}

// 5. Check for environment variable conflicts
console.log('\n🔍 Checking for environment variable conflicts...');
console.log('Note: Check your Vercel dashboard for NOW_ prefixed variables');
console.log('   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
console.log('   - Look for any variables starting with NOW_');
console.log('   - Delete any NOW_ variables and use VERCEL_ instead');

// 6. Recommendations
console.log('\n📚 Recommendations:');

if (conflictsFound) {
  console.log('✅ Conflicts resolved! You can now deploy to Vercel.');
} else {
  console.log('✅ No conflicts found in configuration files.');
}

console.log('\n🚀 Next Steps:');
console.log('1. Run: vercel --prod (to deploy to production)');
console.log('2. Or: vercel (to deploy to preview)');
console.log('3. Check Vercel dashboard for any NOW_ prefixed environment variables');
console.log('4. Ensure all environment variables use VERCEL_ prefix');

console.log('\n✨ Your Vercel configuration should now be conflict-free!');