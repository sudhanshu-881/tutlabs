/**
 * Production Backend Test Utility
 * This utility helps test backend connection in production environment
 */

export interface ProductionTestResult {
  environmentDetected: boolean;
  supabaseConfigured: boolean;
  supabaseConnected: boolean;
  databaseAccessible: boolean;
  authenticationWorking: boolean;
  errors: string[];
  recommendations: string[];
  testUrl?: string;
}

export async function testProductionBackend(): Promise<ProductionTestResult> {
  const result: ProductionTestResult = {
    environmentDetected: false,
    supabaseConfigured: false,
    supabaseConnected: false,
    databaseAccessible: false,
    authenticationWorking: false,
    errors: [],
    recommendations: [],
  };

  // Check if we're in production environment
  const isProduction = window.location.hostname !== 'localhost' && 
                      !window.location.hostname.includes('127.0.0.1');
  
  result.environmentDetected = isProduction;
  result.testUrl = window.location.origin;

  // Check if Supabase is configured
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    result.supabaseConfigured = true;
  } else {
    result.errors.push('Supabase environment variables not found');
    result.recommendations.push('Check Vercel environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  }

  // Test Supabase connection
  if (result.supabaseConfigured) {
    try {
      // Import supabase client dynamically to avoid issues if not configured
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl!, supabaseKey!);

      // Test basic connection
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) {
        result.errors.push(`Supabase connection failed: ${error.message}`);
        if (error.message.includes('relation "profiles" does not exist')) {
          result.recommendations.push('Run the database setup script in Supabase SQL Editor');
        } else if (error.message.includes('JWT')) {
          result.recommendations.push('Check your Supabase API key is correct');
        } else if (error.message.includes('Failed to fetch')) {
          result.recommendations.push('Check if your Supabase project is paused');
        }
      } else {
        result.supabaseConnected = true;
        result.databaseAccessible = true;
      }
    } catch (error) {
      result.errors.push(`Supabase test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.recommendations.push('Check your internet connection and Supabase project status');
    }
  }

  // Test authentication (basic check)
  if (result.supabaseConnected) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl!, supabaseKey!);
      
      // Check if auth is working by trying to get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        result.errors.push(`Authentication test failed: ${error.message}`);
        result.recommendations.push('Check Supabase authentication settings');
      } else {
        result.authenticationWorking = true;
      }
    } catch (error) {
      result.errors.push(`Authentication test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Add general recommendations based on environment
  if (isProduction) {
    result.recommendations.push('This is a production environment - ensure all settings are production-ready');
    result.recommendations.push('Check Vercel deployment logs for any build or runtime errors');
  }

  return result;
}

export function generateProductionReport(result: ProductionTestResult): string {
  let report = `# Production Backend Status Report\n\n`;
  report += `**Test URL:** ${result.testUrl}\n`;
  report += `**Environment:** ${result.environmentDetected ? 'Production' : 'Development'}\n\n`;
  
  report += `## Status Overview\n`;
  report += `- Environment Detected: ${result.environmentDetected ? '✅' : '❌'}\n`;
  report += `- Supabase Configured: ${result.supabaseConfigured ? '✅' : '❌'}\n`;
  report += `- Supabase Connected: ${result.supabaseConnected ? '✅' : '❌'}\n`;
  report += `- Database Accessible: ${result.databaseAccessible ? '✅' : '❌'}\n`;
  report += `- Authentication Working: ${result.authenticationWorking ? '✅' : '❌'}\n\n`;

  if (result.errors.length > 0) {
    report += `## Issues Found\n`;
    result.errors.forEach((error, index) => {
      report += `${index + 1}. ${error}\n`;
    });
    report += `\n`;
  }

  if (result.recommendations.length > 0) {
    report += `## Recommendations\n`;
    result.recommendations.forEach((rec, index) => {
      report += `${index + 1}. ${rec}\n`;
    });
    report += `\n`;
  }

  report += `## Next Steps\n`;
  if (result.supabaseConnected && result.databaseAccessible && result.authenticationWorking) {
    report += `🎉 **Your backend is working correctly!**\n`;
    report += `- Try signing up for a new account\n`;
    report += `- Test the tutor and student feeds\n`;
    report += `- Verify all features are working as expected\n`;
  } else {
    report += `🔧 **Backend needs attention:**\n`;
    report += `- Follow the recommendations above\n`;
    report += `- Check Vercel environment variables\n`;
    report += `- Verify Supabase project is active\n`;
    report += `- Run database setup script if needed\n`;
  }

  return report;
}