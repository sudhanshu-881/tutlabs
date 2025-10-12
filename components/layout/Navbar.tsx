import React, { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import ThemeToggle from '../ui/ThemeToggle';
import { Theme } from '../../types';
import { AuthContext } from '../../context/AuthContext';
import { getPendingRole } from '../../lib/services/role';
// import RoleSwitcher from '../ui/RoleSwitcher';

interface NavbarProps {
  theme: Theme;
  toggleTheme: () => void;
}

const activeLinkStyle = {
  color: '#10B981',
  fontWeight: '600'
};

const Navbar: React.FC<NavbarProps> = ({ theme, toggleTheme }) => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const feedPath = user ? (user.active_role === 'tutor' ? '/feed/tutor' : '/feed/student') : '/';
  // When authenticated, show compact in-app header and rely on bottom TabBar for navigation
  if (user) {
    return (
      <nav className="sticky top-0 z-40 bg-white dark:bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-12 grid grid-cols-3 items-center">
          <div />
          <div className="flex items-center justify-center">
            <NavLink to={feedPath} className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
              tutlabs
            </NavLink>
          </div>
          <div className="hidden md:flex items-center justify-end space-x-3">
            {user && (
              <button onClick={logout} className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>
    );
  }
  
  const linkClasses = "px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:-translate-y-0.5";
  const mobileLinkClasses = "block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors";

  const homePath = user ? (user.active_role === 'tutor' ? '/feed/tutor' : '/feed/student') : '/';

  return (
    <nav className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md sticky top-0 z-50 border-b border-white/20 dark:border-white/10 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <NavLink to={homePath} className="flex-shrink-0">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">tutlabs</span>
            </NavLink>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink to={homePath} className={linkClasses} style={({ isActive }) => isActive ? activeLinkStyle : undefined }>Home</NavLink>
                <NavLink to="/tutors" className={linkClasses} style={({ isActive }) => isActive ? activeLinkStyle : undefined }>Tutors Near Me</NavLink>
                <NavLink to="/students" className={linkClasses} style={({ isActive }) => isActive ? activeLinkStyle : undefined }>Students Near Me</NavLink>
                <NavLink to="/connect" className={linkClasses} style={({ isActive }) => isActive ? activeLinkStyle : undefined }>Connect</NavLink>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            {user ? (
              <>
                <NavLink to="/profile" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-all duration-200 hover:-translate-y-0.5">Profile</NavLink>
                <button onClick={logout} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-md">Logout</button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  onClick={(e) => {
                    if (!getPendingRole()) {
                      e.preventDefault();
                      window.dispatchEvent(new Event('role:require'));
                      const el = document.getElementById('role-picker');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      } else {
                        try { sessionStorage.setItem('ROLE_REQUIRED', '1'); } catch {}
                        navigate('/');
                      }
                    }
                  }}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:-translate-y-0.5"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  onClick={(e) => {
                    if (!getPendingRole()) {
                      e.preventDefault();
                      window.dispatchEvent(new Event('role:require'));
                      const el = document.getElementById('role-picker');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      } else {
                        try { sessionStorage.setItem('ROLE_REQUIRED', '1'); } catch {}
                        navigate('/');
                      }
                    }
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30 active:translate-y-0 active:shadow-md"
                >
                  Sign Up
                </NavLink>
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
            <NavLink to={homePath} className={mobileLinkClasses} onClick={() => setMobileMenuOpen(false)} style={({ isActive }) => isActive ? activeLinkStyle : undefined }>Home</NavLink>
            <NavLink to="/tutors" className={mobileLinkClasses} onClick={() => setMobileMenuOpen(false)} style={({ isActive }) => isActive ? activeLinkStyle : undefined }>Tutors Near Me</NavLink>
            <NavLink to="/students" className={mobileLinkClasses} onClick={() => setMobileMenuOpen(false)} style={({ isActive }) => isActive ? activeLinkStyle : undefined }>Students Near Me</NavLink>
            <NavLink to="/connect" className={mobileLinkClasses} onClick={() => setMobileMenuOpen(false)} style={({ isActive }) => isActive ? activeLinkStyle : undefined }>Connect</NavLink>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="px-5">
              <div className="flex flex-col space-y-3 w-full">
                 {user ? (
                   <>
                    <p className="w-full text-left text-base font-medium text-gray-800 dark:text-gray-200">Welcome, {user.name}</p>
                    <NavLink to="/profile" className="block w-full text-left rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 py-2" onClick={() => setMobileMenuOpen(false)}>Profile</NavLink>
                    <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full text-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md text-base font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-md">Logout</button>
                   </>
                 ) : (
                   <>
                    <NavLink
                      to="/login"
                      className="w-full text-left text-base font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 py-2"
                      onClick={(e) => {
                        if (!getPendingRole()) {
                          e.preventDefault();
                          window.dispatchEvent(new Event('role:require'));
                          const el = document.getElementById('role-picker');
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          } else {
                            try { sessionStorage.setItem('ROLE_REQUIRED', '1'); } catch {}
                            navigate('/');
                          }
                        } else {
                          setMobileMenuOpen(false);
                        }
                      }}
                    >
                      Login
                    </NavLink>
                    <NavLink
                      to="/signup"
                      className="w-full text-center bg-blue-600 text-white px-4 py-2 rounded-md text-base font-medium hover:bg-blue-700 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg active:translate-y-0"
                      onClick={(e) => {
                        if (!getPendingRole()) {
                          e.preventDefault();
                          window.dispatchEvent(new Event('role:require'));
                          const el = document.getElementById('role-picker');
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          } else {
                            try { sessionStorage.setItem('ROLE_REQUIRED', '1'); } catch {}
                            navigate('/');
                          }
                        } else {
                          setMobileMenuOpen(false);
                        }
                      }}
                    >
                      Sign Up
                    </NavLink>
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