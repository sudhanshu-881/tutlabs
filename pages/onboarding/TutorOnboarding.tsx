import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, supabase } from '../../context/AuthContext';
import { useGeolocation } from '../../hooks/useGeolocation';
import { reverseGeocode } from '../../utils/geocoding';
import toast from 'react-hot-toast';

const inputClasses = "mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 sm:text-sm dark:bg-gray-700 dark:text-white transition-shadow";

const TutorOnboarding: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [subjects, setSubjects] = useState('');
  const [location, setLocation] = useState('');
  const [pincodes, setPincodes] = useState('');
  const [availability, setAvailability] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { coords, isLoading: isLocating, error: geoError, requestLocation } = useGeolocation();

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    const load = async () => {
      try {
        if (!supabase) throw new Error('Database unavailable');
        // Prefill from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, location')
          .eq('id', user.id)
          .single();
        setFullName(profile?.full_name || user.name || '');
        setLocation(profile?.location || '');
        // If a tutor listing already exists, skip onboarding
        const { data: tutorRow } = await supabase
          .from('tutors')
          .select('id')
          .eq('user_id', user.id)
          .single();
        if (tutorRow?.id) {
          navigate('/feed/tutor', { replace: true });
          return;
        }
      } catch {}
      finally {
        setLoading(false);
      }
    };
    load();
  }, [user, navigate]);

  useEffect(() => {
    if (coords) {
      reverseGeocode(coords.latitude, coords.longitude)
        .then(name => setLocation(name))
        .catch(() => {});
    }
  }, [coords]);

  const handleUseLocation = () => {
    requestLocation();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase) { toast.error('Auth unavailable.'); return; }
    if (!subjects.trim() || !location.trim() || !pincodes.trim()) {
      toast.error('Please fill all required fields.');
      return;
    }
    setSaving(true);
    try {
      const subjectsArr = subjects.split(',').map(s => s.trim()).filter(Boolean);
      const pincodesArr = pincodes.split(',').map(s => s.trim()).filter(Boolean);
      // Ensure profile has latest full name and location
      await supabase.from('profiles').upsert({ id: user.id, full_name: fullName, location, updated_at: new Date() });
      const { error } = await supabase.from('tutors').insert({
        user_id: user.id,
        name: fullName,
        subjects: subjectsArr,
        location,
        pincodes: pincodesArr,
        availability: availability || null,
        bio: bio || null,
        rating: 0,
        verified: false,
        image_url: null,
      });
      if (error) throw error;
      toast.success('Welcome! Your tutor profile is created.');
      navigate('/feed/tutor', { replace: true });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Set up your Tutor Profile</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Complete these details to appear in student searches near your location.</p>
      <form onSubmit={handleSubmit} className="space-y-5 bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name <span className="text-red-500">*</span></label>
          <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className={inputClasses} required maxLength={100} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subjects (comma separated) <span className="text-red-500">*</span></label>
          <input type="text" value={subjects} onChange={e => setSubjects(e.target.value)} className={inputClasses} required placeholder="e.g., Math, Physics" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location <span className="text-red-500">*</span></label>
          <div className="mt-1 flex">
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="flex-1 block w-full min-w-0 rounded-l-md border border-gray-300 dark:border-gray-600 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 sm:text-sm dark:bg-gray-700 dark:text-white" required />
            <button type="button" onClick={handleUseLocation} disabled={isLocating} className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50">{isLocating ? '...' : '📍'}</button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pincodes (comma separated) <span className="text-red-500">*</span></label>
          <input type="text" value={pincodes} onChange={e => setPincodes(e.target.value)} className={inputClasses} required placeholder="e.g., 560001, 560002" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Availability (optional)</label>
          <input type="text" value={availability} onChange={e => setAvailability(e.target.value)} className={inputClasses} placeholder="e.g., Weekdays 6–9 PM" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio (optional)</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className={inputClasses} placeholder="Tell students about your expertise and approach." />
        </div>
        {geoError && <p className="text-sm text-red-500">{geoError.message}</p>}
        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving…' : 'Save & Continue'}</button>
        </div>
      </form>
    </div>
  );
};

export default TutorOnboarding;
