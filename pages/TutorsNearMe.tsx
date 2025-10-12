import React, { useState, useEffect, useCallback } from 'react';
import { Tutor } from '../types';
import TutorCard from '../components/ui/TutorCard';
import { listTutors } from '../lib/services/tutorService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import CardSkeleton from '../components/ui/CardSkeleton';
import toast from 'react-hot-toast';
import { useGeolocation } from '../hooks/useGeolocation';
import { reverseGeocode } from '../utils/geocoding';

// SECURITY NOTE: The security of this page depends on Supabase Row Level Security (RLS).
// Ensure that you have an RLS policy on the `tutors` table that allows public read access.
// Example Policy:
// CREATE POLICY "Allow public read access to tutors"
// ON public.tutors
// FOR SELECT
// USING (true);

const TutorsNearMe: React.FC = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subjectQuery, setSubjectQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [pincodeQuery, setPincodeQuery] = useState('');
  const { coords, error: geoError, isLoading: isLocating, requestLocation } = useGeolocation();

  const fetchTutors = useCallback(async (subject: string, location: string, pincode: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await listTutors({ subject, location, pincode });
      setTutors(data);
    } catch (err: any) {
      const message = 'Failed to fetch tutors. Please make sure you have created a "tutors" table in your Supabase project as per the documentation.';
      setError(message);
      toast.error(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTutors('', '', '');
  }, [fetchTutors]);
  
  // Effect to handle geolocation result
  useEffect(() => {
    if (coords) {
      reverseGeocode(coords.latitude, coords.longitude)
        .then(locationName => {
          setLocationQuery(locationName);
          fetchTutors(subjectQuery, locationName, pincodeQuery); // Auto-search with new location
        })
        .catch(err => {
          setError(err.message);
        });
    }
    if (geoError) {
      setError(geoError.message);
    }
  }, [coords, geoError, subjectQuery, fetchTutors]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTutors(subjectQuery, locationQuery, pincodeQuery);
  };
  
  const handleClear = () => {
    setSubjectQuery('');
    setLocationQuery('');
    setPincodeQuery('');
    fetchTutors('', '', '');
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

    if (tutors.length === 0) {
      return <div className="text-center py-10 text-gray-600 dark:text-gray-400">No tutors found matching your criteria.</div>;
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
        <h1 className="text-3xl font-bold text-white drop-shadow-[0_2px_10px_rgba(59,130,246,0.35)]">Find Tutors Near You</h1>
        <p className="mt-2 text-lg text-white/90">Browse our list of verified and experienced tutors.</p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 p-4 bg-white/80 dark:bg-gray-900/60 backdrop-blur rounded-lg">
        <input 
          type="text" 
          placeholder="Search by subject (e.g., Math)" 
          value={subjectQuery}
          onChange={(e) => setSubjectQuery(e.target.value)}
          className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
        />
        <input 
          type="text" 
          placeholder="Pincode (e.g., 560001)" 
          value={pincodeQuery}
          onChange={(e) => setPincodeQuery(e.target.value)}
          className="w-full md:w-40 p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
        />
        <div className="relative flex-grow">
          <input 
            type="text" 
            placeholder="Location (e.g., New York)" 
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            className="w-full p-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
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
        <button type="submit" className="bg-pink-600 text-white px-6 py-2 rounded-md hover:bg-pink-700 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/30 active:translate-y-0 active:shadow-md">Search</button>
        <button type="button" onClick={handleClear} className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-md">Clear</button>
      </form>

      {renderContent()}
    </div>
  );
};

export default TutorsNearMe;