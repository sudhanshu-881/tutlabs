import React, { useState, useEffect, useCallback } from 'react';
import { Student } from '../types';
import StudentCard from '../components/ui/StudentCard';
import { supabase } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// SECURITY NOTE: The security of this page depends on Supabase Row Level Security (RLS).
// Ensure that you have an RLS policy on the `students` table that allows public read access.
// Example Policy:
// CREATE POLICY "Allow public read access to students"
// ON public.students
// FOR SELECT
// USING (true);

const StudentsNearMe: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subjectQuery, setSubjectQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');

  const fetchStudents = useCallback(async (subject: string, location: string) => {
    if (!supabase) {
      setError("Database connection is not available. Please configure your Supabase credentials.");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      let query = supabase
        .from('students')
        .select('*');

      if (location) {
        query = query.ilike('location', `%${location}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      let finalData = data || [];

      if (subject) {
        finalData = finalData.filter(student =>
          (student.learning_goals || []).some(goal => goal.toLowerCase().includes(subject.toLowerCase()))
        );
      }

      setStudents(finalData);
    } catch (err: any) {
      setError('Failed to fetch students. Please make sure you have created a "students" table in your Supabase project as per the documentation.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents('', '');
  }, [fetchStudents]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents(subjectQuery, locationQuery);
  };

  const handleClear = () => {
    setSubjectQuery('');
    setLocationQuery('');
    fetchStudents('', '');
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingSpinner />;
    }

    if (error) {
      return <div className="text-center py-10 text-red-500 bg-red-100 dark:bg-red-900/50 p-4 rounded-md">{error}</div>;
    }

    if (students.length === 0) {
      return <div className="text-center py-10 text-gray-600 dark:text-gray-400">No students found matching your criteria.</div>;
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

      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <input 
          type="text" 
          placeholder="Subject you teach (e.g., Physics)"
          value={subjectQuery}
          onChange={(e) => setSubjectQuery(e.target.value)}
          className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
        />
        <input 
          type="text" 
          placeholder="Your Location" 
          value={locationQuery}
          onChange={(e) => setLocationQuery(e.target.value)}
          className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
        />
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30 active:translate-y-0 active:shadow-md">Search</button>
        <button type="button" onClick={handleClear} className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-md">Clear</button>
      </form>

      {renderContent()}
    </div>
  );
};

export default StudentsNearMe;