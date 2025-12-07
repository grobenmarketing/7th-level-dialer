import { useState } from 'react'
import Dashboard from './components/Dashboard'
import CallingInterface from './components/CallingInterface'

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

  const handleNextContact = () => {
    setCurrentContactIndex(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'dashboard' ? (
        <Dashboard onStartCalling={handleStartCalling} />
      ) : (
        <CallingInterface
          contactIndex={currentContactIndex}
          onBackToDashboard={handleBackToDashboard}
          onNextContact={handleNextContact}
        />
      )}
    </div>
  )
}

export default App
