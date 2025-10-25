import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';

// Simplified working version of the app
function WorkingApp() {
  console.log('🔧 Debug: WorkingApp component rendering...');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Default to system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen bg-transparent text-gray-900 dark:text-white">
        {/* Simple Navbar */}
        <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">🎮 TutLabs</h1>
              <button
                onClick={toggleTheme}
                className="px-4 py-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-colors"
              >
                {theme === 'light' ? '🌙' : '☀️'} {theme}
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow container mx-auto px-4 py-6">
          <div className="text-center py-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-lg mb-8">
              Welcome to TutLabs
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Connect tutors with parents and students. Discover nearby tutors or students, 
              manage your profile, and accelerate learning with AI-powered tools.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
                Find Tutors
              </button>
              <button className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors">
                Find Students
              </button>
              <button className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors">
                Connect
              </button>
            </div>
          </div>

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tutors" element={<TutorsPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/connect" element={<ConnectPage />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white/10 backdrop-blur-md border-t border-white/20 py-8">
          <div className="container mx-auto px-4 text-center text-white/80">
            <p>&copy; 2024 TutLabs. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
}

// Simple page components
function HomePage() {
  return (
    <div className="text-center py-8">
      <h2 className="text-3xl font-bold text-white mb-4">Home Page</h2>
      <p className="text-white/80">This is the home page. The app is working correctly!</p>
    </div>
  );
}

function TutorsPage() {
  return (
    <div className="text-center py-8">
      <h2 className="text-3xl font-bold text-white mb-4">Find Tutors</h2>
      <p className="text-white/80">Search for tutors in your area.</p>
    </div>
  );
}

function StudentsPage() {
  return (
    <div className="text-center py-8">
      <h2 className="text-3xl font-bold text-white mb-4">Find Students</h2>
      <p className="text-white/80">Search for students looking for tutors.</p>
    </div>
  );
}

function ConnectPage() {
  return (
    <div className="text-center py-8">
      <h2 className="text-3xl font-bold text-white mb-4">Connect</h2>
      <p className="text-white/80">Connect with the TutLabs community.</p>
    </div>
  );
}

export default WorkingApp;
