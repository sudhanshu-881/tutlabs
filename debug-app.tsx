import React from 'react';
import ReactDOM from 'react-dom/client';

// Simple debug app to test if React is working
const DebugApp = () => {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        🎮 TutLabs Debug Mode
      </h1>
      <p style={{ color: '#666', marginBottom: '10px' }}>
        If you can see this, React is working correctly.
      </p>
      <p style={{ color: '#666', marginBottom: '10px' }}>
        The white screen issue is likely caused by:
      </p>
      <ul style={{ color: '#666', marginLeft: '20px' }}>
        <li>Missing environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)</li>
        <li>Build/dependency issues</li>
        <li>CSS loading problems</li>
        <li>JavaScript errors in the main app</li>
      </ul>
      <div style={{ 
        marginTop: '20px', 
        padding: '10px', 
        backgroundColor: '#e8f4fd', 
        border: '1px solid #bee5eb',
        borderRadius: '4px'
      }}>
        <strong>Next Steps:</strong>
        <ol style={{ marginTop: '10px', marginLeft: '20px' }}>
          <li>Check browser console for errors</li>
          <li>Verify environment variables are set</li>
          <li>Check if all dependencies are installed</li>
          <li>Test with TestSprite validation</li>
        </ol>
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(<DebugApp />);
