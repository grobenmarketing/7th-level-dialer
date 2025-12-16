import { useMemo } from 'react';

function SessionEndSummary({ contacts, onBackToDashboard, onViewContacts }) {
  // Get contacts that need email follow-up
  const emailContacts = useMemo(() => {
    return contacts.filter(contact => contact.needsEmail);
  }, [contacts]);

  // Get contacts with specific OK codes that might need callbacks
  const callbackContacts = useMemo(() => {
    return contacts.filter(contact =>
      contact.currentOkCode &&
      (contact.currentOkCode.toLowerCase().includes('call back') ||
       contact.currentOkCode.toLowerCase().includes('callback'))
    );
  }, [contacts]);

  const totalContacts = contacts.length;
  const contactsWithCalls = contacts.filter(c => c.totalDials > 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-r7-light to-gray-100">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold text-r7-blue mb-2">Session Complete!</h1>
          <p className="text-xl text-gray-600">Great work on your calling session</p>
        </div>

        {/* Session Stats */}
        <div className="card bg-white mb-6">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Session Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-r7-blue">{totalContacts}</div>
              <div className="text-sm text-gray-600">Total Contacts</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{contactsWithCalls}</div>
              <div className="text-sm text-gray-600">Contacts Called</div>
            </div>
          </div>
        </div>

        {/* Follow-up Actions */}
        {(emailContacts.length > 0 || callbackContacts.length > 0) && (
          <div className="card bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 mb-6">
            <h2 className="text-2xl font-bold text-orange-900 mb-4">
              📋 Follow-up Actions Required
            </h2>

            {/* Email Follow-ups */}
            {emailContacts.length > 0 && (
              <div className="mb-6 last:mb-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-2xl">📧</span>
                    Send Email ({emailContacts.length})
                  </h3>
                </div>
                <div className="bg-white rounded-lg p-4 space-y-2 max-h-64 overflow-y-auto">
                  {emailContacts.map((contact, index) => (
                    <div key={contact.id} className="flex items-center justify-between border-b border-gray-200 pb-2 last:border-0">
                      <div>
                        <div className="font-semibold text-gray-800">{index + 1}. {contact.companyName}</div>
                        <div className="text-sm text-gray-600">{contact.phone}</div>
                        {contact.currentOkCode && (
                          <div className="text-xs text-gray-500">Last OK: {contact.currentOkCode}</div>
                        )}
                      </div>
                      {contact.linkedin && (
                        <a
                          href={contact.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          LinkedIn →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Callback Follow-ups */}
            {callbackContacts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-2xl">📞</span>
                    Schedule Callbacks ({callbackContacts.length})
                  </h3>
                </div>
                <div className="bg-white rounded-lg p-4 space-y-2 max-h-64 overflow-y-auto">
                  {callbackContacts.map((contact, index) => (
                    <div key={contact.id} className="flex items-center justify-between border-b border-gray-200 pb-2 last:border-0">
                      <div>
                        <div className="font-semibold text-gray-800">{index + 1}. {contact.companyName}</div>
                        <div className="text-sm text-gray-600">{contact.phone}</div>
                        <div className="text-xs text-gray-500">Last OK: {contact.currentOkCode}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* No Follow-ups Message */}
        {emailContacts.length === 0 && callbackContacts.length === 0 && (
          <div className="card bg-gray-50 border-2 border-gray-200 mb-6 text-center py-8">
            <div className="text-4xl mb-2">✓</div>
            <p className="text-gray-600">No follow-up actions needed</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onBackToDashboard}
            className="btn-secondary py-4 text-lg"
          >
            ← Back to Dashboard
          </button>
          <button
            onClick={onViewContacts}
            className="btn-primary py-4 text-lg"
          >
            View All Contacts →
          </button>
        </div>

        {/* Info */}
        <div className="card bg-blue-50 border-2 border-blue-200 mt-6">
          <h3 className="font-bold text-blue-900 mb-2">💡 Next Steps</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use the Contacts page to filter and export contacts marked for email</li>
            <li>• Review call notes for detailed context on each contact</li>
            <li>• Check Analytics for session performance metrics</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SessionEndSummary;
