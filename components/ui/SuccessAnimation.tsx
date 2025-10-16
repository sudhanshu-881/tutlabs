import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SuccessAnimationProps {
  trigger: boolean;
  message?: string;
  onComplete?: () => void;
  type?: 'success' | 'celebration' | 'achievement' | 'welcome';
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({ 
  trigger, 
  message = 'Success!', 
  onComplete,
  type = 'success'
}) => {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (trigger) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  const getAnimationConfig = () => {
    switch (type) {
      case 'celebration':
        return {
          emoji: '🎉',
          bgColor: 'from-yellow-400 to-orange-500',
          message: message || 'Celebration!',
        };
      case 'achievement':
        return {
          emoji: '🏆',
          bgColor: 'from-yellow-500 to-yellow-600',
          message: message || 'Achievement Unlocked!',
        };
      case 'welcome':
        return {
          emoji: '👋',
          bgColor: 'from-blue-500 to-purple-600',
          message: message || 'Welcome!',
        };
      default:
        return {
          emoji: '✅',
          bgColor: 'from-green-500 to-green-600',
          message: message || 'Success!',
        };
    }
  };

  const config = getAnimationConfig();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ 
              type: 'spring', 
              stiffness: 200, 
              damping: 15,
              duration: 0.6 
            }}
            className={`bg-gradient-to-r ${config.bgColor} text-white p-8 rounded-2xl shadow-2xl max-w-sm mx-4 text-center`}
          >
            {/* Animated emoji */}
            <motion.div
              className="text-6xl mb-4"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: 'easeInOut' 
              }}
            >
              {config.emoji}
            </motion.div>

            {/* Message */}
            <motion.h3
              className="text-2xl font-bold mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {config.message}
            </motion.h3>

            {/* Progress bar */}
            <motion.div
              className="w-full bg-white/20 rounded-full h-2 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                className="bg-white h-2 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.5, ease: 'linear' }}
              />
            </motion.div>

            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full"
                  style={{
                    left: `${20 + i * 10}%`,
                    top: `${30 + (i % 2) * 20}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Quick success toast
export const QuickSuccess: React.FC<{
  trigger: boolean;
  message: string;
  onComplete?: () => void;
}> = ({ trigger, message, onComplete }) => {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (trigger) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 0.5 }}
            className="text-xl"
          >
            ✅
          </motion.div>
          <span className="font-medium">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Progress celebration
export const ProgressCelebration: React.FC<{
  progress: number;
  total: number;
  message?: string;
}> = ({ progress, total, message }) => {
  const percentage = (progress / total) * 100;
  const isComplete = progress === total;

  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
      <motion.div
        className={`h-full rounded-full transition-all duration-500 ${
          isComplete 
            ? 'bg-gradient-to-r from-green-500 to-green-600' 
            : 'bg-gradient-to-r from-blue-500 to-purple-600'
        }`}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {isComplete && (
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: 'linear' 
            }}
          />
        )}
      </motion.div>
      
      {isComplete && (
        <motion.div
          className="absolute -top-2 -right-2 text-2xl"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: 'spring', 
            stiffness: 200, 
            damping: 15,
            delay: 0.5 
          }}
        >
          🎉
        </motion.div>
      )}
    </div>
  );
};

// Achievement badge
export const AchievementBadge: React.FC<{
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}> = ({ title, description, icon, unlocked }) => {
  return (
    <motion.div
      className={`p-4 rounded-lg border-2 transition-all duration-300 ${
        unlocked 
          ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' 
          : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
      }`}
      whileHover={{ scale: 1.02 }}
      animate={unlocked ? { 
        boxShadow: [
          '0 0 0 0 rgba(251, 191, 36, 0)',
          '0 0 0 10px rgba(251, 191, 36, 0.1)',
          '0 0 0 0 rgba(251, 191, 36, 0)'
        ]
      } : {}}
      transition={unlocked ? { 
        duration: 2, 
        repeat: Infinity 
      } : {}}
    >
      <div className="flex items-center gap-3">
        <motion.div
          className={`text-3xl ${unlocked ? '' : 'grayscale opacity-50'}`}
          animate={unlocked ? { 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          } : {}}
          transition={unlocked ? { 
            duration: 2, 
            repeat: Infinity 
          } : {}}
        >
          {icon}
        </motion.div>
        <div>
          <h4 className={`font-semibold ${unlocked ? 'text-yellow-800 dark:text-yellow-200' : 'text-gray-600 dark:text-gray-400'}`}>
            {title}
          </h4>
          <p className={`text-sm ${unlocked ? 'text-yellow-700 dark:text-yellow-300' : 'text-gray-500 dark:text-gray-500'}`}>
            {description}
          </p>
        </div>
        {unlocked && (
          <motion.div
            className="ml-auto text-yellow-500"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            ✨
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default SuccessAnimation;
