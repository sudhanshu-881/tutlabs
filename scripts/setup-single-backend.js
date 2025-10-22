#!/usr/bin/env node

/**
 * Single Backend Setup Script
 * This script helps set up a single Supabase backend for TutLabs
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🚀 TutLabs Single Backend Setup\n');

// Check current environment
const envPath = '.env.local';
let envContent = '';

if (existsSync(envPath)) {
  envContent = readFileSync(envPath, 'utf8');
  console.log('✅ Found existing .env.local file');
} else {
  console.log('❌ No .env.local file found');
  process.exit(1);
}

// Parse current environment variables
const supabaseUrlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
const supabaseKeyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);

const currentUrl = supabaseUrlMatch ? supabaseUrlMatch[1] : '';
const currentKey = supabaseKeyMatch ? supabaseKeyMatch[1] : '';

console.log('\n🔍 Current Configuration:');
console.log(`VITE_SUPABASE_URL: ${currentUrl}`);
console.log(`VITE_SUPABASE_ANON_KEY: ${currentKey ? 'Set' : 'Not set'}`);

// Check if we have placeholder values
const hasPlaceholders = currentUrl.includes('your_supabase_project_url_here') || 
                       currentKey.includes('your_supabase_anon_key_here');

if (hasPlaceholders) {
  console.log('\n❌ Found placeholder values in environment variables');
  console.log('📋 Next Steps:');
  console.log('1. Go to https://supabase.com');
  console.log('2. Create a new project');
  console.log('3. Get your Project URL and API key from Settings > API');
  console.log('4. Update your .env.local file with real values');
  console.log('5. Run this script again to test the connection');
  process.exit(0);
}

// Validate configuration if we have real values
if (currentUrl && currentKey && !hasPlaceholders) {
  console.log('\n🔍 Validating Configuration...');
  
  // Check URL format
  if (currentUrl.includes('supabase.co') && currentUrl.startsWith('https://')) {
    console.log('✅ Supabase URL format looks correct');
  } else {
    console.log('❌ Supabase URL format appears incorrect');
    console.log('💡 Should be: https://your-project-id.supabase.co');
  }
  
  // Check API key format
  if (currentKey.startsWith('eyJ') && currentKey.length > 100) {
    console.log('✅ Supabase API key format looks correct');
  } else {
    console.log('❌ Supabase API key format appears incorrect');
    console.log('💡 Should be a long JWT token starting with "eyJ"');
  }
  
  console.log('\n🧪 To test the connection:');
  console.log('1. Run: npm run dev');
  console.log('2. Open: http://localhost:3000/backend-status');
  console.log('3. Check the connection status indicators');
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Start the development server: npm run dev');
  console.log('2. Test the application functionality');
  console.log('3. Set up database tables if needed');
  
  console.log('\n🚀 For Production:');
  console.log('1. Set the same environment variables in Vercel');
  console.log('2. Redeploy your Vercel app');
  console.log('3. Test the production deployment');
} else {
  console.log('\n❌ Environment variables not properly configured');
  console.log('📋 Please set up your Supabase project first');
}

console.log('\n📚 For detailed setup instructions, see:');
console.log('- BACKEND_SETUP.md');
console.log('- BACKEND_CONNECTION_RESOLUTION.md');
console.log('- /backend-status page in your app');

console.log('\n✨ Happy coding!');