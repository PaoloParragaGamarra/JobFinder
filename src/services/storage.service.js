import { supabase } from './supabase'
import { profiles } from './profiles.service'

// Resume storage helper functions
export const resumeStorage = {
  // Upload a resume file
  upload: async (userId, file) => {
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const fileName = `${userId}/${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    
    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) return { data: null, error }
    
    // Get signed URL (valid for 1 hour) - for private bucket
    const { data: urlData, error: urlError } = await supabase.storage
      .from('resumes')
      .createSignedUrl(fileName, 3600) // 1 hour expiration
    
    return { 
      data: { 
        path: data.path, 
        url: urlData?.signedUrl || null,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: new Date().toISOString()
      }, 
      error: urlError 
    }
  },

  // List all resumes for a user
  list: async (userId) => {
    const { data, error } = await supabase.storage
      .from('resumes')
      .list(userId, {
        sortBy: { column: 'created_at', order: 'desc' }
      })
    
    if (error) return { data: null, error }
    
    // Generate signed URLs for each file (valid for 1 hour)
    const filesWithUrls = await Promise.all(
      data.map(async (file) => {
        const filePath = `${userId}/${file.name}`
        const { data: urlData } = await supabase.storage
          .from('resumes')
          .createSignedUrl(filePath, 3600)
        
        return {
          ...file,
          url: urlData?.signedUrl || null,
          path: filePath
        }
      })
    )
    
    return { data: filesWithUrls, error: null }
  },

  // Delete a resume
  delete: async (filePath) => {
    const { error } = await supabase.storage
      .from('resumes')
      .remove([filePath])
    return { error }
  },

  // Get signed URL for a resume (private bucket)
  getSignedUrl: async (filePath, expiresIn = 3600) => {
    const { data, error } = await supabase.storage
      .from('resumes')
      .createSignedUrl(filePath, expiresIn)
    return { url: data?.signedUrl || null, error }
  },

  // Download a resume
  download: async (filePath) => {
    const { data, error } = await supabase.storage
      .from('resumes')
      .download(filePath)
    return { data, error }
  }
}

// Avatar storage helper functions (PUBLIC bucket for profile pictures)
export const avatarStorage = {
  // Upload an avatar image
  upload: async (userId, file) => {
    const fileExt = file.name.split('.').pop().toLowerCase()
    const fileName = `${userId}/avatar.${fileExt}`
    
    // Delete existing avatar first (to replace it)
    await supabase.storage
      .from('avatars')
      .remove([`${userId}/avatar.png`, `${userId}/avatar.jpg`, `${userId}/avatar.jpeg`, `${userId}/avatar.webp`])
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true // Replace if exists
      })
    
    if (error) return { data: null, error }
    
    // Get public URL (avatars can be public since they're displayed in UI)
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)
    
    // Add cache buster to URL to force refresh
    const urlWithCacheBuster = `${urlData.publicUrl}?t=${Date.now()}`
    
    return { 
      data: { 
        path: data.path, 
        url: urlWithCacheBuster
      }, 
      error: null 
    }
  },

  // Get public URL for an avatar
  getUrl: (userId, fileExt = 'png') => {
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(`${userId}/avatar.${fileExt}`)
    return data.publicUrl
  },

  // Delete avatar
  delete: async (userId) => {
    const { error } = await supabase.storage
      .from('avatars')
      .remove([
        `${userId}/avatar.png`,
        `${userId}/avatar.jpg`, 
        `${userId}/avatar.jpeg`,
        `${userId}/avatar.webp`
      ])
    return { error }
  }
}

// Re-export profiles for convenience
export { profiles }
