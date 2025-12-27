import { useState, useEffect } from 'react'
import DashboardLayout from './components/DashboardLayout'
import Dashboard from './components/Dashboard'
import CallingInterface from './components/CallingInterface'
import HowToUse from './components/HowToUse'
import Settings from './components/Settings'
import FilteredSessionPage from './components/FilteredSessionPage'
import SessionReviewPage from './components/SessionReviewPage'
import Login from './components/Login'
import OkCodesAdmin from './components/OkCodesAdmin'
import DatabaseManager from './components/DatabaseManager'
import { useAuth } from './hooks/useAuth'

const VIEW_STATE_KEY = 'r7_current_view'
const CONTACT_INDEX_KEY = 'r7_contact_index'
const FILTERED_SESSION_KEY = 'r7_filtered_session'

function App() {
  const { isAuthenticated, login, logout } = useAuth();

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

  // Reset to dashboard when authentication state changes to true (user logs in)
  useEffect(() => {
    if (isAuthenticated) {
      setCurrentView('dashboard')
    }
  }, [isAuthenticated])

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

  // Generic navigation handler - replaces 13 individual functions
  const navigate = (view, options = {}) => {
    setCurrentView(view)

    // Handle view-specific state changes
    if (options.resetSession) {
      setCurrentContactIndex(0)
      setFilteredSession(null)
      setFilterCriteria(null)
    }
    if (options.filterCriteria) {
      setFilterCriteria(options.filterCriteria)
    }
    if (options.startFilteredCalling && filterCriteria?.contacts) {
      setFilteredSession(filterCriteria.contacts)
      setCurrentContactIndex(0)
    }
    if (options.resetContactIndex) {
      setCurrentContactIndex(0)
    }
  }

  // Simplified handlers using navigate
  const handleStartCalling = (limitedContacts = null) => {
    if (limitedContacts) {
      setFilteredSession(limitedContacts);
      setCurrentContactIndex(0);
      setCurrentView('calling');
    } else {
      navigate('calling', { resetSession: true });
    }
  }
  const handleStartFilteredSession = () => navigate('filteredSession')
  const handleReviewFilters = (criteria) => navigate('sessionReview', { filterCriteria: criteria })
  const handleStartFilteredCalling = () => navigate('calling', { startFilteredCalling: true })
  const handleBackToFilters = () => navigate('filteredSession')
  const handleBackToDashboard = () => navigate('dashboard', { resetSession: true })
  const handleNextContact = () => setCurrentContactIndex(prev => prev + 1)

  // Show login screen if not authenticated (after all hooks are defined)
  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

  return (
    <DashboardLayout currentView={currentView} onNavigate={navigate}>
      {currentView === 'dashboard' && (
        <Dashboard
          onStartCalling={handleStartCalling}
          onStartFilteredSession={handleStartFilteredSession}
          onViewContacts={() => navigate('contacts')}
          onViewHowToUse={() => navigate('howto')}
          onViewSettings={() => navigate('settings')}
          onViewSequenceTasks={() => navigate('database')}
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
      {currentView === 'howto' && (
        <HowToUse onBackToDashboard={handleBackToDashboard} />
      )}
      {currentView === 'settings' && (
        <Settings
          onBackToDashboard={handleBackToDashboard}
          onLogout={logout}
          onManageOkCodes={() => navigate('okCodes')}
        />
      )}
      {currentView === 'okCodes' && (
        <OkCodesAdmin onBack={() => navigate('settings')} />
      )}
      {currentView === 'database' && (
        <DatabaseManager onBackToDashboard={handleBackToDashboard} />
      )}
    </DashboardLayout>
  )
}

export default App
