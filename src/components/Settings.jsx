import { useState } from 'react';
import { useContacts } from '../hooks/useContacts';
import { useKPI } from '../hooks/useKPI';
import { resetContactsToFresh } from '../lib/resetContacts';

function Settings({ onBackToDashboard, onLogout, onManageOkCodes }) {
  const { resetAllStats, getStats } = useContacts();
  const { resetAllKPI } = useKPI();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showResetContactsDialog, setShowResetContactsDialog] = useState(false);
  const [showResetKPIDialog, setShowResetKPIDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isResettingContacts, setIsResettingContacts] = useState(false);
  const [isResettingKPI, setIsResettingKPI] = useState(false);
  const stats = getStats();

  const handleResetStats = async () => {
    setIsResetting(true);
    try {
      await resetAllStats();
      alert('All stats have been reset successfully!');
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Error resetting stats:', error);
      alert('Failed to reset stats. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetContacts = async () => {
    setIsResettingContacts(true);
    try {
      const result = await resetContactsToFresh(30);
      if (result.success) {
        alert(`✅ Successfully created ${result.count} fresh contacts!\n\nAll contacts are now in "never_contacted" status and ready for cold calling.`);
        setShowResetContactsDialog(false);
        // Reload page to refresh all data
        window.location.reload();
      } else {
        alert(`❌ Failed to reset contacts: ${result.error}`);
      }
    } catch (error) {
      console.error('Error resetting contacts:', error);
      alert('Failed to reset contacts. Please try again.');
    } finally {
      setIsResettingContacts(false);
    }
  };

  const handleResetKPI = async () => {
    setIsResettingKPI(true);
    try {
      await resetAllKPI();
      alert('✅ All KPI data has been reset successfully!\n\nDial counts, pickups, conversations, and all metrics are now cleared.');
      setShowResetKPIDialog(false);
      // Reload page to refresh all data
      window.location.reload();
    } catch (error) {
      console.error('Error resetting KPI:', error);
      alert('Failed to reset KPI data. Please try again.');
    } finally {
      setIsResettingKPI(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-r7-light to-gray-100">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-r7-blue">Settings</h1>
            <p className="text-gray-600">Manage your dialer configuration</p>
          </div>
          <button onClick={onBackToDashboard} className="btn-secondary">
            ← Back to Dashboard
          </button>
        </div>

        {/* Current Stats Overview */}
        <div className="card bg-white mb-6">
          <h2 className="text-xl font-bold text-gray-700 mb-4">
            Current Statistics Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-r7-blue">
                {stats.totalContacts}
              </div>
              <div className="text-sm text-gray-600">Total Contacts</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {stats.totalDials}
              </div>
              <div className="text-sm text-gray-600">Total Dials</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {stats.totalCalls}
              </div>
              <div className="text-sm text-gray-600">Calls Logged</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600">
                {stats.meetingsBooked}
              </div>
              <div className="text-sm text-gray-600">Meetings Booked</div>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="card bg-white">
          <h2 className="text-xl font-bold text-gray-700 mb-4">
            Admin Actions
          </h2>

          {/* Manage OK Codes Section */}
          <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-blue-800 mb-2">
                  Manage OK Codes
                </h3>
                <p className="text-sm text-blue-700 mb-4">
                  Customize your call outcome options. Add, edit, delete, and reorder
                  OK codes to match your sales process.
                </p>
              </div>
            </div>
            <button
              onClick={onManageOkCodes}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all"
            >
              Manage OK Codes →
            </button>
          </div>

          {/* Reset to Fresh Contacts Section */}
          <div className="border-2 border-teal-200 rounded-lg p-6 bg-teal-50 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-teal-800 mb-2">
                  Reset to Fresh Contacts (Testing)
                </h3>
                <p className="text-sm text-teal-700 mb-4">
                  Delete all existing contacts and create 30 fresh test contacts
                  with "never_contacted" status. Perfect for testing the cold calling
                  and sequence workflow.
                </p>
                <ul className="text-sm text-teal-700 space-y-1 mb-4">
                  <li>✓ Deletes all existing contacts</li>
                  <li>✓ Deletes all sequence tasks</li>
                  <li>✓ Creates 30 fresh contacts</li>
                  <li>✓ All contacts ready for cold calling</li>
                </ul>
              </div>
            </div>

            {!showResetContactsDialog ? (
              <button
                onClick={() => setShowResetContactsDialog(true)}
                className="w-full px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition-all"
              >
                Reset to Fresh Contacts
              </button>
            ) : (
              <div className="bg-white border-2 border-teal-300 rounded-lg p-4">
                <p className="text-center font-bold text-teal-800 mb-4">
                  This will delete all existing contacts and tasks. Continue?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowResetContactsDialog(false)}
                    disabled={isResettingContacts}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResetContacts}
                    disabled={isResettingContacts}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition-all disabled:opacity-50"
                  >
                    {isResettingContacts ? 'Resetting...' : 'Yes, Create Fresh Contacts'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reset KPI Data Section */}
          <div className="border-2 border-orange-200 rounded-lg p-6 bg-orange-50 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-orange-800 mb-2">
                  Reset KPI Data
                </h3>
                <p className="text-sm text-orange-700 mb-4">
                  Clear all daily and weekly KPI metrics including dial counts,
                  pickups, conversations, triage, and objections. Use this to fix
                  incorrect or stale data.
                </p>
                <ul className="text-sm text-orange-700 space-y-1 mb-4">
                  <li>✓ Resets daily dial counts to 0</li>
                  <li>✓ Clears all KPI metrics</li>
                  <li>✓ Removes objection tracking data</li>
                  <li>✓ Keeps call goal settings</li>
                  <li>✓ Preserves contact data</li>
                </ul>
              </div>
            </div>

            {!showResetKPIDialog ? (
              <button
                onClick={() => setShowResetKPIDialog(true)}
                className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-all"
              >
                Reset KPI Data
              </button>
            ) : (
              <div className="bg-white border-2 border-orange-300 rounded-lg p-4">
                <p className="text-center font-bold text-orange-800 mb-4">
                  This will reset all KPI metrics. Continue?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowResetKPIDialog(false)}
                    disabled={isResettingKPI}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResetKPI}
                    disabled={isResettingKPI}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-all disabled:opacity-50"
                  >
                    {isResettingKPI ? 'Resetting...' : 'Yes, Reset KPI Data'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reset Stats Section */}
          <div className="border-2 border-red-200 rounded-lg p-6 bg-red-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-800 mb-2">
                  Reset All Statistics
                </h3>
                <p className="text-sm text-red-700 mb-4">
                  This will permanently delete all call history, dial counts,
                  and OK codes for all contacts. This action cannot be undone.
                  Contact information (company names, phone numbers, etc.) will
                  be preserved.
                </p>
                <ul className="text-sm text-red-700 space-y-1 mb-4">
                  <li>✓ Clears all call history</li>
                  <li>✓ Resets total dials to 0</li>
                  <li>✓ Removes all OK codes</li>
                  <li>✓ Preserves contact details</li>
                </ul>
              </div>
            </div>

            {!showConfirmDialog ? (
              <button
                onClick={() => setShowConfirmDialog(true)}
                className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all"
              >
                Reset All Stats
              </button>
            ) : (
              <div className="bg-white border-2 border-red-300 rounded-lg p-4">
                <p className="text-center font-bold text-red-800 mb-4">
                  Are you absolutely sure? This cannot be undone!
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowConfirmDialog(false)}
                    disabled={isResetting}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResetStats}
                    disabled={isResetting}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all disabled:opacity-50"
                  >
                    {isResetting ? 'Resetting...' : 'Yes, Reset Everything'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Logout Section */}
          <div className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50 mt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Logout
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  End your current session and return to the login screen.
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-all"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="card bg-blue-50 border-2 border-blue-200 mt-6">
          <h3 className="font-bold text-blue-900 mb-2">
            About Settings
          </h3>
          <p className="text-sm text-blue-800">
            This settings page provides administrative controls for managing
            your 7th Level Dialer data. More features coming soon!
          </p>
        </div>
      </div>
    </div>
  );
}

export default Settings;
