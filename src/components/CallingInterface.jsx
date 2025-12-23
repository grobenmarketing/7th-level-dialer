import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useContacts } from '../hooks/useContacts';
import { useKPI } from '../hooks/useKPI';
import { useOkCodes } from '../hooks/useOkCodes';
import { useCallForm } from '../hooks/useCallForm';
import ContactCard from './ContactCard';
import CallTimer from './CallTimer';
import SessionEndSummary from './SessionEndSummary';
import { CALL_OUTCOMES } from '../lib/constants';
import { generatePhoneURL } from '../lib/phoneUtils';
import { enterSequence, generateSequenceTasks, completeSequenceTask, applyCounterUpdates, getCounterUpdates } from '../lib/sequenceLogic';
import { getNeverContactedLeads } from '../lib/taskScheduler';

function CallingInterface({ contactIndex, filteredContacts, onBackToDashboard, onNextContact }) {
  const { contacts, getActiveContacts, addCallToHistory, updateContact } = useContacts();
  const { incrementMetric, addObjection, getTodayDials, dailyDialGoal, saveDailyDialGoal } = useKPI();
  const { okCodes } = useOkCodes();

  // Use custom hook for form state management
  const {
    outcome, okCode, notes, hadConversation, hadTriage, objection, needsEmail,
    callDuration, timerActive, isSaving,
    updateField, setIsSaving, startTimer, setCallDuration, validate
  } = useCallForm(contactIndex);

  // Use filtered contacts if provided, otherwise use ONLY never-contacted leads for cold calling
  const activeContacts = filteredContacts || getNeverContactedLeads(contacts);
  const currentContact = activeContacts[contactIndex];

  // Daily goal state
  const [editingGoal, setEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(dailyDialGoal);
  const todayDials = getTodayDials();

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
          updateField('okCode', okCodes[index].label);
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
    startTimer();

    // Increment dial count immediately when call button is clicked
    const today = new Date();
    await incrementMetric(today, 'dials', 1);
  };

  const handleSaveAndNext = async () => {
    // Prevent double submissions
    if (isSaving) {
      console.log('⏳ Already saving, please wait...');
      return;
    }

    if (!currentContact) {
      onBackToDashboard();
      return;
    }

    // Validate form
    const validation = validate();
    if (!validation.isValid) {
      alert(validation.errors.join('\n'));
      return;
    }

    try {
      setIsSaving(true);

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

      // SEQUENCE LOGIC: Auto-enter into sequence on first call
      if (currentContact.sequence_status === 'never_contacted') {
        console.log('🔄 Entering contact into sequence...');
        await enterSequence(currentContact.id, updateContact);

        // Generate sequence tasks for the full 30-day sequence with due dates
        const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];
        const updatedContact = {
          ...currentContact,
          sequence_status: 'active',
          sequence_current_day: 1, // Start on Day 1 - sequence begins tomorrow
          sequence_start_date: tomorrow,
          calls_made: 1,
          has_email: currentContact.has_email || !!currentContact.email,
          has_linkedin: currentContact.has_linkedin || !!currentContact.linkedin,
          has_social_media: currentContact.has_social_media || false
        };
        await generateSequenceTasks(updatedContact);

        console.log('✅ Contact entered sequence - Day 1 tasks will begin tomorrow!');
      } else if (currentContact.sequence_status === 'active') {
        // This is a follow-up call - update counters
        console.log('📞 Follow-up call - updating sequence...');

        // Update call counter
        const counterUpdates = getCounterUpdates('call');
        const updatedContactData = applyCounterUpdates(currentContact, counterUpdates);

        await updateContact(currentContact.id, {
          calls_made: updatedContactData.calls_made,
          last_contact_date: new Date().toISOString().split('T')[0]
        });

        // Mark today's call task as complete
        await completeSequenceTask(
          currentContact.id,
          currentContact.sequence_current_day,
          'call',
          notes
        );

        console.log('✅ Follow-up call logged in sequence');
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

      // Wait a brief moment for state to settle
      await new Promise(resolve => setTimeout(resolve, 100));

      // Move to next contact or finish
      if (contactIndex < activeContacts.length - 1) {
        onNextContact();
      } else {
        // Session complete - show summary
        setShowSessionSummary(true);
      }
    } catch (error) {
      console.error('Error saving call:', error);
      alert('Error saving call. Please try again.');
    } finally {
      setIsSaving(false);
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
    <div className="min-h-screen bg-gradient-to-br from-r7-light to-gray-100">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-r7-blue">
              {filteredContacts ? '🎯 Filtered Calling Session' : 'Calling Session'}
            </h1>
            <p className="text-gray-600">
              Contact {contactIndex + 1} of {activeContacts.length}
              {filteredContacts && ' (filtered)'}
            </p>
          </div>
          <div className="flex flex-col gap-3 items-end">
            {currentContact && timerActive && (
              <CallTimer
                key={contactIndex}
                isActive={timerActive}
                onTimeUpdate={setCallDuration}
              />
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
        <div className="mb-6">
          <div className="bg-gray-200 rounded-full h-3">
            <div
              className="bg-r7-blue rounded-full h-3 transition-all duration-300"
              style={{
                width: `${((contactIndex + 1) / activeContacts.length) * 100}%`
              }}
            ></div>
          </div>
        </div>

        {/* Daily Dial Goal Tracker - Compact */}
        <div className="mb-4">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-3">
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
            <AnimatePresence mode="wait">
              <ContactCard key={currentContact?.id || 'empty'} contact={currentContact} />
            </AnimatePresence>

            {/* Last Call Summary */}
            {lastCall && (
              <div className="card bg-blue-50 border-2 border-blue-200">
                <h3 className="text-lg font-bold text-blue-900 mb-3">📞 Last Call Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Date:</span>
                    <span className="font-semibold text-blue-900">
                      {new Date(lastCall.timestamp).toLocaleDateString()} at{' '}
                      {new Date(lastCall.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">OK Code:</span>
                    <span className="font-semibold text-blue-900">{lastCall.okCode || 'N/A'}</span>
                  </div>
                  {lastCall.duration > 0 && (
                    <div className="flex justify-between">
                      <span className="text-blue-700">Duration:</span>
                      <span className="font-semibold text-blue-900">{Math.floor(lastCall.duration / 60)}m {lastCall.duration % 60}s</span>
                    </div>
                  )}
                  {lastCall.notes && (
                    <div className="mt-2 pt-2 border-t border-blue-200">
                      <span className="text-blue-700 block mb-1">Notes:</span>
                      <p className="text-blue-900">{lastCall.notes}</p>
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
              <div className="card bg-gradient-to-r from-r7-blue to-r7-dark text-white">
                <a
                  href={phoneURL}
                  onClick={handleStartCall}
                  className="block text-center py-8 hover:opacity-90 transition-opacity"
                >
                  <div className="text-6xl mb-3">📞</div>
                  <div className="text-3xl font-bold mb-2">Call Now</div>
                  <div className="text-xl opacity-90">
                    {currentContact.phone}
                  </div>
                </a>
              </div>
            )}

            {/* Call Outcome Selection */}
            <div className="card bg-white">
              <h3 className="text-xl font-bold text-gray-700 mb-4">
                1️⃣ Call Outcome
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {CALL_OUTCOMES.map((outcomeOption) => (
                  <button
                    key={outcomeOption.id}
                    onClick={() => updateField('outcome', outcomeOption.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      outcome === outcomeOption.id
                        ? 'border-r7-blue bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-r7-blue hover:bg-gray-50'
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
            <div className="card bg-white">
              <h3 className="text-xl font-bold text-gray-700 mb-4">
                2️⃣ OK Code
                <span className="text-sm text-gray-500 font-normal ml-2">(or press 1-9)</span>
              </h3>
              <select
                value={okCode}
                onChange={(e) => updateField('okCode', e.target.value)}
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
                    onChange={(e) => updateField('hadConversation', e.target.checked)}
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
                    onChange={(e) => updateField('hadTriage', e.target.checked)}
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
                    onChange={(e) => updateField('needsEmail', e.target.checked)}
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
                  onChange={(e) => updateField('objection', e.target.value)}
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
                  onChange={(e) => updateField('notes', e.target.value)}
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
                disabled={isSaving}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? '⏳ Saving...' : '💾 Save & Next'}
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
