import React from 'react';
import React, { useContext } from 'react';
import StudentsNearMe from '../StudentsNearMe';
import { useEffect, useState } from 'react';
import { listTuitionRequests, TuitionRequest } from '../../lib/services/requestsService';
import RequestCard from './components/RequestCard';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const TutorsFeed: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState<TuitionRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const pincodes = [] as string[];
        // In a full implementation, fetch tutor pincodes from 'tutors' by user_id
        const data = await listTuitionRequests({ pincodes });
        setRequests(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load tuition requests.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white drop-shadow-[0_2px_10px_rgba(59,130,246,0.35)]">Your Tutor Feed</h1>
        <p className="mt-2 text-lg text-white/90">Browse students near you who need your expertise{user?.name ? `, ${user.name}` : ''}.</p>
        {/* Top tabs removed; bottom TabBar provides navigation */}
      </div>
      {loading ? (
        <div className="text-white/90">Loading tuition requests…</div>
      ) : error ? (
        <div className="text-red-200 bg-red-900/40 p-4 rounded-lg">{error}</div>
      ) : requests.length === 0 ? (
        <div className="text-white/90">No tuition requests found. Check back later.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map((req) => (
            <RequestCard key={req.id} req={req} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TutorsFeed;
