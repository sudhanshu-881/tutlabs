import React, { useState, useEffect } from 'react';
import { Tutor } from '../types';
import TutorCard from '../components/ui/TutorCard';
import { supabase } from '../context/AuthContext';

const TutorsNearMe: React.FC = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTutors = async () => {
      if (!supabase) {
        setError("Database connection is not available. Please configure your Supabase credentials.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('tutors')
          .select('*');

        if (error) {
          throw new Error(error.message);
        }

        setTutors(data || []);
      } catch (err: any) {
        setError('Failed to fetch tutors. Please make sure you have created a "tutors" table in your Supabase project as per the documentation.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, []);

  const renderContent = () => {
    if (loading) {
      return <div className="text-center py-10 text-gray-600 dark:text-gray-400">Loading tutors...</div>;
    }

    if (error) {
      return <div className="text-center py-10 text-red-500 bg-red-100 dark:bg-red-900/50 p-4 rounded-md">{error}</div>;
    }

    if (tutors.length === 0) {
      return <div className="text-center py-10 text-gray-600 dark:text-gray-400">No tutors found.</div>;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {tutors.map((tutor) => (
          <TutorCard key={tutor.id} tutor={tutor} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Find Tutors Near You</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Browse our list of verified and experienced tutors.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <input type="text" placeholder="Search by subject (e.g., Math)" className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"/>
        <input type="text" placeholder="Location (e.g., New York)" className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"/>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">Search</button>
      </div>

      {renderContent()}
    </div>
  );
};

export default TutorsNearMe;