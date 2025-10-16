import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
};

const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Special transition for hero sections
export const HeroTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
  const heroVariants = {
    initial: {
      opacity: 0,
      y: 50,
      scale: 0.95,
    },
    in: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
    out: {
      opacity: 0,
      y: -50,
      scale: 1.05,
    },
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={heroVariants}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 15,
        duration: 0.6,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Staggered animation for lists
export const StaggeredList: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = '', delay = 0.1 }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: delay,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Floating animation for cards
export const FloatingCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
}> = ({ children, className = '', intensity = 'medium' }) => {
  const intensityMap = {
    low: { y: [0, -5, 0], duration: 3 },
    medium: { y: [0, -10, 0], duration: 2.5 },
    high: { y: [0, -15, 0], duration: 2 },
  };

  return (
    <motion.div
      animate={intensityMap[intensity]}
      transition={{
        duration: intensityMap[intensity].duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
      whileHover={{
        scale: 1.02,
        y: -5,
        transition: { duration: 0.2 },
      }}
    >
      {children}
    </motion.div>
  );
};

// Bounce animation for buttons
export const BounceButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}> = ({ children, onClick, className = '', disabled = false }) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={className}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        y: [0, -2, 0],
      }}
      transition={{
        y: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }}
    >
      {children}
    </motion.button>
  );
};

// Pulse animation for important elements
export const PulseElement: React.FC<{
  children: React.ReactNode;
  className?: string;
  intensity?: 'subtle' | 'medium' | 'strong';
}> = ({ children, className = '', intensity = 'medium' }) => {
  const intensityMap = {
    subtle: { scale: [1, 1.02, 1], opacity: [1, 0.9, 1] },
    medium: { scale: [1, 1.05, 1], opacity: [1, 0.8, 1] },
    strong: { scale: [1, 1.1, 1], opacity: [1, 0.7, 1] },
  };

  return (
    <motion.div
      animate={intensityMap[intensity]}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Typewriter effect for text
export const TypewriterText: React.FC<{
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}> = ({ text, speed = 50, className = '', onComplete }) => {
  const [displayedText, setDisplayedText] = React.useState('');
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {displayedText}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="ml-1"
      >
        |
      </motion.span>
    </motion.span>
  );
};

// Confetti animation for celebrations
export const Confetti: React.FC<{
  trigger: boolean;
  onComplete?: () => void;
}> = ({ trigger, onComplete }) => {
  const [particles, setParticles] = React.useState<Array<{
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
  }>>([]);

  React.useEffect(() => {
    if (trigger) {
      const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -10,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
      }));

      setParticles(newParticles);

      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            backgroundColor: particle.color,
            width: particle.size,
            height: particle.size,
            left: particle.x,
            top: particle.y,
          }}
          animate={{
            y: [particle.y, window.innerHeight + 100],
            x: [particle.x, particle.x + (Math.random() - 0.5) * 200],
            rotate: [0, 360],
            opacity: [1, 0],
          }}
          transition={{
            duration: 3,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
};

export default PageTransition;
