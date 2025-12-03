import React, { useState } from 'react';
import { 
  MapPin, Briefcase, DollarSign, Clock, ExternalLink, 
  Heart, ChevronRight, Building2, Share2, BarChart3,
  CheckCircle2, Loader2, X, FileText, Upload
} from 'lucide-react';
import { ResumeSelector } from './ResumeUpload';

export default function JobDetails({ job, isLiked, onToggleLike, hasApplied, application, onApply, userId }) {
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);

  const handleApplyClick = () => {
    if (!job || hasApplied || isApplying) return;
    setShowApplyModal(true);
    setApplyError(null);
  };

  const handleApply = async () => {
    if (!job || hasApplied || isApplying) return;
    
    setIsApplying(true);
    setApplyError(null);
    
    try {
      const result = await onApply(job.id, null, selectedResume?.url || null);
      if (!result.success) {
        setApplyError(result.error);
      } else {
        setShowApplyModal(false);
        setSelectedResume(null);
      }
    } catch (err) {
      setApplyError('Failed to submit application');
    } finally {
      setIsApplying(false);
    }
  };

  const handleApplyWithoutResume = async () => {
    setIsApplying(true);
    setApplyError(null);
    
    try {
      const result = await onApply(job.id);
      if (!result.success) {
        setApplyError(result.error);
      } else {
        setShowApplyModal(false);
      }
    } catch (err) {
      setApplyError('Failed to submit application');
    } finally {
      setIsApplying(false);
    }
  };
  if (!job) {
    return (
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
          <Briefcase className="w-16 h-16 mb-4" />
          <p className="text-lg">Select a job to view details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <div className="p-8 max-w-5xl mx-auto">
        {/* Header Section */}
        <JobHeader job={job} isLiked={isLiked} onToggleLike={onToggleLike} />

        {/* Action Buttons */}
        <ActionButtons 
          hasApplied={hasApplied} 
          application={application}
          isApplying={isApplying}
          onApply={handleApplyClick}
          applyError={applyError}
        />

        {/* Description Section */}
        <Section title="About the Role">
          <p className="text-slate-300 leading-relaxed text-base">
            {job.description}
          </p>
        </Section>

        {/* Requirements Section */}
        <Section title="What We're Looking For">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {job.requirements.map((req, idx) => (
              <RequirementItem key={idx} text={req} />
            ))}
          </div>
        </Section>

        {/* Benefits Section */}
        <Section title="Benefits & Perks">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {job.benefits.map((benefit, idx) => (
              <BenefitItem key={idx} text={benefit} />
            ))}
          </div>
        </Section>

        {/* Skills Tags */}
        <Section title="Required Skills">
          <div className="flex flex-wrap gap-2">
            {job.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm font-medium hover:border-amber-500/50 hover:text-white transition-all cursor-default"
              >
                {tag}
              </span>
            ))}
          </div>
        </Section>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <ApplyModal
          job={job}
          userId={userId}
          selectedResume={selectedResume}
          onSelectResume={setSelectedResume}
          onApply={handleApply}
          onApplyWithoutResume={handleApplyWithoutResume}
          onClose={() => setShowApplyModal(false)}
          isApplying={isApplying}
          error={applyError}
        />
      )}
    </div>
  );
}

function JobHeader({ job, isLiked, onToggleLike }) {
  return (
    <div className="mb-8">
      <div className="flex items-start gap-6">
        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${job.color} flex items-center justify-center text-5xl shadow-2xl flex-shrink-0`}>
          {job.logo}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h2 className="text-4xl font-bold text-white mb-2 leading-tight">
                {job.title}
              </h2>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="text-amber-400" size={20} />
                <span className="text-xl text-amber-400 font-semibold">
                  {job.company}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="w-11 h-11 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all text-slate-300 hover:text-white">
                <Share2 size={18} />
              </button>
              <button 
                onClick={(e) => onToggleLike(job.id, e)}
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
              >
                <Heart
                  size={18}
                  className={isLiked ? 'fill-red-500 text-red-500' : 'text-slate-300 hover:text-red-500'}
                />
              </button>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <InfoCard icon={<MapPin size={14} />} label="Location" value={job.location} />
            <InfoCard icon={<Briefcase size={14} />} label="Type" value={job.type} />
            <InfoCard icon={<DollarSign size={14} />} label="Salary" value={job.salary} />
            <InfoCard icon={<Clock size={14} />} label="Posted" value={job.posted} />
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-800/50 to-slate-800/30 rounded-lg border border-slate-700/50">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <BarChart3 size={16} className="text-amber-400" />
                <span className="text-sm text-slate-300">
                  <span className="font-semibold text-white">{job.applicants}</span> applicants
                </span>
              </div>
              <div className="w-px h-4 bg-slate-700" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-slate-300">Actively hiring</span>
              </div>
            </div>
            <span className="px-3 py-1 bg-slate-700/50 text-slate-300 text-xs font-medium rounded-full border border-slate-600">
              via {job.source}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="px-4 py-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
      <div className="flex items-center gap-2 text-slate-400 mb-1">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-white text-sm font-semibold">{value}</p>
    </div>
  );
}

function ActionButtons({ hasApplied, application, isApplying, onApply, applyError }) {
  const getButtonContent = () => {
    if (isApplying) {
      return (
        <>
          <Loader2 size={20} className="animate-spin" />
          <span>Submitting...</span>
        </>
      );
    }
    
    if (hasApplied) {
      const statusLabels = {
        applied: 'Application Submitted',
        viewed: 'Application Viewed',
        interviewing: 'Interview in Progress',
        offered: 'Offer Received!',
        rejected: 'Application Closed',
        withdrawn: 'Application Withdrawn'
      };
      
      return (
        <>
          <CheckCircle2 size={20} />
          <span>{statusLabels[application?.status] || 'Applied'}</span>
        </>
      );
    }
    
    return (
      <>
        <span>Quick Apply</span>
        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </>
    );
  };

  const getButtonStyle = () => {
    if (hasApplied) {
      const statusColors = {
        applied: 'from-blue-500 to-blue-600',
        viewed: 'from-purple-500 to-purple-600',
        interviewing: 'from-amber-500 to-orange-500',
        offered: 'from-green-500 to-emerald-500',
        rejected: 'from-slate-500 to-slate-600',
        withdrawn: 'from-slate-500 to-slate-600'
      };
      return `bg-gradient-to-r ${statusColors[application?.status] || 'from-blue-500 to-blue-600'} cursor-default`;
    }
    return 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 cursor-pointer';
  };

  return (
    <div className="mb-8">
      <div className="flex gap-3">
        <button 
          onClick={!hasApplied && !isApplying ? onApply : undefined}
          disabled={hasApplied || isApplying}
          className={`flex-1 px-6 py-4 ${getButtonStyle()} text-slate-900 font-bold rounded-xl transition-all shadow-2xl shadow-amber-500/30 flex items-center justify-center gap-3 text-base group disabled:opacity-100`}
        >
          {getButtonContent()}
        </button>
        <button className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all flex items-center gap-2 border border-slate-700">
          <ExternalLink size={18} />
          <span>View Original</span>
        </button>
      </div>
      {applyError && (
        <p className="mt-2 text-red-400 text-sm text-center">{applyError}</p>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-8 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full" />
        <h3 className="text-2xl font-bold text-white">{title}</h3>
      </div>
      <div className="pl-7">{children}</div>
    </div>
  );
}

function RequirementItem({ text }) {
  return (
    <div className="flex items-start gap-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 hover:border-amber-500/30 transition-all group">
      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
        <div className="w-2 h-2 bg-slate-900 rounded-full" />
      </div>
      <span className="text-slate-300 text-sm leading-relaxed group-hover:text-white transition-colors">
        {text}
      </span>
    </div>
  );
}

function BenefitItem({ text }) {
  return (
    <div className="px-4 py-4 bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-slate-700/50 rounded-xl text-slate-300 text-sm font-medium hover:border-amber-500/30 transition-all text-center hover:scale-105">
      {text}
    </div>
  );
}

function ApplyModal({ job, userId, selectedResume, onSelectResume, onApply, onApplyWithoutResume, onClose, isApplying, error }) {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Apply to Position</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Job Info */}
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${job.color} flex items-center justify-center text-2xl`}>
                {job.logo}
              </div>
              <div>
                <p className="font-semibold text-white">{job.title}</p>
                <p className="text-sm text-slate-400">{job.company}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Resume Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <FileText size={16} className="text-amber-500" />
                Select Resume (Optional)
              </label>
              
              {showUpload ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-400">
                    Upload a new resume from your Profile page to use it here.
                  </p>
                  <button
                    onClick={() => setShowUpload(false)}
                    className="text-sm text-amber-400 hover:text-amber-300"
                  >
                    ← Back to resume selection
                  </button>
                </div>
              ) : (
                <ResumeSelector
                  userId={userId}
                  selectedResume={selectedResume}
                  onSelect={onSelectResume}
                  onUploadNew={() => setShowUpload(true)}
                />
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-700/50 bg-slate-800/30 space-y-3">
            <button
              onClick={onApply}
              disabled={isApplying}
              className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-bold rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isApplying ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>{selectedResume ? 'Apply with Resume' : 'Apply Now'}</span>
                  <ChevronRight size={18} />
                </>
              )}
            </button>
            
            {selectedResume && (
              <button
                onClick={onApplyWithoutResume}
                disabled={isApplying}
                className="w-full px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-50"
              >
                Apply without resume
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
