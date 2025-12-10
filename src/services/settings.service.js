import { supabase } from './supabase'

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
