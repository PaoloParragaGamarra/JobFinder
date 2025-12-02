import { useState, useEffect, useCallback } from 'react';
import { applications } from '../lib/supabase';

/**
 * Custom hook for managing job applications
 * Provides functionality to fetch, create, update, and withdraw applications
 */
export function useApplications(userId) {
  const [applicationsList, setApplicationsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());

  // Fetch all applications for the user
  const fetchApplications = useCallback(async () => {
    if (!userId) {
      setApplicationsList([]);
      setAppliedJobIds(new Set());
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await applications.getAll(userId);
      
      if (fetchError) {
        throw fetchError;
      }

      setApplicationsList(data || []);
      setAppliedJobIds(new Set((data || []).map(app => app.job_id)));
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err.message || 'Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Apply to a job
  const applyToJob = useCallback(async (jobId, coverLetter = null, resumeUrl = null) => {
    if (!userId) return { success: false, error: 'User not authenticated' };

    try {
      const { data, error: applyError } = await applications.apply(userId, jobId, coverLetter, resumeUrl);
      
      if (applyError) {
        throw applyError;
      }

      // Refresh applications list
      await fetchApplications();
      
      return { success: true, application: data };
    } catch (err) {
      console.error('Error applying to job:', err);
      return { success: false, error: err.message || 'Failed to submit application' };
    }
  }, [userId, fetchApplications]);

  // Update application status
  const updateApplicationStatus = useCallback(async (applicationId, status, notes = null) => {
    try {
      const { data, error: updateError } = await applications.updateStatus(applicationId, status, notes);
      
      if (updateError) {
        throw updateError;
      }

      // Update local state
      setApplicationsList(prev => 
        prev.map(app => app.id === applicationId ? { ...app, status, notes } : app)
      );
      
      return { success: true, application: data };
    } catch (err) {
      console.error('Error updating application:', err);
      return { success: false, error: err.message || 'Failed to update application' };
    }
  }, []);

  // Withdraw application
  const withdrawApplication = useCallback(async (applicationId) => {
    try {
      const { data, error: withdrawError } = await applications.withdraw(applicationId);
      
      if (withdrawError) {
        throw withdrawError;
      }

      // Update local state
      setApplicationsList(prev => 
        prev.map(app => app.id === applicationId ? { ...app, status: 'withdrawn' } : app)
      );
      
      return { success: true, application: data };
    } catch (err) {
      console.error('Error withdrawing application:', err);
      return { success: false, error: err.message || 'Failed to withdraw application' };
    }
  }, []);

  // Check if user has applied to a specific job
  const hasAppliedToJob = useCallback((jobId) => {
    return appliedJobIds.has(jobId);
  }, [appliedJobIds]);

  // Get application for a specific job
  const getApplicationForJob = useCallback((jobId) => {
    return applicationsList.find(app => app.job_id === jobId);
  }, [applicationsList]);

  // Get applications by status
  const getApplicationsByStatus = useCallback((status) => {
    if (status === 'all') return applicationsList;
    return applicationsList.filter(app => app.status === status);
  }, [applicationsList]);

  // Get application counts by status
  const getApplicationCounts = useCallback(() => {
    const counts = {
      all: applicationsList.length,
      applied: 0,
      viewed: 0,
      interviewing: 0,
      offered: 0,
      rejected: 0,
      withdrawn: 0
    };

    applicationsList.forEach(app => {
      if (counts[app.status] !== undefined) {
        counts[app.status]++;
      }
    });

    return counts;
  }, [applicationsList]);

  return {
    applications: applicationsList,
    isLoading,
    error,
    applyToJob,
    updateApplicationStatus,
    withdrawApplication,
    hasAppliedToJob,
    getApplicationForJob,
    getApplicationsByStatus,
    getApplicationCounts,
    refetch: fetchApplications,
    totalCount: applicationsList.length
  };
}
