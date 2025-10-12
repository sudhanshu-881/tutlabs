import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext, supabase } from '../context/AuthContext';
import { Profile } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
    const { user } = useContext(AuthContext);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchProfile = async () => {
            try {
                if (!supabase) throw new Error("Supabase client not available");
                setLoading(true);

                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
                    throw error;
                }
                
                if (data) {
                    setProfile(data);
                    if (data.avatar_url) {
                        const { data: imageData, error: imageError } = await supabase.storage.from('avatars').download(data.avatar_url);
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
    }, [user, navigate]);
    
    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-center text-red-500 bg-red-100 dark:bg-red-900/50 p-4 rounded-md">{error}</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800/50 shadow-md rounded-lg p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                    <img 
                        src={avatarUrl || 'https://via.placeholder.com/150'} 
                        alt="Profile" 
                        className="w-32 h-32 rounded-full object-cover shadow-lg"
                    />
                    <div className="flex-grow text-center md:text-left">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{profile?.full_name || user?.name}</h1>
                        <p className="text-md text-gray-500 dark:text-gray-400 mt-1">{user?.email}</p>
                        <Link 
                            to="/profile/edit"
                            className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 active:translate-y-0 active:shadow-md"
                        >
                            Edit Profile
                        </Link>
                    </div>
                </div>
                <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Profile Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-medium text-gray-500 dark:text-gray-400">Location</h3>
                            <p className="text-gray-800 dark:text-gray-200">{profile?.location || 'Not specified'}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-500 dark:text-gray-400">Education</h3>
                            <p className="text-gray-800 dark:text-gray-200">{profile?.education || 'Not specified'}</p>
                        </div>
                        <div className="md:col-span-2">
                            <h3 className="font-medium text-gray-500 dark:text-gray-400">Experience</h3>
                            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{profile?.experience || 'Not specified'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
