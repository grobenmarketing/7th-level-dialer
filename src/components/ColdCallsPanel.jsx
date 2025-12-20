import { useState } from 'react';
import { getNeverContactedLeads } from '../lib/taskScheduler';

function ColdCallsPanel({ contacts, onStartCalling }) {
  const [showAll, setShowAll] = useState(false);

  const neverContacted = getNeverContactedLeads(contacts);
  const displayLimit = 10;
  const displayedContacts = showAll ? neverContacted : neverContacted.slice(0, displayLimit);
  const hasMore = neverContacted.length > displayLimit;

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
          {/* Quick Start Button */}
          <button
            onClick={onStartCalling}
            className="w-full mb-4 p-4 rounded-lg text-center bg-gradient-to-br from-teal-600 to-teal-700 text-white hover:from-teal-700 hover:to-teal-800 transition-all transform hover:scale-105 shadow-lg"
          >
            <div className="text-2xl mb-1">📞</div>
            <div className="text-lg font-bold">Start Calling Session</div>
            <div className="text-sm mt-1 opacity-90">
              {neverContacted.length} contacts ready
            </div>
          </button>

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

          {/* Stats Footer */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-600 text-center">
              💡 <span className="font-medium">Goal: ~25 calls/day</span>
              <br />
              <span className="text-gray-500">
                Adjust based on sequence tasks and meetings
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ColdCallsPanel;
