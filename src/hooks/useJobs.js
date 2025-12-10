import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { transformJob } from '../utils/jobUtils';

// Cache jobs data to avoid unnecessary refetches
let cachedJobs = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Custom hook for fetching and managing jobs from Supabase
 */
export function useJobs() {
  const [jobs, setJobs] = useState(cachedJobs || []);
  const [isLoading, setIsLoading] = useState(!cachedJobs);
  const [error, setError] = useState(null);

  const fetchJobs = useCallback(async (force = false) => {
    // Use cache if available and not expired
    const now = Date.now();
    if (!force && cachedJobs && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
      setJobs(cachedJobs);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('jobs')
        .select(`
          *,
          company:companies(*)
        `)
        .eq('is_active', true)
        .order('posted_at', { ascending: false });
      
      if (fetchError) {
        console.error('Error fetching jobs:', fetchError);
        setError('Failed to load jobs');
      } else {
        const transformedJobs = data.map(transformJob);
        setJobs(transformedJobs);
        // Update cache
        cachedJobs = transformedJobs;
        cacheTimestamp = Date.now();
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs');
    }
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    jobs,
    isLoading,
    error,
    refetch: fetchJobs,
  };
}
