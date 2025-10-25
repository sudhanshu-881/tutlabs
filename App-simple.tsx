import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';

// Simple test app to isolate the white screen issue
function SimpleApp() {
  return (
    <HashRouter>
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '20px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>
            🎮 TutLabs
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
            If you can see this, React is working correctly!
          </p>
          <div style={{ 
            padding: '20px', 
            background: 'rgba(34, 197, 94, 0.2)',
            borderRadius: '10px',
            border: '1px solid #22c55e'
          }}>
            <h3>✅ Debug Status</h3>
            <p>React: Working</p>
            <p>Router: Working</p>
            <p>Styling: Working</p>
            <p>Server: Running on port 3000</p>
          </div>
          <Routes>
            <Route path="/" element={<div>Home Route Working</div>} />
            <Route path="/test" element={<div>Test Route Working</div>} />
          </Routes>
        </div>
      </div>
    </HashRouter>
  );
}

export default SimpleApp;
