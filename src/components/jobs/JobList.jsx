import React from 'react';
import { Search, Filter, ChevronRight, Briefcase, Loader2, SlidersHorizontal } from 'lucide-react';
import JobCard from './JobCard';

export default function JobList({
  jobs,
  selectedJobId,
  searchTerm,
  onSearchChange,
  isLoading,
  error,
  onRetry,
  onSelectJob,
  isJobSaved,
  onToggleSave,
  onShowAdvancedFilters,
  activeFilterCount = 0,
}) {

  return (
    <div className="w-[420px] border-r border-slate-800/50 flex flex-col bg-slate-900/50 backdrop-blur-sm">
      {/* Search & Filter Bar */}
      <div className="p-4 space-y-3 border-b border-slate-800/50 bg-slate-900/80">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by title, company, or location..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-800/50 text-white border border-slate-700/50 rounded-lg focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 placeholder-slate-500 text-sm transition-all"
          />
        </div>
        
        <button 
          onClick={onShowAdvancedFilters}
          className={`w-full flex items-center justify-between px-4 py-2.5 border rounded-lg transition-all text-sm font-medium ${
            activeFilterCount > 0
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 hover:bg-amber-500/30'
              : 'bg-slate-800/30 hover:bg-slate-800/50 border-slate-700/50 text-slate-300 hover:text-white'
          }`}
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal size={16} />
            Advanced Filters
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 bg-amber-500 text-slate-900 text-xs font-bold rounded-full">
                {activeFilterCount}
              </span>
            )}
          </span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Job List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} onRetry={onRetry} />
          ) : jobs.length === 0 ? (
            <EmptyState />
          ) : (
            jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSelected={selectedJobId === job.id}
                isLiked={isJobSaved(job.id)}
                onSelect={onSelectJob}
                onToggleLike={onToggleSave}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
      <p className="text-sm">Loading jobs...</p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
      <p className="text-red-400 mb-2">{message}</p>
      <button onClick={onRetry} className="text-sm text-amber-500 hover:text-amber-400">
        Try again
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
      <Briefcase className="w-8 h-8 mb-3" />
      <p className="text-sm">No jobs found</p>
    </div>
  );
}
