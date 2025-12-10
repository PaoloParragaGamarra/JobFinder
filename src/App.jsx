import { useState, useEffect, useCallback } from 'react'
import { AuthPage } from './components/auth'
import { JobDashboard } from './components/jobs'
import { ProfilePage } from './components/profile'
import { SettingsPage } from './components/settings'
import { ApplicationsPage } from './components/applications'
import { SettingsProvider } from './hooks/useSettings'
import { auth } from './services/supabase'
import { profiles } from './services/profiles.service'

function App() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState('dashboard') // 'dashboard', 'profile', 'settings', or 'applications'
  const [selectedJobId, setSelectedJobId] = useState(null)

  // Helper to build user object (without extra profile fetch for performance)
  const buildUserObject = useCallback((authUser) => {
    return {
      id: authUser.id,
      name: authUser.user_metadata?.full_name || authUser.email.split('@')[0],
      email: authUser.email,
      initials: (authUser.user_metadata?.full_name || authUser.email).slice(0, 2).toUpperCase(),
      avatarUrl: authUser.user_metadata?.avatar_url || null
    }
  }, [])

  // Function to update user avatar (called from ProfilePage)
  const handleAvatarUpdate = useCallback((newAvatarUrl) => {
    setUser(prev => prev ? { ...prev, avatarUrl: newAvatarUrl } : null)
  }, [])

  // Check for existing session on mount and listen for auth changes
  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { session } = await auth.getSession()
        
        if (session?.user) {
          const userData = buildUserObject(session.user)
          setUser(userData)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Listen for auth state changes (for OAuth callbacks and session changes)
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userData = buildUserObject(session.user)
        setUser(userData)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe()
    }
  }, [buildUserObject])

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = async () => {
    try {
      await auth.signOut()
      setUser(null)
      setCurrentView('dashboard')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleShowProfile = () => {
    setCurrentView('profile')
  }

  const handleShowSettings = () => {
    setCurrentView('settings')
  }

  const handleShowApplications = () => {
    setCurrentView('applications')
  }

  const handleViewJob = (jobId) => {
    setSelectedJobId(jobId)
    setCurrentView('dashboard')
  }

  const handleBackToDashboard = () => {
    setCurrentView('dashboard')
  }

  // Show loading state
  if (isLoading) {
    return (
      <SettingsProvider userId={null}>
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
        </div>
      </SettingsProvider>
    )
  }

  // Show auth page if not logged in
  if (!user) {
    return (
      <SettingsProvider userId={null}>
        <AuthPage onLogin={handleLogin} />
      </SettingsProvider>
    )
  }

  // Show profile page
  if (currentView === 'profile') {
    return (
      <SettingsProvider userId={user.id}>
        <ProfilePage user={user} onBack={handleBackToDashboard} onAvatarUpdate={handleAvatarUpdate} />
      </SettingsProvider>
    )
  }

  // Show settings page
  if (currentView === 'settings') {
    return (
      <SettingsProvider userId={user.id}>
        <SettingsPage user={user} onBack={handleBackToDashboard} />
      </SettingsProvider>
    )
  }

  // Show applications page
  if (currentView === 'applications') {
    return (
      <SettingsProvider userId={user.id}>
        <ApplicationsPage user={user} onBack={handleBackToDashboard} onViewJob={handleViewJob} />
      </SettingsProvider>
    )
  }

  // Show dashboard if logged in
  return (
    <SettingsProvider userId={user.id}>
      <JobDashboard 
        user={user} 
        onLogout={handleLogout} 
        onShowProfile={handleShowProfile} 
        onShowSettings={handleShowSettings} 
        onShowApplications={handleShowApplications}
        initialSelectedJobId={selectedJobId}
      />
    </SettingsProvider>
  )
}

export default App
