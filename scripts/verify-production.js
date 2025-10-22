#!/usr/bin/env node

/**
 * Production Backend Verification Script
 * This script helps verify your Vercel + Supabase setup
 */

import { readFileSync, existsSync } from 'fs';

console.log('🚀 Production Backend Verification\n');

// Check if we have a production URL
const productionUrl = process.env.VERCEL_URL || process.env.VITE_SUPABASE_URL;
if (productionUrl) {
  console.log(`🌐 Production URL: ${productionUrl}`);
} else {
  console.log('⚠️  No production URL detected');
}

console.log('\n📋 Verification Checklist:');
console.log('1. ✅ Environment variables set in Vercel');
console.log('2. ❓ Supabase project is active (not paused)');
console.log('3. ❓ Database tables are created');
console.log('4. ❓ RLS policies are configured');
console.log('5. ❓ Authentication is working');

console.log('\n🔧 Quick Tests You Can Run:');

console.log('\n1. **Test Your Live App:**');
console.log('   - Visit your Vercel deployment URL');
console.log('   - Go to /backend-status');
console.log('   - Check if backend shows as "Connected"');

console.log('\n2. **Test Authentication:**');
console.log('   - Try signing up for a new account');
console.log('   - Check if you receive confirmation email');
console.log('   - Try logging in with the new account');

console.log('\n3. **Test Data Loading:**');
console.log('   - Check if tutors load in the tutor feed');
console.log('   - Check if students load in the student feed');
console.log('   - Verify no "Database connection not available" errors');

console.log('\n4. **Check Browser Console:**');
console.log('   - Open browser dev tools');
console.log('   - Look for any Supabase connection errors');
console.log('   - Check network tab for failed API calls');

console.log('\n🛠️ Common Issues & Solutions:');

console.log('\n**Issue: "Database connection not available"**');
console.log('Solution: Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel');

console.log('\n**Issue: "Failed to fetch" errors**');
console.log('Solution: Verify Supabase project is not paused');

console.log('\n**Issue: "Row Level Security" errors**');
console.log('Solution: Run the database setup script in Supabase SQL Editor');

console.log('\n**Issue: Tables don\'t exist**');
console.log('Solution: Create tables using the script from BACKEND_SETUP.md');

console.log('\n📚 Next Steps:');
console.log('1. Deploy the latest changes: git push origin main');
console.log('2. Visit your Vercel app and check /backend-status');
console.log('3. Test signup/login functionality');
console.log('4. Verify data loads correctly in feeds');

console.log('\n✨ If everything works, your backend is properly connected!');
console.log('If you see issues, check the specific error messages and follow the solutions above.');