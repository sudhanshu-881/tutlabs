#!/usr/bin/env node

/**
 * Test Production Environment Variables
 * This script tests if environment variables are loading correctly in production
 */

console.log('🔍 Testing Production Environment Variables\n');

// Test if we can access the production URL
const productionUrl = 'https://www.tutlabs.in';

console.log('📋 Production URL:', productionUrl);
console.log('🧪 Testing environment variable loading...\n');

// Create a simple test page to check environment variables
const testHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Environment Variables Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .test { margin: 10px 0; padding: 10px; border: 1px solid #ccc; }
        .success { background-color: #d4edda; border-color: #c3e6cb; }
        .error { background-color: #f8d7da; border-color: #f5c6cb; }
    </style>
</head>
<body>
    <h1>Environment Variables Test</h1>
    <div id="results"></div>
    
    <script>
        const results = document.getElementById('results');
        
        function addTest(name, value, isValid) {
            const div = document.createElement('div');
            div.className = 'test ' + (isValid ? 'success' : 'error');
            div.innerHTML = \`<strong>\${name}:</strong> \${value || 'undefined'} \${isValid ? '✅' : '❌'}\`;
            results.appendChild(div);
        }
        
        // Test environment variables
        addTest('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL, 
                import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL.includes('supabase.co'));
        
        addTest('VITE_SUPABASE_ANON_KEY', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set', 
                import.meta.env.VITE_SUPABASE_ANON_KEY && import.meta.env.VITE_SUPABASE_ANON_KEY.startsWith('eyJ'));
        
        addTest('VITE_CONTACT_EMAIL', import.meta.env.VITE_CONTACT_EMAIL, 
                import.meta.env.VITE_CONTACT_EMAIL && import.meta.env.VITE_CONTACT_EMAIL.includes('@'));
        
        addTest('NODE_ENV', import.meta.env.NODE_ENV, 
                import.meta.env.NODE_ENV === 'production');
        
        // Test if React is loading
        addTest('React Available', typeof React !== 'undefined' ? 'Yes' : 'No', 
                typeof React !== 'undefined');
        
        // Test if the app is mounting
        setTimeout(() => {
            const app = document.getElementById('root');
            addTest('App Root Element', app ? 'Found' : 'Not found', !!app);
            
            if (app) {
                addTest('App Content', app.innerHTML.length > 0 ? 'Has content' : 'Empty', 
                        app.innerHTML.length > 0);
            }
        }, 1000);
    </script>
</body>
</html>
`;

console.log('📝 Test HTML created. You can use this to debug the production environment.');
console.log('🔗 Visit your production URL and check the browser console for errors.');
console.log('📋 Common issues that cause blank pages:');
console.log('1. JavaScript errors preventing React from mounting');
console.log('2. Environment variables not loading');
console.log('3. Build artifacts missing or corrupted');
console.log('4. CORS issues with Supabase');
console.log('5. React hydration mismatches');

console.log('\n🧪 Quick Debug Steps:');
console.log('1. Open https://www.tutlabs.in in browser');
console.log('2. Open Developer Tools (F12)');
console.log('3. Check Console tab for JavaScript errors');
console.log('4. Check Network tab for failed requests');
console.log('5. Check if environment variables are loaded');

console.log('\n✨ If you see errors, share them and I can help fix them!');