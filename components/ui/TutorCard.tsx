import React from 'react';
import { Link } from 'react-router-dom';
import { Tutor } from '../../types';
import { StarIcon, VerifiedIcon } from './Icons';

interface TutorCardProps {
  tutor: Tutor;
}

const TutorCard: React.FC<TutorCardProps> = ({ tutor }) => {
  return (
    <article className="relative rounded-2xl border border-white/15 dark:border-white/10 bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.25)] overflow-hidden transform transition-all duration-300 will-change-transform hover:-translate-y-1 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
      <div className="relative">
        <img 
          className="h-48 w-full object-cover" 
          src={tutor.image_url} 
          alt={`Profile photo of ${tutor.name}`}
          loading="lazy"
        />
        {tutor.verified && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full" aria-label="Verified tutor">
            <VerifiedIcon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            {tutor.name}
            {tutor.verified && (
              <span className="ml-2 text-blue-500" aria-label="Verified">
                <VerifiedIcon className="w-5 h-5" />
              </span>
            )}
          </h3>
          <div className="flex items-center" aria-label={`Rating: ${tutor.rating.toFixed(1)} out of 5`}>
            <StarIcon className="w-5 h-5 text-yellow-400" aria-hidden="true" />
            <span className="ml-1 text-gray-600 dark:text-gray-300 font-medium">{tutor.rating.toFixed(1)}</span>
          </div>
        </div>
        <p className="text-sm text-gray-700/80 dark:text-gray-300/90 mb-4" aria-label={`Location: ${tutor.location}`}>
          📍 {tutor.location}
        </p>
        <div className="mb-5">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subjects:</h4>
          <div className="flex flex-wrap gap-2">
            {tutor.subjects.map((subject) => (
              <span 
                key={subject} 
                className="px-2.5 py-1 bg-white/50 dark:bg-white/10 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded-full border border-white/20 dark:border-white/10 backdrop-blur"
                role="listitem"
              >
                {subject}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Link 
            to={`/profile?tutor=${encodeURIComponent(String(tutor.id))}`} 
            className="w-full text-center bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-blue-500/30 active:translate-y-0 active:shadow-sm text-sm font-medium"
            aria-label={`View ${tutor.name}'s profile`}
          >
            View Profile
          </Link>
          <Link 
            to={`/feed/messages?peer=${encodeURIComponent('t:' + String(tutor.id))}&name=${encodeURIComponent(tutor.name)}`} 
            className="w-full text-center bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2.5 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all text-sm font-medium"
            aria-label={`Connect with ${tutor.name}`}
          >
            Connect
          </Link>
        </div>
      </div>
    </article>
  );
};

export default TutorCard;