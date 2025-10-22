/**
 * Backend Connection Test Utility
 * This utility helps diagnose backend connection issues
 */

import { supabase } from '../../context/AuthContext';

export interface BackendTestResult {
  supabaseConfigured: boolean;
  supabaseConnected: boolean;
  environmentVariables: {
    supabaseUrl: string | undefined;
    supabaseAnonKey: string | undefined;
    contactEmail: string | undefined;
  };
  errors: string[];
  recommendations: string[];
}

export async function testBackendConnection(): Promise<BackendTestResult> {
  const result: BackendTestResult = {
    supabaseConfigured: false,
    supabaseConnected: false,
    environmentVariables: {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      contactEmail: import.meta.env.VITE_CONTACT_EMAIL,
    },
    errors: [],
    recommendations: [],
  };

  // Check if Supabase is configured
  if (result.environmentVariables.supabaseUrl && result.environmentVariables.supabaseAnonKey) {
    result.supabaseConfigured = true;
  } else {
    result.errors.push('Supabase environment variables are not configured');
    result.recommendations.push('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file');
  }

  // Test Supabase connection
  if (result.supabaseConfigured && supabase) {
    try {
      // Test basic connection by fetching a simple query
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (error) {
        result.errors.push(`Supabase connection failed: ${error.message}`);
        result.recommendations.push('Check your Supabase URL and API key');
        result.recommendations.push('Ensure your Supabase project is active and accessible');
      } else {
        result.supabaseConnected = true;
      }
    } catch (error) {
      result.errors.push(`Supabase connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.recommendations.push('Check your internet connection');
      result.recommendations.push('Verify Supabase project is not paused');
    }
  }

  // Check for missing environment variables
  if (!result.environmentVariables.contactEmail) {
    result.recommendations.push('Set VITE_CONTACT_EMAIL for OpenStreetMap Nominatim requests');
  }

  return result;
}

export function generateBackendSetupInstructions(): string {
  return `
# Backend Setup Instructions

## 1. Supabase Setup (Required)

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign in and click "New project"
3. Choose your organization and enter project details
4. Set a strong database password
5. Wait for the project to be created

### Step 2: Get API Credentials
1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - Project URL (VITE_SUPABASE_URL)
   - anon public key (VITE_SUPABASE_ANON_KEY)

### Step 3: Set Up Database
1. Go to SQL Editor in your Supabase dashboard
2. Run the database setup script (see DEPLOYMENT.md for full SQL)
3. This creates the required tables: profiles, tutors, students

### Step 4: Configure Environment Variables
Create a .env.local file in your project root with:
\`\`\`
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CONTACT_EMAIL=your_email@example.com
\`\`\`

## 2. Test Backend Connection
Run the backend test utility to verify everything is working:
\`\`\`typescript
import { testBackendConnection } from './lib/utils/backendTest';
const result = await testBackendConnection();
console.log(result);
\`\`\`

## 3. Common Issues and Solutions

### Issue: "Database connection is not available"
- **Solution**: Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly

### Issue: "Failed to fetch" errors
- **Solution**: Verify your Supabase project is not paused and is accessible

### Issue: "Row Level Security" errors
- **Solution**: Ensure RLS policies are set up correctly in your Supabase project

### Issue: "Table doesn't exist" errors
- **Solution**: Run the database setup script from DEPLOYMENT.md

## 4. Production Deployment
For production deployment, set the same environment variables in your hosting platform (Vercel, Netlify, etc.).
`;
}