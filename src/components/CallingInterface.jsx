import { useState, useEffect } from 'react';
import { useContacts } from '../hooks/useContacts';
import ContactCard from './ContactCard';
import NEPQTracker from './NEPQTracker';
import { OK_CODES, CALL_OUTCOMES, NEPQ_PHASES, PROBLEM_LEVELS } from '../lib/constants';

function CallingInterface({ contactIndex, onBackToDashboard, onNextContact }) {
  const { getActiveContacts, addCallToHistory, updateContact } = useContacts();
  const activeContacts = getActiveContacts();
  const currentContact = activeContacts[contactIndex];

  // Form state
  const [outcome, setOutcome] = useState('');
  const [okCode, setOkCode] = useState('');
  const [notes, setNotes] = useState('');

  // NEPQ tracking state (only for Decision Maker calls)
  const [nepqPhaseReached, setNepqPhaseReached] = useState('connection');
  const [problemLevelReached, setProblemLevelReached] = useState(0);
  const [problemStatement, setProblemStatement] = useState('');
  const [problemsDiscovered, setProblemsDiscovered] = useState([]);

  // Reset form when contact changes
  useEffect(() => {
    setOutcome('');
    setOkCode('');
    setNotes('');
    // Reset NEPQ state
    setNepqPhaseReached(currentContact?.nepqPhase || 'connection');
    setProblemLevelReached(0);
    setProblemStatement('');
    setProblemsDiscovered([]);
  }, [contactIndex, currentContact]);

  const handleSaveAndNext = () => {
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

    // Save call to history with NEPQ data
    addCallToHistory(currentContact.id, {
      outcome,
      okCode,
      notes,
      duration: 0, // Will add timer in future phase
      // NEPQ tracking (only saved if DM call)
      nepqPhaseReached: outcome === 'DM' ? nepqPhaseReached : currentContact.nepqPhase,
      problemLevelReached: outcome === 'DM' ? problemLevelReached : 0,
      problemsDiscovered: outcome === 'DM' ? problemsDiscovered : []
    });

    // Update contact's overall NEPQ progress (if this was a DM call)
    if (outcome === 'DM') {
      const updatedProblems = [
        ...(currentContact.problemsIdentified || []),
        ...problemsDiscovered
      ];

      updateContact(currentContact.id, {
        nepqPhase: nepqPhaseReached,
        problemLevel: Math.max(currentContact.problemLevel || 0, problemLevelReached),
        problemsIdentified: updatedProblems
      });
    }

    // Move to next contact or finish
    if (contactIndex < activeContacts.length - 1) {
      onNextContact();
    } else {
      alert('All contacts completed! Great work!');
      onBackToDashboard();
    }
  };

  // Add problem to the discovered list
  const handleAddProblem = () => {
    if (!problemStatement.trim() || problemLevelReached === 0) {
      alert('Please enter a problem statement and select a problem level');
      return;
    }

    const newProblem = {
      level: problemLevelReached,
      statement: problemStatement.trim(),
      date: new Date().toISOString()
    };

    setProblemsDiscovered([...problemsDiscovered, newProblem]);
    setProblemStatement('');
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
        ['OK-09', 'OK-10'].includes(code.code)
      );
    } else if (outcome === 'GK') {
      return OK_CODES.filter(code =>
        ['OK-05', 'OK-08', 'OK-09'].includes(code.code)
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Contact Info & NEPQ Progress */}
          <div className="space-y-6">
            <ContactCard contact={currentContact} />
            {currentContact && <NEPQTracker contact={currentContact} />}
          </div>

          {/* Right Column - Call Logging */}
          <div className="space-y-6">
            {/* Call Now Button */}
            {currentContact && (
              <div className="card bg-gradient-to-r from-r7-blue to-r7-dark text-white">
                <a
                  href={`tel:${currentContact.phone}`}
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

            {/* NEPQ Phase Selector (Only for Decision Maker calls) */}
            {outcome === 'DM' && (
              <div className="card bg-white border-2 border-r7-blue">
                <h3 className="text-xl font-bold text-gray-700 mb-4">
                  3️⃣ NEPQ Phase Reached
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {NEPQ_PHASES.map((phase) => (
                    <button
                      key={phase.id}
                      onClick={() => setNepqPhaseReached(phase.id)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        nepqPhaseReached === phase.id
                          ? 'border-r7-blue bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-r7-blue hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-2xl mb-1">{phase.icon}</div>
                      <div className="text-xs font-semibold">
                        {phase.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Problem Discovery Tracker (Only for Decision Maker calls) */}
            {outcome === 'DM' && (
              <div className="card bg-white border-2 border-r7-blue">
                <h3 className="text-xl font-bold text-gray-700 mb-4">
                  4️⃣ Problem Discovery (L1-L4)
                </h3>

                {/* Problem Level Selector */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Problem Level
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {PROBLEM_LEVELS.map((level) => (
                      <button
                        key={level.level}
                        onClick={() => setProblemLevelReached(level.level)}
                        className={`p-2 rounded-lg border-2 transition-all ${
                          problemLevelReached === level.level
                            ? `border-${level.color}-500 bg-${level.color}-50`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`text-lg font-bold ${
                          problemLevelReached === level.level
                            ? level.color === 'blue' ? 'text-blue-700' :
                              level.color === 'green' ? 'text-green-700' :
                              level.color === 'yellow' ? 'text-yellow-700' :
                              level.color === 'red' ? 'text-red-700' :
                              'text-gray-700'
                            : 'text-gray-400'
                        }`}>
                          L{level.level}
                        </div>
                        <div className="text-xs">{level.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Problem Statement Input */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Problem Statement
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={problemStatement}
                      onChange={(e) => setProblemStatement(e.target.value)}
                      placeholder="Enter problem discovered..."
                      className="input-field flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddProblem();
                        }
                      }}
                    />
                    <button
                      onClick={handleAddProblem}
                      className="btn-primary px-4"
                      disabled={!problemStatement.trim() || problemLevelReached === 0}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Problems Discovered This Call */}
                {problemsDiscovered.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Problems Discovered This Call
                    </label>
                    <div className="space-y-2">
                      {problemsDiscovered.map((problem, index) => (
                        <div
                          key={index}
                          className={`p-2 rounded border-l-4 flex items-start ${
                            problem.level === 1 ? 'border-blue-500 bg-blue-50' :
                            problem.level === 2 ? 'border-green-500 bg-green-50' :
                            problem.level === 3 ? 'border-yellow-500 bg-yellow-50' :
                            problem.level === 4 ? 'border-red-500 bg-red-50' :
                            'border-gray-500 bg-gray-50'
                          }`}
                        >
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white text-xs font-bold mr-2 flex-shrink-0">
                            L{problem.level}
                          </span>
                          <p className="text-sm text-gray-800 flex-1">{problem.statement}</p>
                          <button
                            onClick={() => {
                              setProblemsDiscovered(problemsDiscovered.filter((_, i) => i !== index));
                            }}
                            className="text-red-600 hover:text-red-800 ml-2"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="card bg-white">
              <h3 className="text-xl font-bold text-gray-700 mb-4">
                {outcome === 'DM' ? '5️⃣' : '3️⃣'} Call Notes
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this call..."
                rows="5"
                className="input-field resize-none"
              ></textarea>
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
                {outcome === 'DM' && (
                  <>
                    <li>• Track NEPQ phase and problem levels for DM calls</li>
                    <li>• Aim for L3-L4 problems for better close rates</li>
                  </>
                )}
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
