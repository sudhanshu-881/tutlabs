import React from 'react';
import TutorsNearMe from '../TutorsNearMe';
import { NavLink } from 'react-router-dom';

const StudentsFeed: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white drop-shadow-[0_2px_10px_rgba(59,130,246,0.35)]">Your Student Feed</h1>
        <p className="mt-2 text-lg text-white/90">Discover verified tutors tailored to your learning goals.</p>
        <div className="mt-4 inline-flex rounded-lg border border-white/15 bg-white/20 backdrop-blur">
          <NavLink to="/feed/student" className="px-4 py-2 text-sm text-white" end>
            Feed
          </NavLink>
          <NavLink to="/feed/messages" className="px-4 py-2 text-sm text-white/80 hover:text-white">
            Messages
          </NavLink>
          <NavLink to="/profile" className="px-4 py-2 text-sm text-white/80 hover:text-white">
            Profile
          </NavLink>
        </div>
      </div>
      <TutorsNearMe />
    </div>
  );
};

export default StudentsFeed;
