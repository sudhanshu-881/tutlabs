import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import TutorsNearMe from './pages/TutorsNearMe';
import StudentsNearMe from './pages/StudentsNearMe';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AwaitingConfirmation from './pages/AwaitingConfirmation';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/routing/ProtectedRoute';
import { Theme } from './types';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

function App() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <HashRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-background text-foreground dark:bg-gray-900 dark:text-gray-100">
          <Toaster position="top-right" />
          <Navbar theme={theme} toggleTheme={toggleTheme} />
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tutors" element={<TutorsNearMe />} />
              <Route path="/students" element={<StudentsNearMe />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/awaiting-confirmation" element={<AwaitingConfirmation />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;