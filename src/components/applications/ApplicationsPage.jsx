import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Briefcase, Clock, MapPin, Building2, 
  CheckCircle2, XCircle, Eye, MessageSquare, ChevronRight,
  Search, Filter, Calendar, TrendingUp, AlertCircle,
  MoreVertical, ExternalLink, Trash2
} from 'lucide-react';
import { useApplications } from '../../hooks/useApplications';

const STATUS_CONFIG = {
  applied: { 
    label: 'Applied', 
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: Clock,
    description: 'Waiting for response'
  },
  viewed: { 
    label: 'Viewed', 
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    icon: Eye,
    description: 'Employer viewed your application'
  },
  interviewing: { 
    label: 'Interviewing', 
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    icon: MessageSquare,
    description: 'Interview process ongoing'
  },
  offered: { 
    label: 'Offered', 
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    icon: CheckCircle2,
    description: 'You received an offer!'
  },
  rejected: { 
    label: 'Rejected', 
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    icon: XCircle,
    description: 'Application not selected'
  },
  withdrawn: { 
    label: 'Withdrawn', 
    color: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    icon: Trash2,
    description: 'You withdrew this application'
  }
};

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'applied', label: 'Applied' },
  { key: 'viewed', label: 'Viewed' },
  { key: 'interviewing', label: 'Interviewing' },
  { key: 'offered', label: 'Offered' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'withdrawn', label: 'Withdrawn' }
];

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.applied;
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}

function ApplicationCard({ application, onWithdraw, onViewDetails }) {
  const [showMenu, setShowMenu] = useState(false);
  const job = application.job;
  
  if (!job) return null;

  const appliedDate = new Date(application.applied_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const daysSinceApplied = Math.floor(
    (new Date() - new Date(application.applied_at)) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-amber-500/30 transition-all group">
      <div className="flex items-start gap-4">
        {/* Company Logo */}
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl flex-shrink-0">
          {job.company_name?.[0] || '?'}
        </div>

        {/* Job Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                {job.title}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-slate-400 text-sm">
                <Building2 size={14} />
                <span>{job.company_name}</span>
                <span className="text-slate-600">•</span>
                <MapPin size={14} />
                <span>{job.location || 'Remote'}</span>
              </div>
            </div>

            {/* Actions Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
              >
                <MoreVertical size={16} />
              </button>
              
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 overflow-hidden">
                    <button
                      onClick={() => { onViewDetails(job); setShowMenu(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all"
                    >
                      <ExternalLink size={14} />
                      View Job Details
                    </button>
                    {application.status !== 'withdrawn' && (
                      <button
                        onClick={() => { onWithdraw(application.id); setShowMenu(false); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 size={14} />
                        Withdraw Application
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-4 mt-3">
            <StatusBadge status={application.status} />
            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
              <Calendar size={12} />
              <span>Applied {appliedDate}</span>
              {daysSinceApplied > 0 && (
                <span className="text-slate-600">({daysSinceApplied}d ago)</span>
              )}
            </div>
          </div>

          {/* Job Type & Salary */}
          <div className="flex items-center gap-3 mt-3">
            <span className="px-2.5 py-1 bg-slate-700/50 text-slate-300 text-xs font-medium rounded-lg">
              {job.job_type}
            </span>
            {job.salary_min && job.salary_max && (
              <span className="text-slate-400 text-xs">
                ${(job.salary_min / 1000).toFixed(0)}k - ${(job.salary_max / 1000).toFixed(0)}k
              </span>
            )}
          </div>

          {/* Notes */}
          {application.notes && (
            <div className="mt-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
              <p className="text-slate-400 text-sm">{application.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ statusFilter }) {
  const message = statusFilter === 'all' 
    ? "You haven't applied to any jobs yet"
    : `No ${statusFilter} applications`;
  
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <Briefcase className="w-16 h-16 mb-4 opacity-50" />
      <p className="text-lg font-medium mb-2">{message}</p>
      <p className="text-sm text-slate-500">
        {statusFilter === 'all' 
          ? 'Start exploring jobs and submit your first application!'
          : 'Applications with this status will appear here'}
      </p>
    </div>
  );
}

function StatsCards({ counts }) {
  const stats = [
    { key: 'applied', label: 'Pending', count: counts.applied, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
    { key: 'interviewing', label: 'Interviewing', count: counts.interviewing, color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
    { key: 'offered', label: 'Offers', count: counts.offered, color: 'text-green-400', bgColor: 'bg-green-500/10' },
    { key: 'rejected', label: 'Rejected', count: counts.rejected, color: 'text-red-400', bgColor: 'bg-red-500/10' }
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {stats.map(stat => (
        <div 
          key={stat.key}
          className={`${stat.bgColor} border border-slate-700/30 rounded-xl p-4`}
        >
          <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
          <p className="text-slate-400 text-sm mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

export default function ApplicationsPage({ user, onBack, onViewJob }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { 
    applications, 
    isLoading, 
    error,
    withdrawApplication,
    getApplicationsByStatus,
    getApplicationCounts 
  } = useApplications(user?.id);

  const counts = useMemo(() => getApplicationCounts(), [getApplicationCounts]);
  
  const filteredApplications = useMemo(() => {
    let filtered = getApplicationsByStatus(statusFilter);
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.job?.title?.toLowerCase().includes(search) ||
        app.job?.company_name?.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  }, [getApplicationsByStatus, statusFilter, searchTerm]);

  const handleWithdraw = async (applicationId) => {
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      await withdrawApplication(applicationId);
    }
  };

  const handleViewDetails = (job) => {
    if (onViewJob) {
      onViewJob(job.id);
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-all text-slate-300 hover:text-white"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold">My Applications</h1>
                <p className="text-slate-400 text-sm">
                  Track and manage your job applications
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <TrendingUp size={16} className="text-amber-400" />
                <span className="text-sm font-medium text-slate-300">
                  {counts.all} total applications
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <StatsCards counts={counts} />

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-4 py-2 rounded-md transition-all font-medium text-sm ${
                  statusFilter === tab.key
                    ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {tab.label}
                {counts[tab.key] > 0 && (
                  <span className={`ml-1.5 text-xs ${
                    statusFilter === tab.key ? 'text-slate-900/70' : 'text-slate-500'
                  }`}>
                    ({counts[tab.key]})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search applications..."
              className="w-64 pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {/* Applications List */}
        {!isLoading && !error && (
          <>
            {filteredApplications.length > 0 ? (
              <div className="space-y-4">
                {filteredApplications.map(application => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    onWithdraw={handleWithdraw}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            ) : (
              <EmptyState statusFilter={statusFilter} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
