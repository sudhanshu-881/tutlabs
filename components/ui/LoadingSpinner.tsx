import React from 'react';

type LoadingSpinnerProps = {
  inline?: boolean;
  intervalMs?: number;
  messages?: string[];
};

const defaultMessages = [
  'Thinking…',
  'Crunching the numbers…',
  'Polishing results…',
  'Cross‑checking the details…',
  'Almost there…',
];

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ inline = true, intervalMs = 1400, messages = defaultMessages }) => {
  const [index, setIndex] = React.useState(0);
  React.useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, messages.length]);

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    inline ? (
      <div className="flex flex-col items-center justify-center py-14" aria-busy="true" aria-live="polite">{children}</div>
    ) : (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur" aria-busy="true" aria-live="polite">{children}</div>
    )
  );

  return (
    <Wrapper>
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
        <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-blue-600/20 to-pink-600/20 blur-xl"></div>
      </div>
      <div className="mt-4 text-sm font-medium text-white/90">
        {messages[index]}
      </div>
    </Wrapper>
  );
};

export default LoadingSpinner;