import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import StudentCard from '../components/ui/StudentCard';
import { supabase } from '../context/AuthContext';

const StudentsNearMe: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!supabase) {
        setError("Database connection is not available. Please configure your Supabase credentials.");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('students')
          .select('*');

        if (error) {
          throw new Error(error.message);
        }

        setStudents(data || []);
      } catch (err: any) {
        setError('Failed to fetch students. Please make sure you have created a "students" table in your Supabase project as per the documentation.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);
  
  const renderContent = () => {
    if (loading) {
      return <div className="text-center py-10 text-gray-600 dark:text-gray-400">Loading students...</div>;
    }

    if (error) {
      return <div className="text-center py-10 text-red-500 bg-red-100 dark:bg-red-900/50 p-4 rounded-md">{error}</div>;
    }

    if (students.length === 0) {
      return <div className="text-center py-10 text-gray-600 dark:text-gray-400">No students found.</div>;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {students.map((student) => (
          <StudentCard key={student.id} student={student} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Find Students Near You</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Connect with students who need your expertise.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <input type="text" placeholder="Subject you teach (e.g., Physics)" className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"/>
        <input type="text" placeholder="Your Location" className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"/>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">Search</button>
      </div>

      {renderContent()}
    </div>
  );
};

export default StudentsNearMe;