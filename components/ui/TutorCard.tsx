import React from 'react';
import { Link } from 'react-router-dom';
import { Tutor } from '../../types';
import { StarIcon, VerifiedIcon } from './Icons';

interface TutorCardProps {
  tutor: Tutor;
}

const TutorCard: React.FC<TutorCardProps> = ({ tutor }) => {
  return (
    <div className="relative rounded-2xl border border-white/15 dark:border-white/10 bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.25)] overflow-hidden transform transition-all duration-300 will-change-transform hover:-translate-y-1">
      <img className="h-48 w-full object-cover" src={tutor.image_url} alt={tutor.name} />
      <div className="p-5">
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              {tutor.name}
              {tutor.verified && <VerifiedIcon className="w-5 h-5 text-blue-500 ml-2" />}
            </h3>
            <div className="flex items-center">
                <StarIcon className="w-5 h-5 text-yellow-400" />
                <span className="ml-1 text-gray-600 dark:text-gray-300">{tutor.rating.toFixed(1)}</span>
            </div>
        </div>
        <p className="text-sm text-gray-700/80 dark:text-gray-300/90 mt-1">{tutor.location}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {tutor.subjects.map((subject) => (
            <span key={subject} className="px-2.5 py-1 bg-white/50 dark:bg-white/10 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded-full border border-white/20 dark:border-white/10 backdrop-blur">
              {subject}
            </span>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link to={`/profile?tutor=${encodeURIComponent(String(tutor.id))}`} className="w-full text-center bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-blue-500/30 active:translate-y-0 active:shadow-sm text-sm font-medium">View Profile</Link>
          <Link to={`/feed/messages?peer=${encodeURIComponent('t:' + String(tutor.id))}&name=${encodeURIComponent(tutor.name)}`} className="w-full text-center bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2.5 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all text-sm font-medium">Connect</Link>
        </div>
      </div>
    </div>
  );
};

export default TutorCard;