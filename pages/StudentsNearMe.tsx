import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Student } from '../types';
import StudentCard from '../components/ui/StudentCard';
import { listStudents } from '../lib/services/studentService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import CardSkeleton from '../components/ui/CardSkeleton';
import toast from 'react-hot-toast';
import { useGeolocation } from '../hooks/useGeolocation';
import { reverseGeocode } from '../utils/geocoding';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

// SECURITY NOTE: The security of this page depends on Supabase Row Level Security (RLS).
// Ensure that you have an RLS policy on the `students` table that allows public read access.
// Example Policy:
// CREATE POLICY "Allow public read access to students"
// ON public.students
// FOR SELECT
// USING (true);

const StudentsNearMe: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const { coords, error: geoError, isLoading: isLocating, requestLocation } = useGeolocation();

  const fetchStudents = useCallback(async (subject: string, location: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await listStudents({ subject, location });
      setStudents(data);
    } catch (err: any) {
      const message = 'Failed to fetch students. Please make sure you have created a "students" table in your Supabase project as per the documentation.';
      setError(message);
      toast.error(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Use saved preferred location if available
    let initialLocation = '';
    try { initialLocation = localStorage.getItem('PREFERRED_LOCATION_NAME') || ''; } catch {}
    fetchStudents('', initialLocation);
  }, [fetchStudents]);
  
  // Effect to handle geolocation result
  useEffect(() => {
    if (coords) {
      reverseGeocode(coords.latitude, coords.longitude)
        .then(locationName => {
          setLocationQuery(locationName);
          try { localStorage.setItem('PREFERRED_LOCATION_NAME', locationName); } catch {}
          fetchStudents(keyword, locationName); // Auto-search with new location
        })
        .catch(err => {
          setError(err.message);
        });
    }
    if (geoError) {
      setError(geoError.message);
    }
  }, [coords, geoError, keyword, fetchStudents]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents(keyword, locationQuery);
  };

  const handleClear = () => {
    setKeyword('');
    setLocationQuery('');
    let initialLocation = '';
    try { initialLocation = localStorage.getItem('PREFERRED_LOCATION_NAME') || ''; } catch {}
    fetchStudents('', initialLocation);
  };

  const handleFindNearMe = () => {
    setError(null);
    requestLocation();
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      );
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

  // If a logged-in student/parent reaches here, redirect to their student feed
  if (user?.active_role === 'student') {
    return <Navigate to="/feed/student" replace />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white drop-shadow-[0_2px_10px_rgba(59,130,246,0.35)]">Find Students Near You</h1>
        <p className="mt-2 text-lg text-white/90">Connect with students who need your expertise.</p>
      </div>

      <form onSubmit={handleSearch} className="space-y-3">
        <div className="flex items-center gap-2 p-3 bg-white/80 dark:bg-gray-900/60 backdrop-blur rounded-lg border border-white/20 dark:border-white/10">
          <ion-icon name="search" class="text-xl text-gray-600 dark:text-gray-300" />
          <input
            type="text"
            placeholder="Search students by subject, class, board, or location"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-grow bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <button type="submit" className="px-4 py-2 rounded-md bg-pink-600 text-white hover:bg-pink-700 transition">Search</button>
          <button type="button" onClick={() => setFiltersOpen(!filtersOpen)} className="px-3 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">Filters</button>
        </div>
        {filtersOpen && (
          <div className="flex flex-wrap items-center gap-3 p-3 bg-white/70 dark:bg-gray-900/50 rounded-lg border border-white/20 dark:border-white/10">
            <div className="relative">
              <input
                type="text"
                placeholder="Location"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="w-60 p-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
              />
              <button
                type="button"
                onClick={handleFindNearMe}
                disabled={isLocating}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-wait"
                aria-label="Find near me"
              >
                {isLocating ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div> : <ion-icon name="locate-outline" className="text-xl" />}
              </button>
            </div>
            <button type="button" onClick={handleClear} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600">Clear</button>
          </div>
        )}
      </form>

      {renderContent()}
    </div>
  );
};

export default StudentsNearMe;