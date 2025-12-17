import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import CallingInterface from './components/CallingInterface'
import ContactsPage from './components/ContactsPage'
import Analytics from './components/Analytics'
import HowToUse from './components/HowToUse'
import Settings from './components/Settings'
import FilteredSessionPage from './components/FilteredSessionPage'
import SessionReviewPage from './components/SessionReviewPage'
import Login from './components/Login'
import OkCodesAdmin from './components/OkCodesAdmin'
import Sidebar from './components/Sidebar'
import { useAuth } from './hooks/useAuth'
import { useTheme } from './hooks/useTheme'

const VIEW_STATE_KEY = 'r7_current_view'
const CONTACT_INDEX_KEY = 'r7_contact_index'
const FILTERED_SESSION_KEY = 'r7_filtered_session'

function App() {
  const { isAuthenticated, login, logout } = useAuth();
  const { theme } = useTheme(); // Initialize theme system

  // Initialize state from localStorage if available
  const [currentView, setCurrentView] = useState(() => {
    const saved = localStorage.getItem(VIEW_STATE_KEY)
    return saved || 'dashboard'
  })
  const [currentContactIndex, setCurrentContactIndex] = useState(() => {
    const saved = localStorage.getItem(CONTACT_INDEX_KEY)
    return saved ? parseInt(saved, 10) : 0
  })
  const [filteredSession, setFilteredSession] = useState(() => {
    const saved = localStorage.getItem(FILTERED_SESSION_KEY)
    return saved ? JSON.parse(saved) : null
  })
  const [filterCriteria, setFilterCriteria] = useState(null)

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

  // Persist view state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(VIEW_STATE_KEY, currentView)
  }, [currentView])

  // Persist contact index to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CONTACT_INDEX_KEY, currentContactIndex.toString())
  }, [currentContactIndex])

  // Persist filtered session to localStorage whenever it changes
  useEffect(() => {
    if (filteredSession) {
      localStorage.setItem(FILTERED_SESSION_KEY, JSON.stringify(filteredSession))
    } else {
      localStorage.removeItem(FILTERED_SESSION_KEY)
    }
  }, [filteredSession])

  const handleStartCalling = () => {
    setCurrentContactIndex(0)
    setFilteredSession(null) // Clear any filtered session
    setCurrentView('calling')
  }

  const handleStartFilteredSession = () => {
    setCurrentView('filteredSession')
  }

  const handleReviewFilters = (criteria) => {
    setFilterCriteria(criteria)
    setCurrentView('sessionReview')
  }

  const handleStartFilteredCalling = () => {
    if (filterCriteria && filterCriteria.contacts) {
      setFilteredSession(filterCriteria.contacts)
      setCurrentContactIndex(0)
      setCurrentView('calling')
    }
  }

  const handleBackToFilters = () => {
    setCurrentView('filteredSession')
  }

  const handleBackToDashboard = () => {
    setCurrentView('dashboard')
    setCurrentContactIndex(0)
    setFilteredSession(null) // Clear filtered session when returning to dashboard
    setFilterCriteria(null)
  }

  const handleViewContacts = () => {
    setCurrentView('contacts')
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

  const handleManageOkCodes = () => {
    setCurrentView('okCodes')
  }

  const handleNextContact = () => {
    setCurrentContactIndex(prev => prev + 1)
  }

  // Helper to determine the main view (excluding modals like sessionReview and okCodes)
  const getMainView = () => {
    if (currentView === 'sessionReview' || currentView === 'okCodes') {
      return 'filteredSession'; // Default fallback for sub-views
    }
    return currentView;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar currentView={getMainView()} onNavigate={setCurrentView} />

      <div className="flex-1 overflow-y-auto">
        {currentView === 'dashboard' && (
          <Dashboard
            onStartCalling={handleStartCalling}
            onStartFilteredSession={handleStartFilteredSession}
            onViewContacts={handleViewContacts}
            onViewAnalytics={handleViewAnalytics}
            onViewHowToUse={handleViewHowToUse}
            onViewSettings={handleViewSettings}
          />
        )}
        {currentView === 'filteredSession' && (
          <FilteredSessionPage
            onBackToDashboard={handleBackToDashboard}
            onReview={handleReviewFilters}
          />
        )}
        {currentView === 'sessionReview' && filterCriteria && (
          <SessionReviewPage
            filterCriteria={filterCriteria}
            onBackToFilters={handleBackToFilters}
            onStartSession={handleStartFilteredCalling}
          />
        )}
        {currentView === 'calling' && (
          <CallingInterface
            contactIndex={currentContactIndex}
            filteredContacts={filteredSession}
            onBackToDashboard={handleBackToDashboard}
            onNextContact={handleNextContact}
          />
        )}
        {currentView === 'contacts' && (
          <ContactsPage onBackToDashboard={handleBackToDashboard} />
        )}
        {currentView === 'analytics' && (
          <Analytics onBackToDashboard={handleBackToDashboard} />
        )}
        {currentView === 'howto' && (
          <HowToUse onBackToDashboard={handleBackToDashboard} />
        )}
        {currentView === 'settings' && (
          <Settings
            onBackToDashboard={handleBackToDashboard}
            onLogout={logout}
            onManageOkCodes={handleManageOkCodes}
          />
        )}
        {currentView === 'okCodes' && (
          <OkCodesAdmin onBack={handleViewSettings} />
        )}
      </div>
    </div>
  )
}

export default App
