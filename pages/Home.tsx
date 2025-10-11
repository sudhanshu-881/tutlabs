

import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => (
  <div className="text-center py-16 sm:py-24">
    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
      <span className="block">Unlock Your Potential with</span>
      <span className="block text-blue-600 dark:text-blue-500">AI-Powered Learning</span>
    </h1>
    <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-300">
      Connect with expert tutors, find eager students, and leverage cutting-edge AI tools to accelerate your educational journey.
    </p>
    <div className="mt-8 flex justify-center gap-4 flex-wrap">
      <Link to="/tutors" className="inline-block bg-blue-600 text-white font-semibold px-8 py-3 rounded-md hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg">
        Find a Tutor
      </Link>
      <Link to="/students" className="inline-block bg-white dark:bg-gray-700 text-blue-600 dark:text-white font-semibold px-8 py-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-transform transform hover:scale-105 shadow-lg border border-gray-200 dark:border-gray-600">
        Find a Student
      </Link>
    </div>
  </div>
);

const FeatureCard: React.FC<{ icon: string; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white mb-4">
            {/* FIX: Replaced 'class' with 'className' for JSX compatibility. */}
            <ion-icon name={icon} className="text-3xl"></ion-icon>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-base text-gray-600 dark:text-gray-400">{description}</p>
    </div>
);

const Home = () => {
  return (
    <div className="space-y-16">
      <Hero />
      <div className="py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                  <h2 className="text-base text-blue-600 dark:text-blue-400 font-semibold tracking-wide uppercase">Why tutLabs?</h2>
                  <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-4xl">
                      A better way to learn and teach
                  </p>
                  <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
                      We provide the tools and connections to make education more effective and accessible for everyone.
                  </p>
              </div>

              <div className="mt-10">
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                      <FeatureCard 
                        icon="search-outline"
                        title="Find Perfect Matches"
                        description="Easily search and filter for tutors or students near you based on subject, level, and location."
                      />
                      <FeatureCard 
                        icon="bulb-outline"
                        title="AI-Powered Tools"
                        description="Utilize our AI tools like text summarizers and sentiment analyzers to enhance your learning."
                      />
                      <FeatureCard 
                        icon="shield-checkmark-outline"
                        title="Verified & Trusted"
                        description="Our platform features verified tutors to ensure quality and safety for all our users."
                      />
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Home;