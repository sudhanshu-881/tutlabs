import React, { useCallback, useEffect, useState } from 'react';
import { listTutors } from '../../lib/services/tutorService';
import type { Tutor } from '../../types';
import CardSkeleton from '../../components/ui/CardSkeleton';
import TutorCard from '../../components/ui/TutorCard';
import toast from 'react-hot-toast';
import { useGeolocation } from '../../hooks/useGeolocation';
import { reverseGeocode } from '../../utils/geocoding';

const StudentsFeed: React.FC = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const { coords, isLoading: isLocating, error: geoError, requestLocation } = useGeolocation();

  const fetchByLocation = useCallback(async (loc: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await listTutors({ location: loc });
      setTutors(data);
    } catch (e: any) {
      const msg = e?.message || 'Failed to load tutors for your location.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load saved location or request it once
  useEffect(() => {
    try {
      const saved = localStorage.getItem('PREFERRED_LOCATION_NAME');
      if (saved) {
        setLocationName(saved);
        fetchByLocation(saved);
        return;
      }
    } catch {}
    requestLocation();
  }, [fetchByLocation, requestLocation]);

  // When geolocation arrives, reverse geocode and store
  useEffect(() => {
    if (!coords) return;
    reverseGeocode(coords.latitude, coords.longitude)
      .then((name) => {
        try {
          localStorage.setItem('PREFERRED_LOCATION_NAME', name);
          localStorage.setItem('PREFERRED_LOCATION_TS', String(Date.now()));
        } catch {}
        setLocationName(name);
        fetchByLocation(name);
      })
      .catch((e) => {
        setError(e?.message || 'Could not determine your location name.');
      });
  }, [coords, fetchByLocation]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white drop-shadow-[0_2px_10px_rgba(59,130,246,0.35)]">Your Student Feed</h1>
        <p className="mt-2 text-lg text-white/90">
          {locationName ? `Tutors near ${locationName}` : 'Discover verified tutors tailored to your goals.'}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-red-200 bg-red-900/40 p-4 rounded-lg">{error}</div>
      ) : tutors.length === 0 ? (
        <div className="text-white/90">No tutors found near {locationName || 'your area'}.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {tutors.map((t) => (
            <TutorCard key={t.id} tutor={t} />
          ))}
        </div>
      )}

      {!locationName && (
        <div className="text-white/80 text-sm">
          {geoError ? (
            <span>We could not get your location: {geoError.message}</span>
          ) : isLocating ? (
            <span>Determining your location…</span>
          ) : (
            <button onClick={requestLocation} className="underline underline-offset-4">Use my current location</button>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentsFeed;
