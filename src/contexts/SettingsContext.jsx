import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { DEFAULT_SETTINGS } from '../constants'
import { userSettings } from '../services'
import { supabase } from '../services'

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Load settings when user changes
  useEffect(() => {
    async function loadSettings() {
      if (!user) {
        setSettings(DEFAULT_SETTINGS)
        setLoading(false)
        return
      }

      try {
        const { data, error } = await userSettings.get(user.id)
        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error loading settings:', error)
        }
        setSettings(data || DEFAULT_SETTINGS)
      } catch (err) {
        console.error('Error loading settings:', err)
        setSettings(DEFAULT_SETTINGS)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [user])

  // Apply theme
  useEffect(() => {
    const applyTheme = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const isDark = settings.theme === 'dark' || (settings.theme === 'system' && prefersDark)
      
      document.documentElement.classList.toggle('dark', isDark)
    }

    applyTheme()

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (settings.theme === 'system') applyTheme()
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [settings.theme])

  const updateSettings = useCallback(async (newSettings) => {
    const merged = { ...settings, ...newSettings }
    setSettings(merged)

    if (user) {
      try {
        const { error } = await userSettings.update(user.id, merged)
        if (error) {
          console.error('Error saving settings:', error)
          // Revert on error
          setSettings(settings)
          return { success: false, error }
        }
      } catch (err) {
        console.error('Error saving settings:', err)
        setSettings(settings)
        return { success: false, error: err }
      }
    }

    return { success: true }
  }, [settings, user])

  const value = {
    settings,
    updateSettings,
    loading
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettingsContext() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettingsContext must be used within a SettingsProvider')
  }
  return context
}

export { SettingsContext }
