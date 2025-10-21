import React from 'react';
import { Link } from 'react-router-dom';
import { Student } from '../../types';
import OptimizedImage from './OptimizedImage';

interface StudentCardProps {
  student: Student;
}

const StudentCard: React.FC<StudentCardProps> = ({ student }) => {
  return (
    <article className="relative rounded-2xl border border-white/15 dark:border-white/10 bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.25)] overflow-hidden transform transition-all duration-300 will-change-transform hover:-translate-y-1 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
      <div className="relative">
        <OptimizedImage 
          className="h-48 w-full" 
          src={student.image_url} 
          alt={`Profile photo of ${student.name}`}
          loading="lazy"
          width={300}
          height={192}
        />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{student.name}</h3>
        <p className="text-sm text-gray-700/80 dark:text-gray-300/90 mb-2" aria-label={`Location: ${student.location}`}>
          📍 {student.location}
        </p>
        <p className="text-sm text-gray-700/90 dark:text-gray-200 mb-4 font-medium">
          Level: <span className="font-semibold text-blue-600 dark:text-blue-400">{student.level}</span>
        </p>
        <div className="mb-5">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Learning Goals:</h4>
          <div className="flex flex-wrap gap-2">
            {student.learning_goals.map((goal) => (
              <span 
                key={goal} 
                className="px-2.5 py-1 bg-white/50 dark:bg-white/10 text-emerald-900 dark:text-emerald-200 text-xs font-semibold rounded-full border border-white/20 dark:border-white/10 backdrop-blur"
                role="listitem"
              >
                {goal}
              </span>
            ))}
          </div>
        </div>
        <Link 
          to={`/feed/messages?peer=${encodeURIComponent('s:' + String(student.id))}&name=${encodeURIComponent(student.name)}`} 
          className="block w-full text-center bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-blue-500/30 active:translate-y-0 active:shadow-sm text-sm font-medium"
          aria-label={`Connect with ${student.name}`}
        >
          Connect
        </Link>
      </div>
    </article>
  );
};

export default StudentCard;