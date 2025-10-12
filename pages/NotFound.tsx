import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="text-center py-24">
      <h1 className="text-6xl font-extrabold text-gray-900 dark:text-white">404</h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">The page you are looking for does not exist.</p>
      <Link to="/" className="mt-8 inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30 active:translate-y-0 active:shadow-md">Go Home</Link>
    </div>
  );
};

export default NotFound;
