// Job type color mappings for UI badges
export const JOB_COLORS = {
  'Full-time': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Part-time': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'Contract': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  'Freelance': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'Internship': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  'Remote': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  'default': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}

// Salary range filter mappings (value -> [min, max])
export const SALARY_RANGE_MAP = {
  '0-50k': [0, 50000],
  '50k-100k': [50000, 100000],
  '100k-150k': [100000, 150000],
  '150k+': [150000, null]
}

// Posted within filter mappings (value -> days ago)
export const POSTED_WITHIN_MAP = {
  '24h': 1,
  '7d': 7,
  '30d': 30,
  '90d': 90
}

// Default settings for new users
export const DEFAULT_SETTINGS = {
  theme: 'system',
  emailNotifications: true,
  pushNotifications: false,
  jobAlerts: true,
  weeklyDigest: true
}

// Application status types
export const APPLICATION_STATUS = {
  APPLIED: 'applied',
  REVIEWING: 'reviewing',
  INTERVIEW: 'interview',
  OFFERED: 'offered',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn'
}

// Application status colors for UI
export const APPLICATION_STATUS_COLORS = {
  applied: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  reviewing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  interview: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  offered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  withdrawn: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}

// File upload limits
export const FILE_LIMITS = {
  RESUME_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  AVATAR_MAX_SIZE: 5 * 1024 * 1024,  // 5MB
  RESUME_ALLOWED_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  AVATAR_ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp']
}
