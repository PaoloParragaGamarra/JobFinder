import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Clock, 
  Building2,
  Wifi,
  Check,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';

const EXPERIENCE_LEVELS = [
  { value: 'Entry', label: 'Entry Level', description: '0-2 years' },
  { value: 'Mid', label: 'Mid Level', description: '3-5 years' },
  { value: 'Senior', label: 'Senior', description: '5-8 years' },
  { value: 'Lead', label: 'Lead', description: '8+ years' },
  { value: 'Executive', label: 'Executive', description: '10+ years' },
];

const JOB_TYPES = [
  { value: 'Full-time', label: 'Full-time', icon: Briefcase },
  { value: 'Part-time', label: 'Part-time', icon: Clock },
  { value: 'Contract', label: 'Contract', icon: Building2 },
  { value: 'Internship', label: 'Internship', icon: Briefcase },
];

const SALARY_RANGES = [
  { value: '0-50000', label: 'Under $50k', min: 0, max: 50000 },
  { value: '50000-80000', label: '$50k - $80k', min: 50000, max: 80000 },
  { value: '80000-120000', label: '$80k - $120k', min: 80000, max: 120000 },
  { value: '120000-150000', label: '$120k - $150k', min: 120000, max: 150000 },
  { value: '150000-200000', label: '$150k - $200k', min: 150000, max: 200000 },
  { value: '200000+', label: '$200k+', min: 200000, max: Infinity },
];

const POSTED_OPTIONS = [
  { value: '24h', label: 'Last 24 hours', days: 1 },
  { value: '7d', label: 'Last 7 days', days: 7 },
  { value: '14d', label: 'Last 14 days', days: 14 },
  { value: '30d', label: 'Last 30 days', days: 30 },
  { value: 'any', label: 'Any time', days: null },
];

const CheckboxButton = ({ checked, onChange, children, className = '' }) => (
  <button
    type="button"
    onClick={onChange}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm ${
      checked
        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
        : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600'
    } ${className}`}
  >
    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
      checked ? 'bg-amber-500 border-amber-500' : 'border-slate-600'
    }`}>
      {checked && <Check size={12} className="text-slate-900" />}
    </div>
    {children}
  </button>
);

const FilterSection = ({ title, icon: Icon, children }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 text-slate-300">
      {Icon && <Icon size={16} className="text-amber-500" />}
      <span className="text-sm font-medium">{title}</span>
    </div>
    {children}
  </div>
);

export default function AdvancedFilters({ 
  isOpen, 
  onClose, 
  filters, 
  onFiltersChange,
  onReset,
  activeFilterCount 
}) {
  const [localFilters, setLocalFilters] = useState(filters);

  // Sync local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleToggleArrayValue = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value]
    }));
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      experienceLevels: [],
      jobTypes: [],
      salaryRange: null,
      postedWithin: 'any',
      remoteOnly: false,
      locations: [],
    };
    setLocalFilters(resetFilters);
    onReset();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-700/50 shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <SlidersHorizontal size={20} className="text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Advanced Filters</h2>
              <p className="text-sm text-slate-400">
                {activeFilterCount > 0 ? `${activeFilterCount} active filters` : 'Refine your search'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Remote Work */}
          <FilterSection title="Work Type" icon={Wifi}>
            <CheckboxButton
              checked={localFilters.remoteOnly}
              onChange={() => handleChange('remoteOnly', !localFilters.remoteOnly)}
              className="w-full justify-start"
            >
              <Wifi size={16} />
              <span>Remote Only</span>
            </CheckboxButton>
          </FilterSection>

          {/* Job Types */}
          <FilterSection title="Job Type" icon={Briefcase}>
            <div className="grid grid-cols-2 gap-2">
              {JOB_TYPES.map(({ value, label, icon: TypeIcon }) => (
                <CheckboxButton
                  key={value}
                  checked={localFilters.jobTypes.includes(value)}
                  onChange={() => handleToggleArrayValue('jobTypes', value)}
                >
                  <TypeIcon size={14} />
                  <span>{label}</span>
                </CheckboxButton>
              ))}
            </div>
          </FilterSection>

          {/* Experience Level */}
          <FilterSection title="Experience Level" icon={Briefcase}>
            <div className="space-y-2">
              {EXPERIENCE_LEVELS.map(({ value, label, description }) => (
                <CheckboxButton
                  key={value}
                  checked={localFilters.experienceLevels.includes(value)}
                  onChange={() => handleToggleArrayValue('experienceLevels', value)}
                  className="w-full justify-start"
                >
                  <div className="flex-1 text-left">
                    <span className="block">{label}</span>
                    <span className="text-xs text-slate-500">{description}</span>
                  </div>
                </CheckboxButton>
              ))}
            </div>
          </FilterSection>

          {/* Salary Range */}
          <FilterSection title="Salary Range" icon={DollarSign}>
            <div className="space-y-2">
              {SALARY_RANGES.map(({ value, label }) => (
                <CheckboxButton
                  key={value}
                  checked={localFilters.salaryRange === value}
                  onChange={() => handleChange('salaryRange', localFilters.salaryRange === value ? null : value)}
                  className="w-full justify-start"
                >
                  <span>{label}</span>
                </CheckboxButton>
              ))}
            </div>
          </FilterSection>

          {/* Posted Within */}
          <FilterSection title="Date Posted" icon={Clock}>
            <div className="flex flex-wrap gap-2">
              {POSTED_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleChange('postedWithin', value)}
                  className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                    localFilters.postedWithin === value
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                      : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Location Filter */}
          <FilterSection title="Location" icon={MapPin}>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Add a location (e.g., New York, London)"
                className="w-full px-4 py-3 bg-slate-800/50 text-white border border-slate-700/50 rounded-lg focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 placeholder-slate-500 text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    if (!localFilters.locations.includes(e.target.value.trim())) {
                      handleChange('locations', [...localFilters.locations, e.target.value.trim()]);
                    }
                    e.target.value = '';
                  }
                }}
              />
              {localFilters.locations.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {localFilters.locations.map((location, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-full text-sm"
                    >
                      <MapPin size={12} />
                      {location}
                      <button
                        onClick={() => handleChange('locations', localFilters.locations.filter((_, i) => i !== index))}
                        className="hover:text-amber-300"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </FilterSection>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700/50 bg-slate-900/80 space-y-3">
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors font-medium"
            >
              <RotateCcw size={18} />
              <span>Reset All</span>
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-semibold rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Export filter constants for use in other components
export { EXPERIENCE_LEVELS, JOB_TYPES, SALARY_RANGES, POSTED_OPTIONS };
