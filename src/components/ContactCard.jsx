import { motion } from 'framer-motion';

function ContactCard({ contact }) {
  if (!contact) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="card bg-yellow-50 border-2 border-yellow-200"
      >
        <div className="text-center py-8">
          <div className="text-5xl mb-3">🎉</div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">
            All Done!
          </h3>
          <p className="text-gray-600">
            You've completed all active contacts.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={contact.id}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="card bg-white"
    >
      {/* Sequence Indicator */}
      {contact.sequence_status && contact.sequence_status !== 'never_contacted' && (
        <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {contact.sequence_status === 'active' && (
                <>
                  <span className="text-lg">🔄</span>
                  <span className="font-bold">DAY {contact.sequence_current_day} OF 30</span>
                </>
              )}
              {contact.sequence_status === 'paused' && (
                <>
                  <span className="text-lg">⏸️</span>
                  <span className="font-bold">SEQUENCE PAUSED</span>
                </>
              )}
              {contact.sequence_status === 'completed' && (
                <>
                  <span className="text-lg">✅</span>
                  <span className="font-bold">SEQUENCE COMPLETE</span>
                </>
              )}
              {contact.sequence_status === 'dead' && (
                <>
                  <span className="text-lg">☠️</span>
                  <span className="font-bold">MARKED DEAD</span>
                </>
              )}
              {contact.sequence_status === 'converted' && (
                <>
                  <span className="text-lg">🎉</span>
                  <span className="font-bold">CONVERTED TO CLIENT</span>
                </>
              )}
            </div>
            {contact.sequence_status === 'active' && contact.calls_made !== undefined && (
              <span className="text-sm opacity-90">
                Call #{contact.calls_made + 1} of 4
              </span>
            )}
          </div>
          {contact.sequence_start_date && (
            <div className="text-xs opacity-80 mt-1">
              Started: {new Date(contact.sequence_start_date).toLocaleDateString()}
            </div>
          )}
        </div>
      )}
      {contact.sequence_status === 'never_contacted' && (
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

        {contact.address && (
          <div className="flex items-center">
            <span className="text-2xl mr-3">📍</span>
            <div>
              <div className="text-sm text-gray-500">Address</div>
              <div className="text-lg font-semibold text-gray-700">
                {contact.address}
              </div>
            </div>
          </div>
        )}

        {contact.linkedin && (
          <div className="flex items-center">
            <span className="text-2xl mr-3">💼</span>
            <div>
              <div className="text-sm text-gray-500">LinkedIn</div>
              <a
                href={contact.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-r7-blue hover:underline"
              >
                {contact.linkedin}
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
    </motion.div>
  );
}

export default ContactCard;
