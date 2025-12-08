import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import CallingInterface from './components/CallingInterface'
import ContactsPage from './components/ContactsPage'
import AvatarManager from './components/AvatarManager'
import Analytics from './components/Analytics'
import HowToUse from './components/HowToUse'
import Settings from './components/Settings'

const VIEW_STATE_KEY = 'r7_current_view'
const CONTACT_INDEX_KEY = 'r7_contact_index'

function App() {
  // Initialize state from localStorage if available
  const [currentView, setCurrentView] = useState(() => {
    const saved = localStorage.getItem(VIEW_STATE_KEY)
    return saved || 'dashboard'
  })
  const [currentContactIndex, setCurrentContactIndex] = useState(() => {
    const saved = localStorage.getItem(CONTACT_INDEX_KEY)
    return saved ? parseInt(saved, 10) : 0
  })

  // Persist view state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(VIEW_STATE_KEY, currentView)
  }, [currentView])

  // Persist contact index to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CONTACT_INDEX_KEY, currentContactIndex.toString())
  }, [currentContactIndex])

  const handleStartCalling = () => {
    setCurrentContactIndex(0)
    setCurrentView('calling')
  }

  const handleBackToDashboard = () => {
    setCurrentView('dashboard')
    setCurrentContactIndex(0)
  }

  const handleViewContacts = () => {
    setCurrentView('contacts')
  }

  const handleManageAvatars = () => {
    setCurrentView('avatars')
  }

  const handleViewAnalytics = () => {
    setCurrentView('analytics')
  }

  const handleViewHowToUse = () => {
    setCurrentView('howto')
  }

  const handleViewSettings = () => {
    setCurrentView('settings')
  }

  const handleNextContact = () => {
    setCurrentContactIndex(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'dashboard' && (
        <Dashboard
          onStartCalling={handleStartCalling}
          onViewContacts={handleViewContacts}
          onManageAvatars={handleManageAvatars}
          onViewAnalytics={handleViewAnalytics}
          onViewHowToUse={handleViewHowToUse}
          onViewSettings={handleViewSettings}
        />
      )}
      {currentView === 'calling' && (
        <CallingInterface
          contactIndex={currentContactIndex}
          onBackToDashboard={handleBackToDashboard}
          onNextContact={handleNextContact}
        />
      )}
      {currentView === 'contacts' && (
        <ContactsPage onBackToDashboard={handleBackToDashboard} />
      )}
      {currentView === 'avatars' && (
        <AvatarManager onBack={handleBackToDashboard} />
      )}
      {currentView === 'analytics' && (
        <Analytics onBackToDashboard={handleBackToDashboard} />
      )}
      {currentView === 'howto' && (
        <HowToUse onBackToDashboard={handleBackToDashboard} />
      )}
      {currentView === 'settings' && (
        <Settings onBackToDashboard={handleBackToDashboard} />
      )}
    </div>
  )
}

export default App
