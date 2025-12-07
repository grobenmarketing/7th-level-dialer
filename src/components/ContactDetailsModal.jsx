function ContactDetailsModal({ contact, onClose }) {
  if (!contact) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-r7-blue mb-2">
              {contact.companyName || 'Unknown Company'}
            </h2>
            <div className="flex gap-2">
              {contact.industry && (
                <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {contact.industry}
                </span>
              )}
              {contact.companySize && (
                <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {contact.companySize} employees
                </span>
              )}
              <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                contact.status === 'active' ? 'bg-green-100 text-green-700' :
                contact.status === 'closed-won' ? 'bg-blue-100 text-blue-700' :
                contact.status === 'closed-lost' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {contact.status}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Contact Information */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-700 mb-3">
              Contact Information
            </h3>
            <div className="space-y-3">
              {contact.phone && (
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📞</span>
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <a
                      href={`tel:${contact.phone}`}
                      className="text-lg font-semibold text-r7-blue hover:underline"
                    >
                      {contact.phone}
                    </a>
                  </div>
                </div>
              )}

              {contact.website && (
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🌐</span>
                  <div>
                    <div className="text-sm text-gray-500">Website</div>
                    <a
                      href={contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-r7-blue hover:underline"
                    >
                      {contact.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Call Statistics */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-700 mb-3">
              Call Statistics
            </h3>
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-r7-blue">
                  {contact.totalDials || 0}
                </div>
                <div className="text-xs text-gray-600">Total Dials</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {contact.callHistory?.length || 0}
                </div>
                <div className="text-xs text-gray-600">Calls Logged</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-700 mt-1">
                  {contact.currentOkCode || 'N/A'}
                </div>
                <div className="text-xs text-gray-600">Last OK Code</div>
              </div>
            </div>
          </div>

          {/* Call History */}
          {contact.callHistory && contact.callHistory.length > 0 ? (
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-3">
                📋 Complete Call History
              </h3>
              <div className="space-y-3">
                {contact.callHistory.slice().reverse().map((call, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-400"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-base font-semibold text-gray-700">
                        {call.outcome === 'DM' && '👤 Decision Maker'}
                        {call.outcome === 'GK' && '🚪 Gatekeeper'}
                        {call.outcome === 'NA' && '📵 No Answer'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(call.date).toLocaleDateString()} {new Date(call.date).toLocaleTimeString()}
                      </span>
                    </div>
                    {call.okCode && (
                      <div className="mb-2">
                        <span className="text-xs font-semibold text-gray-500 mr-2">OK Code:</span>
                        <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {call.okCode}
                        </span>
                      </div>
                    )}
                    {call.notes && (
                      <div className="mt-2 p-3 bg-white rounded border border-gray-200">
                        <div className="text-xs font-semibold text-gray-500 mb-1">Notes:</div>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">
                          {call.notes}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📞</div>
              <div>No calls logged yet</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn-secondary w-full"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ContactDetailsModal;
