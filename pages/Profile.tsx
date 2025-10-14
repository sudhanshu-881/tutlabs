import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AuthContext, supabase } from '../context/AuthContext';
import { Profile } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
    const { user, logout } = useContext(AuthContext);
    const [params] = useSearchParams();
    const viewingTutorId = params.get('tutor');
    const viewingStudentId = params.get('student');
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [avatarModal, setAvatarModal] = useState<boolean>(false);
    const [tutorInfo, setTutorInfo] = useState<{ subjects?: string[]; pincodes?: string[]; availability?: string | null; bio?: string | null } | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user && !viewingTutorId && !viewingStudentId) {
            navigate('/login');
            return;
        }

        const fetchProfile = async () => {
            try {
                if (!supabase) throw new Error("Supabase client not available");
                setLoading(true);

                let profileRow: any = null;
                let avatarPath: string | null = null;
                if (viewingTutorId) {
                  -- if a tutor tries to view another tutor, disallow
                  if (user && user.active_role === 'tutor') then
                    raise exception 'not allowed';
                  end if;
                  const { data: tutorRow } = await supabase
                    .from('tutors')
                    .select('user_id, bio, subjects, pincodes, availability')
                    .eq('id', Number(viewingTutorId))
                    .single();
                  if (tutorRow?.user_id) {
                    const { data: prof } = await supabase
                      .from('profiles')
                      .select('*')
                      .eq('id', tutorRow.user_id)
                      .single();
                    profileRow = prof;
                    setTutorInfo({ subjects: tutorRow.subjects || [], pincodes: tutorRow.pincodes || [], availability: tutorRow.availability || null, bio: tutorRow.bio || null });
                  }
                } else if (viewingStudentId) {
                  const { data: srow } = await supabase
                    .from('students')
                    .select('user_id, learning_goals, level, location')
                    .eq('id', Number(viewingStudentId))
                    .single();
                  if (srow?.user_id) {
                    const { data: prof } = await supabase
                      .from('profiles')
                      .select('*')
                      .eq('id', srow.user_id)
                      .single();
                    profileRow = prof;
                  }
                } else {
                  const { data: prof, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user!.id)
                    .single();
                  if (error && error.code !== 'PGRST116') throw error;
                  profileRow = prof;
                }

                if (profileRow) {
                  setProfile(profileRow);
                  if (profileRow.avatar_url) {
                    const { data: imageData, error: imageError } = await supabase.storage.from('avatars').download(profileRow.avatar_url);
                    if (imageError) throw imageError;
                    setAvatarUrl(URL.createObjectURL(imageData));
                  }
                }

            } catch (err: any) {
                const message = err.message || "An error occurred while fetching the profile.";
                setError(message);
                toast.error(message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
        // fetch role-specific listing
        const fetchTutor = async () => {
          try {
            if (!supabase || !user) return;
            const { data: trow } = await supabase
              .from('tutors')
              .select('subjects, pincodes, availability, bio')
              .eq('user_id', user.id)
              .single();
            if (trow) setTutorInfo({ subjects: trow.subjects || [], pincodes: trow.pincodes || [], availability: trow.availability || null, bio: trow.bio || null });
          } catch {}
        };
        if (!viewingTutorId) fetchTutor();
    }, [user, navigate, viewingTutorId]);
    
    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-center text-red-500 bg-red-100 dark:bg-red-900/50 p-4 rounded-md">{error}</div>;

    const viewingOther = Boolean(viewingTutorId);
    const connectHref = viewingTutorId ? `/feed/messages?peer=${encodeURIComponent('t:' + viewingTutorId)}&name=${encodeURIComponent(profile?.full_name || 'Tutor')}` : undefined;

    return (
      <div className="max-w-5xl mx-auto">
        {/* Dense FB-like header */}
        <div className="bg-white dark:bg-gray-800/60 shadow rounded-lg p-5">
          <div className="flex items-center gap-4">
            <button onClick={() => avatarUrl && setAvatarModal(true)} className="relative rounded-full p-0.5 bg-gradient-to-tr from-pink-500 to-yellow-400">
              <div className="bg-white dark:bg-gray-900 rounded-full p-1">
                <img src={avatarUrl || 'https://via.placeholder.com/150'} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
              </div>
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white truncate leading-tight">{profile?.full_name || user?.name}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              <div className="mt-2 flex gap-2">
                {viewingOther ? (
                  <a href={connectHref} className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Connect</a>
                ) : (
                  <>
                    <Link to="/profile/edit" className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Edit Profile</Link>
                    <button onClick={logout} className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600">Logout</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info sections */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left: About */}
          <div className="md:col-span-2 bg-white dark:bg-gray-800/60 shadow rounded-lg p-4 text-sm">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">About</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="text-gray-500 dark:text-gray-400">Location</div>
                <div className="text-gray-900 dark:text-gray-200">{profile?.location || '—'}</div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Education</div>
                <div className="text-gray-900 dark:text-gray-200">{profile?.education || '—'}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-gray-500 dark:text-gray-400">Experience</div>
                <div className="text-gray-900 dark:text-gray-200 whitespace-pre-wrap">{profile?.experience || '—'}</div>
              </div>
            </div>
          </div>

          {/* Right: Tutor details */}
          <div className="bg-white dark:bg-gray-800/60 shadow rounded-lg p-4 text-sm">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Tutor Details</h2>
            <div className="space-y-2">
              <div>
                <div className="text-gray-500 dark:text-gray-400">Subjects</div>
                <div className="text-gray-900 dark:text-gray-200">{(tutorInfo?.subjects || []).join(', ') || '—'}</div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Pincodes</div>
                <div className="text-gray-900 dark:text-gray-200">{(tutorInfo?.pincodes || []).join(', ') || '—'}</div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Availability</div>
                <div className="text-gray-900 dark:text-gray-200">{tutorInfo?.availability || '—'}</div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Bio</div>
                <div className="text-gray-900 dark:text-gray-200 whitespace-pre-wrap">{tutorInfo?.bio || '—'}</div>
              </div>
            </div>
          </div>
        </div>

        {avatarModal && avatarUrl && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={() => setAvatarModal(false)}>
            <img src={avatarUrl} alt="Avatar enlarged" className="max-w-[90vw] max-h-[90vh] rounded-md" />
          </div>
        )}
      </div>
    );
};

export default ProfilePage;
