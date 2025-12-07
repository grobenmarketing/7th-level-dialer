import { useState } from 'react'
import Dashboard from './components/Dashboard'
import CallingInterface from './components/CallingInterface'
import ContactsPage from './components/ContactsPage'
import AvatarManager from './components/AvatarManager'
import Analytics from './components/Analytics'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [currentContactIndex, setCurrentContactIndex] = useState(0)

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
    </div>
  )
}

export default App
