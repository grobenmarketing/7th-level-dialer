import { useState } from 'react';
import { useContacts } from '../hooks/useContacts';

function Settings({ onBackToDashboard, onLogout, onManageOkCodes }) {
  const { resetAllStats, getStats } = useContacts();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
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

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-r7-blue dark:text-r7-neon">Settings</h1>
            <p className="text-muted">Manage your dialer configuration</p>
          </div>
          <button onClick={onBackToDashboard} className="btn-secondary">
            ← Back to Dashboard
          </button>
        </div>

        {/* Current Stats Overview */}
        <div className="glass-card mb-6">
          <h2 className="text-xl font-bold text-gray-700 mb-4">
            Current Statistics Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-r7-blue/10 dark:bg-r7-neon/10 rounded-lg">
              <div className="text-3xl font-bold text-r7-blue dark:text-r7-neon">
                {stats.totalContacts}
              </div>
              <div className="text-sm text-muted">Total Contacts</div>
            </div>
            <div className="text-center p-4 bg-green-500/10 dark:bg-green-400/10 rounded-lg">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.totalDials}
              </div>
              <div className="text-sm text-muted">Total Dials</div>
            </div>
            <div className="text-center p-4 bg-purple-500/10 dark:bg-purple-400/10 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.totalCalls}
              </div>
              <div className="text-sm text-muted">Calls Logged</div>
            </div>
            <div className="text-center p-4 bg-yellow-500/10 dark:bg-yellow-400/10 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.meetingsBooked}
              </div>
              <div className="text-sm text-muted">Meetings Booked</div>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="glass-card">
          <h2 className="text-xl font-bold text-gray-700 mb-4">
            Admin Actions
          </h2>

          {/* Manage OK Codes Section */}
          <div className="border-2 border-glass rounded-lg p-6 bg-r7-blue/10 dark:bg-r7-neon/10 mb-6">
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

          {/* Reset Stats Section */}
          <div className="border-2 border-glass rounded-lg p-6 bg-red-500/10 dark:bg-red-400/10">
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
              <div className="glass-card border-2 border-red-300 rounded-lg p-4">
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
          <div className="border-2 border-glass rounded-lg p-6 bg-gray-500/10 dark:bg-gray-400/10 mt-6">
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
        <div className="glass-card border-2 border-glass bg-r7-blue/10 dark:bg-r7-neon/10 mt-6">
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
