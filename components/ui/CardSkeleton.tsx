import React from 'react';

interface CardSkeletonProps {
  variant?: 'tutor' | 'student' | 'request';
  className?: string;
}

const CardSkeleton: React.FC<CardSkeletonProps> = ({ variant = 'tutor', className = '' }) => {
  const baseClasses = "relative rounded-2xl border border-white/15 dark:border-white/10 bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl overflow-hidden";
  
  if (variant === 'tutor') {
    return (
      <div className={`${baseClasses} ${className}`} role="status" aria-label="Loading tutor card">
        <div className="h-48 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse" />
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-32 animate-pulse" />
            <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-12 animate-pulse" />
          </div>
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-24 animate-pulse" />
          <div className="flex flex-wrap gap-2">
            <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full w-16 animate-pulse" />
            <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full w-20 animate-pulse" />
            <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full w-14 animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg animate-pulse" />
            <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg animate-pulse" />
          </div>
        </div>
        <span className="sr-only">Loading tutor information...</span>
      </div>
    );
  }

  if (variant === 'student') {
    return (
      <div className={`${baseClasses} ${className}`} role="status" aria-label="Loading student card">
        <div className="h-48 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse" />
        <div className="p-5 space-y-4">
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-28 animate-pulse" />
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-20 animate-pulse" />
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-16 animate-pulse" />
          <div className="flex flex-wrap gap-2">
            <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full w-18 animate-pulse" />
            <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full w-22 animate-pulse" />
          </div>
          <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg animate-pulse" />
        </div>
        <span className="sr-only">Loading student information...</span>
      </div>
    );
  }

  if (variant === 'request') {
    return (
      <div className={`${baseClasses} ${className}`} role="status" aria-label="Loading request card">
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-36 animate-pulse" />
            <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-20 animate-pulse" />
          </div>
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-32 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-full animate-pulse" />
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-3/4 animate-pulse" />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full w-16 animate-pulse" />
            <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full w-20 animate-pulse" />
          </div>
          <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg animate-pulse" />
        </div>
        <span className="sr-only">Loading request information...</span>
      </div>
    );
  }

  return null;
};

export default CardSkeleton;
