// Job-related utility functions

export const JOB_COLORS = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-orange-500 to-red-500',
  'from-green-500 to-teal-500',
  'from-yellow-500 to-orange-500',
  'from-indigo-500 to-purple-500',
];

/**
 * Get emoji logo based on job title keywords
 */
export const getJobLogo = (title) => {
  const t = title.toLowerCase();
  if (t.includes('frontend') || t.includes('react')) return '💻';
  if (t.includes('full stack')) return '🚀';
  if (t.includes('backend') || t.includes('python')) return '⚙️';
  if (t.includes('devops') || t.includes('cloud')) return '☁️';
  if (t.includes('machine learning') || t.includes('ml') || t.includes('ai')) return '🧠';
  if (t.includes('data')) return '📊';
  if (t.includes('design') || t.includes('ux')) return '🎨';
  if (t.includes('product')) return '📋';
  if (t.includes('mobile') || t.includes('ios') || t.includes('android')) return '📱';
  return '💼';
};

/**
 * Format relative time from date string
 */
export const formatPostedTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  return `${Math.floor(diffDays / 7)} weeks ago`;
};

/**
 * Format salary range
 */
export const formatSalary = (min, max, currency = 'USD') => {
  const formatNum = (n) => {
    if (n >= 1000) return `$${Math.round(n / 1000)}k`;
    return `$${n}`;
  };
  return `${formatNum(min)} - ${formatNum(max)}`;
};

/**
 * Transform database job to UI format
 */
export const transformJob = (job, index) => ({
  id: job.id,
  title: job.title,
  company: job.company_name,
  companyData: job.company,
  location: job.location || 'Remote',
  type: job.job_type,
  salary: formatSalary(job.salary_min, job.salary_max),
  salaryMin: job.salary_min,
  salaryMax: job.salary_max,
  posted: formatPostedTime(job.posted_at),
  postedAt: job.posted_at,
  source: 'JobStream',
  logo: getJobLogo(job.title),
  color: JOB_COLORS[index % JOB_COLORS.length],
  applicants: job.applicants_count || 0,
  description: job.description,
  requirements: job.requirements || [],
  benefits: job.benefits || [],
  tags: job.tags || [],
  isRemote: job.is_remote,
  experienceLevel: job.experience_level,
  applicationUrl: job.application_url,
});

/**
 * Filter jobs based on search term and filter type
 */
export const filterJobs = (jobs, searchTerm, filterType) => {
  return jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filterType === 'all' || 
      job.type.toLowerCase().includes(filterType.toLowerCase());
    return matchesSearch && matchesFilter;
  });
};

/**
 * Salary range definitions for advanced filtering
 */
const SALARY_RANGE_MAP = {
  '0-50000': { min: 0, max: 50000 },
  '50000-80000': { min: 50000, max: 80000 },
  '80000-120000': { min: 80000, max: 120000 },
  '120000-150000': { min: 120000, max: 150000 },
  '150000-200000': { min: 150000, max: 200000 },
  '200000+': { min: 200000, max: Infinity },
};

/**
 * Posted within date map (in days)
 */
const POSTED_WITHIN_MAP = {
  '24h': 1,
  '7d': 7,
  '14d': 14,
  '30d': 30,
  'any': null,
};

/**
 * Advanced filter function for jobs
 * @param {Array} jobs - Array of job objects
 * @param {string} searchTerm - Search term for title/company/location
 * @param {string} filterType - Quick filter type (all, full-time, contract)
 * @param {Object} advancedFilters - Advanced filter options
 * @returns {Array} Filtered jobs array
 */
export const filterJobsAdvanced = (jobs, searchTerm, filterType, advancedFilters = {}) => {
  const {
    experienceLevels = [],
    jobTypes = [],
    salaryRange = null,
    postedWithin = 'any',
    remoteOnly = false,
    locations = [],
  } = advancedFilters;

  return jobs.filter(job => {
    // Basic search filter
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.tags && job.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));

    // Quick filter type (from navbar)
    const matchesQuickFilter = 
      filterType === 'all' || 
      job.type.toLowerCase().includes(filterType.toLowerCase());

    // Job types filter
    const matchesJobType = 
      jobTypes.length === 0 || 
      jobTypes.some(type => job.type.toLowerCase() === type.toLowerCase());

    // Experience level filter
    const matchesExperience = 
      experienceLevels.length === 0 || 
      experienceLevels.includes(job.experienceLevel);

    // Salary range filter
    let matchesSalary = true;
    if (salaryRange && SALARY_RANGE_MAP[salaryRange]) {
      const { min, max } = SALARY_RANGE_MAP[salaryRange];
      // Job matches if its salary range overlaps with the filter range
      matchesSalary = job.salaryMax >= min && job.salaryMin <= max;
    }

    // Posted within filter
    let matchesPosted = true;
    if (postedWithin && postedWithin !== 'any' && POSTED_WITHIN_MAP[postedWithin]) {
      const daysAgo = POSTED_WITHIN_MAP[postedWithin];
      const postedDate = new Date(job.postedAt);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      matchesPosted = postedDate >= cutoffDate;
    }

    // Remote only filter
    const matchesRemote = !remoteOnly || job.isRemote || job.location.toLowerCase().includes('remote');

    // Location filter
    const matchesLocation = 
      locations.length === 0 || 
      locations.some(loc => job.location.toLowerCase().includes(loc.toLowerCase()));

    return matchesSearch && 
           matchesQuickFilter && 
           matchesJobType && 
           matchesExperience && 
           matchesSalary && 
           matchesPosted && 
           matchesRemote && 
           matchesLocation;
  });
};

/**
 * Count active filters
 * @param {Object} filters - Filter object
 * @returns {number} Count of active filters
 */
export const countActiveFilters = (filters = {}) => {
  let count = 0;
  
  if (filters.experienceLevels?.length > 0) count += filters.experienceLevels.length;
  if (filters.jobTypes?.length > 0) count += filters.jobTypes.length;
  if (filters.salaryRange) count += 1;
  if (filters.postedWithin && filters.postedWithin !== 'any') count += 1;
  if (filters.remoteOnly) count += 1;
  if (filters.locations?.length > 0) count += filters.locations.length;
  
  return count;
};

/**
 * Get default filter state
 * @returns {Object} Default filter values
 */
export const getDefaultFilters = () => ({
  experienceLevels: [],
  jobTypes: [],
  salaryRange: null,
  postedWithin: 'any',
  remoteOnly: false,
  locations: [],
});
