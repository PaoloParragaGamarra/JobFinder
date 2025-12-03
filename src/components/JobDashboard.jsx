import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useJobs } from '../hooks/useJobs';
import { useSavedJobs } from '../hooks/useSavedJobs';
import { useNotifications } from '../hooks/useNotifications';
import { useApplications } from '../hooks/useApplications';
import { filterJobsAdvanced, countActiveFilters, getDefaultFilters } from '../utils/jobUtils';
import Navbar from './Navbar';
import JobList from './JobList';
import JobDetails from './JobDetails';
import SavedJobsSidebar from './SavedJobsSidebar';
import AdvancedFilters from './AdvancedFilters';
import { ToastContainer } from './ToastNotification';

/**
 * Main Job Dashboard Component
 * 
 * Follows SOLID principles:
 * - Single Responsibility: Each component handles one concern
 * - Open/Closed: Easy to extend with new features without modifying existing code
 * - Liskov Substitution: Components can be swapped with compatible implementations
 * - Interface Segregation: Components receive only the props they need
 * - Dependency Inversion: High-level modules don't depend on low-level modules
 */
export default function JobDashboard({ user, onLogout, onShowProfile, onShowSettings, onShowApplications, initialSelectedJobId }) {
  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobId, setSelectedJobId] = useState(initialSelectedJobId || null);
  const [filterType, setFilterType] = useState('all');
  const [showSavedJobs, setShowSavedJobs] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState(getDefaultFilters());
  const [toasts, setToasts] = useState([]);

  // Data hooks
  const { jobs, isLoading: isLoadingJobs, error: jobsError, refetch } = useJobs();
  const { 
    savedCount, 
    isLoading: isLoadingSaved, 
    toggleSaveJob, 
    isJobSaved, 
    getSavedJobsWithDetails 
  } = useSavedJobs(user?.id, jobs);

  // Applications hook
  const {
    applications: userApplications,
    totalCount: applicationsCount,
    applyToJob,
    hasAppliedToJob,
    getApplicationForJob
  } = useApplications(user?.id);

  // Notifications hook
  const {
    notifications,
    unreadCount: unreadNotificationCount,
    markAsRead: markNotificationAsRead,
    markAllAsRead: markAllNotificationsAsRead,
    clearAll: clearAllNotifications,
    removeNotification,
    addNotification,
  } = useNotifications(user?.id);

  // Show toast when new notification arrives
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      // Only show toast for unread notifications that were just added
      if (!latestNotification.read && latestNotification.type === 'new_job') {
        const existingToast = toasts.find(t => t.id === latestNotification.id);
        if (!existingToast) {
          setToasts(prev => [...prev, latestNotification].slice(-3)); // Keep max 3 toasts
        }
      }
    }
  }, [notifications]);

  // Handle toast dismiss
  const handleDismissToast = useCallback((toastId) => {
    setToasts(prev => prev.filter(t => t.id !== toastId));
  }, []);

  // Handle view job from notification/toast
  const handleViewJobFromNotification = useCallback((jobId) => {
    setSelectedJobId(jobId);
    // Scroll the job into view if needed
    refetch();
  }, [refetch]);

  // Count active filters
  const activeFilterCount = useMemo(
    () => countActiveFilters(advancedFilters),
    [advancedFilters]
  );

  // Derived state - using advanced filtering
  const filteredJobs = useMemo(
    () => filterJobsAdvanced(jobs, searchTerm, filterType, advancedFilters),
    [jobs, searchTerm, filterType, advancedFilters]
  );

  const selectedJob = useMemo(
    () => jobs.find(j => j.id === selectedJobId) || jobs[0],
    [jobs, selectedJobId]
  );

  // Set initial selected job when jobs load
  useEffect(() => {
    if (jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(initialSelectedJobId || jobs[0].id);
    } else if (initialSelectedJobId && jobs.length > 0) {
      setSelectedJobId(initialSelectedJobId);
    }
  }, [jobs, selectedJobId, initialSelectedJobId]);

  // Handlers
  const handleSelectJob = (jobId) => setSelectedJobId(jobId);
  const handleShowSavedJobs = () => setShowSavedJobs(true);
  const handleCloseSavedJobs = () => setShowSavedJobs(false);
  const handleShowAdvancedFilters = () => setShowAdvancedFilters(true);
  const handleCloseAdvancedFilters = () => setShowAdvancedFilters(false);
  const handleFiltersChange = (newFilters) => setAdvancedFilters(newFilters);
  const handleResetFilters = () => setAdvancedFilters(getDefaultFilters());

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white">
      <Navbar
        user={user}
        filterType={filterType}
        onFilterChange={setFilterType}
        jobCount={filteredJobs.length}
        savedCount={savedCount}
        applicationsCount={applicationsCount}
        onShowSavedJobs={handleShowSavedJobs}
        onShowProfile={onShowProfile}
        onShowSettings={onShowSettings}
        onShowApplications={onShowApplications}
        onLogout={onLogout}
        notifications={notifications}
        unreadNotificationCount={unreadNotificationCount}
        onMarkNotificationAsRead={markNotificationAsRead}
        onMarkAllNotificationsAsRead={markAllNotificationsAsRead}
        onClearAllNotifications={clearAllNotifications}
        onRemoveNotification={removeNotification}
        onViewJob={handleViewJobFromNotification}
      />

      <div className="flex flex-1 overflow-hidden">
        <JobList
          jobs={filteredJobs}
          selectedJobId={selectedJobId}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          isLoading={isLoadingJobs}
          error={jobsError}
          onRetry={refetch}
          onSelectJob={handleSelectJob}
          isJobSaved={isJobSaved}
          onToggleSave={toggleSaveJob}
          onShowAdvancedFilters={handleShowAdvancedFilters}
          activeFilterCount={activeFilterCount}
        />

        <JobDetails
          job={selectedJob}
          userId={user?.id}
          isLiked={selectedJob ? isJobSaved(selectedJob.id) : false}
          onToggleLike={toggleSaveJob}
          hasApplied={selectedJob ? hasAppliedToJob(selectedJob.id) : false}
          application={selectedJob ? getApplicationForJob(selectedJob.id) : null}
          onApply={applyToJob}
        />
      </div>

      <SavedJobsSidebar
        isOpen={showSavedJobs}
        onClose={handleCloseSavedJobs}
        savedJobs={getSavedJobsWithDetails()}
        savedCount={savedCount}
        isLoading={isLoadingSaved}
        onSelectJob={handleSelectJob}
        onRemoveJob={toggleSaveJob}
      />

      <AdvancedFilters
        isOpen={showAdvancedFilters}
        onClose={handleCloseAdvancedFilters}
        filters={advancedFilters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
        activeFilterCount={activeFilterCount}
      />

      {/* Toast Notifications */}
      <ToastContainer
        toasts={toasts}
        onDismiss={handleDismissToast}
        onView={handleViewJobFromNotification}
      />
    </div>
  );
}
