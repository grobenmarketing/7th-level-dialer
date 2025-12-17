import { useState, useEffect, useRef } from 'react';
import { useStats } from '../hooks/useStats';
import { useKPI } from '../hooks/useKPI';
import { useContacts } from '../hooks/useContacts';
import { formatDuration } from '../lib/constants';

function Analytics({ onBackToDashboard }) {
  const {
    getActivityStats,
    getOKCodeDistribution,
    getAllCallRecords
  } = useStats();

  const { contacts } = useContacts();

  const {
    getWeekData,
    getWeeklyTotals,
    getDailyAverages,
    getPerformanceRatios,
    getObjectionFrequency,
    updateKPIForDate,
    weeklyTargets,
    updateWeeklyTargets,
    rebuildFromCallHistory,
    kpiData,
    getWeekStart
  } = useKPI();

  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart());
  const [editingDate, setEditingDate] = useState(null);
  const [editingTargets, setEditingTargets] = useState(false);
  const [tempTargets, setTempTargets] = useState(weeklyTargets);
  const [view, setView] = useState('kpi'); // 'kpi' or 'overview'
  const [syncing, setSyncing] = useState(false);
  const hasAutoSynced = useRef(false);

  const activityStats = getActivityStats();
  const okCodeDistribution = getOKCodeDistribution();
  const weekData = getWeekData(currentWeekStart);
  const weeklyTotals = getWeeklyTotals(currentWeekStart);
  const dailyAverages = getDailyAverages(currentWeekStart);
  const performanceRatios = getPerformanceRatios(currentWeekStart);
  const objectionFrequency = getObjectionFrequency(currentWeekStart);

  // Auto-sync historical data on first load if needed
  useEffect(() => {
    const autoSyncIfNeeded = async () => {
      // Only run once
      if (hasAutoSynced.current) return;

      // Check if we have call history but no KPI data
      const allCalls = getAllCallRecords();
      const hasCallHistory = allCalls.length > 0;
      const hasKPIData = Object.keys(kpiData).length > 0;

      // If we have call history but no KPI data, auto-sync
      if (hasCallHistory && !hasKPIData && contacts.length > 0) {
        console.log('Auto-syncing historical call data to KPI tracker...');
        hasAutoSynced.current = true;
        setSyncing(true);
        try {
          await rebuildFromCallHistory(contacts);
          console.log('Auto-sync complete!');
        } catch (error) {
          console.error('Auto-sync failed:', error);
        } finally {
          setSyncing(false);
        }
      }
    };

    autoSyncIfNeeded();
  }, [contacts, kpiData, getAllCallRecords, rebuildFromCallHistory]);

  const handleEditDay = async (date, field, value) => {
    await updateKPIForDate(date, { [field]: parseInt(value) || 0 });
  };

  const handleSaveTargets = async () => {
    await updateWeeklyTargets(tempTargets);
    setEditingTargets(false);
  };

  const handlePreviousWeek = () => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() - 7);
    setCurrentWeekStart(date.toISOString().split('T')[0]);
  };

  const handleNextWeek = () => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + 7);
    setCurrentWeekStart(date.toISOString().split('T')[0]);
  };

  const handleThisWeek = () => {
    setCurrentWeekStart(getWeekStart());
  };

  const handleSyncFromCallHistory = async () => {
    if (!confirm('This will rebuild all KPI data from your contact call history. Continue?')) {
      return;
    }

    setSyncing(true);
    try {
      await rebuildFromCallHistory(contacts);
      alert('KPI data successfully synced from call history!');
    } catch (error) {
      console.error('Error syncing KPI data:', error);
      alert('Error syncing data. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Auto-sync loading overlay */}
        {syncing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="glass-card p-8 max-w-md text-center">
              <div className="text-6xl mb-4">⏳</div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Syncing Data...</h2>
              <p className="text-muted">
                Building KPI metrics from your call history. This will only take a moment.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-r7-blue dark:text-r7-neon flex items-center">
              <span className="mr-3">📊</span>
              Analytics & KPI Tracker
            </h1>
            <p className="text-muted">Performance insights and weekly activity tracking</p>
          </div>
          <button
            onClick={onBackToDashboard}
            className="btn-secondary"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-6 flex-wrap items-center">
          <button
            onClick={() => setView('kpi')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              view === 'kpi'
                ? 'bg-r7-blue text-white'
                : 'glass-card text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-white/20'
            }`}
          >
            📅 Weekly KPI Tracker
          </button>
          <button
            onClick={() => setView('overview')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              view === 'overview'
                ? 'bg-r7-blue text-white'
                : 'glass-card text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-white/20'
            }`}
          >
            📈 Overall Analytics
          </button>
          <button
            onClick={handleSyncFromCallHistory}
            disabled={syncing}
            className="ml-auto px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
            title="Manually rebuild all KPI data from contact call history (usually not needed - auto-syncs on first load)"
          >
            {syncing ? '⏳ Syncing...' : '🔄 Re-sync All Data'}
          </button>
        </div>

        {view === 'kpi' ? (
          <div className="space-y-6">
            {/* Week Navigation */}
            <div className="glass-card">
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePreviousWeek}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold"
                >
                  ← Previous Week
                </button>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-800">
                    Week of {new Date(currentWeekStart).toLocaleDateString()}
                  </div>
                  <button
                    onClick={handleThisWeek}
                    className="text-sm text-r7-blue hover:underline"
                  >
                    Jump to This Week
                  </button>
                </div>
                <button
                  onClick={handleNextWeek}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold"
                >
                  Next Week →
                </button>
              </div>
            </div>

            {/* Weekly Targets & Progress */}
            <div className="glass-card border-2 border-glass bg-r7-blue/10 dark:bg-r7-neon/10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-700">
                  🎯 Weekly Targets & Progress
                </h3>
                {!editingTargets ? (
                  <button
                    onClick={() => {
                      setTempTargets(weeklyTargets);
                      setEditingTargets(true);
                    }}
                    className="px-4 py-2 bg-r7-blue text-white rounded-lg hover:bg-r7-dark"
                  >
                    ⚙️ Edit Targets
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingTargets(false)}
                      className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveTargets}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      💾 Save
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* Dials Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-700">📞 Dials</span>
                    {editingTargets ? (
                      <input
                        type="number"
                        value={tempTargets.dials}
                        onChange={(e) => setTempTargets({ ...tempTargets, dials: parseInt(e.target.value) || 0 })}
                        className="w-24 px-2 py-1 border border-gray-300 rounded"
                      />
                    ) : (
                      <span className="font-bold text-gray-800">
                        {weeklyTotals.dials} / {weeklyTargets.dials}
                      </span>
                    )}
                  </div>
                  <div className="bg-gray-200 rounded-full h-8">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full h-8 flex items-center justify-center text-white font-bold text-sm"
                      style={{ width: `${Math.min((weeklyTotals.dials / weeklyTargets.dials) * 100, 100)}%` }}
                    >
                      {((weeklyTotals.dials / weeklyTargets.dials) * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly KPI Table */}
            <div className="glass-card overflow-x-auto">
              <h3 className="text-xl font-bold text-gray-700 mb-4">📋 Daily Activity Log</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-glass">
                    <th className="text-left py-2 px-2 font-bold">Day</th>
                    <th className="text-center py-2 px-2 font-bold">📞 Dials</th>
                    <th className="text-center py-2 px-2 font-bold">✅ Pickups<br/><span className="text-xs font-normal">(DM only)</span></th>
                    <th className="text-center py-2 px-2 font-bold">💬 Convos</th>
                    <th className="text-center py-2 px-2 font-bold">🎯 Triage</th>
                    <th className="text-center py-2 px-2 font-bold">📅 Meetings<br/><span className="text-xs font-normal">Booked</span></th>
                    <th className="text-center py-2 px-2 font-bold">✔️ Meetings<br/><span className="text-xs font-normal">Ran</span></th>
                  </tr>
                </thead>
                <tbody>
                  {weekData.map((day) => (
                    <tr key={day.date} className="border-b border-glass hover:bg-r7-blue/5 dark:hover:bg-r7-neon/5">
                      <td className="py-3 px-2 font-semibold">
                        {day.dayName}<br/>
                        <span className="text-xs text-muted">{new Date(day.date).toLocaleDateString()}</span>
                      </td>
                      <td className="text-center py-3 px-2">
                        <input
                          type="number"
                          value={day.dials || 0}
                          onChange={(e) => handleEditDay(day.date, 'dials', e.target.value)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                          min="0"
                        />
                      </td>
                      <td className="text-center py-3 px-2">
                        <input
                          type="number"
                          value={day.pickups || 0}
                          onChange={(e) => handleEditDay(day.date, 'pickups', e.target.value)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                          min="0"
                        />
                      </td>
                      <td className="text-center py-3 px-2">
                        <input
                          type="number"
                          value={day.conversations || 0}
                          onChange={(e) => handleEditDay(day.date, 'conversations', e.target.value)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                          min="0"
                        />
                      </td>
                      <td className="text-center py-3 px-2">
                        <input
                          type="number"
                          value={day.triage || 0}
                          onChange={(e) => handleEditDay(day.date, 'triage', e.target.value)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                          min="0"
                        />
                      </td>
                      <td className="text-center py-3 px-2">
                        <input
                          type="number"
                          value={day.bookedMeetings || 0}
                          onChange={(e) => handleEditDay(day.date, 'bookedMeetings', e.target.value)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                          min="0"
                        />
                      </td>
                      <td className="text-center py-3 px-2">
                        <input
                          type="number"
                          value={day.meetingsRan || 0}
                          onChange={(e) => handleEditDay(day.date, 'meetingsRan', e.target.value)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                          min="0"
                        />
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr className="bg-r7-blue/10 dark:bg-r7-neon/10 font-bold border-t-2 border-glass">
                    <td className="py-3 px-2">TOTAL</td>
                    <td className="text-center py-3 px-2">{weeklyTotals.dials}</td>
                    <td className="text-center py-3 px-2">{weeklyTotals.pickups}</td>
                    <td className="text-center py-3 px-2">{weeklyTotals.conversations}</td>
                    <td className="text-center py-3 px-2">{weeklyTotals.triage}</td>
                    <td className="text-center py-3 px-2">{weeklyTotals.bookedMeetings}</td>
                    <td className="text-center py-3 px-2">{weeklyTotals.meetingsRan}</td>
                  </tr>
                  {/* Daily Average Row */}
                  <tr className="bg-green-500/10 dark:bg-green-400/10 font-semibold">
                    <td className="py-3 px-2">
                      Daily Avg
                      <br/>
                      <span className="text-xs font-normal text-muted">
                        ({dailyAverages.daysWorked} {dailyAverages.daysWorked === 1 ? 'day' : 'days'} worked)
                      </span>
                    </td>
                    <td className="text-center py-3 px-2">{dailyAverages.dials.toFixed(1)}</td>
                    <td className="text-center py-3 px-2">{dailyAverages.pickups.toFixed(1)}</td>
                    <td className="text-center py-3 px-2">{dailyAverages.conversations.toFixed(1)}</td>
                    <td className="text-center py-3 px-2">{dailyAverages.triage.toFixed(1)}</td>
                    <td className="text-center py-3 px-2">{dailyAverages.bookedMeetings.toFixed(1)}</td>
                    <td className="text-center py-3 px-2">{dailyAverages.meetingsRan.toFixed(1)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Performance Ratios */}
            <div className="glass-card border-2 border-glass bg-purple-500/10 dark:bg-purple-400/10">
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-4">📈 Your Performance Ratios</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white/50 dark:bg-white/10 rounded-lg">
                  <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">
                    {(performanceRatios.meetingsShowedRatio * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-muted mt-1">Meetings Showed</div>
                  <div className="text-xs text-muted mt-1">Ran / Booked</div>
                </div>
                <div className="text-center p-4 bg-white/50 dark:bg-white/10 rounded-lg">
                  <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                    {(performanceRatios.conversationsToMeetings * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-muted mt-1">Convos to Meetings</div>
                  <div className="text-xs text-muted mt-1">Booked / Convos</div>
                </div>
                <div className="text-center p-4 bg-white/50 dark:bg-white/10 rounded-lg">
                  <div className="text-3xl font-bold text-green-700 dark:text-green-400">
                    {(performanceRatios.triageToConversations * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-muted mt-1">Triage Rate</div>
                  <div className="text-xs text-muted mt-1">Triage / Convos</div>
                </div>
                <div className="text-center p-4 bg-white/50 dark:bg-white/10 rounded-lg">
                  <div className="text-3xl font-bold text-orange-700 dark:text-orange-400">
                    {(performanceRatios.pickupsToConversations * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-muted mt-1">Pickup to Convo</div>
                  <div className="text-xs text-muted mt-1">Convos / Pickups</div>
                </div>
              </div>
            </div>

            {/* Objection Frequency */}
            {objectionFrequency.length > 0 && (
              <div className="glass-card">
                <h3 className="text-xl font-bold text-gray-700 mb-4">⚠️ Most Common Objections This Week</h3>
                <div className="space-y-2">
                  {objectionFrequency.slice(0, 10).map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 font-semibold text-gray-700 capitalize">
                        {item.objection}
                      </div>
                      <div className="w-16 text-right font-bold text-gray-700">
                        {item.count}x
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <div className="text-sm font-semibold opacity-90">Total Contacts</div>
                <div className="text-4xl font-bold my-2">{activityStats.totalContacts}</div>
                <div className="text-sm opacity-80">{activityStats.activeContacts} active</div>
              </div>

              <div className="glass-card bg-gradient-to-br from-green-500 to-green-600 text-white">
                <div className="text-sm font-semibold opacity-90">Total Dials</div>
                <div className="text-4xl font-bold my-2">{activityStats.totalDials}</div>
                <div className="text-sm opacity-80">{activityStats.dmCalls} reached DM</div>
              </div>

              <div className="glass-card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <div className="text-sm font-semibold opacity-90">Contact Rate</div>
                <div className="text-4xl font-bold my-2">{activityStats.contactRate}%</div>
                <div className="text-sm opacity-80">DM / Total Dials</div>
              </div>

              <div className="glass-card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <div className="text-sm font-semibold opacity-90">Meeting Rate</div>
                <div className="text-4xl font-bold my-2">{activityStats.meetingRate}%</div>
                <div className="text-sm opacity-80">{activityStats.meetingsBooked} meetings booked</div>
              </div>
            </div>

            {/* Call Breakdown */}
            <div className="glass-card">
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-4">Call Outcome Breakdown</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-500/10 dark:bg-green-400/10 border border-glass rounded-lg">
                  <div className="text-3xl mb-2">👤</div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">{activityStats.dmCalls}</div>
                  <div className="text-sm text-muted">Decision Makers</div>
                  <div className="text-xs text-muted mt-1">
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

                <div className="p-4 bg-yellow-500/10 dark:bg-yellow-400/10 border border-glass rounded-lg">
                  <div className="text-3xl mb-2">🚪</div>
                  <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{activityStats.gkCalls}</div>
                  <div className="text-sm text-muted">Gatekeepers</div>
                  <div className="text-xs text-muted mt-1">
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

                <div className="p-4 bg-gray-500/10 dark:bg-gray-400/10 border border-glass rounded-lg">
                  <div className="text-3xl mb-2">📵</div>
                  <div className="text-2xl font-bold text-gray-700 dark:text-gray-400">{activityStats.naCalls}</div>
                  <div className="text-sm text-muted">No Answer</div>
                  <div className="text-xs text-muted mt-1">
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
              <div className="glass-card border-2 border-glass bg-purple-500/10 dark:bg-purple-400/10">
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-4">⏱️ Call Duration Analytics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                      {formatDuration(activityStats.totalDuration)}
                    </div>
                    <div className="text-xs text-muted">Total Talk Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                      {formatDuration(activityStats.avgDuration)}
                    </div>
                    <div className="text-xs text-muted">Average per Call</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                      {formatDuration(activityStats.avgDmDuration)}
                    </div>
                    <div className="text-xs text-muted">Avg DM Call</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                      {activityStats.avgDmDuration > 0 && activityStats.avgDuration > 0
                        ? ((activityStats.avgDmDuration / activityStats.avgDuration) * 100).toFixed(0)
                        : 0}%
                    </div>
                    <div className="text-xs text-muted">DM vs Avg</div>
                  </div>
                </div>
                <div className="text-sm text-purple-800">
                  💡 <strong>Insight:</strong> Longer DM calls often indicate deeper problem discovery and higher engagement.
                </div>
              </div>
            )}

            {/* OK Code Distribution */}
            {okCodeDistribution.length > 0 && (
              <div className="glass-card">
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
        )}
      </div>
    </div>
  );
}

export default Analytics;
