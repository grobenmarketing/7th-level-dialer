import { useState, useEffect, useMemo } from 'react';
import { useContacts } from '../hooks/useContacts';
import { useKPI } from '../hooks/useKPI';
import ContactCard from './ContactCard';
import CallTimer from './CallTimer';
import { OK_CODES, CALL_OUTCOMES } from '../lib/constants';
import { generatePhoneURL } from '../lib/phoneUtils';

function CallingInterface({ contactIndex, onBackToDashboard, onNextContact }) {
  const { getActiveContacts, addCallToHistory, updateContact } = useContacts();
  const { incrementMetric, addObjection, getTodayDials, dailyDialGoal, saveDailyDialGoal } = useKPI();
  const activeContacts = getActiveContacts();
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

  // Call timer state
  const [callDuration, setCallDuration] = useState(0);
  const [timerActive, setTimerActive] = useState(false); // Start timer when call button is clicked

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
    // Reset timer
    setCallDuration(0);
    setTimerActive(false);
  }, [contactIndex]);

  const handleSaveGoal = async () => {
    await saveDailyDialGoal(tempGoal);
    setEditingGoal(false);
  };

  const handleStartCall = () => {
    setTimerActive(true);
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
    addCallToHistory(currentContact.id, {
      outcome,
      okCode,
      notes,
      duration: callDuration,
      hadConversation,
      hadTriage,
      objection: objection.trim()
    });

    // Update KPI metrics for today
    const today = new Date();

    // Always increment dials
    await incrementMetric(today, 'dials', 1);

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

    // Booked meetings (OK-09)
    if (okCode === 'OK-09') {
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
      alert('All contacts completed! Great work!');
      onBackToDashboard();
    }
  };

  const handleSkip = () => {
    if (contactIndex < activeContacts.length - 1) {
      onNextContact();
    } else {
      onBackToDashboard();
    }
  };

  // Get filtered OK codes based on outcome
  const getFilteredOKCodes = () => {
    if (outcome === 'NA') {
      return OK_CODES.filter(code =>
        ['OK-07', 'OK-08', 'OK-10'].includes(code.code)
      );
    } else if (outcome === 'GK') {
      return OK_CODES.filter(code =>
        ['OK-03', 'OK-06', 'OK-07', 'OK-11'].includes(code.code)
      );
    } else if (outcome === 'DM') {
      return OK_CODES; // All codes available for decision makers
    }
    return OK_CODES;
  };

  const filteredOKCodes = getFilteredOKCodes();

  return (
    <div className="min-h-screen bg-gradient-to-br from-r7-light to-gray-100">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-r7-blue">
              Calling Session
            </h1>
            <p className="text-gray-600">
              Contact {contactIndex + 1} of {activeContacts.length}
            </p>
          </div>
          <button
            onClick={onBackToDashboard}
            className="btn-secondary"
          >
            ← Back to Dashboard
          </button>
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

        {/* Daily Dial Goal Tracker */}
        <div className="mb-6">
          <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-semibold opacity-90 mb-1">
                  Today's Progress
                </div>
                <div className="text-4xl font-bold">
                  {todayDials} / {dailyDialGoal} dials
                </div>
                <div className="mt-2 bg-white bg-opacity-30 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-white h-3 transition-all duration-300"
                    style={{
                      width: `${Math.min((todayDials / dailyDialGoal) * 100, 100)}%`
                    }}
                  ></div>
                </div>
                <div className="text-sm opacity-90 mt-2">
                  {dailyDialGoal - todayDials > 0
                    ? `${dailyDialGoal - todayDials} dials remaining`
                    : '🎉 Goal achieved!'}
                </div>
              </div>
              <div className="ml-4">
                {!editingGoal ? (
                  <button
                    onClick={() => setEditingGoal(true)}
                    className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg font-semibold transition-all"
                  >
                    ⚙️ Edit Goal
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <input
                      type="number"
                      value={tempGoal}
                      onChange={(e) => setTempGoal(parseInt(e.target.value) || 0)}
                      className="w-24 px-3 py-2 text-gray-800 rounded-lg text-center font-bold"
                      min="1"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingGoal(false)}
                        className="px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveGoal}
                        className="px-3 py-1 bg-white text-green-600 rounded text-sm font-semibold"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Contact Info */}
          <div className="space-y-6">
            <ContactCard contact={currentContact} />
            {/* Call Timer */}
            {currentContact && (
              <CallTimer
                key={contactIndex}
                isActive={timerActive}
                onTimeUpdate={setCallDuration}
              />
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
                    onClick={() => setOutcome(outcomeOption.id)}
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
              </h3>
              <select
                value={okCode}
                onChange={(e) => setOkCode(e.target.value)}
                className="select-field"
                disabled={!outcome}
              >
                <option value="">Select OK Code...</option>
                {filteredOKCodes.map((code) => (
                  <option key={code.code} value={code.code}>
                    {code.code} - {code.label}
                  </option>
                ))}
              </select>

              {okCode && (
                <div className="mt-3 p-3 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <span
                      className={`w-3 h-3 rounded-full mr-2 ${
                        OK_CODES.find(c => c.code === okCode)?.color === 'green'
                          ? 'bg-green-500'
                          : OK_CODES.find(c => c.code === okCode)?.color === 'red'
                          ? 'bg-red-500'
                          : OK_CODES.find(c => c.code === okCode)?.color === 'yellow'
                          ? 'bg-yellow-500'
                          : OK_CODES.find(c => c.code === okCode)?.color === 'blue'
                          ? 'bg-blue-500'
                          : 'bg-gray-500'
                      }`}
                    ></span>
                    <span className="text-sm font-semibold">
                      {OK_CODES.find(c => c.code === okCode)?.label}
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
                <li>• Add detailed notes for follow-ups</li>
                <li>• Use Save & Next to move efficiently</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CallingInterface;
