import React from 'react';
import { Role } from '../../types';

interface RoleSwitcherProps {
  currentRole: Role | null;
  onSwitchRole: (newRole: Role) => void;
  loading: boolean;
}

const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentRole, onSwitchRole, loading }) => {
  const baseClasses = "px-3 py-1 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed";
  const activeClasses = "bg-blue-600 text-white shadow";
  const inactiveClasses = "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600";

  return (
    <div className="flex items-center space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <button
        onClick={() => onSwitchRole('student')}
        disabled={loading || currentRole === 'student'}
        className={`${baseClasses} ${currentRole === 'student' ? activeClasses : inactiveClasses}`}
        aria-pressed={currentRole === 'student'}
      >
        Student
      </button>
      <button
        onClick={() => onSwitchRole('tutor')}
        disabled={loading || currentRole === 'tutor'}
        className={`${baseClasses} ${currentRole === 'tutor' ? activeClasses : inactiveClasses}`}
        aria-pressed={currentRole === 'tutor'}
      >
        Tutor
      </button>
    </div>
  );
};

export default RoleSwitcher;
