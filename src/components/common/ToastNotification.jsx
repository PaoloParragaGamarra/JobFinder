import React, { useEffect, useState } from 'react';
import { Briefcase, X } from 'lucide-react';

/**
 * Toast notification component for displaying temporary messages
 */
export default function ToastNotification({ notification, onDismiss, onView, duration = 5000 }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animate in
    const showTimer = setTimeout(() => setIsVisible(true), 50);

    // Auto dismiss
    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
    };
  }, [duration]);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300);
  };

  const handleView = () => {
    if (notification.jobId) {
      onView(notification.jobId);
    }
    handleDismiss();
  };

  return (
    <div
      className={`transform transition-all duration-300 ease-out ${
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-w-sm">
        <div className="p-4">
          <div className="flex gap-3">
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Briefcase size={20} className="text-amber-400" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-white truncate">
                  {notification.title}
                </p>
                <button
                  onClick={handleDismiss}
                  className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                {notification.jobTitle} at {notification.company}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleView}
              className="flex-1 px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-sm font-medium rounded-lg transition-colors"
            >
              View Job
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium rounded-lg transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-slate-700">
          <div
            className="h-full bg-amber-500 transition-all ease-linear"
            style={{
              width: '100%',
              animation: `shrink ${duration}ms linear forwards`,
            }}
          />
        </div>

        <style>{`
          @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}</style>
      </div>
    </div>
  );
}

/**
 * Container for managing multiple toast notifications
 */
export function ToastContainer({ toasts, onDismiss, onView }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3">
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          notification={toast}
          onDismiss={onDismiss}
          onView={onView}
        />
      ))}
    </div>
  );
}
