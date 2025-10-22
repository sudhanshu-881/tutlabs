#!/usr/bin/env node

/**
 * Backend Setup Assistant
 * This script helps users set up their Supabase backend
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🚀 Backend Setup Assistant for TutLabs\n');

// Check if .env.local exists
const envPath = '.env.local';
let envContent = '';

if (existsSync(envPath)) {
  envContent = readFileSync(envPath, 'utf8');
  console.log('✅ Found existing .env.local file');
} else {
  console.log('📝 Creating .env.local file...');
  envContent = `# Supabase Configuration (REQUIRED)
# Get these from your Supabase project dashboard: Settings > API
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Contact Email for OpenStreetMap Nominatim requests
VITE_CONTACT_EMAIL=your_email@example.com

# Gemini API Key (for AI features)
GEMINI_API_KEY=PLACEHOLDER_API_KEY
`;
  writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file');
}

// Check current configuration
console.log('\n🔍 Current Configuration:');
const supabaseUrlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
const supabaseKeyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);

if (supabaseUrlMatch && supabaseUrlMatch[1] !== 'your_supabase_project_url_here') {
  console.log('✅ VITE_SUPABASE_URL is configured');
} else {
  console.log('❌ VITE_SUPABASE_URL needs to be configured');
}

if (supabaseKeyMatch && supabaseKeyMatch[1] !== 'your_supabase_anon_key_here') {
  console.log('✅ VITE_SUPABASE_ANON_KEY is configured');
} else {
  console.log('❌ VITE_SUPABASE_ANON_KEY needs to be configured');
}

console.log('\n📋 Setup Instructions:');
console.log('1. Go to https://supabase.com');
console.log('2. Sign in and create a new project');
console.log('3. In your project dashboard, go to Settings > API');
console.log('4. Copy your Project URL and anon public key');
console.log('5. Update your .env.local file with these values');

console.log('\n🗄️ Database Setup:');
console.log('1. In your Supabase dashboard, go to SQL Editor');
console.log('2. Create a new query');
console.log('3. Copy and paste the SQL script from BACKEND_SETUP.md');
console.log('4. Run the script to create the required tables');

console.log('\n🧪 Test Your Setup:');
console.log('1. Run: npm run dev');
console.log('2. Open: http://localhost:3000/backend-status');
console.log('3. Check the connection status');

console.log('\n📚 Need Help?');
console.log('- Check BACKEND_SETUP.md for detailed instructions');
console.log('- Visit /backend-status in your app for diagnostics');
console.log('- Run: npm run test:backend for environment check');

console.log('\n✨ Setup complete! Follow the instructions above to configure your backend.');