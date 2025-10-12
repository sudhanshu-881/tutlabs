import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, supabase } from '../context/AuthContext';
import Avatar from '../components/ui/Avatar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useGeolocation } from '../hooks/useGeolocation';
import { reverseGeocode } from '../utils/geocoding';
import toast from 'react-hot-toast';

// SECURITY NOTE: The security of this page depends on Supabase Row Level Security (RLS).
// Ensure that you have an RLS policy on the `profiles` table that only allows users to update their own profile.
// Example Policy:
// CREATE POLICY "Users can update their own profile"
// ON public.profiles
// FOR UPDATE
// USING (auth.uid() = id)
// WITH CHECK (auth.uid() = id);

const EditProfile: React.FC = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fullName, setFullName] = useState('');
    const [education, setEducation] = useState('');
    const [experience, setExperience] = useState('');
    const [location, setLocation] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [availability, setAvailability] = useState('');
    const [bio, setBio] = useState('');
    // Role-specific fields
    const [tutorSubjectsInput, setTutorSubjectsInput] = useState<string>('');
    const [studentGoalsInput, setStudentGoalsInput] = useState<string>('');
    const [pincodesInput, setPincodesInput] = useState<string>('');
    const [locationError, setLocationError] = useState<string | null>(null);
    
    const { coords, error: geoError, isLoading: isLocating, requestLocation } = useGeolocation();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const getProfile = async () => {
            try {
                setLoading(true);
                if (!supabase) throw new Error("Supabase client not available");

                let { data, error } = await supabase
                    .from('profiles')
                    .select(`full_name, education, experience, location, avatar_url`)
                    .eq('id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') { // Ignore "no rows found" error
                    throw error;
                }

                if (data) {
                    setFullName(data.full_name || '');
                    setEducation(data.education || '');
                    setExperience(data.experience || '');
                    setLocation(data.location || '');
                    setAvatarUrl(data.avatar_url);
                    // optional fields from profiles if present
                }

                // Try to fetch role-specific listing details if schema supports it
                if (user?.active_role === 'tutor') {
                    try {
                        const { data: tutorRow } = await supabase
                          .from('tutors')
                          .select('subjects, location, pincodes, availability, bio')
                          .eq('user_id', user.id)
                          .single();
                        if (tutorRow) {
                            setTutorSubjectsInput(Array.isArray(tutorRow.subjects) ? tutorRow.subjects.join(', ') : '');
                            if (tutorRow.location) setLocation(tutorRow.location);
                            if (Array.isArray(tutorRow.pincodes)) setPincodesInput(tutorRow.pincodes.join(', '));
                            setAvailability(tutorRow.availability || '');
                            setBio(tutorRow.bio || '');
                        }
                    } catch (e) {
                        // Swallow if column does not exist or row not found
                    }
                } else if (user?.active_role === 'student') {
                    try {
                        const { data: studentRow } = await supabase
                          .from('students')
                          .select('learning_goals, location')
                          .eq('user_id', user.id)
                          .single();
                        if (studentRow) {
                            setStudentGoalsInput(Array.isArray(studentRow.learning_goals) ? studentRow.learning_goals.join(', ') : '');
                            if (studentRow.location) setLocation(studentRow.location);
                        }
                    } catch (e) {
                        // Swallow if column does not exist or row not found
                    }
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to load your profile');
            } finally {
                setLoading(false);
            }
        };
        getProfile();
    }, [user, navigate]);

    // Effect to handle geolocation result
    useEffect(() => {
        setLocationError(null);
        if (coords) {
            reverseGeocode(coords.latitude, coords.longitude)
            .then(locationName => {
                setLocation(locationName);
            })
            .catch(err => {
                setLocationError(err.message);
            });
        }
        if (geoError) {
            setLocationError(geoError.message);
        }
    }, [coords, geoError]);


    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            if (!user || !supabase) throw new Error("User or Supabase client not available");

            // 1. Update user metadata in auth.users to keep name in sync
            const { error: userError } = await supabase.auth.updateUser({
                data: { full_name: fullName }
            });
            if (userError) throw userError;
            
            // 2. Upsert profile data in profiles table
            const updates = {
                id: user.id,
                full_name: fullName,
                education,
                experience,
                location,
                avatar_url: avatarUrl,
                updated_at: new Date(),
            };
            let { error } = await supabase.from('profiles').upsert(updates);
            if (error) throw error;

            // 3. Upsert role-specific listing details into tutors/students tables if available
            if (user.active_role === 'tutor') {
                const subjects: string[] = tutorSubjectsInput
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean);
                const pincodes: string[] = pincodesInput
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean);
                try {
                    // Try find existing row by user_id
                    const { data: existing } = await supabase
                      .from('tutors')
                      .select('id')
                      .eq('user_id', user.id)
                      .single();
                    if (existing?.id) {
                        const { error: updErr } = await supabase
                          .from('tutors')
                          .update({ name: fullName, subjects, location, pincodes, availability, bio, image_url: avatarUrl || null })
                          .eq('id', existing.id);
                        if (updErr) throw updErr;
                    } else {
                        const { error: insErr } = await supabase
                          .from('tutors')
                          .insert({ user_id: user.id, name: fullName, subjects, location, pincodes, availability, bio, image_url: avatarUrl || null, rating: 0, verified: false });
                        if (insErr) throw insErr;
                    }
                } catch (e: any) {
                    // Likely schema missing user_id; inform user non-blocking
                    console.warn('Tutor listing sync skipped:', e?.message);
                }
            } else if (user.active_role === 'student') {
                const learningGoals: string[] = studentGoalsInput
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean);
                try {
                    const { data: existing } = await supabase
                      .from('students')
                      .select('id')
                      .eq('user_id', user.id)
                      .single();
                    if (existing?.id) {
                        const { error: updErr } = await supabase
                          .from('students')
                          .update({ name: fullName, learning_goals: learningGoals, location, image_url: avatarUrl || null })
                          .eq('id', existing.id);
                        if (updErr) throw updErr;
                    } else {
                        const { error: insErr } = await supabase
                          .from('students')
                          .insert({ user_id: user.id, name: fullName, learning_goals: learningGoals, location, image_url: avatarUrl || null, level: '' });
                        if (insErr) throw insErr;
                    }
                } catch (e: any) {
                    console.warn('Student listing sync skipped:', e?.message);
                }
            }
            
            toast.success('Profile updated successfully');
            navigate('/profile');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };
    
    const handleGetCurrentLocation = () => {
      setLocationError(null);
      requestLocation();
    };

    if (loading) return <LoadingSpinner />;
    
    const inputClasses = "mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 sm:text-sm dark:bg-gray-700 dark:text-white transition-shadow";

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Edit Profile</h1>
            <div className="bg-white dark:bg-gray-800/50 shadow-md rounded-lg p-8">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <Avatar
                        url={avatarUrl}
                        size={150}
                        userId={user?.id || null}
                        onUpload={(url) => {
                            setAvatarUrl(url);
                        }}
                    />
                    
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input type="text" id="email" value={user?.email} disabled className="mt-1 block w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 sm:text-sm text-gray-500 dark:text-gray-400" />
                    </div>

                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                        <input type="text" id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} className={inputClasses} required maxLength={100} />
                    </div>

                     <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location / Locality</label>
                         <div className="mt-1 flex rounded-md shadow-sm">
                            <input type="text" id="location" placeholder="e.g., San Francisco, CA" value={location} onChange={e => setLocation(e.target.value)} className="flex-1 block w-full min-w-0 rounded-none rounded-l-md border-gray-300 dark:border-gray-600 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 sm:text-sm dark:bg-gray-700 dark:text-white transition-shadow" required maxLength={100} />
                            <button type="button" onClick={handleGetCurrentLocation} disabled={isLocating} className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-wait">
                                {isLocating ? '...' : '📍'} Use Current Location
                            </button>
                         </div>
                         <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Your location is required to connect with others.</p>
                         {locationError && <p className="mt-2 text-sm text-red-500">{locationError}</p>}
                    </div>

                    <div>
                        <label htmlFor="education" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Education</label>
                        <input type="text" id="education" placeholder="e.g., B.S. in Computer Science from Stanford" value={education} onChange={e => setEducation(e.target.value)} className={inputClasses} maxLength={200} />
                    </div>

                    <div>
                        <label htmlFor="experience" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Experience</label>
                        <textarea id="experience" rows={4} placeholder="Describe your tutoring or professional experience..." value={experience} onChange={e => setExperience(e.target.value)} className={inputClasses} maxLength={5000}></textarea>
                    </div>

                    {user?.active_role === 'tutor' && (
                        <div>
                          <label htmlFor="tutor-subjects" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subjects you teach (comma separated)</label>
                          <input id="tutor-subjects" type="text" value={tutorSubjectsInput} onChange={(e) => setTutorSubjectsInput(e.target.value)} className={inputClasses} placeholder="e.g., Math, Physics, Chemistry" />
                        </div>
                    )}

                    {user?.active_role === 'student' && (
                        <div>
                          <label htmlFor="student-goals" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Learning goals (comma separated)</label>
                          <input id="student-goals" type="text" value={studentGoalsInput} onChange={(e) => setStudentGoalsInput(e.target.value)} className={inputClasses} placeholder="e.g., Calculus I, Essay Writing" />
                        </div>
                    )}

                    {user?.active_role === 'tutor' && (
                        <>
                          <div>
                            <label htmlFor="pincodes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preferred Pincodes (comma separated)</label>
                            <input id="pincodes" type="text" value={pincodesInput} onChange={(e) => setPincodesInput(e.target.value)} className={inputClasses} placeholder="e.g., 560001, 560002" />
                          </div>
                          <div>
                            <label htmlFor="availability" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Availability (optional)</label>
                            <input id="availability" type="text" value={availability} onChange={(e) => setAvailability(e.target.value)} className={inputClasses} placeholder="e.g., Weekdays 6-9 PM" />
                          </div>
                          <div>
                            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio/About (optional)</label>
                            <textarea id="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} className={inputClasses} placeholder="Tell prospective students about your teaching style and results." />
                          </div>
                        </>
                    )}

                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={() => navigate('/profile')} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-6 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 active:translate-y-0 active:shadow-md" disabled={saving || (user?.active_role==='tutor' && (!tutorSubjectsInput.trim() || !pincodesInput.trim() || !location.trim()))}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfile;