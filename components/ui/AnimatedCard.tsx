import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hoverScale?: number;
  tapScale?: number;
  delay?: number;
  whileHover?: any;
  whileTap?: any;
  onClick?: () => void;
  disabled?: boolean;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  hoverScale = 1.02,
  tapScale = 0.98,
  delay = 0,
  whileHover,
  whileTap,
  onClick,
  disabled = false,
}) => {
  const defaultHover = {
    scale: hoverScale,
    y: -5,
    transition: { duration: 0.2, ease: 'easeOut' },
  };

  const defaultTap = {
    scale: tapScale,
    transition: { duration: 0.1 },
  };

  return (
    <motion.div
      className={`${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={disabled ? {} : (whileHover || defaultHover)}
      whileTap={disabled ? {} : (whileTap || defaultTap)}
      onClick={disabled ? undefined : onClick}
      layout
    >
      {children}
    </motion.div>
  );
};

// Specialized card for tutor/student profiles
export const ProfileCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  delay?: number;
}> = ({ children, className = '', onClick, delay = 0 }) => {
  return (
    <AnimatedCard
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 ${className}`}
      hoverScale={1.03}
      tapScale={0.97}
      delay={delay}
      onClick={onClick}
      whileHover={{
        scale: 1.03,
        y: -8,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        transition: { duration: 0.3, ease: 'easeOut' },
      }}
    >
      {children}
    </AnimatedCard>
  );
};

// Card with floating animation
export const FloatingCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  delay?: number;
}> = ({ children, className = '', intensity = 'medium', delay = 0 }) => {
  const intensityMap = {
    low: { y: [0, -5, 0], duration: 3 },
    medium: { y: [0, -10, 0], duration: 2.5 },
    high: { y: [0, -15, 0], duration: 2 },
  };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <motion.div
        animate={intensityMap[intensity]}
        transition={{
          duration: intensityMap[intensity].duration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        whileHover={{
          scale: 1.02,
          y: -5,
          transition: { duration: 0.2 },
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

// Card with shimmer effect
export const ShimmerCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  shimmerColor?: string;
  delay?: number;
}> = ({ children, className = '', shimmerColor = 'rgba(255, 255, 255, 0.1)', delay = 0 }) => {
  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{ x: ['100%', '-100%'] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  );
};

// Card with pulse effect
export const PulseCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  pulseColor?: string;
  delay?: number;
}> = ({ children, className = '', pulseColor = 'rgba(59, 130, 246, 0.1)', delay = 0 }) => {
  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
      <motion.div
        className="absolute inset-0 rounded-lg"
        style={{ backgroundColor: pulseColor }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0, 0.3, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  );
};

// Card with magnetic effect
export const MagneticCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  strength?: number;
  delay?: number;
}> = ({ children, className = '', strength = 0.3, delay = 0 }) => {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    setMousePosition({
      x: (e.clientX - centerX) * strength,
      y: (e.clientY - centerY) * strength,
    });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      <motion.div
        animate={{
          x: mousePosition.x,
          y: mousePosition.y,
          scale: isHovered ? 1.02 : 1,
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

// Card with reveal animation
export const RevealCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
}> = ({ children, className = '', direction = 'up', delay = 0 }) => {
  const directionMap = {
    left: { x: -50, y: 0 },
    right: { x: 50, y: 0 },
    up: { x: 0, y: -50 },
    down: { x: 0, y: 50 },
  };

  const initialPosition = directionMap[direction];

  return (
    <motion.div
      className={className}
      initial={{ 
        opacity: 0, 
        x: initialPosition.x, 
        y: initialPosition.y,
        scale: 0.9 
      }}
      whileInView={{ 
        opacity: 1, 
        x: 0, 
        y: 0,
        scale: 1 
      }}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: 'easeOut' 
      }}
      viewport={{ once: true, margin: '-50px' }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
