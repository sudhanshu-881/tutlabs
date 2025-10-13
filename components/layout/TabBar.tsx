import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const TabBar: React.FC = () => {
  const { user } = useContext(AuthContext);
  // Do not render bottom tabs for unauthenticated users
  if (!user) return null;

  const feedPath = user.active_role === 'tutor' ? '/feed/tutor' : '/feed/student';

  const base = 'flex-1 flex items-center justify-center py-2';
  const link = 'inline-flex flex-col items-center justify-center text-[11px] font-medium transition-colors';
  const iconClass = (isActive: boolean) => isActive ? 'text-pink-500' : 'text-white/70';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/20 dark:border-white/10 bg-white/25 dark:bg-slate-900/50 backdrop-blur-xl" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="max-w-4xl mx-auto flex">
        <NavLink to={feedPath} className={base} end>
          {({ isActive }) => (
            <span className={link + ' ' + iconClass(isActive)} aria-label="Feed">
              <ion-icon name={isActive ? 'home' : 'home-outline'} class="text-2xl"></ion-icon>
              <span className="mt-1">Feed</span>
            </span>
          )}
        </NavLink>
        <NavLink to="/feed/messages" className={base}>
          {({ isActive }) => (
            <span className={link + ' ' + iconClass(isActive)} aria-label="Messages">
              <ion-icon name={isActive ? 'chatbubbles' : 'chatbubbles-outline'} class="text-2xl"></ion-icon>
              <span className="mt-1">Messages</span>
            </span>
          )}
        </NavLink>
        <NavLink to="/profile" className={base}>
          {({ isActive }) => (
            <span className={link + ' ' + iconClass(isActive)} aria-label="Profile">
              <ion-icon name={isActive ? 'person' : 'person-outline'} class="text-2xl"></ion-icon>
              <span className="mt-1">Profile</span>
            </span>
          )}
        </NavLink>
      </div>
    </nav>
  );
};

export default TabBar;
