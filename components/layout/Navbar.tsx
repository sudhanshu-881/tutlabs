import React, { useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import ThemeToggle from '../ui/ThemeToggle';
import { Theme } from '../../types';
import { AuthContext } from '../../context/AuthContext';

interface NavbarProps {
  theme: Theme;
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ theme, toggleTheme }) => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);

  const activeLinkStyle = {
    color: '#3b82f6',
    fontWeight: '600'
  };
  
  const linkClasses = "px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors";
  const mobileLinkClasses = "block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors";

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <NavLink to="/" className="flex-shrink-0">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-500">tutLabs</span>
            </NavLink>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink to="/" className={linkClasses} style={({ isActive }) => isActive ? activeLinkStyle : undefined }>Home</NavLink>
                <NavLink to="/tutors" className={linkClasses} style={({ isActive }) => isActive ? activeLinkStyle : undefined }>Tutors Near Me</NavLink>
                <NavLink to="/students" className={linkClasses} style={({ isActive }) => isActive ? activeLinkStyle : undefined }>Students Near Me</NavLink>
                <NavLink to="/contact" className={linkClasses} style={({ isActive }) => isActive ? activeLinkStyle : undefined }>Contact</NavLink>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            {user ? (
              <>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Welcome, {user.name}</span>
                <button onClick={logout} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Logout</button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Login</NavLink>
                <NavLink to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">Sign Up</NavLink>
              </>
            )}
          </div>
          <div className="-mr-2 flex md:hidden">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} type="button" className="bg-gray-100 dark:bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-blue-500 ml-2">
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink to="/" className={mobileLinkClasses} onClick={() => setMobileMenuOpen(false)} style={({ isActive }) => isActive ? activeLinkStyle : undefined }>Home</NavLink>
            <NavLink to="/tutors" className={mobileLinkClasses} onClick={() => setMobileMenuOpen(false)} style={({ isActive }) => isActive ? activeLinkStyle : undefined }>Tutors Near Me</NavLink>
            <NavLink to="/students" className={mobileLinkClasses} onClick={() => setMobileMenuOpen(false)} style={({ isActive }) => isActive ? activeLinkStyle : undefined }>Students Near Me</NavLink>
            <NavLink to="/contact" className={mobileLinkClasses} onClick={() => setMobileMenuOpen(false)} style={({ isActive }) => isActive ? activeLinkStyle : undefined }>Contact</NavLink>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center px-5">
              <div className="flex flex-col space-y-2 w-full">
                 {user ? (
                   <>
                    <p className="w-full text-left text-base font-medium text-gray-800 dark:text-gray-200 py-2">Welcome, {user.name}</p>
                    <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full text-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md text-base font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Logout</button>
                   </>
                 ) : (
                   <>
                    <NavLink to="/login" className="w-full text-left text-base font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 py-2" onClick={() => setMobileMenuOpen(false)}>Login</NavLink>
                    <NavLink to="/signup" className="w-full text-center bg-blue-600 text-white px-4 py-2 rounded-md text-base font-medium hover:bg-blue-700 transition-colors" onClick={() => setMobileMenuOpen(false)}>Sign Up</NavLink>
                   </>
                 )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;