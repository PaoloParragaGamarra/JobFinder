import { supabase } from './supabase'

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
