#!/usr/bin/env node

/**
 * Environment Variables Test
 * This script tests if environment variables are being loaded correctly
 */

console.log('🔍 Environment Variables Test\n');

// Check if we're in a build environment
const isBuild = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

console.log('📋 Environment Information:');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
console.log(`VERCEL: ${process.env.VERCEL || 'undefined'}`);
console.log(`Is Build Environment: ${isBuild ? 'Yes' : 'No'}`);

console.log('\n🔧 Vite Environment Variables:');
console.log('Note: These are only available in the browser, not in Node.js');

console.log('\n📚 Common Issues:');

console.log('\n1. **Environment Variables Not Set in Vercel:**');
console.log('   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
console.log('   - Add: VITE_SUPABASE_URL = your_supabase_url');
console.log('   - Add: VITE_SUPABASE_ANON_KEY = your_supabase_anon_key');
console.log('   - Make sure they are set for "Production" environment');

console.log('\n2. **Variables Set But Not Loading:**');
console.log('   - Redeploy your Vercel app after setting variables');
console.log('   - Check for typos in variable names (case-sensitive)');
console.log('   - Ensure variables start with VITE_ prefix');

console.log('\n3. **Supabase Project Issues:**');
console.log('   - Check if your Supabase project is paused');
console.log('   - Verify the URL and API key are correct');
console.log('   - Check Supabase project settings');

console.log('\n4. **Database Not Set Up:**');
console.log('   - Go to Supabase SQL Editor');
console.log('   - Run the database setup script from BACKEND_SETUP.md');
console.log('   - Create the required tables: profiles, tutors, students');

console.log('\n🧪 Quick Test:');
console.log('1. Visit your Vercel app');
console.log('2. Open browser console (F12)');
console.log('3. Type: console.log(import.meta.env.VITE_SUPABASE_URL)');
console.log('4. Check if it shows your Supabase URL or undefined');

console.log('\n✨ If you see "undefined", the environment variables are not loaded!');
console.log('✨ If you see your URL, the variables are loaded but there might be other issues.');