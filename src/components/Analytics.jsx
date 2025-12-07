import { useStats } from '../hooks/useStats';
import { formatDuration } from '../lib/constants';

function Analytics({ onBackToDashboard }) {
  const {
    getActivityStats,
    getOKCodeDistribution
  } = useStats();

  const activityStats = getActivityStats();
  const okCodeDistribution = getOKCodeDistribution();

  return (
    <div className="min-h-screen bg-gradient-to-br from-r7-light to-gray-100">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-r7-blue flex items-center">
              <span className="mr-3">📊</span>
              Analytics Dashboard
            </h1>
            <p className="text-gray-600">Performance insights and call metrics</p>
          </div>
          <button
            onClick={onBackToDashboard}
            className="btn-secondary"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <div className="text-sm font-semibold opacity-90">Total Contacts</div>
                <div className="text-4xl font-bold my-2">{activityStats.totalContacts}</div>
                <div className="text-sm opacity-80">{activityStats.activeContacts} active</div>
              </div>

              <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                <div className="text-sm font-semibold opacity-90">Total Dials</div>
                <div className="text-4xl font-bold my-2">{activityStats.totalDials}</div>
                <div className="text-sm opacity-80">{activityStats.dmCalls} reached DM</div>
              </div>

              <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <div className="text-sm font-semibold opacity-90">Contact Rate</div>
                <div className="text-4xl font-bold my-2">{activityStats.contactRate}%</div>
                <div className="text-sm opacity-80">DM / Total Dials</div>
              </div>

              <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <div className="text-sm font-semibold opacity-90">Meeting Rate</div>
                <div className="text-4xl font-bold my-2">{activityStats.meetingRate}%</div>
                <div className="text-sm opacity-80">{activityStats.meetingsBooked} meetings booked</div>
              </div>
            </div>

            {/* Call Breakdown */}
            <div className="card bg-white">
              <h3 className="text-xl font-bold text-gray-700 mb-4">Call Outcome Breakdown</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-3xl mb-2">👤</div>
                  <div className="text-2xl font-bold text-green-700">{activityStats.dmCalls}</div>
                  <div className="text-sm text-gray-600">Decision Makers</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {activityStats.totalCalls > 0
                      ? ((activityStats.dmCalls / activityStats.totalCalls) * 100).toFixed(1)
                      : 0}% of calls
                  </div>
                  {activityStats.avgDmDuration > 0 && (
                    <div className="text-xs text-purple-600 font-semibold mt-1">
                      ⏱️ Avg: {formatDuration(activityStats.avgDmDuration)}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-3xl mb-2">🚪</div>
                  <div className="text-2xl font-bold text-yellow-700">{activityStats.gkCalls}</div>
                  <div className="text-sm text-gray-600">Gatekeepers</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {activityStats.totalCalls > 0
                      ? ((activityStats.gkCalls / activityStats.totalCalls) * 100).toFixed(1)
                      : 0}% of calls
                  </div>
                  {activityStats.avgGkDuration > 0 && (
                    <div className="text-xs text-purple-600 font-semibold mt-1">
                      ⏱️ Avg: {formatDuration(activityStats.avgGkDuration)}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="text-3xl mb-2">📵</div>
                  <div className="text-2xl font-bold text-gray-700">{activityStats.naCalls}</div>
                  <div className="text-sm text-gray-600">No Answer</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {activityStats.totalCalls > 0
                      ? ((activityStats.naCalls / activityStats.totalCalls) * 100).toFixed(1)
                      : 0}% of calls
                  </div>
                  {activityStats.avgNaDuration > 0 && (
                    <div className="text-xs text-purple-600 font-semibold mt-1">
                      ⏱️ Avg: {formatDuration(activityStats.avgNaDuration)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Duration Statistics */}
            {activityStats.totalDuration > 0 && (
              <div className="card bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200">
                <h3 className="text-xl font-bold text-gray-700 mb-4">⏱️ Call Duration Analytics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-700">
                      {formatDuration(activityStats.totalDuration)}
                    </div>
                    <div className="text-xs text-gray-600">Total Talk Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-700">
                      {formatDuration(activityStats.avgDuration)}
                    </div>
                    <div className="text-xs text-gray-600">Average per Call</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">
                      {formatDuration(activityStats.avgDmDuration)}
                    </div>
                    <div className="text-xs text-gray-600">Avg DM Call</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-700">
                      {activityStats.avgDmDuration > 0 && activityStats.avgDuration > 0
                        ? ((activityStats.avgDmDuration / activityStats.avgDuration) * 100).toFixed(0)
                        : 0}%
                    </div>
                    <div className="text-xs text-gray-600">DM vs Avg</div>
                  </div>
                </div>
                <div className="text-sm text-purple-800">
                  💡 <strong>Insight:</strong> Longer DM calls often indicate deeper problem discovery and higher engagement.
                </div>
              </div>
            )}

            {/* OK Code Distribution */}
            {okCodeDistribution.length > 0 && (
              <div className="card bg-white">
                <h3 className="text-xl font-bold text-gray-700 mb-4">OK Code Distribution</h3>
                <div className="space-y-2">
                  {okCodeDistribution.map(item => (
                    <div key={item.code} className="flex items-center gap-3">
                      <div className="w-24 font-semibold text-gray-700">{item.code}</div>
                      <div className="flex-1">
                        <div className="bg-gray-200 rounded-full h-6 relative">
                          <div
                            className="bg-r7-blue rounded-full h-6 transition-all duration-500 flex items-center justify-end pr-2"
                            style={{ width: `${item.percentage}%` }}
                          >
                            <span className="text-white text-xs font-semibold">
                              {item.percentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="w-12 text-right font-semibold text-gray-700">
                        {item.count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
      </div>
    </div>
  );
}

export default Analytics;
