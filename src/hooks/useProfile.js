import { useState, useEffect, useCallback } from 'react';
import { profiles, auth } from '../services/profiles.service';

/**
 * Custom hook for managing user profile data
 * Handles fetching, updating, and caching profile information
 */
export function useProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await profiles.get(userId);
      
      if (fetchError) {
        // If profile doesn't exist, create a basic one from auth data
        if (fetchError.code === 'PGRST116') {
          const { user } = await auth.getUser();
          if (user) {
            setProfile({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || '',
              avatar_url: user.user_metadata?.avatar_url || '',
              phone: '',
              location: '',
              bio: '',
              linkedin_url: '',
              github_url: '',
              portfolio_url: '',
              resume_url: '',
              job_title: '',
              years_experience: 0,
              skills: [],
              preferred_job_types: [],
              preferred_locations: [],
              salary_min: null,
              salary_max: null,
              is_open_to_work: true,
            });
          }
        } else {
          setError(fetchError.message);
        }
      } else {
        setProfile(data);
      }
    } catch (err) {
      setError('Failed to load profile');
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Update profile
  const updateProfile = useCallback(async (updates) => {
    if (!userId) return { success: false, error: 'No user ID' };

    setIsSaving(true);
    setError(null);

    try {
      const { data, error: updateError } = await profiles.update(userId, updates);
      
      if (updateError) {
        setError(updateError.message);
        return { success: false, error: updateError.message };
      }

      setProfile(data);
      return { success: true, data };
    } catch (err) {
      const errorMessage = 'Failed to update profile';
      setError(errorMessage);
      console.error('Error updating profile:', err);
      return { success: false, error: errorMessage };
    } finally {
      setIsSaving(false);
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    isSaving,
    error,
    updateProfile,
    refetch: fetchProfile,
  };
}
