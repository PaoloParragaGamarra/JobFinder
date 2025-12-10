import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

/**
 * Custom hook for managing saved jobs with Supabase
 */
export function useSavedJobs(userId, jobs) {
  const [savedJobs, setSavedJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load saved jobs from Supabase
  const loadSavedJobs = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('saved_jobs')
        .select('id, job_id, notes, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        console.error('Error loading saved jobs:', fetchError);
        setError('Failed to load saved jobs');
      } else {
        const ids = new Set(data?.map(item => item.job_id) || []);
        setSavedJobIds(ids);
        setSavedJobs(data || []);
      }
    } catch (err) {
      console.error('Error loading saved jobs:', err);
      setError('Failed to load saved jobs');
    }
    
    setIsLoading(false);
  }, [userId]);

  // Toggle save/unsave job
  const toggleSaveJob = useCallback(async (jobId, e) => {
    e?.stopPropagation();
    
    if (!userId) {
      setError('Please log in to save jobs');
      return;
    }

    const isCurrentlySaved = savedJobIds.has(jobId);

    // Optimistic update
    const newIds = new Set(savedJobIds);
    if (isCurrentlySaved) {
      newIds.delete(jobId);
      setSavedJobIds(newIds);
      setSavedJobs(prev => prev.filter(item => item.job_id !== jobId));
    } else {
      newIds.add(jobId);
      setSavedJobIds(newIds);
      const newSavedJob = {
        id: `temp_${Date.now()}`,
        job_id: jobId,
        user_id: userId,
        created_at: new Date().toISOString(),
      };
      setSavedJobs(prev => [newSavedJob, ...prev]);
    }

    // Persist to Supabase
    try {
      if (isCurrentlySaved) {
        const { error } = await supabase
          .from('saved_jobs')
          .delete()
          .eq('user_id', userId)
          .eq('job_id', jobId);
        
        if (error) {
          console.error('Error unsaving job:', error);
          // Revert optimistic update
          setSavedJobIds(prev => new Set([...prev, jobId]));
          loadSavedJobs();
          setError('Failed to unsave job');
        }
      } else {
        const { data, error } = await supabase
          .from('saved_jobs')
          .insert({ user_id: userId, job_id: jobId })
          .select()
          .single();
        
        if (error) {
          console.error('Error saving job:', error);
          // Revert optimistic update
          newIds.delete(jobId);
          setSavedJobIds(new Set(newIds));
          setSavedJobs(prev => prev.filter(item => item.job_id !== jobId));
          setError('Failed to save job');
        } else if (data) {
          // Update with real ID from database
          setSavedJobs(prev => 
            prev.map(item => 
              item.job_id === jobId && item.id.startsWith('temp_') 
                ? { ...item, id: data.id }
                : item
            )
          );
        }
      }
    } catch (err) {
      console.error('Error toggling save:', err);
      setError('Failed to update saved job');
      loadSavedJobs();
    }
  }, [userId, savedJobIds, loadSavedJobs]);

  // Check if a job is saved
  const isJobSaved = useCallback((jobId) => {
    return savedJobIds.has(jobId);
  }, [savedJobIds]);

  // Get saved jobs with full job details
  const getSavedJobsWithDetails = useCallback(() => {
    return savedJobs
      .map(savedItem => ({
        ...savedItem,
        job: jobs.find(j => j.id === savedItem.job_id)
      }))
      .filter(item => item.job);
  }, [savedJobs, jobs]);

  // Load on mount and when user changes
  useEffect(() => {
    if (userId) {
      loadSavedJobs();
    }
  }, [userId, loadSavedJobs]);

  return {
    savedJobs,
    savedJobIds,
    savedCount: savedJobIds.size,
    isLoading,
    error,
    toggleSaveJob,
    isJobSaved,
    getSavedJobsWithDetails,
    clearError: () => setError(null),
  };
}
