import { OK_CODES } from '../lib/constants';

function SessionReviewPage({ filterCriteria, onBackToFilters, onStartSession }) {
  const { okCodes, includeNoOkCode, dateFrom, dateTo, filterMode, contacts } = filterCriteria;

  const getOkCodeLabel = (code) => {
    const okCode = OK_CODES.find(c => c.code === code);
    return okCode ? okCode.label : code;
  };

  const getOkCodeColor = (code) => {
    if (!code) return 'bg-gray-100 text-gray-700';
    const okCode = OK_CODES.find(c => c.code === code);
    if (!okCode) return 'bg-gray-100 text-gray-700';

    const colorMap = {
      green: 'bg-green-100 text-green-700',
      red: 'bg-red-100 text-red-700',
      yellow: 'bg-yellow-100 text-yellow-700',
      blue: 'bg-blue-100 text-blue-700',
      gray: 'bg-gray-100 text-gray-700'
    };

    return colorMap[okCode.color] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-r7-light to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-r7-blue mb-2">
            📋 Review Filtered Contacts
          </h1>
          <p className="text-gray-600">
            Review the contacts before loading them into your dial session
          </p>
        </div>

        {/* Summary Card */}
        <div className="card bg-gradient-to-r from-r7-blue to-r7-dark text-white mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm opacity-75 mb-1">Total Contacts</div>
              <div className="text-4xl font-bold">{contacts.length}</div>
            </div>
            <div>
              <div className="text-sm opacity-75 mb-1">Filters Applied</div>
              <div className="text-lg">
                {includeNoOkCode && (
                  <div className="mb-1">✓ Never Called</div>
                )}
                {okCodes.length > 0 && (
                  <div className="mb-1">
                    {okCodes.length} OK Code{okCodes.length > 1 ? 's' : ''}
                  </div>
                )}
                {(dateFrom || dateTo) && (
                  <div>📅 Date Range</div>
                )}
              </div>
            </div>
            <div>
              <div className="text-sm opacity-75 mb-1">Filter Mode</div>
              <div className="text-lg">
                {filterMode === 'current' ? 'Current Code' : 'Any in History'}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Details */}
        <div className="card bg-white mb-6">
          <h2 className="text-xl font-bold text-gray-700 mb-4">
            Filter Criteria
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* OK Codes */}
            <div>
              <div className="text-sm font-semibold text-gray-600 mb-2">
                OK Codes:
              </div>
              <div className="flex flex-wrap gap-2">
                {includeNoOkCode && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                    No OK Code
                  </span>
                )}
                {okCodes.length > 0 ? (
                  okCodes.map(code => (
                    <span
                      key={code}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
                    >
                      {code} - {getOkCodeLabel(code)}
                    </span>
                  ))
                ) : (
                  !includeNoOkCode && (
                    <span className="text-sm text-gray-500">None selected</span>
                  )
                )}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <div className="text-sm font-semibold text-gray-600 mb-2">
                Date Range:
              </div>
              <div className="text-sm text-gray-700">
                {dateFrom || dateTo ? (
                  <>
                    <span>{dateFrom ? new Date(dateFrom).toLocaleDateString() : 'Start'}</span>
                    {' → '}
                    <span>{dateTo ? new Date(dateTo).toLocaleDateString() : 'End'}</span>
                  </>
                ) : (
                  <span className="text-gray-500">All time</span>
                )}
              </div>
              {includeNoOkCode && (dateFrom || dateTo) && (
                <div className="mt-2 text-xs text-blue-600">
                  * Never-called contacts included regardless of date
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contacts Preview Table */}
        <div className="card bg-white mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-700">
              Contacts Preview
            </h2>
            <span className="text-sm text-gray-500">
              {contacts.length} contact{contacts.length !== 1 ? 's' : ''} to call
            </span>
          </div>

          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Dials
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current OK Code
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Call
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map((contact, index) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-semibold text-r7-blue">
                        {contact.companyName || 'Unknown'}
                      </div>
                      {contact.industry && (
                        <div className="text-xs text-gray-500">
                          {contact.industry}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {contact.phone || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium text-r7-blue">
                      {contact.totalDials || 0}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      {contact.currentOkCode ? (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${getOkCodeColor(contact.currentOkCode)}`}>
                          {contact.currentOkCode}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Never Called</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-500">
                      {contact.lastCall
                        ? new Date(contact.lastCall).toLocaleDateString()
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onBackToFilters}
            className="btn-secondary flex-1"
          >
            ← Back to Filters
          </button>
          <button
            onClick={onStartSession}
            className="btn-primary flex-1 text-lg py-4"
          >
            Load into Dial Session →
          </button>
        </div>

        {/* Info Box */}
        <div className="card bg-blue-50 border-2 border-blue-200 mt-6">
          <h4 className="font-bold text-blue-900 mb-2">
            💡 What happens next?
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• These {contacts.length} contacts will be loaded into your calling session</li>
            <li>• You'll call them one by one, just like a normal session</li>
            <li>• Your progress will be saved automatically</li>
            <li>• You can exit and resume anytime</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SessionReviewPage;
