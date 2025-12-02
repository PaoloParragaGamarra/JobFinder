import { useState, useEffect, useCallback, createContext, useContext, createElement } from 'react';
import { userSettings } from '../lib/supabase';

const defaultSettings = {
  theme: 'dark', // 'light', 'dark', 'system'
  emailNotifications: true,
  pushNotifications: true,
  applicationUpdates: true,
  jobRecommendations: true,
  marketingEmails: false,
  language: 'en',
  compactView: false,
  showSalary: true,
  autoApplyProfile: true,
};

/**
 * Custom hook for managing user settings
 */
export function useSettings(userId) {
  const [settings, setSettings] = useState(() => {
    // Load from localStorage first for immediate access
    const stored = localStorage.getItem('user_settings');
    if (stored) {
      try {
        return { ...defaultSettings, ...JSON.parse(stored) };
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (settings.theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
      root.classList.toggle('light', !prefersDark);
    } else {
      root.classList.toggle('dark', settings.theme === 'dark');
      root.classList.toggle('light', settings.theme === 'light');
    }
    
    // Save to localStorage
    localStorage.setItem('user_settings', JSON.stringify(settings));
  }, [settings]);

  // Listen for system theme changes
  useEffect(() => {
    if (settings.theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      document.documentElement.classList.toggle('dark', e.matches);
      document.documentElement.classList.toggle('light', !e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme]);

  // Fetch settings from database
  const fetchSettings = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await userSettings.get(userId);
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching settings:', fetchError);
      } else if (data) {
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Update a single setting
  const updateSetting = useCallback(async (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));

    if (userId) {
      try {
        await userSettings.update(userId, { [key]: value });
      } catch (err) {
        console.error('Error saving setting:', err);
      }
    }
  }, [userId]);

  // Update multiple settings
  const updateSettings = useCallback(async (updates) => {
    setSettings(prev => ({ ...prev, ...updates }));
    setIsSaving(true);
    setError(null);

    if (userId) {
      try {
        const { error: updateError } = await userSettings.update(userId, updates);
        if (updateError) {
          setError(updateError.message);
          return { success: false, error: updateError.message };
        }
      } catch (err) {
        setError('Failed to save settings');
        return { success: false, error: 'Failed to save settings' };
      } finally {
        setIsSaving(false);
      }
    }

    setIsSaving(false);
    return { success: true };
  }, [userId]);

  // Reset to defaults
  const resetSettings = useCallback(async () => {
    setSettings(defaultSettings);
    localStorage.setItem('user_settings', JSON.stringify(defaultSettings));

    if (userId) {
      try {
        await userSettings.update(userId, defaultSettings);
      } catch (err) {
        console.error('Error resetting settings:', err);
      }
    }
  }, [userId]);

  return {
    settings,
    isLoading,
    isSaving,
    error,
    updateSetting,
    updateSettings,
    resetSettings,
  };
}

// Theme context for easy access throughout the app
const SettingsContext = createContext({
  settings: defaultSettings,
  updateSetting: () => {},
  updateSettings: () => {},
  resetSettings: () => {},
  isLoading: false,
  isSaving: false,
});

export const useSettingsContext = () => useContext(SettingsContext);

// Settings Provider component
export function SettingsProvider({ userId, children }) {
  const settingsHook = useSettings(userId);

  return createElement(SettingsContext.Provider, { value: settingsHook }, children);
}

export { SettingsContext, defaultSettings };
