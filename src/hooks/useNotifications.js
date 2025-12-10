import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabase';

/**
 * Custom hook for managing job notifications
 * Subscribes to real-time job updates and maintains notification state
 */
export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialLoadRef = useRef(true);
  const processedJobIdsRef = useRef(new Set());

  // Load notifications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`notifications_${userId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotifications(parsed.notifications || []);
        setUnreadCount(parsed.unreadCount || 0);
        // Track already processed job IDs
        (parsed.notifications || []).forEach(n => {
          if (n.jobId) processedJobIdsRef.current.add(n.jobId);
        });
      } catch (e) {
        console.error('Error parsing stored notifications:', e);
      }
    }
    setIsLoading(false);
  }, [userId]);

  // Save notifications to localStorage when they change
  useEffect(() => {
    if (!isLoading && userId) {
      localStorage.setItem(`notifications_${userId}`, JSON.stringify({
        notifications: notifications.slice(0, 50), // Keep only last 50
        unreadCount,
      }));
    }
  }, [notifications, unreadCount, userId, isLoading]);

  // Add a new notification
  const addNotification = useCallback((notification) => {
    // Prevent duplicate notifications for the same job
    if (notification.jobId && processedJobIdsRef.current.has(notification.jobId)) {
      return null;
    }

    const newNotification = {
      id: notification.id || Date.now().toString(),
      type: notification.type || 'new_job',
      title: notification.title,
      message: notification.message,
      jobId: notification.jobId,
      jobTitle: notification.jobTitle,
      company: notification.company,
      timestamp: notification.timestamp || new Date().toISOString(),
      read: false,
    };

    if (notification.jobId) {
      processedJobIdsRef.current.add(notification.jobId);
    }

    setNotifications(prev => [newNotification, ...prev].slice(0, 50));
    setUnreadCount(prev => prev + 1);

    console.log('🔔 New notification added:', newNotification);
    return newNotification;
  }, []);

  // Mark a notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Remove a specific notification
  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  }, []);

  // Subscribe to real-time job updates
  useEffect(() => {
    if (!userId) return;

    console.log('📡 Setting up real-time subscription for new jobs...');

    const channel = supabase
      .channel('new-jobs-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'jobs',
        },
        (payload) => {
          console.log('📨 Received real-time event:', payload);
          
          // Skip initial load to avoid flooding with existing jobs
          if (isInitialLoadRef.current) {
            console.log('⏳ Skipping - still in initial load period');
            return;
          }

          const job = payload.new;
          
          // Only notify for active jobs
          if (!job.is_active) {
            console.log('⏭️ Skipping - job is not active');
            return;
          }

          console.log('✨ New job detected:', job.title, 'at', job.company_name);
          
          addNotification({
            id: `job_${job.id}_${Date.now()}`,
            type: 'new_job',
            title: 'New Job Posted',
            message: `${job.company_name} is hiring!`,
            jobId: job.id,
            jobTitle: job.title,
            company: job.company_name,
            timestamp: job.posted_at || new Date().toISOString(),
          });
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
      });

    // Set initial load to false after a short delay
    const timer = setTimeout(() => {
      isInitialLoadRef.current = false;
      console.log('✅ Initial load complete - now listening for new jobs');
    }, 3000);

    return () => {
      console.log('🔌 Cleaning up subscription');
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [userId, addNotification]);

  return {
    notifications,
    unreadCount,
    isLoading,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    removeNotification,
  };
}
