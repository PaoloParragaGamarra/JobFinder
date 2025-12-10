import { supabase } from './supabase'

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
