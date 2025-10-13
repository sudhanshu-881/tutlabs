import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { setPendingRole } from '../lib/services/role';
import RolePicker from '../components/ui/RolePicker';

const Hero = () => (
  <div className="text-center py-16 sm:py-24">
    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(59,130,246,0.35)]">
      <span className="block">Unlock Your Potential with</span>
      <span className="block text-white">One on 1 Personalised Learning</span>
    </h1>
    <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-white/90">
      Connect parents, students, and verified tutors. Find nearby tutors or students, manage your profile, and accelerate learning with tutlabs.
    </p>
    <div className="mt-8 flex justify-center">
      <RolePicker />
    </div>
  </div>
);

const FeatureCard: React.FC<{ icon: string; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white mb-4">
            <ion-icon name={icon} className="text-3xl" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-base text-gray-600 dark:text-gray-400">{description}</p>
    </div>
);

const Home = () => {
  const navigate = useNavigate();

  const chooseRole = (role: 'student' | 'tutor') => {
    setPendingRole(role);
    navigate('/signup');
  };

  return (
    <div className="space-y-16">
      <Hero />
      <div className="py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                  <h2 className="text-base text-blue-200 dark:text-blue-300 font-semibold tracking-wide lowercase">Why tutlabs?</h2>
                  <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-4xl">
                      A better way to learn and teach
                  </p>
                  <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
                      We provide the platform and connections to make education more effective and accessible for everyone.
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
                        description="Our platform features verified local tutors to ensure quality and safety for all our users."
                      />
                  </div>
                  <div className="mt-10 flex justify-center gap-4">
                    <button onClick={() => chooseRole('student')} className="inline-block bg-white/90 dark:bg-gray-900/70 text-blue-700 dark:text-white font-semibold px-8 py-3 rounded-md shadow-lg border border-white/20 dark:border-gray-700 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 hover:shadow-2xl">
                      I’m a Student/Parent
                    </button>
                    <button onClick={() => chooseRole('tutor')} className="inline-block bg-blue-600 text-white font-semibold px-8 py-3 rounded-md shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 hover:shadow-2xl">
                      I’m a Tutor
                    </button>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Home;
