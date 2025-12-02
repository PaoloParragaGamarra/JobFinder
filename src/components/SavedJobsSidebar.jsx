import React from 'react';
import { X, Bookmark, BookmarkCheck, ChevronRight, MapPin, DollarSign, Trash2 } from 'lucide-react';

export default function SavedJobsSidebar({ 
  isOpen, 
  onClose, 
  savedJobs, 
  savedCount,
  isLoading,
  onSelectJob,
  onRemoveJob 
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-[480px] bg-slate-900 border-l border-slate-700 shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <Header savedCount={savedCount} onClose={onClose} />

        {/* Saved Jobs List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <LoadingState />
          ) : savedJobs.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="p-4 space-y-3">
              {savedJobs.map((savedItem) => (
                <SavedJobCard
                  key={savedItem.job_id || savedItem.job?.id}
                  job={savedItem.job}
                  onSelect={() => {
                    onSelectJob(savedItem.job.id);
                    onClose();
                  }}
                  onRemove={(e) => onRemoveJob(savedItem.job.id, e)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {savedJobs.length > 0 && (
          <div className="p-4 border-t border-slate-700 bg-slate-800/50">
            <button 
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-semibold rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all flex items-center justify-center gap-2"
            >
              <span>Browse All Jobs</span>
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function Header({ savedCount, onClose }) {
  return (
    <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
            <BookmarkCheck className="text-slate-900" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Saved Jobs</h2>
            <p className="text-sm text-slate-400">{savedCount} jobs saved</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all text-slate-400 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-48">
      <div className="w-8 h-8 border-3 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center px-8">
      <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
        <Bookmark className="text-slate-500" size={32} />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">No saved jobs yet</h3>
      <p className="text-slate-400 text-sm">
        Click the heart icon on any job to save it here for later
      </p>
    </div>
  );
}

function SavedJobCard({ job, onSelect, onRemove }) {
  if (!job) return null;

  return (
    <div 
      className="p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-xl transition-all cursor-pointer group"
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${job.color} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
          {job.logo}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-white text-sm leading-tight group-hover:text-amber-400 transition-colors">
              {job.title}
            </h3>
            <button
              onClick={onRemove}
              className="flex-shrink-0 p-1.5 hover:bg-slate-700 rounded-lg transition-all group/btn"
              title="Remove from saved"
            >
              <Trash2 size={14} className="text-slate-500 group-hover/btn:text-red-400" />
            </button>
          </div>
          
          <p className="text-amber-400 text-sm font-medium mb-2">{job.company}</p>
          
          <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign size={12} />
              {job.salary}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {job.tags.slice(0, 2).map((tag, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-slate-700/50 text-slate-300 text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>
            <span className="px-2 py-0.5 bg-slate-700/50 text-slate-400 text-xs rounded border border-slate-700">
              {job.type}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
