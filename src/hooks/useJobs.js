import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { transformJob } from '../utils/jobUtils';

/**
 * Custom hook for fetching and managing jobs from Supabase
 */
export function useJobs() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJobs = useCallback(async () => {
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
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs');
    }
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    isLoading,
    error,
    refetch: fetchJobs,
  };
}
