import React, { useEffect, useState } from 'react';
import type { Role } from '../../types';
import { getPendingRole, setPendingRole } from '../../lib/services/role';

interface RolePickerProps {
  onChange?: (role: Role | null) => void;
}

const RolePicker: React.FC<RolePickerProps> = ({ onChange }) => {
  const [role, setRole] = useState<Role | null>(null);
  const [required, setRequired] = useState<boolean>(false);

  useEffect(() => {
    const initial = getPendingRole();
    setRole(initial);
  }, []);

  useEffect(() => {
    const handler = () => setRequired(true);
    window.addEventListener('role:require', handler as EventListener);
    return () => window.removeEventListener('role:require', handler as EventListener);
  }, []);

  const apply = (next: Role) => {
    setRole(next);
    setPendingRole(next);
    setRequired(false);
    onChange?.(next);
  };

  const base =
    'px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500';
  const active = 'bg-blue-600 text-white shadow';
  const inactive = 'bg-white/90 dark:bg-gray-900/70 text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800';

  return (
    <div id="role-picker" className={`inline-flex items-center space-x-1 p-1 bg-white/80 dark:bg-gray-900/60 rounded-lg backdrop-blur border ${required && !role ? 'border-red-500 ring-2 ring-red-500/30' : 'border-white/20 dark:border-white/10'}`}>
      <button
        type="button"
        className={`${base} ${role === 'student' ? active : inactive} ${required && !role ? 'ring-1 ring-red-400' : ''}`}
        onClick={() => apply('student')}
        aria-pressed={role === 'student'}
      >
        Student/Parent
      </button>
      <button
        type="button"
        className={`${base} ${role === 'tutor' ? active : inactive} ${required && !role ? 'ring-1 ring-red-400' : ''}`}
        onClick={() => apply('tutor')}
        aria-pressed={role === 'tutor'}
      >
        Tutor
      </button>
      {required && !role && (
        <span className="ml-3 text-xs text-red-600">Select your role to continue</span>
      )}
    </div>
  );
};

export default RolePicker;
