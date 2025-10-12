import React from 'react';

const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="h-48 w-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
        </div>
        <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
      </div>
    </div>
  );
};

export default CardSkeleton;
