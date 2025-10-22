import React, { useEffect, useState } from 'react'
import { supabase } from '../../context/AuthContext'
import { getPlaceholderAvatar } from '../../utils/placeholder'

// SECURITY NOTE: The security of file uploads depends on Supabase Storage Policies.
// Ensure your 'avatars' bucket has policies that restrict uploads to authenticated users,
// control file types, and enforce size limits.
// Example Policy (allow users to upload to their own folder):
// CREATE POLICY "Allow users to upload to their own folder"
// ON storage.objects FOR INSERT
// WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

interface AvatarProps {
  url: string | null
  size: number
  userId: string | null
  onUpload: (filePath: string) => void
}

const Avatar: React.FC<AvatarProps> = ({ url, size, userId, onUpload }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (url) downloadImage(url)
  }, [url])

  const downloadImage = async (path: string) => {
    try {
      if (!supabase) return;
      const { data, error } = await supabase.storage.from('avatars').download(path)
      if (error) {
        throw error
      }
      const newUrl = URL.createObjectURL(data)
      setAvatarUrl(newUrl)
    } catch (error) {
      console.log('Error downloading image: ', error)
    }
  }

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      if (!supabase) throw new Error("Supabase client not available");
      if (!userId) throw new Error("User not authenticated for upload");

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      
      // Client-side validation for file type and size
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a JPG, PNG, or WEBP image.');
      }
      const maxSizeInMB = 5;
      if (file.size > maxSizeInMB * 1024 * 1024) {
        throw new Error(`File is too large. Maximum size is ${maxSizeInMB}MB.`);
      }

      // Create a more secure and organized file path
      const filePath = `${userId}/${Date.now()}.${fileExt}`

      let { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      onUpload(filePath)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <img
        src={avatarUrl || getPlaceholderAvatar(name || 'User', size)}
        alt="Avatar"
        className="rounded-full object-cover shadow-lg"
        style={{ height: size, width: size }}
      />
      <div className="mt-4">
        <label className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer transition-colors" htmlFor="single">
          {uploading ? 'Uploading ...' : 'Upload Avatar'}
        </label>
        <input
          style={{
            visibility: 'hidden',
            position: 'absolute',
          }}
          type="file"
          id="single"
          accept="image/png, image/jpeg, image/webp"
          onChange={uploadAvatar}
          disabled={uploading}
        />
      </div>
    </div>
  )
}

export default Avatar;