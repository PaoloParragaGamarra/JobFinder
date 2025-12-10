import { useState, useCallback } from 'react';
import { avatarStorage, profiles } from '../services/storage.service';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_DIMENSIONS = 1024; // Max width/height in pixels

/**
 * Custom hook for managing user avatar/profile picture
 */
export function useAvatar(userId) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  // Validate file before upload
  const validateFile = useCallback((file) => {
    if (!file) {
      return { valid: false, error: 'No file selected' };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Invalid file type. Please upload a JPG, PNG, or WebP image.' 
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { 
        valid: false, 
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` 
      };
    }

    return { valid: true, error: null };
  }, []);

  // Resize image before upload (to reduce file size and standardize dimensions)
  const resizeImage = useCallback((file, maxSize = MAX_DIMENSIONS) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          // Calculate new dimensions maintaining aspect ratio
          if (width > height) {
            if (width > maxSize) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                // Create a new file from the blob
                const resizedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(resizedFile);
              } else {
                reject(new Error('Failed to resize image'));
              }
            },
            'image/jpeg',
            0.85 // Quality (85%)
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }, []);

  // Upload avatar
  const uploadAvatar = useCallback(async (file) => {
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return { success: false, error: validation.error };
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate initial progress
      setUploadProgress(10);

      // Resize image
      const resizedFile = await resizeImage(file);
      setUploadProgress(30);

      // Upload to storage
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 80));
      }, 200);

      const { data, error: uploadError } = await avatarStorage.upload(userId, resizedFile);

      clearInterval(progressInterval);

      if (uploadError) {
        throw uploadError;
      }

      setUploadProgress(90);

      // Update profile with new avatar URL
      if (data?.url) {
        const { error: updateError } = await profiles.update(userId, { 
          avatar_url: data.url 
        });

        if (updateError) {
          console.error('Failed to update profile avatar URL:', updateError);
        }
      }

      setUploadProgress(100);

      return { success: true, data };
    } catch (err) {
      console.error('Error uploading avatar:', err);
      const errorMessage = err.message || 'Failed to upload profile picture';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 500);
    }
  }, [userId, validateFile, resizeImage]);

  // Delete avatar
  const deleteAvatar = useCallback(async () => {
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    setError(null);

    try {
      // Delete from storage
      const { error: deleteError } = await avatarStorage.delete(userId);

      if (deleteError) {
        throw deleteError;
      }

      // Clear avatar URL in profile
      await profiles.update(userId, { avatar_url: null });

      return { success: true };
    } catch (err) {
      console.error('Error deleting avatar:', err);
      const errorMessage = err.message || 'Failed to delete profile picture';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [userId]);

  return {
    isUploading,
    uploadProgress,
    error,
    uploadAvatar,
    deleteAvatar,
    validateFile,
    clearError: () => setError(null),
    allowedTypes: ALLOWED_TYPES,
    maxFileSize: MAX_FILE_SIZE
  };
}
