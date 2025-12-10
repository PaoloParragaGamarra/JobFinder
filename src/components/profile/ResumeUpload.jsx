import React, { useRef, useState } from 'react';
import {
  Upload,
  FileText,
  Trash2,
  Download,
  Star,
  StarOff,
  AlertCircle,
  Check,
  Loader2,
  X,
  File,
  ExternalLink
} from 'lucide-react';
import { useResume } from '../../hooks/useResume';

/**
 * Resume Upload and Management Component
 * Allows users to upload, view, delete, and set primary resume
 */
export default function ResumeUpload({ userId, onResumeSelect, showSelectButton = false }) {
  const {
    resumes,
    primaryResumeUrl,
    isLoading,
    isUploading,
    uploadProgress,
    error,
    uploadResume,
    deleteResume,
    setPrimaryResume,
    getFileTypeInfo,
    formatFileSize,
    allowedTypes,
    maxFileSize
  } = useResume(userId);

  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer?.files;
    if (files?.[0]) {
      await handleUpload(files[0]);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleUpload(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async (file) => {
    const setAsPrimary = resumes.length === 0; // Auto-set as primary if first resume
    const result = await uploadResume(file, setAsPrimary);
    
    if (result.success) {
      setSuccessMessage('Resume uploaded successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleDelete = async (filePath) => {
    const result = await deleteResume(filePath);
    if (result.success) {
      setDeleteConfirm(null);
      setSuccessMessage('Resume deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleSetPrimary = async (resumeUrl) => {
    const result = await setPrimaryResume(resumeUrl);
    if (result.success) {
      setSuccessMessage('Primary resume updated!');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const openResume = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3 animate-fadeIn">
          <Check className="text-green-400 flex-shrink-0" size={20} />
          <p className="text-green-400">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
          <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          dragActive
            ? 'border-amber-500 bg-amber-500/10'
            : 'border-slate-700 hover:border-slate-600 bg-slate-800/30'
        } ${isUploading ? 'pointer-events-none opacity-70' : 'cursor-pointer'}`}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isUploading ? (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto" />
            <div className="w-full max-w-xs mx-auto">
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-slate-400 mt-2">Uploading... {uploadProgress}%</p>
            </div>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/20 flex items-center justify-center">
              <Upload className="w-8 h-8 text-amber-500" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">
              {dragActive ? 'Drop your resume here' : 'Upload Resume'}
            </h4>
            <p className="text-slate-400 text-sm mb-3">
              Drag and drop your resume or click to browse
            </p>
            <p className="text-slate-500 text-xs">
              Supported formats: PDF, DOC, DOCX (max {maxFileSize / 1024 / 1024}MB)
            </p>
          </>
        )}
      </div>

      {/* Resume List */}
      {resumes.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <FileText size={16} className="text-amber-500" />
            Your Resumes ({resumes.length})
          </h4>

          <div className="space-y-2">
            {resumes.map((resume) => {
              const fileInfo = getFileTypeInfo(resume.type);
              const isPrimary = resume.url === primaryResumeUrl;

              return (
                <div
                  key={resume.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    isPrimary
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                  }`}
                >
                  {/* File Type Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${fileInfo.color}`}>
                    <span className="text-xs font-bold">{fileInfo.icon}</span>
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-white truncate">{resume.name}</h5>
                      {isPrimary && (
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full flex items-center gap-1">
                          <Star size={10} className="fill-amber-400" />
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400">
                      {formatFileSize(resume.size)}
                      {resume.createdAt && (
                        <span className="ml-2">
                          • {new Date(resume.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* Select Button (for apply flow) */}
                    {showSelectButton && onResumeSelect && (
                      <button
                        onClick={() => onResumeSelect(resume)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-medium rounded-lg transition-colors"
                      >
                        Select
                      </button>
                    )}

                    {/* Set as Primary */}
                    {!isPrimary && (
                      <button
                        onClick={() => handleSetPrimary(resume.url)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-amber-400 transition-all"
                        title="Set as primary resume"
                      >
                        <StarOff size={16} />
                      </button>
                    )}

                    {/* View/Download */}
                    <button
                      onClick={() => openResume(resume.url)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                      title="View resume"
                    >
                      <ExternalLink size={16} />
                    </button>

                    {/* Delete */}
                    {deleteConfirm === resume.path ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(resume.path)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all"
                          title="Confirm delete"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-400 transition-all"
                          title="Cancel"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(resume.path)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-all"
                        title="Delete resume"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {resumes.length === 0 && !isUploading && (
        <div className="text-center py-6">
          <File className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No resumes uploaded yet</p>
          <p className="text-slate-500 text-sm mt-1">
            Upload your resume to apply to jobs faster
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Compact Resume Selector for Apply Modal
 */
export function ResumeSelector({ userId, selectedResume, onSelect, onUploadNew }) {
  const {
    resumes,
    primaryResumeUrl,
    isLoading,
    getFileTypeInfo,
    formatFileSize
  } = useResume(userId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading resumes...</span>
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <button
        onClick={onUploadNew}
        className="flex items-center gap-2 px-4 py-3 w-full bg-slate-800/50 border border-dashed border-slate-600 rounded-xl text-slate-400 hover:text-white hover:border-slate-500 transition-all"
      >
        <Upload size={18} />
        <span>Upload a resume to apply</span>
      </button>
    );
  }

  return (
    <div className="space-y-2">
      {resumes.map((resume) => {
        const fileInfo = getFileTypeInfo(resume.type);
        const isPrimary = resume.url === primaryResumeUrl;
        const isSelected = selectedResume?.url === resume.url;

        return (
          <button
            key={resume.id}
            onClick={() => onSelect(resume)}
            className={`flex items-center gap-3 w-full p-3 rounded-xl border transition-all ${
              isSelected
                ? 'bg-amber-500/20 border-amber-500/50'
                : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${fileInfo.color}`}>
              <span className="text-xs font-bold">{fileInfo.icon}</span>
            </div>
            <div className="flex-1 text-left">
              <p className={`font-medium truncate ${isSelected ? 'text-amber-400' : 'text-white'}`}>
                {resume.name}
              </p>
              <p className="text-xs text-slate-400">{formatFileSize(resume.size)}</p>
            </div>
            {isPrimary && (
              <Star size={14} className="text-amber-500 fill-amber-500 flex-shrink-0" />
            )}
            {isSelected && (
              <Check size={18} className="text-amber-400 flex-shrink-0" />
            )}
          </button>
        );
      })}
      
      <button
        onClick={onUploadNew}
        className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm text-slate-400 hover:text-amber-400 transition-colors"
      >
        <Upload size={14} />
        <span>Upload new resume</span>
      </button>
    </div>
  );
}
