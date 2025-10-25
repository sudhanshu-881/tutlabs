import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';

// Production-ready version that works without Supabase
function ProductionApp() {
  console.log('🔧 Debug: ProductionApp component rendering...');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Default to system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
    
    // Simulate app loading
    console.log('🔧 Debug: Starting loading simulation...');
    setTimeout(() => {
      console.log('🔧 Debug: Loading simulation complete, setting isLoading to false');
      setIsLoading(false);
    }, 500);
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

  if (isLoading) {
    console.log('🔧 Debug: App is in loading state, rendering loading component');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-700 via-indigo-600 to-pink-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Loading TutLabs...</h2>
          <p className="text-white/80">Preparing your learning experience</p>
          <p className="text-white/60 text-sm mt-2">Debug: Loading state active</p>
        </div>
      </div>
    );
  }

  console.log('🔧 Debug: App is rendering main content, isLoading is false');
  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen bg-transparent text-gray-900 dark:text-white">
        {/* Navigation */}
        <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-white">🎮 TutLabs</h1>
                <span className="text-sm text-white/60">Production Ready</span>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleTheme}
                  className="px-4 py-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-colors"
                >
                  {theme === 'light' ? '🌙' : '☀️'} {theme}
                </button>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tutors" element={<TutorsPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/connect" element={<ConnectPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white/10 backdrop-blur-md border-t border-white/20 py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-white font-bold mb-4">TutLabs</h3>
                <p className="text-white/80 text-sm">
                  Connect tutors with parents and students for personalized learning experiences.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">For Tutors</h4>
                <ul className="space-y-2 text-sm text-white/80">
                  <li><a href="/#/tutors" className="hover:text-white transition-colors">Find Students</a></li>
                  <li><a href="/#/connect" className="hover:text-white transition-colors">Connect</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">For Students</h4>
                <ul className="space-y-2 text-sm text-white/80">
                  <li><a href="/#/tutors" className="hover:text-white transition-colors">Find Tutors</a></li>
                  <li><a href="/#/connect" className="hover:text-white transition-colors">Get Help</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-sm text-white/80">
                  <li><a href="/#/about" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="/#/contact" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60 text-sm">
              <p>&copy; 2024 TutLabs. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
}

// Enhanced page components
function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-indigo-600 to-pink-600">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center py-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-lg mb-8">
            Welcome to TutLabs
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Connect tutors with parents and students. Discover nearby tutors or students, 
            manage your profile, and accelerate learning with AI-powered tools.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a href="/#/tutors" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
              Find Tutors
            </a>
            <a href="/#/students" className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors">
              Find Students
            </a>
            <a href="/#/connect" className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors">
              Connect
            </a>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-white mb-2">Personalized Learning</h3>
              <p className="text-white/80">AI-powered matching for optimal tutor-student connections.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="text-xl font-bold text-white mb-2">Location-Based</h3>
              <p className="text-white/80">Find tutors and students in your local area.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold text-white mb-2">Community Driven</h3>
              <p className="text-white/80">Join a supportive learning community.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TutorsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-indigo-600 to-pink-600">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center py-16">
          <h1 className="text-4xl font-bold text-white mb-8">Find Tutors</h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Discover qualified tutors in your area for personalized learning experiences.
          </p>
          
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Search for Tutors</h2>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Enter subject or topic..." 
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input 
                type="text" 
                placeholder="Enter your location..." 
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
                Search Tutors
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-indigo-600 to-pink-600">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center py-16">
          <h1 className="text-4xl font-bold text-white mb-8">Find Students</h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Connect with students looking for tutoring in your expertise areas.
          </p>
          
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Student Opportunities</h2>
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-2">Mathematics Tutoring</h3>
                <p className="text-white/80 mb-2">High school student needs help with algebra and calculus.</p>
                <span className="text-sm text-blue-300">Location: Downtown Area</span>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-2">Science Tutoring</h3>
                <p className="text-white/80 mb-2">Middle school student needs help with physics and chemistry.</p>
                <span className="text-sm text-blue-300">Location: Suburbs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConnectPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-indigo-600 to-pink-600">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center py-16">
          <h1 className="text-4xl font-bold text-white mb-8">Connect</h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join the TutLabs community and start your learning journey.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">I'm a Tutor</h2>
              <p className="text-white/80 mb-6">Share your knowledge and help students succeed.</p>
              <button className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
                Become a Tutor
              </button>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">I'm a Student</h2>
              <p className="text-white/80 mb-6">Find the perfect tutor for your learning needs.</p>
              <button className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors">
                Find a Tutor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-indigo-600 to-pink-600">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center py-16">
          <h1 className="text-4xl font-bold text-white mb-8">About TutLabs</h1>
          <div className="max-w-4xl mx-auto">
            <p className="text-xl text-white/90 mb-8">
              TutLabs is a modern learning platform that connects tutors with students for personalized education experiences.
            </p>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-white/80 mb-6">
                To make quality education accessible to everyone by connecting passionate tutors with eager learners.
              </p>
              <h2 className="text-2xl font-bold text-white mb-4">Features</h2>
              <ul className="text-white/80 space-y-2">
                <li>• AI-powered tutor-student matching</li>
                <li>• Location-based search</li>
                <li>• Secure messaging system</li>
                <li>• Progress tracking</li>
                <li>• Community support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-indigo-600 to-pink-600">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center py-16">
          <h1 className="text-4xl font-bold text-white mb-8">Contact Us</h1>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">Get in Touch</h2>
              <p className="text-white/80 mb-6">
                Have questions or need support? We're here to help!
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-semibold mb-2">Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Email</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Message</label>
                  <textarea 
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your message..."
                  />
                </div>
                <button className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductionApp;
