import { supabase } from './supabase'

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
