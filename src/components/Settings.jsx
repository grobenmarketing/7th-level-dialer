import { useContacts } from '../hooks/useContacts';

function Settings({ onBackToDashboard, onLogout, onManageOkCodes }) {
  const { getStats } = useContacts();
  const stats = getStats();

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
              className="w-full px-6 py-3 bg-r7-navy hover:bg-r7-dark text-white font-bold rounded-lg transition-all"
            >
              Manage OK Codes →
            </button>
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
