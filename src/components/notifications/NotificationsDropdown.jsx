import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Briefcase, 
  Check, 
  CheckCheck, 
  Trash2, 
  Clock,
  ChevronRight,
  BellOff
} from 'lucide-react';

const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const NotificationItem = ({ notification, onMarkAsRead, onRemove, onViewJob }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'new_job':
        return <Briefcase size={18} className="text-amber-400" />;
      default:
        return <Bell size={18} className="text-amber-400" />;
    }
  };

  return (
    <div 
      className={`group p-4 border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors cursor-pointer ${
        !notification.read ? 'bg-amber-500/5' : ''
      }`}
      onClick={() => {
        if (!notification.read) onMarkAsRead(notification.id);
        if (notification.jobId) onViewJob(notification.jobId);
      }}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          !notification.read ? 'bg-amber-500/20' : 'bg-slate-800'
        }`}>
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${
                !notification.read ? 'text-white' : 'text-slate-300'
              }`}>
                {notification.jobTitle || notification.title}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {notification.message}
              </p>
            </div>
            
            {/* Unread indicator */}
            {!notification.read && (
              <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock size={12} />
              {formatTimeAgo(notification.timestamp)}
            </span>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification.id);
                  }}
                  className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-green-400 transition-colors"
                  title="Mark as read"
                >
                  <Check size={14} />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(notification.id);
                }}
                className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400 transition-colors"
                title="Remove"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function NotificationsDropdown({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onRemove,
  onViewJob,
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-30" onClick={onClose} />

      {/* Dropdown */}
      <div className="absolute right-0 mt-2 w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-40 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-700/50 bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-amber-400" />
              <h3 className="font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-amber-500 text-slate-900 text-xs font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={onMarkAllAsRead}
                    className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck size={16} />
                  </button>
                  <button
                    onClick={onClearAll}
                    className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                    title="Clear all"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                <BellOff size={28} className="text-slate-500" />
              </div>
              <p className="text-slate-400 font-medium">No notifications yet</p>
              <p className="text-slate-500 text-sm mt-1">
                We'll notify you when new jobs are posted
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onRemove={onRemove}
                onViewJob={onViewJob}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-slate-700/50 bg-slate-800/30">
            <button 
              onClick={onClose}
              className="w-full text-center text-sm text-slate-400 hover:text-amber-400 transition-colors flex items-center justify-center gap-1"
            >
              <span>View all activity</span>
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
