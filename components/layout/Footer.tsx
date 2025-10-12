import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white/70 dark:bg-gray-900/70 backdrop-blur border-t border-white/20 dark:border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">tutlabs</h2>
            <p className="text-gray-600 dark:text-gray-400">The modern educational platform offering interactive AI-driven tools and learning experiences.</p>
            <div className="flex space-x-4">
                <a href="#" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-transform duration-300 hover:scale-110 hover:-translate-y-1"><ion-icon name="logo-facebook" className="text-2xl" /></a>
                <a href="#" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-transform duration-300 hover:scale-110 hover:-translate-y-1"><ion-icon name="logo-twitter" className="text-2xl" /></a>
                <a href="#" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-transform duration-300 hover:scale-110 hover:-translate-y-1"><ion-icon name="logo-instagram" className="text-2xl" /></a>
                <a href="#" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-transform duration-300 hover:scale-110 hover:-translate-y-1"><ion-icon name="logo-linkedin" className="text-2xl" /></a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Solutions</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/" className="text-base text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-300">AI Tools</Link></li>
              <li><Link to="/tutors" className="text-base text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400">Find Tutors</Link></li>
              <li><Link to="/students" className="text-base text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400">Find Students</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Support</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/contact" className="text-base text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-300">Pricing</Link></li>
              <li><Link to="/contact" className="text-base text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-300">Documentation</Link></li>
              <li><Link to="/contact" className="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Company</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/contact" className="text-base text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-300">About</Link></li>
              <li><Link to="/contact" className="text-base text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-300">Blog</Link></li>
              <li><Link to="/contact" className="text-base text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-300">Careers</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8 text-center">
          <p className="text-base text-gray-500 dark:text-gray-400">&copy; {new Date().getFullYear()} tutlabs, Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;