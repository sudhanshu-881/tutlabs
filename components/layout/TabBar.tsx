import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const TabBar: React.FC = () => {
  const { user } = useContext(AuthContext);
  const feedPath = user?.active_role === 'tutor' ? '/feed/tutor' : '/feed/student';

  const base = 'flex-1 flex items-center justify-center py-2';
  const link = 'inline-flex flex-col items-center justify-center text-xs';
  const iconClass = (isActive: boolean) => isActive ? 'text-pink-500' : 'text-white/70';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/20 dark:border-white/10 bg-white/20 dark:bg-slate-900/40 backdrop-blur-xl">
      <div className="max-w-4xl mx-auto flex">
        <NavLink to={feedPath} className={base} end>
          {({ isActive }) => (
            <span className={link + ' ' + iconClass(isActive)} aria-label="Feed">
              <ion-icon name={isActive ? 'home' : 'home-outline'} class="text-2xl"></ion-icon>
            </span>
          )}
        </NavLink>
        <NavLink to="/feed/messages" className={base}>
          {({ isActive }) => (
            <span className={link + ' ' + iconClass(isActive)} aria-label="Messages">
              <ion-icon name={isActive ? 'chatbubbles' : 'chatbubbles-outline'} class="text-2xl"></ion-icon>
            </span>
          )}
        </NavLink>
        <NavLink to="/profile" className={base}>
          {({ isActive }) => (
            <span className={link + ' ' + iconClass(isActive)} aria-label="Profile">
              <ion-icon name={isActive ? 'person' : 'person-outline'} class="text-2xl"></ion-icon>
            </span>
          )}
        </NavLink>
      </div>
    </nav>
  );
};

export default TabBar;
