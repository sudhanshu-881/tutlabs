import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type LoadingSpinnerProps = {
  inline?: boolean;
  intervalMs?: number;
  messages?: string[];
  type?: 'default' | 'fun' | 'educational' | 'auth' | 'search';
};

const messageSets = {
  default: [
    'Preparing results…',
    'Analyzing details…',
    'Curating your experience…',
    'Finalizing the update…',
    'Almost there…',
  ],
  fun: [
    '🎉 Summoning the learning spirits...',
    '🧠 Activating brain cells...',
    '📚 Dusting off the knowledge books...',
    '🎯 Aiming for excellence...',
    '✨ Adding a sprinkle of magic...',
    '🚀 Preparing for takeoff...',
    '🎪 Setting up the learning circus...',
    '🌈 Painting with knowledge colors...',
    '🎵 Composing the perfect learning melody...',
    '🎭 Getting ready for the show...',
  ],
  educational: [
    '📖 Opening the book of knowledge...',
    '🔬 Conducting educational experiments...',
    '🎓 Preparing your graduation cap...',
    '📝 Writing the perfect lesson plan...',
    '🧮 Calculating the best learning path...',
    '🌱 Planting seeds of wisdom...',
    '🔍 Searching for the perfect tutor...',
    '💡 Lighting up new ideas...',
    '🎯 Targeting your learning goals...',
    '🏆 Preparing your success trophy...',
  ],
  auth: [
    '🔐 Unlocking your potential...',
    '🎫 Validating your learning passport...',
    '🛡️ Securing your educational fortress...',
    '🔑 Finding the right key to success...',
    '🎪 Preparing your personalized learning show...',
    '🌟 Activating your learning superpowers...',
    '🎨 Painting your educational masterpiece...',
    '🎵 Tuning into your learning frequency...',
    '🚀 Launching your educational journey...',
    '🎉 Welcome to the future of learning!',
  ],
  search: [
    '🔍 Scanning the universe for perfect matches...',
    '🎯 Aiming for the ideal tutor...',
    '🧭 Navigating through the learning galaxy...',
    '🎪 Curating the best learning circus...',
    '🎨 Painting the perfect learning picture...',
    '🎵 Composing your learning symphony...',
    '🌟 Finding your educational star...',
    '🎭 Casting the perfect learning play...',
    '🎪 Setting up your personalized show...',
    '🎉 Found your learning soulmate!',
  ],
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  inline = true, 
  intervalMs = 2000, 
  messages, 
  type = 'default' 
}) => {
  const [index, setIndex] = React.useState(0);
  const messageArray = messages || messageSets[type];
  
  React.useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % messageArray.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, messageArray.length]);

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    inline ? (
      <div className="flex flex-col items-center justify-center py-14" aria-busy="true" aria-live="polite">
        {children}
      </div>
    ) : (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur"
        aria-busy="true" 
        aria-live="polite"
      >
        {children}
      </motion.div>
    )
  );

  return (
    <Wrapper>
      <motion.div 
        className="relative h-20 w-20"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Outer ring */}
        <motion.div 
          className="absolute inset-0 rounded-full border-4 border-blue-500/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Spinning ring */}
        <motion.div 
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner glow */}
        <motion.div 
          className="absolute inset-2 rounded-full bg-gradient-to-tr from-blue-600/20 to-pink-600/20 blur-xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Center dot */}
        <motion.div 
          className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
      
      <AnimatePresence mode="wait">
        <motion.div 
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="mt-6 text-center"
        >
          <div className="text-sm font-medium text-white/90 mb-2">
            {messageArray[index]}
          </div>
          
          {/* Progress dots */}
          <div className="flex justify-center space-x-1">
            {messageArray.map((_, i) => (
              <motion.div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === index ? 'bg-blue-500' : 'bg-white/30'
                }`}
                animate={{
                  scale: i === index ? [1, 1.2, 1] : 1,
                  opacity: i === index ? [0.7, 1, 0.7] : 0.3
                }}
                transition={{ duration: 0.5, repeat: i === index ? Infinity : 0 }}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </Wrapper>
  );
};

export default LoadingSpinner;