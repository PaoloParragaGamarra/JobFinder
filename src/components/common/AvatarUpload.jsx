import React, { useRef, useState } from 'react';
import {
  Camera,
  Trash2,
  Loader2,
  AlertCircle,
  Check,
  X,
  Upload,
  User
} from 'lucide-react';
import { useAvatar } from '../../hooks/useAvatar';

/**
 * Avatar Upload Component with preview and edit functionality
 */
export default function AvatarUpload({ userId, currentAvatarUrl, userName, onAvatarChange }) {
  const {
    isUploading,
    uploadProgress,
    error,
    uploadAvatar,
    deleteAvatar,
    clearError,
    maxFileSize
  } = useAvatar(userId);

  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Get display initials from name
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload the file
    const result = await uploadAvatar(file);
    
    if (result.success) {
      setSuccessMessage('Profile picture updated!');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Notify parent of the change
      if (onAvatarChange && result.data?.url) {
        onAvatarChange(result.data.url);
      }
    } else {
      // Clear preview on error
      setPreviewUrl(null);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    const result = await deleteAvatar();
    
    if (result.success) {
      setPreviewUrl(null);
      setShowDeleteConfirm(false);
      setSuccessMessage('Profile picture removed');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      if (onAvatarChange) {
        onAvatarChange(null);
      }
    }
  };

  const displayUrl = previewUrl || currentAvatarUrl;
  const hasAvatar = !!displayUrl;

  return (
    <div className="relative group">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Avatar Display */}
      <div className="relative">
        {hasAvatar ? (
          <img
            src={displayUrl}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover shadow-xl shadow-amber-500/20 border-4 border-slate-800"
          />
        ) : (
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-4xl font-bold text-slate-900 shadow-xl shadow-amber-500/20 border-4 border-slate-800">
            {getInitials(userName)}
          </div>
        )}

        {/* Upload Progress Overlay */}
        {isUploading && (
          <div className="absolute inset-0 rounded-full bg-black/70 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-2" />
            <span className="text-xs text-white font-medium">{uploadProgress}%</span>
          </div>
        )}

        {/* Hover Overlay (when not uploading) */}
        {!isUploading && (
          <div 
            className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="w-8 h-8 text-white" />
          </div>
        )}

        {/* Delete Button (only show if has avatar and not uploading) */}
        {hasAvatar && !isUploading && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteConfirm(true);
            }}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center text-white shadow-lg transition-colors opacity-0 group-hover:opacity-100"
            title="Remove profile picture"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-2 animate-fadeIn">
          <Check size={14} className="text-green-400" />
          <span className="text-green-400 text-xs font-medium">{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2">
          <AlertCircle size={14} className="text-red-400" />
          <span className="text-red-400 text-xs font-medium">{error}</span>
          <button onClick={clearError} className="text-red-400 hover:text-red-300">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 p-4 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 w-64">
            <p className="text-white text-sm mb-4">Remove your profile picture?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-400 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </>
      )}

      {/* Upload Hint */}
      <p className="text-center text-xs text-slate-500 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        Click to change • Max {maxFileSize / 1024 / 1024}MB
      </p>
    </div>
  );
}
