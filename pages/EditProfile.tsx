import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, supabase } from '../context/AuthContext';
import Avatar from '../components/ui/Avatar';
import LoadingSpinner from '../components/ui/LoadingSpinner';

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
                }
            } catch (error: any) {
                alert(error.message);
            } finally {
                setLoading(false);
            }
        };
        getProfile();
    }, [user, navigate]);

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
            
            alert('Profile updated successfully!');
            navigate('/profile');
        } catch (error: any) {
            alert(error.message);
        } finally {
            setSaving(false);
        }
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
                        <input type="text" id="location" placeholder="e.g., San Francisco, CA" value={location} onChange={e => setLocation(e.target.value)} className={inputClasses} maxLength={100} />
                    </div>

                    <div>
                        <label htmlFor="education" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Education</label>
                        <input type="text" id="education" placeholder="e.g., B.S. in Computer Science from Stanford" value={education} onChange={e => setEducation(e.target.value)} className={inputClasses} maxLength={200} />
                    </div>

                    <div>
                        <label htmlFor="experience" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Experience</label>
                        <textarea id="experience" rows={4} placeholder="Describe your tutoring or professional experience..." value={experience} onChange={e => setExperience(e.target.value)} className={inputClasses} maxLength={5000}></textarea>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={() => navigate('/profile')} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-6 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 active:translate-y-0 active:shadow-md" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfile;