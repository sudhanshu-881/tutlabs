import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { setPendingRole } from '../lib/services/role';
import { motion } from 'framer-motion';
import { HeroTransition, StaggeredList, FloatingCard, BounceButton, TypewriterText, Confetti } from '../components/ui/PageTransition';

const Hero: React.FC<{ onChooseRole: (role: 'student' | 'tutor') => void }> = ({ onChooseRole }) => {
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [typingComplete, setTypingComplete] = React.useState(false);

  const handleRoleSelection = (role: 'student' | 'tutor') => {
    setShowConfetti(true);
    setTimeout(() => onChooseRole(role), 500);
  };

  return (
    <HeroTransition className="text-center py-16 sm:py-24">
      <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mb-8"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(59,130,246,0.35)]">
          <motion.span 
            className="block"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Unlock Your Potential with
          </motion.span>
          <motion.span 
            className="block text-white"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <TypewriterText
              text="One on 1 Personalised Learning"
              speed={100}
              onComplete={() => setTypingComplete(true)}
              className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
            />
          </motion.span>
        </h1>
      </motion.div>

      <motion.p 
        className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-white/90"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        Connect parents, students, and verified tutors. Find nearby tutors or students, manage your profile, and accelerate learning with tutlabs.
      </motion.p>

      <motion.div 
        id="role-picker" 
        className="mt-8 flex justify-center gap-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: typingComplete ? 1 : 0, y: typingComplete ? 0 : 30 }}
        transition={{ duration: 0.6, delay: 1.4 }}
      >
        <BounceButton
          onClick={() => handleRoleSelection('student')}
          className="inline-block bg-white/90 dark:bg-gray-900/70 text-blue-700 dark:text-white font-semibold px-8 py-3 rounded-md shadow-lg border border-white/20 dark:border-gray-700 transition-all duration-300 ease-in-out hover:shadow-2xl"
        >
          <motion.span
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2"
          >
            🎓 I'm a Student/Parent
          </motion.span>
        </BounceButton>
        
        <BounceButton
          onClick={() => handleRoleSelection('tutor')}
          className="inline-block bg-blue-600 text-white font-semibold px-8 py-3 rounded-md shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl"
        >
          <motion.span
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2"
          >
            👨‍🏫 I'm a Tutor
          </motion.span>
        </BounceButton>
      </motion.div>

      {/* Floating educational icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {['📚', '🧮', '🔬', '🎨', '🎵', '🌍'].map((emoji, index) => (
          <motion.div
            key={index}
            className="absolute text-4xl opacity-20"
            style={{
              left: `${10 + index * 15}%`,
              top: `${20 + (index % 2) * 30}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 4 + index * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.3,
            }}
          >
            {emoji}
          </motion.div>
        ))}
      </div>
    </HeroTransition>
  );
};

const FeatureCard: React.FC<{ icon: string; title: string; description: string; delay?: number }> = ({ 
  icon, 
  title, 
  description, 
  delay = 0 
}) => (
  <FloatingCard intensity="low" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 200, 
        damping: 15,
        delay: delay 
      }}
      className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-br from-blue-600 to-purple-600 text-white mb-4"
    >
      <ion-icon name={icon} className="text-3xl" />
    </motion.div>
    <motion.h3 
      className="text-lg font-medium text-gray-900 dark:text-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay + 0.2 }}
    >
      {title}
    </motion.h3>
    <motion.p 
      className="mt-2 text-base text-gray-600 dark:text-gray-400"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay + 0.4 }}
    >
      {description}
    </motion.p>
  </FloatingCard>
);

const Home = () => {
  const navigate = useNavigate();
  const [showEasterEgg, setShowEasterEgg] = React.useState(false);

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

  // Easter egg: Konami code
  React.useEffect(() => {
    let konamiCode = [];
    const konamiSequence = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'KeyB', 'KeyA'
    ];

    const handleKeyDown = (e: KeyboardEvent) => {
      konamiCode.push(e.code);
      if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
      }
      
      if (konamiCode.join(',') === konamiSequence.join(',')) {
        setShowEasterEgg(true);
        setTimeout(() => setShowEasterEgg(false), 5000);
        konamiCode = [];
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="space-y-16 relative">
      <Hero onChooseRole={chooseRole} />
      
      {/* Easter Egg */}
      {showEasterEgg && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 rounded-lg shadow-2xl"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-6xl mb-4"
          >
            🎉
          </motion.div>
          <h3 className="text-2xl font-bold mb-2">Secret Unlocked!</h3>
          <p className="text-lg">You found the hidden easter egg! 🎊</p>
        </motion.div>
      )}

      <motion.div 
        className="py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h2 className="text-base text-blue-200 dark:text-blue-300 font-semibold tracking-wide lowercase">
              Why tutlabs?
            </h2>
            <motion.p 
              className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-4xl"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              A better way to learn and teach
            </motion.p>
            <motion.p 
              className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              We provide the platform and connections to make education more effective and accessible for everyone.
            </motion.p>
          </motion.div>

          <div className="mt-10">
            <StaggeredList className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3" delay={0.2}>
              <FeatureCard 
                icon="search-outline"
                title="Find Perfect Matches"
                description="Easily search and filter for tutors or students near you based on subject, level, and location."
                delay={0}
              />
              <FeatureCard 
                icon="bulb-outline"
                title="AI-Powered Tools"
                description="Utilize our AI tools like text summarizers and sentiment analyzers to enhance your learning."
                delay={0.2}
              />
              <FeatureCard 
                icon="shield-checkmark-outline"
                title="Verified & Trusted"
                description="Our platform features verified local tutors to ensure quality and safety for all our users."
                delay={0.4}
              />
            </StaggeredList>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
