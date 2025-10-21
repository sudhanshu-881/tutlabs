import React from 'react';

type LoadingSpinnerProps = {
  inline?: boolean;
  intervalMs?: number;
  messages?: string[];
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'dots';
  className?: string;
};

const defaultMessages = [
  'Preparing results…',
  'Analyzing details…',
  'Curating your experience…',
  'Finalizing the update…',
  'Almost there…',
];

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  inline = true, 
  intervalMs = 1400, 
  messages = defaultMessages,
  size = 'md',
  variant = 'default',
  className = ''
}) => {
  const [index, setIndex] = React.useState(0);
  
  React.useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, messages.length]);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-24 w-24'
  };

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    inline ? (
      <div className={`flex flex-col items-center justify-center py-14 ${className}`} aria-busy="true" aria-live="polite" role="status">
        {children}
      </div>
    ) : (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur" aria-busy="true" aria-live="polite" role="status">
        {children}
      </div>
    )
  );

  const renderSpinner = () => {
    if (variant === 'minimal') {
      return (
        <div className={`relative ${sizeClasses[size]}`}>
          <div className="absolute inset-0 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin"></div>
        </div>
      );
    }

    if (variant === 'dots') {
      return (
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      );
    }

    // Default variant
    return (
      <div className={`relative ${sizeClasses[size]}`}>
        <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
        <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-blue-600/20 to-pink-600/20 blur-xl"></div>
      </div>
    );
  };

  return (
    <Wrapper>
      {renderSpinner()}
      {messages.length > 0 && (
        <div className="mt-4 text-sm font-medium text-white/90 dark:text-gray-300 text-center max-w-xs">
          <span key={index} className="animate-fade-in">
            {messages[index]}
          </span>
        </div>
      )}
    </Wrapper>
  );
};

export default LoadingSpinner;