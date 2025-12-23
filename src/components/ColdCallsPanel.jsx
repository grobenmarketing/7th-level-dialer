import { useState, useEffect } from 'react';
import { getNeverContactedLeads } from '../lib/taskScheduler';
import { useKPI } from '../hooks/useKPI';

function ColdCallsPanel({ contacts, onStartCalling }) {
  const [showAll, setShowAll] = useState(false);
  const { dailyDialGoal, saveDailyDialGoal } = useKPI();

  // Daily goal state - now synced with useKPI
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(dailyDialGoal);

  // Sync temp goal when dailyDialGoal changes
  useEffect(() => {
    setTempGoal(dailyDialGoal);
  }, [dailyDialGoal]);

  const neverContacted = getNeverContactedLeads(contacts);
  const displayLimit = 10;
  const displayedContacts = showAll ? neverContacted : neverContacted.slice(0, displayLimit);
  const hasMore = neverContacted.length > displayLimit;

  const handleSaveGoal = async () => {
    const goal = parseInt(tempGoal) || 1;
    if (goal > 0) {
      await saveDailyDialGoal(goal);
      setIsEditingGoal(false);
    }
  };

  const handleStartCalling = () => {
    // Pass limited contacts based on daily goal
    const limitedContacts = neverContacted.slice(0, dailyDialGoal);
    onStartCalling(limitedContacts);
  };

  return (
    <div className="card bg-white h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">
          📞 Cold Calls
        </h3>
        <span className="text-sm font-medium text-gray-600 bg-teal-100 px-3 py-1 rounded-full">
          {neverContacted.length} available
        </span>
      </div>

      {neverContacted.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">🎉</div>
          <p className="text-gray-600 font-medium">All contacts have been called!</p>
          <p className="text-sm text-gray-500 mt-2">
            Import more contacts to continue cold calling
          </p>
        </div>
      ) : (
        <>
          {/* Daily Goal Setting */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-700">
                Today's Cold Call Goal:
              </div>
              {!isEditingGoal ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-blue-700">{dailyDialGoal}</span>
                  <button
                    onClick={() => {
                      setTempGoal(dailyDialGoal);
                      setIsEditingGoal(true);
                    }}
                    className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={tempGoal}
                    onChange={(e) => setTempGoal(e.target.value === '' ? '' : parseInt(e.target.value))}
                    className="w-16 px-2 py-1 border border-blue-300 rounded text-center text-sm"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveGoal}
                    className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingGoal(false)}
                    className="text-xs px-2 py-1 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Adjust based on your schedule and sequence tasks
            </div>
          </div>

          {/* Quick Start Button */}
          <button
            onClick={handleStartCalling}
            className="w-full mb-2 p-4 rounded-lg text-center bg-teal-600 text-white hover:bg-teal-700 transition-all transform hover:scale-105 shadow-lg"
          >
            <div className="text-2xl mb-1">📞</div>
            <div className="text-lg font-bold">Start Calling Session</div>
            <div className="text-sm mt-1 opacity-90">
              Load {Math.min(dailyDialGoal, neverContacted.length)} contacts for today
            </div>
          </button>

          {/* Total Available Contacts Info */}
          <div className="text-center text-xs text-gray-600 mb-4 py-2 bg-gray-50 rounded border border-gray-200">
            <span className="font-medium">{neverContacted.length} total contacts</span> available to call
          </div>

          {/* Contact List */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Next Contacts to Call
            </div>

            {displayedContacts.map(contact => (
              <div
                key={contact.id}
                className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-teal-50 rounded-lg transition-colors border border-gray-200 hover:border-teal-300"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {contact.companyName}
                  </div>
                  <div className="text-sm text-gray-600">
                    {contact.phone}
                  </div>
                  {contact.industry && (
                    <div className="text-xs text-gray-500 mt-1">
                      {contact.industry}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Show More/Less Toggle */}
            {hasMore && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full mt-3 py-2 text-sm text-teal-700 hover:text-teal-800 font-medium bg-teal-50 hover:bg-teal-100 rounded transition-colors"
              >
                {showAll
                  ? '▲ Show Less'
                  : `▼ Show All ${neverContacted.length} Contacts`
                }
              </button>
            )}
          </div>

        </>
      )}
    </div>
  );
}

export default ColdCallsPanel;
