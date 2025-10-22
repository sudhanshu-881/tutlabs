#!/usr/bin/env node

/**
 * Backend Connection Test Script
 * This script tests the backend connection and provides detailed diagnostics
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🔍 Backend Connection Diagnostic Tool\n');

// Check environment variables
console.log('📋 Checking Environment Variables...');
const envPath = '.env.local';
let envContent = '';

if (existsSync(envPath)) {
  envContent = readFileSync(envPath, 'utf8');
  console.log('✅ .env.local file found');
} else {
  console.log('❌ .env.local file not found');
  console.log('💡 Create a .env.local file with your Supabase credentials');
}

// Check for required environment variables
const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
const optionalVars = ['VITE_CONTACT_EMAIL', 'GEMINI_API_KEY'];

console.log('\n🔧 Environment Variable Status:');
requiredVars.forEach(varName => {
  const hasVar = envContent.includes(varName);
  console.log(`${hasVar ? '✅' : '❌'} ${varName}: ${hasVar ? 'Set' : 'Missing'}`);
});

optionalVars.forEach(varName => {
  const hasVar = envContent.includes(varName);
  console.log(`${hasVar ? '✅' : '⚠️'} ${varName}: ${hasVar ? 'Set' : 'Optional'}`);
});

// Check if Supabase URL looks valid
const supabaseUrlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
if (supabaseUrlMatch) {
  const url = supabaseUrlMatch[1].trim();
  if (url.includes('supabase.co') && url.startsWith('https://')) {
    console.log('✅ Supabase URL format looks correct');
  } else {
    console.log('❌ Supabase URL format appears incorrect');
    console.log('💡 Should be: https://your-project-id.supabase.co');
  }
}

// Check if API key looks valid
const apiKeyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);
if (apiKeyMatch) {
  const key = apiKeyMatch[1].trim();
  if (key.startsWith('eyJ') && key.length > 100) {
    console.log('✅ Supabase API key format looks correct');
  } else {
    console.log('❌ Supabase API key format appears incorrect');
    console.log('💡 Should be a long JWT token starting with "eyJ"');
  }
}

console.log('\n📚 Next Steps:');
console.log('1. If environment variables are missing:');
console.log('   - Go to https://supabase.com');
console.log('   - Create a new project');
console.log('   - Get your Project URL and API key from Settings > API');
console.log('   - Add them to your .env.local file');

console.log('\n2. If environment variables are set:');
console.log('   - Run: npm run dev');
console.log('   - Open http://localhost:3000/backend-status');
console.log('   - Check the backend connection status');

console.log('\n3. Database Setup:');
console.log('   - Go to your Supabase project dashboard');
console.log('   - Navigate to SQL Editor');
console.log('   - Run the database setup script from BACKEND_SETUP.md');

console.log('\n4. Test the Connection:');
console.log('   - Try signing up for a new account');
console.log('   - Check if tutors and students load in the feeds');
console.log('   - Verify authentication is working');

console.log('\n🎯 Backend Status Page:');
console.log('Visit: http://localhost:3000/backend-status');
console.log('This page will show detailed connection diagnostics and setup instructions.');

console.log('\n✨ Happy coding!');