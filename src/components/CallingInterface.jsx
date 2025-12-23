import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContacts } from '../hooks/useContacts';
import { useKPI } from '../hooks/useKPI';
import { useOkCodes } from '../hooks/useOkCodes';
import { useCallForm } from '../hooks/useCallForm';
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

  // Contact Intel drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Animation direction state
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward

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
        console.log('Contact details:', {
          id: currentContact.id,
          current_day: currentContact.sequence_current_day,
          sequence_start_date: currentContact.sequence_start_date
        });

        // Update call counter
        const counterUpdates = getCounterUpdates('call');
        const updatedContactData = applyCounterUpdates(currentContact, counterUpdates);

        await updateContact(currentContact.id, {
          calls_made: updatedContactData.calls_made,
          last_contact_date: new Date().toISOString().split('T')[0]
        });

        // Mark today's call task as complete
        console.log('Marking call task as complete for day', currentContact.sequence_current_day);
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

      // Set animation direction (forward)
      setDirection(1);

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
    setDirection(1); // forward animation
    if (contactIndex < activeContacts.length - 1) {
      onNextContact();
    } else {
      onBackToDashboard();
    }
  };

  // One-tap note button handlers
  const handleQuickNote = (noteText) => {
    updateField('notes', notes ? `${notes}\n${noteText}` : noteText);
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
        {/* Header - R7 Navy */}
        <div className="bg-r7-navy text-white rounded-lg p-6 mb-6 shadow-lg">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {filteredContacts ? '🎯 Filtered Calling Session' : '☎️ Cold Calling Focus Mode'}
              </h1>
              <p className="text-white opacity-80">
                Contact {contactIndex + 1} of {activeContacts.length}
                {filteredContacts && ' (filtered)'}
              </p>
            </div>
            <div className="flex flex-col gap-3 items-end">
              {currentContact && timerActive && (
                <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
                  <CallTimer
                    key={contactIndex}
                    isActive={timerActive}
                    onTimeUpdate={setCallDuration}
                  />
                </div>
              )}
              <button
                onClick={onBackToDashboard}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg font-semibold transition-all"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="bg-white bg-opacity-20 rounded-full h-2">
              <div
                className="bg-r7-teal rounded-full h-2 transition-all duration-300"
                style={{
                  width: `${((contactIndex + 1) / activeContacts.length) * 100}%`
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Daily Dial Goal Tracker */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-bold">{todayDials} / {dailyDialGoal}</span>
                  <span className="text-sm opacity-80">dials today</span>
                  {!editingGoal && (
                    <button
                      onClick={() => setEditingGoal(true)}
                      className="ml-auto px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded text-sm font-semibold transition-all"
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
                <div className="text-sm opacity-80">
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
                    className="px-2 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded text-sm"
                  >
                    ✕
                  </button>
                  <button
                    onClick={handleSaveGoal}
                    className="px-2 py-1 bg-white text-green-600 rounded text-sm font-semibold"
                  >
                    ✓
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SPLIT-SCREEN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN - CONTACT IDENTITY */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentContact?.id || 'empty'}
                initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                {!currentContact ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-2">
                      All Done!
                    </h3>
                    <p className="text-gray-600">
                      You've completed all contacts in this session.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Sequence Status Badge */}
                    {currentContact.sequence_status === 'never_contacted' && (
                      <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">✨</span>
                          <span className="font-bold">NEW PROSPECT</span>
                        </div>
                        <div className="text-xs opacity-80 mt-1">
                          Will enter 30-day sequence after first call
                        </div>
                      </div>
                    )}

                    {/* Company Name - Large & Bold */}
                    <h2 className="text-4xl font-bold text-r7-navy mb-6">
                      {currentContact.companyName || 'Unknown Company'}
                    </h2>

                    {/* Primary Info: Phone & Website */}
                    <div className="space-y-4 mb-6">
                      {currentContact.phone && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                          <span className="text-3xl">📞</span>
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Phone</div>
                            <div className="text-xl font-bold text-r7-navy">
                              {currentContact.phone}
                            </div>
                          </div>
                        </div>
                      )}

                      {currentContact.website && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                          <span className="text-3xl">🌐</span>
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Website</div>
                            <a
                              href={currentContact.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-lg font-semibold text-r7-teal hover:underline break-all"
                            >
                              {currentContact.website}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Collapsible Contact Intel Drawer */}
                    <div className="border-t border-gray-200 pt-4">
                      <button
                        onClick={() => setDrawerOpen(!drawerOpen)}
                        className="w-full flex items-center justify-between p-3 bg-r7-navy text-white rounded-lg hover:bg-opacity-90 transition-all"
                      >
                        <span className="font-bold">📋 Contact Intel</span>
                        <span className="text-xl">{drawerOpen ? '▼' : '▶'}</span>
                      </button>

                      <AnimatePresence>
                        {drawerOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-3 mt-3 p-4 bg-gray-50 rounded-lg">
                              {currentContact.address && (
                                <div className="flex items-start gap-3">
                                  <span className="text-2xl">📍</span>
                                  <div className="flex-1">
                                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Address</div>
                                    <div className="text-sm font-semibold text-gray-700">
                                      {currentContact.address}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {currentContact.linkedin && (
                                <div className="flex items-start gap-3">
                                  <span className="text-2xl">💼</span>
                                  <div className="flex-1">
                                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">LinkedIn</div>
                                    <a
                                      href={currentContact.linkedin}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm font-semibold text-r7-teal hover:underline break-all"
                                    >
                                      {currentContact.linkedin}
                                    </a>
                                  </div>
                                </div>
                              )}

                              {currentContact.industry && (
                                <div className="flex items-start gap-3">
                                  <span className="text-2xl">🏢</span>
                                  <div className="flex-1">
                                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Industry</div>
                                    <div className="text-sm font-semibold text-gray-700">
                                      {currentContact.industry}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Call Stats */}
                              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-200">
                                <div className="text-center">
                                  <div className="text-lg font-bold text-r7-navy">
                                    {currentContact.totalDials || 0}
                                  </div>
                                  <div className="text-xs text-gray-600">Dials</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-green-600">
                                    {currentContact.callHistory?.length || 0}
                                  </div>
                                  <div className="text-xs text-gray-600">Logged</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs font-semibold text-gray-700 mt-1">
                                    {currentContact.currentOkCode || 'N/A'}
                                  </div>
                                  <div className="text-xs text-gray-600">Last OK</div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Last Call Summary (if exists) */}
            {lastCall && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
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

          {/* RIGHT COLUMN - CALL TRACKING & ACTIONS */}
          <div className="space-y-4">
            {/* Call Now Button - R7 Teal */}
            {currentContact && (
              <a
                href={phoneURL}
                onClick={handleStartCall}
                className="block bg-r7-teal hover:bg-opacity-90 text-white rounded-lg shadow-lg transition-all overflow-hidden"
              >
                <div className="text-center py-10">
                  <div className="text-6xl mb-3">📞</div>
                  <div className="text-3xl font-bold mb-2">Call Now</div>
                  <div className="text-xl opacity-90">
                    {currentContact.phone}
                  </div>
                </div>
              </a>
            )}

            {/* Outcome Buttons - Three Large Clear Buttons */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-r7-navy mb-4">
                Call Outcome
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {CALL_OUTCOMES.map((outcomeOption) => (
                  <button
                    key={outcomeOption.id}
                    onClick={() => updateField('outcome', outcomeOption.id)}
                    className={`p-6 rounded-lg border-2 transition-all font-bold ${
                      outcome === outcomeOption.id
                        ? 'border-r7-navy bg-r7-navy text-white shadow-lg scale-105'
                        : 'border-gray-300 hover:border-r7-navy hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="text-4xl mb-2">{outcomeOption.icon}</div>
                    <div className="text-sm">
                      {outcomeOption.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* OK Code Selection */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-r7-navy mb-4">
                OK Code
                <span className="text-sm text-gray-500 font-normal ml-2">(press 1-9)</span>
              </h3>
              <select
                value={okCode}
                onChange={(e) => updateField('okCode', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-r7-navy focus:ring-2 focus:ring-r7-navy focus:ring-opacity-50 text-gray-700 font-semibold"
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
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: okCodes.find(c => c.label === okCode)?.color || '#808080' }}
                    ></span>
                    <span className="text-sm font-semibold text-gray-700">
                      {okCode}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Smart Checkboxes */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-r7-navy mb-4">
                Call Quality
              </h3>

              <div className="space-y-3">
                {/* Had Conversation - Always Enabled */}
                <label className="flex items-center p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors border-2 border-transparent hover:border-blue-300">
                  <input
                    type="checkbox"
                    checked={hadConversation}
                    onChange={(e) => {
                      updateField('hadConversation', e.target.checked);
                      // Auto-uncheck triage if unchecking conversation (triage requires conversation)
                      if (!e.target.checked) {
                        updateField('hadTriage', false);
                      }
                    }}
                    className="w-6 h-6 text-r7-navy rounded focus:ring-r7-navy"
                  />
                  <span className="ml-3 font-bold text-gray-800">
                    💬 Had Conversation
                  </span>
                </label>

                {/* Triage Completed - DISABLED until Had Conversation */}
                <label className={`flex items-center p-4 rounded-lg border-2 transition-colors ${
                  hadConversation
                    ? 'bg-purple-50 cursor-pointer hover:bg-purple-100 border-transparent hover:border-purple-300'
                    : 'bg-gray-100 cursor-not-allowed border-gray-300 opacity-50'
                }`}>
                  <input
                    type="checkbox"
                    checked={hadTriage}
                    onChange={(e) => updateField('hadTriage', e.target.checked)}
                    disabled={!hadConversation}
                    className="w-6 h-6 text-purple-600 rounded focus:ring-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="ml-3 font-bold text-gray-800">
                    🎯 Triage Completed
                  </span>
                </label>

                {/* Needs Email Follow-up - Always Enabled */}
                <label className="flex items-center p-4 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors border-2 border-transparent hover:border-green-300">
                  <input
                    type="checkbox"
                    checked={needsEmail}
                    onChange={(e) => updateField('needsEmail', e.target.checked)}
                    className="w-6 h-6 text-green-600 rounded focus:ring-green-600"
                  />
                  <span className="ml-3 font-bold text-gray-800">
                    📧 Needs Email Follow-up
                  </span>
                </label>
              </div>
            </div>

            {/* Objection Input */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <label className="block text-sm font-bold text-r7-navy mb-2 uppercase tracking-wide">
                ⚠️ Objection (if any)
              </label>
              <input
                type="text"
                value={objection}
                onChange={(e) => updateField('objection', e.target.value)}
                placeholder="e.g., Not interested, No budget, Wrong timing..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-r7-navy focus:ring-2 focus:ring-r7-navy focus:ring-opacity-50"
              />
            </div>

            {/* Quick Notes with One-Tap Buttons */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <label className="block text-sm font-bold text-r7-navy mb-3 uppercase tracking-wide">
                📝 Call Notes
              </label>

              {/* One-Tap Note Buttons */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <button
                  onClick={() => handleQuickNote('LVM - Left voicemail')}
                  className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-sm font-semibold transition-all"
                >
                  📞 LVM
                </button>
                <button
                  onClick={() => handleQuickNote('GK Blocked - Gatekeeper blocked access')}
                  className="px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg text-sm font-semibold transition-all"
                >
                  🚪 GK Blocked
                </button>
                <button
                  onClick={() => handleQuickNote('Not Interested - Prospect declined')}
                  className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm font-semibold transition-all"
                >
                  ✋ Not Interested
                </button>
              </div>

              <textarea
                value={notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Add notes about this call..."
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-r7-navy focus:ring-2 focus:ring-r7-navy focus:ring-opacity-50 resize-none"
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleSkip}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-4 rounded-lg font-bold transition-all text-lg"
              >
                Skip Contact
              </button>
              <button
                onClick={handleSaveAndNext}
                disabled={isSaving}
                className="bg-r7-red hover:bg-opacity-90 text-white px-6 py-4 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg"
              >
                {isSaving ? '⏳ Saving...' : '💾 Save & Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CallingInterface;
