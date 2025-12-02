import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Auth helper functions
export const auth = {
  // Sign up with email and password
  signUp: async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    })
    return { data, error }
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Sign in with OAuth provider (Google, GitHub, etc.)
  signInWithOAuth: async (provider) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin
      }
    })
    return { data, error }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current session
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // Get current user
  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Reset password
  resetPassword: async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    return { data, error }
  },

  // Update password
  updatePassword: async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })
    return { data, error }
  },

  // Listen to auth state changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Profile helper functions
export const profiles = {
  // Get user profile
  get: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  // Update user profile
  update: async (userId, updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  }
}

// Jobs helper functions
export const jobs = {
  // Get all active jobs with optional filters
  getAll: async (filters = {}) => {
    let query = supabase
      .from('jobs')
      .select(`
        *,
        company:companies(*),
        source:job_sources(*)
      `)
      .eq('is_active', true)
      .order('posted_at', { ascending: false })

    if (filters.jobType) {
      query = query.eq('job_type', filters.jobType)
    }
    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`)
    }
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`)
    }
    if (filters.salaryMin) {
      query = query.gte('salary_max', filters.salaryMin)
    }
    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query
    return { data, error }
  },

  // Get single job by ID
  getById: async (jobId) => {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        company:companies(*),
        source:job_sources(*)
      `)
      .eq('id', jobId)
      .single()
    return { data, error }
  },

  // Increment view count
  incrementViews: async (jobId) => {
    const { error } = await supabase.rpc('increment_job_views', { job_id: jobId })
    return { error }
  }
}

// Saved jobs helper functions
export const savedJobs = {
  // Get user's saved jobs
  getAll: async (userId) => {
    const { data, error } = await supabase
      .from('saved_jobs')
      .select(`
        *,
        job:jobs(
          *,
          company:companies(*),
          source:job_sources(*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Save a job
  save: async (userId, jobId, notes = null) => {
    const { data, error } = await supabase
      .from('saved_jobs')
      .insert({ user_id: userId, job_id: jobId, notes })
      .select()
      .single()
    return { data, error }
  },

  // Unsave a job
  unsave: async (userId, jobId) => {
    const { error } = await supabase
      .from('saved_jobs')
      .delete()
      .eq('user_id', userId)
      .eq('job_id', jobId)
    return { error }
  },

  // Check if job is saved
  isSaved: async (userId, jobId) => {
    const { data, error } = await supabase
      .from('saved_jobs')
      .select('id')
      .eq('user_id', userId)
      .eq('job_id', jobId)
      .single()
    return { isSaved: !!data && !error, error }
  }
}

// Applications helper functions
export const applications = {
  // Get user's applications
  getAll: async (userId) => {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        job:jobs(
          *,
          company:companies(*),
          source:job_sources(*)
        )
      `)
      .eq('user_id', userId)
      .order('applied_at', { ascending: false })
    return { data, error }
  },

  // Apply to a job
  apply: async (userId, jobId, coverLetter = null, resumeUrl = null) => {
    const { data, error } = await supabase
      .from('applications')
      .insert({
        user_id: userId,
        job_id: jobId,
        cover_letter: coverLetter,
        resume_url: resumeUrl
      })
      .select()
      .single()
    return { data, error }
  },

  // Update application status
  updateStatus: async (applicationId, status, notes = null) => {
    const { data, error } = await supabase
      .from('applications')
      .update({ status, notes })
      .eq('id', applicationId)
      .select()
      .single()
    return { data, error }
  },

  // Withdraw application
  withdraw: async (applicationId) => {
    const { data, error } = await supabase
      .from('applications')
      .update({ status: 'withdrawn' })
      .eq('id', applicationId)
      .select()
      .single()
    return { data, error }
  },

  // Check if already applied
  hasApplied: async (userId, jobId) => {
    const { data, error } = await supabase
      .from('applications')
      .select('id, status')
      .eq('user_id', userId)
      .eq('job_id', jobId)
      .single()
    return { application: data, hasApplied: !!data && !error, error }
  }
}

// Job alerts helper functions
export const jobAlerts = {
  // Get user's job alerts
  getAll: async (userId) => {
    const { data, error } = await supabase
      .from('job_alerts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Create job alert
  create: async (userId, alert) => {
    const { data, error } = await supabase
      .from('job_alerts')
      .insert({ user_id: userId, ...alert })
      .select()
      .single()
    return { data, error }
  },

  // Update job alert
  update: async (alertId, updates) => {
    const { data, error } = await supabase
      .from('job_alerts')
      .update(updates)
      .eq('id', alertId)
      .select()
      .single()
    return { data, error }
  },

  // Delete job alert
  delete: async (alertId) => {
    const { error } = await supabase
      .from('job_alerts')
      .delete()
      .eq('id', alertId)
    return { error }
  }
}

// User settings helper functions
export const userSettings = {
  // Get user settings
  get: async (userId) => {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()
    return { data, error }
  },

  // Update user settings
  update: async (userId, settings) => {
    const { data, error } = await supabase
      .from('user_settings')
      .update(settings)
      .eq('user_id', userId)
      .select()
      .single()
    return { data, error }
  }
}
