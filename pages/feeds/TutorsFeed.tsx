import React from 'react';
import React, { useContext } from 'react';
import StudentsNearMe from '../StudentsNearMe';
import { AuthContext } from '../../context/AuthContext';

const TutorsFeed: React.FC = () => {
  const { user } = useContext(AuthContext);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white drop-shadow-[0_2px_10px_rgba(59,130,246,0.35)]">Your Tutor Feed</h1>
        <p className="mt-2 text-lg text-white/90">Browse students near you who need your expertise{user?.name ? `, ${user.name}` : ''}.</p>
      </div>
      <StudentsNearMe />
    </div>
  );
};

export default TutorsFeed;
