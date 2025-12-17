import { useState, useMemo } from 'react';
import { useContacts } from '../hooks/useContacts';
import { OK_CODES } from '../lib/constants';

function FilteredSessionPage({ onBackToDashboard, onReview }) {
  const { contacts } = useContacts();

  // Filter state
  const [selectedOkCodes, setSelectedOkCodes] = useState([]);
  const [includeNoOkCode, setIncludeNoOkCode] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterMode, setFilterMode] = useState('current'); // 'current' or 'history'

  // Calculate filtered contacts
  const filteredContacts = useMemo(() => {
    let filtered = contacts.filter(c => c.status === 'active');

    // Filter by OK codes
    if (selectedOkCodes.length > 0 || includeNoOkCode) {
      filtered = filtered.filter(contact => {
        // Check for "No OK Code" option
        if (includeNoOkCode && (!contact.currentOkCode || contact.currentOkCode === '')) {
          return true;
        }

        if (selectedOkCodes.length === 0) {
          return false;
        }

        if (filterMode === 'current') {
          // Filter by current OK code only
          return selectedOkCodes.includes(contact.currentOkCode);
        } else {
          // Filter by any OK code in history
          if (selectedOkCodes.includes(contact.currentOkCode)) {
            return true;
          }
          // Check call history
          return contact.callHistory?.some(call =>
            selectedOkCodes.includes(call.okCode)
          ) || false;
        }
      });
    }

    // Filter by date range (ignore for never-called contacts if includeNoOkCode is true)
    if (dateFrom || dateTo) {
      filtered = filtered.filter(contact => {
        // If this contact has no OK code and we're including those, skip date filtering
        if (includeNoOkCode && (!contact.currentOkCode || contact.currentOkCode === '')) {
          return true;
        }

        if (!contact.lastCall) {
          return false;
        }

        const lastCallDate = new Date(contact.lastCall);
        const fromDate = dateFrom ? new Date(dateFrom) : null;
        const toDate = dateTo ? new Date(dateTo) : null;

        if (fromDate && lastCallDate < fromDate) {
          return false;
        }
        if (toDate) {
          // Set toDate to end of day
          const endOfDay = new Date(toDate);
          endOfDay.setHours(23, 59, 59, 999);
          if (lastCallDate > endOfDay) {
            return false;
          }
        }

        return true;
      });
    }

    return filtered;
  }, [contacts, selectedOkCodes, includeNoOkCode, dateFrom, dateTo, filterMode]);

  const handleToggleOkCode = (code) => {
    setSelectedOkCodes(prev =>
      prev.includes(code)
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  const handleSelectAll = () => {
    setSelectedOkCodes(OK_CODES.map(c => c.code));
    setIncludeNoOkCode(true);
  };

  const handleClearAll = () => {
    setSelectedOkCodes([]);
    setIncludeNoOkCode(false);
  };

  const handleSetPreset = (days) => {
    const today = new Date();
    const from = new Date();
    from.setDate(today.getDate() - days);

    setDateFrom(from.toISOString().split('T')[0]);
    setDateTo(today.toISOString().split('T')[0]);
  };

  const handleApplyFilters = () => {
    if (filteredContacts.length === 0) {
      alert('No contacts match your filters. Please adjust your criteria.');
      return;
    }

    const filterCriteria = {
      okCodes: selectedOkCodes,
      includeNoOkCode,
      dateFrom,
      dateTo,
      filterMode,
      contacts: filteredContacts
    };

    onReview(filterCriteria);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-r7-blue dark:text-r7-neon mb-2">
              🎯 Start Filtered Session
            </h1>
            <p className="text-muted">
              Filter contacts by OK codes and call dates
            </p>
          </div>
          <button
            onClick={onBackToDashboard}
            className="btn-secondary"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Filters */}
          <div className="lg:col-span-2 space-y-6">
            {/* OK Codes Filter */}
            <div className="glass-card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-700">
                  OK Codes to Call
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Select All
                  </button>
                  <span className="text-gray-400">|</span>
                  <button
                    onClick={handleClearAll}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* No OK Code Option */}
              <label className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mb-3 border-2 border-glass">
                <input
                  type="checkbox"
                  checked={includeNoOkCode}
                  onChange={(e) => setIncludeNoOkCode(e.target.checked)}
                  className="w-5 h-5 text-r7-blue rounded focus:ring-r7-blue"
                />
                <div className="ml-3 flex-1">
                  <div className="font-semibold text-gray-700">
                    No OK Code (Never Called)
                  </div>
                  <div className="text-xs text-gray-500">
                    Fresh imports and never-dialed contacts
                  </div>
                </div>
              </label>

              <div className="border-t border-glass my-4"></div>

              {/* OK Code Checkboxes */}
              <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                {OK_CODES.map((okCode) => (
                  <label
                    key={okCode.code}
                    className={`flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-2 ${
                      selectedOkCodes.includes(okCode.code)
                        ? 'bg-r7-blue/10 dark:bg-r7-neon/10 border-glass'
                        : 'border-glass'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedOkCodes.includes(okCode.code)}
                      onChange={() => handleToggleOkCode(okCode.code)}
                      className="w-5 h-5 text-r7-blue rounded focus:ring-r7-blue"
                    />
                    <div className="ml-3 flex items-center gap-2 flex-1">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          okCode.color === 'green'
                            ? 'bg-green-500'
                            : okCode.color === 'red'
                            ? 'bg-red-500'
                            : okCode.color === 'yellow'
                            ? 'bg-yellow-500'
                            : okCode.color === 'blue'
                            ? 'bg-blue-500'
                            : 'bg-gray-500'
                        }`}
                      ></span>
                      <span className="text-sm font-mono text-gray-600">
                        {okCode.code}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {okCode.label}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="glass-card">
              <h2 className="text-xl font-bold text-gray-700 mb-4">
                Call Date Range
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleSetPreset(0)}
                  className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                >
                  Today
                </button>
                <button
                  onClick={() => handleSetPreset(7)}
                  className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => handleSetPreset(30)}
                  className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                >
                  Last 30 Days
                </button>
                <button
                  onClick={() => {
                    setDateFrom('');
                    setDateTo('');
                  }}
                  className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  All Time
                </button>
              </div>

              {includeNoOkCode && (
                <div className="mt-4 p-3 bg-r7-blue/10 dark:bg-r7-neon/10 rounded-lg border border-glass">
                  <p className="text-sm text-blue-800">
                    ℹ️ Never-called contacts will be included regardless of date range
                  </p>
                </div>
              )}
            </div>

            {/* Filter Mode */}
            <div className="glass-card">
              <h2 className="text-xl font-bold text-gray-700 mb-4">
                Filter Mode
              </h2>

              <div className="space-y-3">
                <label className="flex items-start p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-2 border-glass">
                  <input
                    type="radio"
                    name="filterMode"
                    value="current"
                    checked={filterMode === 'current'}
                    onChange={(e) => setFilterMode(e.target.value)}
                    className="mt-1 w-5 h-5 text-r7-blue focus:ring-r7-blue"
                  />
                  <div className="ml-3">
                    <div className="font-semibold text-gray-700">
                      Current OK Code Only
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Only contacts whose most recent OK code matches your selection
                    </div>
                  </div>
                </label>

                <label className="flex items-start p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-2 border-glass">
                  <input
                    type="radio"
                    name="filterMode"
                    value="history"
                    checked={filterMode === 'history'}
                    onChange={(e) => setFilterMode(e.target.value)}
                    className="mt-1 w-5 h-5 text-r7-blue focus:ring-r7-blue"
                  />
                  <div className="ml-3">
                    <div className="font-semibold text-gray-700">
                      Any OK Code in History
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Contacts that ever received the selected OK codes
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Results Summary */}
          <div className="space-y-6">
            {/* Results Counter */}
            <div className="card bg-gradient-to-br from-r7-blue to-r7-dark text-white sticky top-4">
              <div className="text-center">
                <div className="text-6xl font-bold mb-2">
                  {filteredContacts.length}
                </div>
                <div className="text-lg opacity-90">
                  contacts match
                </div>
                <div className="text-sm opacity-75 mt-2">
                  your filters
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white border-opacity-20">
                <button
                  onClick={handleApplyFilters}
                  disabled={filteredContacts.length === 0}
                  className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
                    filteredContacts.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-white text-r7-blue hover:shadow-lg transform hover:scale-105'
                  }`}
                >
                  {filteredContacts.length === 0
                    ? 'No Contacts Match'
                    : 'Review & Continue →'
                  }
                </button>
              </div>
            </div>

            {/* Filter Summary */}
            {(selectedOkCodes.length > 0 || includeNoOkCode || dateFrom || dateTo) && (
              <div className="glass-card">
                <h3 className="text-sm font-bold text-gray-700 mb-3">
                  Active Filters
                </h3>
                <div className="space-y-2 text-sm">
                  {includeNoOkCode && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">✓</span>
                      <span className="text-gray-700">Never Called</span>
                    </div>
                  )}
                  {selectedOkCodes.length > 0 && (
                    <div>
                      <div className="text-gray-600 mb-1">
                        OK Codes ({selectedOkCodes.length}):
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedOkCodes.map(code => (
                          <span
                            key={code}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-mono"
                          >
                            {code}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(dateFrom || dateTo) && (
                    <div className="text-gray-700">
                      <span className="text-gray-600">📅</span>
                      {' '}
                      {dateFrom || '...'} to {dateTo || '...'}
                    </div>
                  )}
                  <div className="text-gray-700">
                    <span className="text-gray-600">🔍</span>
                    {' '}
                    {filterMode === 'current' ? 'Current code' : 'Any in history'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilteredSessionPage;
