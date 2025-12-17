import { useState, useEffect, useMemo } from 'react';
import { useContacts } from '../hooks/useContacts';
import { useKPI } from '../hooks/useKPI';
import { useOkCodes } from '../hooks/useOkCodes';
import ContactCard from './ContactCard';
import CallTimer from './CallTimer';
import SessionEndSummary from './SessionEndSummary';
import { CALL_OUTCOMES } from '../lib/constants';
import { generatePhoneURL } from '../lib/phoneUtils';

function CallingInterface({ contactIndex, filteredContacts, onBackToDashboard, onNextContact }) {
  const { getActiveContacts, addCallToHistory, updateContact } = useContacts();
  const { incrementMetric, addObjection, getTodayDials, dailyDialGoal, saveDailyDialGoal } = useKPI();
  const { okCodes } = useOkCodes();
  // Use filtered contacts if provided, otherwise use all active contacts
  const activeContacts = filteredContacts || getActiveContacts();
  const currentContact = activeContacts[contactIndex];

  // Daily goal state
  const [editingGoal, setEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(dailyDialGoal);
  const todayDials = getTodayDials();

  // Form state
  const [outcome, setOutcome] = useState('');
  const [okCode, setOkCode] = useState('');
  const [notes, setNotes] = useState('');
  const [hadConversation, setHadConversation] = useState(false);
  const [hadTriage, setHadTriage] = useState(false);
  const [objection, setObjection] = useState('');
  const [needsEmail, setNeedsEmail] = useState(false);

  // Call timer state
  const [callDuration, setCallDuration] = useState(0);
  const [timerActive, setTimerActive] = useState(false); // Start timer when call button is clicked

  // Session end state
  const [showSessionSummary, setShowSessionSummary] = useState(false);

  // Generate phone URL based on device (iOS uses OpenPhone deep link, others use tel:)
  const phoneURL = useMemo(() => {
    if (!currentContact?.phone) return '#';
    return generatePhoneURL(currentContact.phone);
  }, [currentContact?.phone]);

  // Sync temp goal with loaded daily goal
  useEffect(() => {
    setTempGoal(dailyDialGoal);
  }, [dailyDialGoal]);

  // Reset form when contact changes
  useEffect(() => {
    setOutcome('');
    setOkCode('');
    setNotes('');
    setHadConversation(false);
    setHadTriage(false);
    setObjection('');
    setNeedsEmail(false);
    // Reset timer
    setCallDuration(0);
    setTimerActive(false);
  }, [contactIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ignore if user is typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }

      // Number keys 1-9 for OK codes
      if (e.key >= '1' && e.key <= '9' && okCodes.length > 0) {
        const index = parseInt(e.key) - 1;
        if (index < okCodes.length) {
          setOkCode(okCodes[index].label);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [okCodes]);

  const handleSaveGoal = async () => {
    await saveDailyDialGoal(tempGoal);
    setEditingGoal(false);
  };

  const handleStartCall = async () => {
    setTimerActive(true);

    // Increment dial count immediately when call button is clicked
    const today = new Date();
    await incrementMetric(today, 'dials', 1);
  };

  const handleSaveAndNext = async () => {
    if (!currentContact) {
      onBackToDashboard();
      return;
    }

    if (!outcome) {
      alert('Please select a call outcome');
      return;
    }

    if (!okCode) {
      alert('Please select an OK code');
      return;
    }

    // Save call to history with new fields
    await addCallToHistory(currentContact.id, {
      outcome,
      okCode,
      notes,
      duration: callDuration,
      hadConversation,
      hadTriage,
      objection: objection.trim()
    });

    // Update contact with needsEmail flag
    if (needsEmail) {
      await updateContact(currentContact.id, { needsEmail: true });
    }

    // Update KPI metrics for today
    const today = new Date();

    // Note: Dials are incremented when "Call Now" button is clicked, not here

    // Pickup = when DM picks up
    if (outcome === 'DM') {
      await incrementMetric(today, 'pickups', 1);
    }

    // Conversations
    if (hadConversation) {
      await incrementMetric(today, 'conversations', 1);
    }

    // Triage (getting into specifics)
    if (hadTriage) {
      await incrementMetric(today, 'triage', 1);
    }

    // Booked meetings - check if current OK code label indicates a meeting
    const selectedOkCode = okCodes.find(code => code.label === okCode);
    if (selectedOkCode && selectedOkCode.label.toLowerCase().includes('meeting')) {
      await incrementMetric(today, 'bookedMeetings', 1);
    }

    // Add objection if present
    if (objection.trim()) {
      await addObjection(today, objection.trim());
    }

    // Move to next contact or finish
    if (contactIndex < activeContacts.length - 1) {
      onNextContact();
    } else {
      // Session complete - show summary
      setShowSessionSummary(true);
    }
  };

  const handleSkip = () => {
    if (contactIndex < activeContacts.length - 1) {
      onNextContact();
    } else {
      onBackToDashboard();
    }
  };

  // Get last call info for this contact
  const lastCall = currentContact?.callHistory?.[currentContact.callHistory.length - 1];

  // Handle viewing contacts from session summary
  const handleViewContactsFromSummary = () => {
    // This will be handled by App.jsx navigation
    onBackToDashboard();
    // User can then navigate to contacts page
  };

  // Show session end summary if complete
  if (showSessionSummary) {
    return (
      <SessionEndSummary
        contacts={activeContacts}
        onBackToDashboard={onBackToDashboard}
        onViewContacts={handleViewContactsFromSummary}
      />
    );
  }

  return (
    <div className="min-h-screen p-6" style={{background: 'var(--bg-void)'}}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-neon mb-2">
              {filteredContacts ? '🎯 FILTERED MISSION' : '📞 ACTIVE MISSION'}
            </h1>
            <p className="text-muted text-lg uppercase tracking-wide">
              Target {contactIndex + 1} of {activeContacts.length}
              {filteredContacts && ' • Filtered'}
            </p>
          </div>
          <div className="flex flex-col gap-3 items-end">
            {currentContact && timerActive && (
              <div className="glass-card px-6 py-3">
                <CallTimer
                  key={contactIndex}
                  isActive={timerActive}
                  onTimeUpdate={setCallDuration}
                />
              </div>
            )}
            <button
              onClick={onBackToDashboard}
              className="btn-secondary"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="glass-card p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-muted uppercase tracking-wide">Progress</span>
            <span className="text-sm font-mono text-r7-blue dark:text-r7-neon">
              {Math.round(((contactIndex + 1) / activeContacts.length) * 100)}%
            </span>
          </div>
          <div className="bg-gray-200 dark:bg-white/10 rounded-full h-2">
            <div
              className="bg-r7-blue dark:bg-r7-neon rounded-full h-2 transition-all duration-300 shadow-lg shadow-r7-blue/50 dark:shadow-r7-neon/50"
              style={{
                width: `${((contactIndex + 1) / activeContacts.length) * 100}%`
              }}
            ></div>
          </div>
        </div>

        {/* Daily Dial Goal Tracker */}
        <div className="mb-6">
          <div className="glass-card bg-gradient-to-r from-green-500/20 to-green-600/20 dark:from-green-500/10 dark:to-green-600/10 border-green-500/30 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xl font-bold">{todayDials} / {dailyDialGoal}</span>
                  <span className="text-xs opacity-80">dials today</span>
                  {!editingGoal && (
                    <button
                      onClick={() => setEditingGoal(true)}
                      className="ml-auto px-2 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded text-xs font-semibold transition-all"
                    >
                      ⚙️ Edit
                    </button>
                  )}
                </div>
                <div className="bg-white bg-opacity-30 rounded-full h-2 overflow-hidden mb-1">
                  <div
                    className="bg-white h-2 transition-all duration-300"
                    style={{
                      width: `${Math.min((todayDials / dailyDialGoal) * 100, 100)}%`
                    }}
                  ></div>
                </div>
                <div className="text-xs opacity-80">
                  {dailyDialGoal - todayDials > 0
                    ? `${dailyDialGoal - todayDials} remaining`
                    : '🎉 Goal achieved!'}
                </div>
              </div>
              {editingGoal && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={tempGoal}
                    onChange={(e) => setTempGoal(parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 text-gray-800 rounded text-center font-bold text-sm"
                    min="1"
                  />
                  <button
                    onClick={() => setEditingGoal(false)}
                    className="px-2 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded text-xs"
                  >
                    ✕
                  </button>
                  <button
                    onClick={handleSaveGoal}
                    className="px-2 py-1 bg-white text-green-600 rounded text-xs font-semibold"
                  >
                    ✓
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Contact Info */}
          <div className="space-y-6">
            <ContactCard contact={currentContact} />

            {/* Last Call Summary */}
            {lastCall && (
              <div className="glass-card p-6 bg-r7-blue/5 dark:bg-r7-neon/5 border-r7-blue/20 dark:border-r7-neon/20">
                <h3 className="text-lg font-bold text-r7-blue dark:text-r7-neon mb-4">📞 Last Call Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Date:</span>
                    <span className="font-semibold">
                      {new Date(lastCall.timestamp).toLocaleDateString()} at{' '}
                      {new Date(lastCall.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">OK Code:</span>
                    <span className="font-semibold">{lastCall.okCode || 'N/A'}</span>
                  </div>
                  {lastCall.duration > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted">Duration:</span>
                      <span className="font-semibold">{Math.floor(lastCall.duration / 60)}m {lastCall.duration % 60}s</span>
                    </div>
                  )}
                  {lastCall.notes && (
                    <div className="mt-3 pt-3 border-t border-glass">
                      <span className="text-muted block mb-2">Notes:</span>
                      <p className="text-sm">{lastCall.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Call Logging */}
          <div className="space-y-6">
            {/* Call Now Button */}
            {currentContact && (
              <div className="glass-card" style={{
                background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-purple))',
                border: '2px solid var(--neon-blue)'
              }}>
                <a
                  href={phoneURL}
                  onClick={handleStartCall}
                  className="block text-center py-10 hover:scale-105 transition-transform"
                >
                  <div className="text-7xl mb-4">📞</div>
                  <div className="text-3xl font-bold mb-2 text-white">ENGAGE TARGET</div>
                  <div className="text-2xl text-white/90 font-mono">
                    {currentContact.phone}
                  </div>
                </a>
              </div>
            )}

            {/* Call Outcome Selection */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-neon mb-4">
                1️⃣ Mission Outcome
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {CALL_OUTCOMES.map((outcomeOption) => (
                  <button
                    key={outcomeOption.id}
                    onClick={() => setOutcome(outcomeOption.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      outcome === outcomeOption.id
                        ? 'border-r7-blue dark:border-r7-neon bg-r7-blue/10 dark:bg-r7-neon/10 shadow-lg shadow-r7-blue/20 dark:shadow-r7-neon/20'
                        : 'border-glass hover:border-r7-blue dark:hover:border-r7-neon hover:bg-white/50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="text-3xl mb-1">{outcomeOption.icon}</div>
                    <div className="text-sm font-semibold">
                      {outcomeOption.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* OK Code Selection */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-neon mb-4">
                2️⃣ Status Code
                <span className="text-sm text-muted font-normal ml-2">(press 1-9)</span>
              </h3>
              <select
                value={okCode}
                onChange={(e) => setOkCode(e.target.value)}
                className="select-field"
                disabled={!outcome}
              >
                <option value="">Select OK Code...</option>
                {okCodes.map((code, index) => (
                  <option key={code.id} value={code.label}>
                    [{index + 1}] {code.label}
                  </option>
                ))}
              </select>

              {okCode && (
                <div className="mt-3 p-3 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <span
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: okCodes.find(c => c.label === okCode)?.color || '#808080' }}
                    ></span>
                    <span className="text-sm font-semibold">
                      {okCode}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Call Quality Tracking */}
            <div className="card bg-white">
              <h3 className="text-xl font-bold text-gray-700 mb-4">
                3️⃣ Call Quality & Details
              </h3>

              {/* Conversation & Triage Checkboxes */}
              <div className="space-y-3 mb-4">
                <label className="flex items-center p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={hadConversation}
                    onChange={(e) => setHadConversation(e.target.checked)}
                    className="w-5 h-5 text-r7-blue rounded focus:ring-r7-blue"
                  />
                  <span className="ml-3 font-semibold text-gray-700">
                    💬 Had Conversation
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    (Meaningful discussion occurred)
                  </span>
                </label>

                <label className="flex items-center p-3 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={hadTriage}
                    onChange={(e) => setHadTriage(e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-600"
                  />
                  <span className="ml-3 font-semibold text-gray-700">
                    🎯 Triage Completed
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    (Got specific details about their situation)
                  </span>
                </label>

                <label className="flex items-center p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={needsEmail}
                    onChange={(e) => setNeedsEmail(e.target.checked)}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-600"
                  />
                  <span className="ml-3 font-semibold text-gray-700">
                    📧 Needs Email Follow-up
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    (Got permission to send email)
                  </span>
                </label>
              </div>

              {/* Objection Input */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ⚠️ Objection (if any)
                </label>
                <input
                  type="text"
                  value={objection}
                  onChange={(e) => setObjection(e.target.value)}
                  placeholder="e.g., Not interested, No budget, Wrong timing..."
                  className="input-field"
                />
              </div>

              {/* Notes Textarea */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📝 Call Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this call..."
                  rows="4"
                  className="input-field resize-none"
                ></textarea>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleSkip}
                className="btn-secondary"
              >
                Skip Contact
              </button>
              <button
                onClick={handleSaveAndNext}
                className="btn-primary"
              >
                💾 Save & Next
              </button>
            </div>

            {/* Quick Tips */}
            <div className="card bg-blue-50 border-2 border-blue-200">
              <h4 className="font-bold text-blue-900 mb-2">
                💡 Quick Tips
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Click the phone number to dial automatically</li>
                <li>• Select outcome first, then OK code</li>
                <li>• Press keys 1-9 for quick OK code selection</li>
                <li>• Check "Needs Email" if they gave email permission</li>
                <li>• Add detailed notes for follow-ups</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CallingInterface;
