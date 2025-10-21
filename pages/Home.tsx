import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { setPendingRole } from '../lib/services/role';
import RolePicker from '../components/ui/RolePicker';
import type { Role } from '../types';

const Hero: React.FC<{ onChooseRole: (role: 'student' | 'tutor') => void }> = ({ onChooseRole }) => (
  <section className="text-center py-16 sm:py-24" aria-labelledby="hero-heading">
    <h1 
      id="hero-heading"
      className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(59,130,246,0.35)]"
    >
      <span className="block">Unlock Your Potential with</span>
      <span className="block text-white">One on 1 Personalised Learning</span>
    </h1>
    <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-white/90">
      Connect parents, students, and verified tutors. Find nearby tutors or students, manage your profile, and accelerate learning with tutlabs.
    </p>
    <div className="mt-8 flex justify-center" role="group" aria-label="Choose your role">
      <RolePicker onChange={(r: Role | null) => { if (r) onChooseRole(r); }} />
    </div>
  </section>
);

const FeatureCard: React.FC<{ icon: string; title: string; description: string }> = ({ icon, title, description }) => (
    <article className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white mb-4" aria-hidden="true">
            <ion-icon name={icon} className="text-3xl" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-base text-gray-600 dark:text-gray-400">{description}</p>
    </article>
);

const Home = () => {
  const navigate = useNavigate();
  React.useEffect(() => {
    try {
      const need = sessionStorage.getItem('ROLE_REQUIRED');
      if (need === '1') {
        sessionStorage.removeItem('ROLE_REQUIRED');
        const el = document.getElementById('role-picker');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch {}
  }, []);

  const chooseRole = (role: 'student' | 'tutor') => {
    setPendingRole(role);
    // If user intended to auth, respect it, else go signup
    let next = '/signup';
    try {
      const pref = sessionStorage.getItem('NEXT_AUTH');
      if (pref === 'login') next = '/login';
    } catch {}
    navigate(next);
  };

  return (
    <main className="space-y-16">
      <Hero onChooseRole={chooseRole} />
      <section className="py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg" aria-labelledby="features-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                  <h2 id="features-heading" className="text-base text-blue-200 dark:text-blue-300 font-semibold tracking-wide lowercase">Why tutlabs?</h2>
                  <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-4xl">
                      A better way to learn and teach
                  </p>
                  <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
                      We provide the platform and connections to make education more effective and accessible for everyone.
                  </p>
              </div>

              <div className="mt-10">
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3" role="list">
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
                  {/* CTA moved to hero; keep section informational */}
              </div>
          </div>
      </section>
    </main>
  );
};

export default Home;
