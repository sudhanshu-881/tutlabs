import React from 'react';
import { motion } from 'framer-motion';

interface FunButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  emoji?: string;
  animation?: 'bounce' | 'pulse' | 'shake' | 'glow' | 'magnetic' | 'ripple';
}

const FunButton: React.FC<FunButtonProps> = ({
  children,
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  emoji,
  animation = 'bounce',
}) => {
  const getVariantStyles = () => {
    const baseStyles = 'font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    switch (variant) {
      case 'primary':
        return `${baseStyles} bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white focus:ring-blue-500 shadow-lg hover:shadow-xl`;
      case 'secondary':
        return `${baseStyles} bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white focus:ring-gray-500`;
      case 'success':
        return `${baseStyles} bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white focus:ring-green-500 shadow-lg hover:shadow-xl`;
      case 'warning':
        return `${baseStyles} bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white focus:ring-yellow-500 shadow-lg hover:shadow-xl`;
      case 'danger':
        return `${baseStyles} bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white focus:ring-red-500 shadow-lg hover:shadow-xl`;
      case 'ghost':
        return `${baseStyles} bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-gray-500`;
      default:
        return baseStyles;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'md':
        return 'px-4 py-2 text-base';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  const getAnimationProps = () => {
    switch (animation) {
      case 'bounce':
        return {
          animate: { y: [0, -2, 0] },
          transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        };
      case 'pulse':
        return {
          animate: { scale: [1, 1.05, 1] },
          transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        };
      case 'shake':
        return {
          animate: { x: [0, -2, 2, -2, 2, 0] },
          transition: { duration: 0.5, repeat: Infinity, repeatDelay: 3 },
        };
      case 'glow':
        return {
          animate: {
            boxShadow: [
              '0 0 0 0 rgba(59, 130, 246, 0)',
              '0 0 0 10px rgba(59, 130, 246, 0.1)',
              '0 0 0 0 rgba(59, 130, 246, 0)',
            ],
          },
          transition: { duration: 2, repeat: Infinity },
        };
      default:
        return {};
    }
  };

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  return (
    <motion.button
      className={`${getVariantStyles()} ${getSizeStyles()} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      onClick={handleClick}
      disabled={disabled || loading}
      whileHover={disabled ? {} : { scale: 1.05, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      {...getAnimationProps()}
    >
      <motion.span
        className="flex items-center justify-center gap-2"
        animate={loading ? { opacity: [1, 0.7, 1] } : {}}
        transition={loading ? { duration: 1, repeat: Infinity } : {}}
      >
        {loading ? (
          <motion.div
            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          <>
            {emoji && <span className="text-lg">{emoji}</span>}
            {icon && <ion-icon name={icon} className="text-lg" />}
          </>
        )}
        {children}
      </motion.span>
    </motion.button>
  );
};

// Specialized buttons
export const MagicButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}> = ({ children, onClick, className = '', disabled = false }) => {
  const [isClicked, setIsClicked] = React.useState(false);

  const handleClick = () => {
    if (!disabled && onClick) {
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 600);
      onClick();
    }
  };

  return (
    <motion.button
      className={`relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      onClick={handleClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.05, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      animate={isClicked ? { scale: [1, 1.1, 1] } : {}}
    >
      <motion.span
        className="relative z-10 flex items-center gap-2"
        animate={isClicked ? { rotate: [0, 5, -5, 0] } : {}}
      >
        ✨ {children}
      </motion.span>
      
      {/* Ripple effect */}
      {isClicked && (
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-lg"
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      )}
    </motion.button>
  );
};

export const CelebrationButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}> = ({ children, onClick, className = '', disabled = false }) => {
  return (
    <motion.button
      className={`bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.05, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      animate={{
        boxShadow: [
          '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          '0 10px 15px -3px rgba(251, 191, 36, 0.3)',
          '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        ],
      }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <motion.span
        className="flex items-center gap-2"
        animate={{ rotate: [0, 2, -2, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🎉 {children}
      </motion.span>
    </motion.button>
  );
};

export const FloatingActionButton: React.FC<{
  icon: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}> = ({ icon, onClick, className = '', disabled = false, position = 'bottom-right' }) => {
  const getPositionStyles = () => {
    switch (position) {
      case 'bottom-right':
        return 'fixed bottom-6 right-6';
      case 'bottom-left':
        return 'fixed bottom-6 left-6';
      case 'top-right':
        return 'fixed top-6 right-6';
      case 'top-left':
        return 'fixed top-6 left-6';
      default:
        return 'fixed bottom-6 right-6';
    }
  };

  return (
    <motion.button
      className={`${getPositionStyles()} w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-40 ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.1, rotate: 5 }}
      whileTap={disabled ? {} : { scale: 0.9 }}
      animate={{
        y: [0, -5, 0],
        boxShadow: [
          '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        ],
      }}
      transition={{
        y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        boxShadow: { duration: 2, repeat: Infinity },
      }}
    >
      <ion-icon name={icon} className="text-2xl" />
    </motion.button>
  );
};

export default FunButton;
