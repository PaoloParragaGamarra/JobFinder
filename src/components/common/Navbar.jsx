import React, { useEffect, useRef } from 'react';
import { Briefcase, TrendingUp, Bell, Bookmark, Settings, LogOut, User, ClipboardList } from 'lucide-react';
import NotificationsDropdown from '../notifications/NotificationsDropdown';

const FilterButton = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-md transition-all font-medium text-sm ${
      isActive 
        ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/30' 
        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
    }`}
  >
    {label}
  </button>
);

const UserMenu = ({ user, isOpen, onToggle, onClose, onLogout, onShowSavedJobs, onShowProfile, onShowSettings, onShowApplications, savedCount, applicationsCount }) => (
  <div className="relative">
    <button 
      onClick={onToggle}
      className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-bold text-slate-900 cursor-pointer hover:scale-105 transition-transform shadow-lg shadow-amber-500/20 overflow-hidden"
    >
      {user?.avatarUrl ? (
        <img 
          src={user.avatarUrl} 
          alt={user.name || 'User'} 
          className="w-full h-full object-cover"
        />
      ) : (
        user?.initials || 'JD'
      )}
    </button>
    
    {isOpen && (
      <>
        <div className="fixed inset-0 z-10" onClick={onClose} />
        <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-bold text-slate-900 overflow-hidden">
                {user?.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt={user.name || 'User'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.initials || 'JD'
                )}
              </div>
              <div>
                <p className="font-semibold text-white">{user?.name || 'User'}</p>
                <p className="text-sm text-slate-400">{user?.email || 'user@example.com'}</p>
              </div>
            </div>
          </div>
          <div className="p-2">
            <button 
              onClick={() => { onShowProfile(); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all text-sm"
            >
              <User size={16} />
              <span>My Profile</span>
            </button>
            <button 
              onClick={() => { onShowApplications(); onClose(); }}
              className="w-full flex items-center justify-between px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all text-sm"
            >
              <span className="flex items-center gap-3">
                <ClipboardList size={16} />
                <span>My Applications</span>
              </span>
              {applicationsCount > 0 && (
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full">
                  {applicationsCount}
                </span>
              )}
            </button>
            <button 
              onClick={onShowSavedJobs}
              className="w-full flex items-center justify-between px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all text-sm"
            >
              <span className="flex items-center gap-3">
                <Bookmark size={16} />
                <span>Saved Jobs</span>
              </span>
              {savedCount > 0 && (
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full">
                  {savedCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => { onShowSettings(); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all text-sm"
            >
              <Settings size={16} />
              <span>Settings</span>
            </button>
          </div>
          <div className="p-2 border-t border-slate-700">
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all text-sm"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </>
    )}
  </div>
);

export default function Navbar({ 
  user, 
  filterType, 
  onFilterChange, 
  jobCount, 
  savedCount,
  applicationsCount = 0,
  onShowSavedJobs,
  onShowProfile,
  onShowSettings,
  onShowApplications,
  onLogout,
  notifications = [],
  unreadNotificationCount = 0,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onClearAllNotifications,
  onRemoveNotification,
  onViewJob,
  hasNewNotification = false,
}) {
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [isRinging, setIsRinging] = React.useState(false);
  const prevUnreadCountRef = useRef(unreadNotificationCount);

  // Trigger bell animation when new notification arrives
  useEffect(() => {
    if (unreadNotificationCount > prevUnreadCountRef.current) {
      // New notification arrived!
      setIsRinging(true);
      
      // Play notification sound
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      } catch (e) {
        console.log('Audio notification not supported');
      }

      // Stop animation after 1 second
      const timer = setTimeout(() => {
        setIsRinging(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
    prevUnreadCountRef.current = unreadNotificationCount;
  }, [unreadNotificationCount]);

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 backdrop-blur-sm">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section - Logo & Nav */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Briefcase className="text-slate-900" size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">JobFinder</h1>
                <p className="text-xs text-slate-400">Find your dream job</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
              <FilterButton label="All Jobs" isActive={filterType === 'all'} onClick={() => onFilterChange('all')} />
              <FilterButton label="Full-time" isActive={filterType === 'full-time'} onClick={() => onFilterChange('full-time')} />
              <FilterButton label="Contract" isActive={filterType === 'contract'} onClick={() => onFilterChange('contract')} />
            </div>
          </div>

          {/* Right Section - Stats & Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <TrendingUp size={16} className="text-amber-400" />
              <span className="text-sm font-medium text-slate-300">{jobCount} opportunities</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative w-10 h-10 flex items-center justify-center rounded-lg border transition-all ${
                    unreadNotificationCount > 0
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 hover:bg-amber-500/30'
                      : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700/50'
                  } ${isRinging ? 'animate-pulse' : ''}`}
                >
                  <Bell 
                    size={18} 
                    className={isRinging ? 'animate-bell-ring' : ''} 
                  />
                  {unreadNotificationCount > 0 && (
                    <span className={`absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-slate-900 text-xs font-bold rounded-full flex items-center justify-center ${
                      isRinging ? 'animate-ping-once' : ''
                    }`}>
                      {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                    </span>
                  )}
                  {/* Ripple effect for new notifications */}
                  {isRinging && (
                    <span className="absolute inset-0 rounded-lg bg-amber-500/30 animate-ping" />
                  )}
                </button>
                
                <NotificationsDropdown
                  isOpen={showNotifications}
                  onClose={() => setShowNotifications(false)}
                  notifications={notifications}
                  unreadCount={unreadNotificationCount}
                  onMarkAsRead={onMarkNotificationAsRead}
                  onMarkAllAsRead={onMarkAllNotificationsAsRead}
                  onClearAll={onClearAllNotifications}
                  onRemove={onRemoveNotification}
                  onViewJob={(jobId) => {
                    onViewJob(jobId);
                    setShowNotifications(false);
                  }}
                />
              </div>
              <button 
                onClick={onShowSavedJobs}
                className={`relative w-10 h-10 flex items-center justify-center rounded-lg border transition-all ${
                  savedCount > 0 
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 hover:bg-amber-500/30' 
                    : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Bookmark size={18} />
                {savedCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-slate-900 text-xs font-bold rounded-full flex items-center justify-center">
                    {savedCount}
                  </span>
                )}
              </button>
              <button 
                onClick={onShowSettings}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-all text-slate-300 hover:text-white"
              >
                <Settings size={18} />
              </button>
            </div>

            <div className="h-8 w-px bg-slate-700/50" />

            <button 
              onClick={onShowApplications}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-semibold rounded-lg hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20 text-sm flex items-center gap-2"
            >
              <ClipboardList size={16} />
              <span>My Applications</span>
              {applicationsCount > 0 && (
                <span className="px-1.5 py-0.5 bg-slate-900/20 rounded-full text-xs font-bold">
                  {applicationsCount}
                </span>
              )}
            </button>

            <UserMenu 
              user={user}
              isOpen={showUserMenu}
              onToggle={() => setShowUserMenu(!showUserMenu)}
              onClose={() => setShowUserMenu(false)}
              onLogout={onLogout}
              onShowSavedJobs={() => { onShowSavedJobs(); setShowUserMenu(false); }}
              onShowProfile={onShowProfile}
              onShowSettings={onShowSettings}
              onShowApplications={() => { onShowApplications(); setShowUserMenu(false); }}
              savedCount={savedCount}
              applicationsCount={applicationsCount}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
