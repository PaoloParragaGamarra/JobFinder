import { useState, useEffect, useCallback } from 'react';
import { resumeStorage, profiles } from '../services/storage.service';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Custom hook for managing user resumes
 * Provides functionality to upload, list, delete, and select resumes
 */
export function useResume(userId) {
  const [resumes, setResumes] = useState([]);
  const [primaryResumeUrl, setPrimaryResumeUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  // Load resumes from storage
  const loadResumes = useCallback(async () => {
    if (!userId) {
      setResumes([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: listError } = await resumeStorage.list(userId);
      
      if (listError) {
        // If folder doesn't exist, that's okay - user has no resumes yet
        if (listError.message?.includes('not found')) {
          setResumes([]);
        } else {
          throw listError;
        }
      } else {
        // Filter out any non-file entries and format the data
        const validResumes = (data || [])
          .filter(file => file.name && !file.name.endsWith('/'))
          .map(file => ({
            id: file.id || file.name,
            name: file.name.split('_').slice(1).join('_') || file.name, // Remove timestamp prefix
            originalName: file.name,
            path: file.path,
            url: file.url,
            size: file.metadata?.size || 0,
            createdAt: file.created_at || file.metadata?.lastModified,
            type: file.metadata?.mimetype || 'application/pdf'
          }));
        
        setResumes(validResumes);
      }
    } catch (err) {
      console.error('Error loading resumes:', err);
      setError(err.message || 'Failed to load resumes');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Load primary resume URL from profile
  const loadPrimaryResume = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await profiles.get(userId);
      if (!error && data?.resume_url) {
        setPrimaryResumeUrl(data.resume_url);
      }
    } catch (err) {
      console.error('Error loading primary resume:', err);
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    loadResumes();
    loadPrimaryResume();
  }, [loadResumes, loadPrimaryResume]);

  // Validate file before upload
  const validateFile = useCallback((file) => {
    if (!file) {
      return { valid: false, error: 'No file selected' };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Invalid file type. Please upload a PDF or Word document.' 
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { 
        valid: false, 
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` 
      };
    }

    return { valid: true, error: null };
  }, []);

  // Upload a resume
  const uploadResume = useCallback(async (file, setAsPrimary = false) => {
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return { success: false, error: validation.error };
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate progress (Supabase doesn't provide real progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const { data, error: uploadError } = await resumeStorage.upload(userId, file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadError) {
        throw uploadError;
      }

      // If setAsPrimary, update profile
      if (setAsPrimary && data?.url) {
        await profiles.update(userId, { resume_url: data.url });
        setPrimaryResumeUrl(data.url);
      }

      // Refresh the list
      await loadResumes();

      return { success: true, data };
    } catch (err) {
      console.error('Error uploading resume:', err);
      const errorMessage = err.message || 'Failed to upload resume';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 500);
    }
  }, [userId, validateFile, loadResumes]);

  // Delete a resume
  const deleteResume = useCallback(async (filePath) => {
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    setError(null);

    try {
      const { error: deleteError } = await resumeStorage.delete(filePath);

      if (deleteError) {
        throw deleteError;
      }

      // If this was the primary resume, clear it
      const resume = resumes.find(r => r.path === filePath);
      if (resume?.url === primaryResumeUrl) {
        await profiles.update(userId, { resume_url: null });
        setPrimaryResumeUrl(null);
      }

      // Update local state
      setResumes(prev => prev.filter(r => r.path !== filePath));

      return { success: true };
    } catch (err) {
      console.error('Error deleting resume:', err);
      const errorMessage = err.message || 'Failed to delete resume';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [userId, resumes, primaryResumeUrl]);

  // Set a resume as primary
  const setPrimaryResume = useCallback(async (resumeUrl) => {
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    setError(null);

    try {
      const { error: updateError } = await profiles.update(userId, { resume_url: resumeUrl });

      if (updateError) {
        throw updateError;
      }

      setPrimaryResumeUrl(resumeUrl);
      return { success: true };
    } catch (err) {
      console.error('Error setting primary resume:', err);
      const errorMessage = err.message || 'Failed to set primary resume';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [userId]);

  // Get file type icon/label
  const getFileTypeInfo = useCallback((type) => {
    if (type === 'application/pdf') {
      return { icon: 'PDF', color: 'text-red-400 bg-red-500/20' };
    }
    if (type.includes('word') || type.includes('document')) {
      return { icon: 'DOC', color: 'text-blue-400 bg-blue-500/20' };
    }
    return { icon: 'FILE', color: 'text-slate-400 bg-slate-500/20' };
  }, []);

  // Format file size
  const formatFileSize = useCallback((bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, []);

  return {
    resumes,
    primaryResumeUrl,
    isLoading,
    isUploading,
    uploadProgress,
    error,
    uploadResume,
    deleteResume,
    setPrimaryResume,
    refreshResumes: loadResumes,
    validateFile,
    getFileTypeInfo,
    formatFileSize,
    allowedTypes: ALLOWED_TYPES,
    maxFileSize: MAX_FILE_SIZE
  };
}
