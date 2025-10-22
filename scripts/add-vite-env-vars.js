#!/usr/bin/env node

/**
 * Add Vite Environment Variables to Vercel
 * This script adds the correct VITE_ prefixed environment variables to Vercel
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

console.log('🔧 Adding Vite Environment Variables to Vercel\n');

// Read the current environment variables from .env.vercel
const envContent = readFileSync('.env.vercel', 'utf8');

// Extract Supabase credentials
const supabaseUrlMatch = envContent.match(/SUPABASE_URL="(.+)"/);
const supabaseKeyMatch = envContent.match(/SUPABASE_ANON_KEY="(.+)"/);

if (!supabaseUrlMatch || !supabaseKeyMatch) {
  console.log('❌ Could not find Supabase credentials in .env.vercel');
  process.exit(1);
}

const supabaseUrl = supabaseUrlMatch[1];
const supabaseKey = supabaseKeyMatch[1];

console.log('📋 Found Supabase credentials:');
console.log(`URL: ${supabaseUrl}`);
console.log(`Key: ${supabaseKey.substring(0, 20)}...`);

// Add VITE_SUPABASE_URL
console.log('\n➕ Adding VITE_SUPABASE_URL...');
try {
  execSync(`echo "${supabaseUrl}" | vercel env add VITE_SUPABASE_URL production --token Om6t1TMEJgiVu93ePFA8tInk`, { stdio: 'inherit' });
  console.log('✅ VITE_SUPABASE_URL added successfully');
} catch (error) {
  console.log('❌ Failed to add VITE_SUPABASE_URL:', error.message);
}

// Add VITE_SUPABASE_ANON_KEY
console.log('\n➕ Adding VITE_SUPABASE_ANON_KEY...');
try {
  execSync(`echo "${supabaseKey}" | vercel env add VITE_SUPABASE_ANON_KEY production --token Om6t1TMEJgiVu93ePFA8tInk`, { stdio: 'inherit' });
  console.log('✅ VITE_SUPABASE_ANON_KEY added successfully');
} catch (error) {
  console.log('❌ Failed to add VITE_SUPABASE_ANON_KEY:', error.message);
}

// Add VITE_CONTACT_EMAIL
console.log('\n➕ Adding VITE_CONTACT_EMAIL...');
try {
  execSync(`echo "contact@tutlabs.in" | vercel env add VITE_CONTACT_EMAIL production --token Om6t1TMEJgiVu93ePFA8tInk`, { stdio: 'inherit' });
  console.log('✅ VITE_CONTACT_EMAIL added successfully');
} catch (error) {
  console.log('❌ Failed to add VITE_CONTACT_EMAIL:', error.message);
}

console.log('\n🎯 Next Steps:');
console.log('1. Redeploy your Vercel app');
console.log('2. Test the backend connection at /backend-status');
console.log('3. Verify authentication and data feeds are working');

console.log('\n✨ Vite environment variables added to Vercel!');