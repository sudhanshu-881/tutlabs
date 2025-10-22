#!/usr/bin/env node

/**
 * Production Backend Diagnostic Tool
 * This script helps diagnose backend issues in production
 */

import { readFileSync, existsSync } from 'fs';

console.log('🔍 Production Backend Diagnostic Tool\n');

// Check if we have deployment information
console.log('📋 Checking Deployment Information...');

// Check for Vercel configuration
if (existsSync('vercel.json')) {
  console.log('✅ vercel.json found');
  try {
    const vercelConfig = JSON.parse(readFileSync('vercel.json', 'utf8'));
    console.log('📄 Vercel Configuration:', JSON.stringify(vercelConfig, null, 2));
  } catch (error) {
    console.log('❌ Error reading vercel.json:', error.message);
  }
} else {
  console.log('⚠️  vercel.json not found');
}

// Check package.json for deployment info
if (existsSync('package.json')) {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  console.log('\n📦 Package Information:');
  console.log(`Name: ${packageJson.name}`);
  console.log(`Version: ${packageJson.version}`);
  console.log(`Build Command: ${packageJson.scripts?.build || 'Not specified'}`);
}

console.log('\n🔧 Common Vercel Backend Issues & Solutions:');

console.log('\n1. **Environment Variables Not Loading:**');
console.log('   - Check Vercel dashboard → Settings → Environment Variables');
console.log('   - Ensure variables are set for "Production" environment');
console.log('   - Redeploy after adding/changing environment variables');
console.log('   - Check for typos in variable names (case-sensitive)');

console.log('\n2. **Supabase Project Issues:**');
console.log('   - Verify Supabase project is not paused');
console.log('   - Check if project URL and API key are correct');
console.log('   - Ensure RLS policies are configured');
console.log('   - Verify database tables exist');

console.log('\n3. **Build Issues:**');
console.log('   - Check Vercel build logs for errors');
console.log('   - Ensure all dependencies are installed');
console.log('   - Verify TypeScript compilation is successful');

console.log('\n4. **Runtime Issues:**');
console.log('   - Check browser console for JavaScript errors');
console.log('   - Verify network requests are reaching Supabase');
console.log('   - Check CORS settings in Supabase');

console.log('\n🧪 Testing Steps:');

console.log('\n1. **Check Environment Variables in Production:**');
console.log('   - Add this to your app temporarily:');
console.log('   ```javascript');
console.log('   console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);');
console.log('   console.log("Supabase Key:", import.meta.env.VITE_SUPABASE_ANON_KEY);');
console.log('   ```');

console.log('\n2. **Test Backend Connection:**');
console.log('   - Visit your Vercel app');
console.log('   - Go to /backend-status');
console.log('   - Check what errors are shown');

console.log('\n3. **Check Browser Network Tab:**');
console.log('   - Open browser dev tools');
console.log('   - Go to Network tab');
console.log('   - Look for failed requests to Supabase');
console.log('   - Check request URLs and headers');

console.log('\n4. **Verify Supabase Configuration:**');
console.log('   - Go to your Supabase project dashboard');
console.log('   - Check Settings → API');
console.log('   - Verify URL and anon key match Vercel');
console.log('   - Check Authentication → URL Configuration');

console.log('\n📞 Need Help?');
console.log('1. Share your Vercel deployment URL');
console.log('2. Check the /backend-status page on your live app');
console.log('3. Share any error messages from browser console');
console.log('4. Verify your Supabase project is active');

console.log('\n✨ Let\'s get your backend working!');