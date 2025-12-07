function ContactCard({ contact }) {
  if (!contact) {
    return (
      <div className="card bg-yellow-50 border-2 border-yellow-200">
        <div className="text-center py-8">
          <div className="text-5xl mb-3">🎉</div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">
            All Done!
          </h3>
          <p className="text-gray-600">
            You've completed all active contacts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-white">
      {/* Company Header */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <h2 className="text-3xl font-bold text-r7-blue mb-2">
          {contact.companyName || 'Unknown Company'}
        </h2>
        {contact.industry && (
          <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
            {contact.industry}
          </span>
        )}
        {contact.companySize && (
          <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm ml-2">
            {contact.companySize} employees
          </span>
        )}
      </div>

      {/* Contact Info */}
      <div className="space-y-3 mb-6">
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

      {/* Call Stats */}
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

      {/* Call History */}
      {contact.callHistory && contact.callHistory.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-bold text-gray-700 mb-3">
            📋 Recent Call History
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {contact.callHistory.slice(-5).reverse().map((call, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 rounded border-l-4 border-blue-400"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-semibold text-gray-700">
                    {call.outcome === 'DM' && '👤 Decision Maker'}
                    {call.outcome === 'GK' && '🚪 Gatekeeper'}
                    {call.outcome === 'NA' && '📵 No Answer'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(call.date).toLocaleDateString()}
                  </span>
                </div>
                {call.okCode && (
                  <div className="text-xs text-blue-600 mb-1">
                    {call.okCode}
                  </div>
                )}
                {call.notes && (
                  <div className="text-sm text-gray-600 mt-1">
                    {call.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ContactCard;
