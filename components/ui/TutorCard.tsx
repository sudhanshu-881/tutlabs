import React from 'react';
import { Tutor } from '../../types';
import { StarIcon, VerifiedIcon } from './Icons';

interface TutorCardProps {
  tutor: Tutor;
}

const TutorCard: React.FC<TutorCardProps> = ({ tutor }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
      <img className="h-48 w-full object-cover" src={tutor.image_url} alt={tutor.name} />
      <div className="p-4">
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
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{tutor.location}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {tutor.subjects.map((subject) => (
            <span key={subject} className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-semibold rounded-full">
              {subject}
            </span>
          ))}
        </div>
        <button className="mt-4 w-full bg-emerald-500 text-white py-2 px-4 rounded-md hover:bg-emerald-600 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-emerald-500/30 active:translate-y-0 active:shadow-sm text-sm font-medium">
          View Profile
        </button>
      </div>
    </div>
  );
};

export default TutorCard;