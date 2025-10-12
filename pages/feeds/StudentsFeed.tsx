import React from 'react';
import TutorsNearMe from '../TutorsNearMe';
import { NavLink } from 'react-router-dom';

const StudentsFeed: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white drop-shadow-[0_2px_10px_rgba(59,130,246,0.35)]">Your Student Feed</h1>
        <p className="mt-2 text-lg text-white/90">Discover verified tutors tailored to your learning goals.</p>
        {/* Top tabs removed; bottom TabBar provides navigation */}
      </div>
      <TutorsNearMe />
    </div>
  );
};

export default StudentsFeed;
