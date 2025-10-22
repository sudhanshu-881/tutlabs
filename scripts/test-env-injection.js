#!/usr/bin/env node

/**
 * Test Environment Variable Injection
 * This script checks if environment variables are being injected into the build
 */

import { readFileSync, existsSync } from 'fs';

console.log('🔍 Testing Environment Variable Injection\n');

// Check if .env.local exists and has the right values
if (existsSync('.env.local')) {
  const envContent = readFileSync('.env.local', 'utf8');
  console.log('📋 .env.local content:');
  console.log(envContent);
  
  // Check for placeholder values
  if (envContent.includes('your_supabase_project_url_here')) {
    console.log('❌ Found placeholder values in .env.local');
    console.log('💡 Update .env.local with real Supabase credentials');
  } else {
    console.log('✅ .env.local has real values');
  }
} else {
  console.log('❌ .env.local not found');
}

// Check if dist/index.html exists
if (existsSync('dist/index.html')) {
  const htmlContent = readFileSync('dist/index.html', 'utf8');
  console.log('\n📋 Built HTML contains:');
  
  // Check for environment variable references
  if (htmlContent.includes('VITE_SUPABASE_URL')) {
    console.log('✅ HTML contains VITE_SUPABASE_URL reference');
  } else {
    console.log('❌ HTML does not contain VITE_SUPABASE_URL reference');
  }
  
  if (htmlContent.includes('import.meta.env')) {
    console.log('✅ HTML contains import.meta.env reference');
  } else {
    console.log('❌ HTML does not contain import.meta.env reference');
  }
  
  // Check for the main script
  if (htmlContent.includes('assets/index-')) {
    console.log('✅ HTML contains main script reference');
  } else {
    console.log('❌ HTML does not contain main script reference');
  }
} else {
  console.log('❌ dist/index.html not found - run npm run build first');
}

console.log('\n🧪 To test in production:');
console.log('1. Visit https://www.tutlabs.in/debug.html');
console.log('2. Check the debug information');
console.log('3. Look for JavaScript errors in browser console');

console.log('\n💡 Common causes of blank pages:');
console.log('1. Environment variables not loaded');
console.log('2. JavaScript errors preventing React from mounting');
console.log('3. Missing dependencies or build artifacts');
console.log('4. CORS issues with external resources');