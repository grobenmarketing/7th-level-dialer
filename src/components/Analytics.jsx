import { useState } from 'react';
import { useStats } from '../hooks/useStats';
import { useContacts } from '../hooks/useContacts';
import { NEPQ_PHASES } from '../lib/constants';

function Analytics({ onBackToDashboard }) {
  const {
    getActivityStats,
    getNEPQFunnelStats,
    getProblemLevelDistribution,
    getAvatarPerformanceStats,
    getPhaseConversionRates,
    getOKCodeDistribution,
    getTopContacts
  } = useStats();

  const activityStats = getActivityStats();
  const nepqFunnel = getNEPQFunnelStats();
  const problemDistribution = getProblemLevelDistribution();
  const avatarPerformance = getAvatarPerformanceStats();
  const phaseConversion = getPhaseConversionRates();
  const okCodeDistribution = getOKCodeDistribution();
  const topContacts = getTopContacts(5);

  const [selectedView, setSelectedView] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-r7-light to-gray-100">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-r7-blue flex items-center">
              <span className="mr-3">📊</span>
              NEPQ Analytics Dashboard
            </h1>
            <p className="text-gray-600">Performance insights and conversion metrics</p>
          </div>
          <button
            onClick={onBackToDashboard}
            className="btn-secondary"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['overview', 'funnel', 'avatars', 'problems'].map(view => (
            <button
              key={view}
              onClick={() => setSelectedView(view)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedView === view
                  ? 'bg-r7-blue text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {view === 'overview' && '📈 Overview'}
              {view === 'funnel' && '🔄 NEPQ Funnel'}
              {view === 'avatars' && '👥 Avatar Performance'}
              {view === 'problems' && '🎯 Problem Discovery'}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {selectedView === 'overview' && (
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
                </div>
              </div>
            </div>

            {/* Top Performing Contacts */}
            {topContacts.length > 0 && (
              <div className="card bg-white">
                <h3 className="text-xl font-bold text-gray-700 mb-4">
                  🌟 Top Performing Contacts (by NEPQ Progress)
                </h3>
                <div className="space-y-2">
                  {topContacts.map((contact, index) => {
                    const phase = NEPQ_PHASES.find(p => p.id === contact.nepqPhase);
                    return (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-r7-blue text-white rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{contact.companyName}</div>
                            <div className="text-sm text-gray-500">
                              {contact.totalDials} {contact.totalDials === 1 ? 'call' : 'calls'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm font-semibold text-r7-blue">
                              {phase?.icon} {phase?.name}
                            </div>
                            {contact.problemLevel > 0 && (
                              <div className="text-xs text-gray-500">
                                Problem Level: L{contact.problemLevel}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
        )}

        {/* NEPQ Funnel Tab */}
        {selectedView === 'funnel' && (
          <div className="space-y-6">
            {/* Funnel Visualization */}
            <div className="card bg-white">
              <h3 className="text-xl font-bold text-gray-700 mb-4">NEPQ Journey Funnel</h3>
              <p className="text-sm text-gray-600 mb-6">
                Shows how many contacts have reached each NEPQ phase
              </p>
              <div className="space-y-3">
                {nepqFunnel.map((stage, index) => (
                  <div key={stage.phaseId}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{stage.icon}</span>
                        <span className="font-semibold text-gray-700">{stage.phase}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-r7-blue">{stage.contactsReachedPhase}</span>
                        <span className="text-gray-500 text-sm ml-2">({stage.percentage}%)</span>
                      </div>
                    </div>
                    <div className="bg-gray-200 rounded-full h-8 relative overflow-hidden">
                      <div
                        className={`h-8 rounded-full transition-all duration-500 ${
                          index === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                          index === 1 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                          index === 2 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                          index === 3 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                          index === 4 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                          index === 5 ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                          'bg-gradient-to-r from-pink-500 to-pink-600'
                        }`}
                        style={{ width: `${stage.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Phase Conversion Rates */}
            <div className="card bg-white">
              <h3 className="text-xl font-bold text-gray-700 mb-4">Phase-to-Phase Conversion Rates</h3>
              <p className="text-sm text-gray-600 mb-6">
                Percentage of contacts that progress from one phase to the next
              </p>
              <div className="space-y-4">
                {phaseConversion.map(phase => (
                  <div key={phase.phaseId} className="border-l-4 border-r7-blue pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-semibold text-gray-700">
                          {phase.icon} {phase.phase}
                        </div>
                        <div className="text-sm text-gray-500">
                          {phase.contactsIn} in → {phase.contactsOut} out
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          phase.conversionRate >= 70 ? 'text-green-600' :
                          phase.conversionRate >= 50 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {phase.conversionRate}%
                        </div>
                        <div className="text-xs text-gray-500">{phase.dropOff} drop-off</div>
                      </div>
                    </div>
                    <div className="bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          phase.conversionRate >= 70 ? 'bg-green-500' :
                          phase.conversionRate >= 50 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${phase.conversionRate}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Avatar Performance Tab */}
        {selectedView === 'avatars' && (
          <div className="space-y-6">
            {avatarPerformance.length > 0 ? (
              <>
                <div className="card bg-white">
                  <h3 className="text-xl font-bold text-gray-700 mb-4">Avatar Performance Comparison</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Compare how different buyer personas (avatars/ICPs) perform
                  </p>
                  <div className="space-y-4">
                    {avatarPerformance.map((avatar, index) => (
                      <div
                        key={avatar.avatarId}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-lg font-bold text-gray-800">{avatar.avatarName}</h4>
                            {avatar.position && (
                              <p className="text-sm text-gray-600">{avatar.position}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${
                              avatar.conversionRate >= 30 ? 'text-green-600' :
                              avatar.conversionRate >= 15 ? 'text-yellow-600' :
                              'text-gray-600'
                            }`}>
                              {avatar.conversionRate}%
                            </div>
                            <div className="text-xs text-gray-500">conversion</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <div className="text-xs text-gray-500">Contacts</div>
                            <div className="text-lg font-semibold text-gray-700">{avatar.totalContacts}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">DM Calls</div>
                            <div className="text-lg font-semibold text-gray-700">{avatar.dmCalls}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Meetings</div>
                            <div className="text-lg font-semibold text-green-600">{avatar.meetingsBooked}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Avg Problem Level</div>
                            <div className="text-lg font-semibold text-blue-600">
                              L{avatar.avgProblemLevel}
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-r7-blue to-blue-600 rounded-full h-2 transition-all duration-500"
                            style={{ width: `${Math.min(avatar.conversionRate * 2, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="card bg-white text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Avatar Data Yet</h3>
                <p className="text-gray-600">
                  Create avatars and assign them to contacts to see performance metrics
                </p>
              </div>
            )}
          </div>
        )}

        {/* Problem Discovery Tab */}
        {selectedView === 'problems' && (
          <div className="space-y-6">
            <div className="card bg-white">
              <h3 className="text-xl font-bold text-gray-700 mb-4">Problem Discovery Distribution</h3>
              <p className="text-sm text-gray-600 mb-6">
                Shows how deeply you're uncovering problems (L1-L4 framework)
              </p>
              <div className="space-y-3">
                {problemDistribution.map(level => (
                  <div key={level.level}>
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="font-semibold text-gray-700">
                          {level.level > 0 ? `L${level.level}:` : ''} {level.name}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({level.description})
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-r7-blue">{level.contactsAtLevel}</span>
                        <span className="text-gray-500 text-sm ml-2">({level.percentage}%)</span>
                      </div>
                    </div>
                    <div className="bg-gray-200 rounded-full h-6 relative">
                      <div
                        className={`h-6 rounded-full transition-all duration-500 ${
                          level.color === 'gray' ? 'bg-gray-400' :
                          level.color === 'blue' ? 'bg-blue-500' :
                          level.color === 'green' ? 'bg-green-500' :
                          level.color === 'yellow' ? 'bg-yellow-500' :
                          level.color === 'red' ? 'bg-red-500' :
                          'bg-gray-400'
                        }`}
                        style={{ width: `${level.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Problem Discovery Insights */}
            <div className="card bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
              <h4 className="font-bold text-blue-900 mb-3">💡 Problem Discovery Insights</h4>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>
                  <strong>L3-L4 Problems</strong> convert at significantly higher rates than L1-L2
                </li>
                <li>
                  <strong>Aim to reach L3+</strong> (quantified impact) on every DM call
                </li>
                <li>
                  <strong>L4 (Mission Critical)</strong> problems create urgency and drive decisions
                </li>
                <li>
                  Use the Question Suggester to guide conversations toward deeper problem discovery
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Analytics;
