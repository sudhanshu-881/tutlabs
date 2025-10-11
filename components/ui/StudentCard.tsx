import React from 'react';
import { Student } from '../../types';

interface StudentCardProps {
  student: Student;
}

const StudentCard: React.FC<StudentCardProps> = ({ student }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
      <img className="h-48 w-full object-cover" src={student.image_url} alt={student.name} />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{student.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{student.location}</p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 font-medium">Level: {student.level}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {student.learning_goals.map((goal) => (
            <span key={goal} className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs font-semibold rounded-full">
              {goal}
            </span>
          ))}
        </div>
         <button className="mt-4 w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm text-sm font-medium">
          Connect
        </button>
      </div>
    </div>
  );
};

export default StudentCard;