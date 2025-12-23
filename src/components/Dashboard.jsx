import { useState, useEffect } from 'react';
import { useContacts } from '../hooks/useContacts';
import ContactDetailsModal from './ContactDetailsModal';
import ContactFormModal from './ContactFormModal';
import TodaysSummary from './TodaysSummary';
import ColdCallsPanel from './ColdCallsPanel';
import SequencesPanel from './SequencesPanel';
import { storage, KEYS } from '../lib/cloudStorage';
import { useKPI } from '../hooks/useKPI';
import { getNeverContactedLeads } from '../lib/taskScheduler';

function Dashboard({ onStartCalling, onStartFilteredSession, onViewContacts, onViewAnalytics, onViewHowToUse, onViewSettings, onViewSequenceTasks }) {
  const {
    contacts,
    addContact,
    updateContact,
    deleteContact,
    getActiveContacts,
    getStats,
    importFromCSV,
    exportToCSV,
    reloadContacts
  } = useContacts();

  const stats = getStats();
  const activeContacts = getActiveContacts();
  const [selectedContact, setSelectedContact] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [sequenceTasks, setSequenceTasks] = useState([]);
  const { dailyDialGoal } = useKPI();

  // Load/reload sequence tasks and contacts whenever Dashboard mounts
  useEffect(() => {
    const refreshData = async () => {
      console.log('🔄 Dashboard mounted - refreshing data...');
      await Promise.all([
        loadSequenceTasks(),
        reloadContacts()
      ]);
      console.log('✅ Dashboard data refreshed');
    };
    refreshData();
  }, [reloadContacts]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh data when page becomes visible (e.g., returning from calling interface)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        console.log('🔄 Dashboard visible - refreshing data...');
        await Promise.all([
          loadSequenceTasks(),
          reloadContacts()
        ]);
      }
    };

    // Poll every 2 seconds to catch updates from calling interface
    const pollInterval = setInterval(async () => {
      if (!document.hidden) {
        await Promise.all([
          loadSequenceTasks(),
          reloadContacts()
        ]);
      }
    }, 2000);

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [reloadContacts]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadSequenceTasks = async () => {
    const tasks = await storage.get(KEYS.SEQUENCE_TASKS, []);
    setSequenceTasks(tasks);
    console.log('📋 Loaded', tasks.length, 'sequence tasks');
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvText = event.target.result;
      const result = await importFromCSV(csvText);

      if (result.success) {
        alert(`Successfully imported ${result.count} contacts!`);
      } else {
        alert(`Import failed: ${result.error}`);
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    const csvContent = exportToCSV();

    if (csvContent === 'No contacts to export') {
      alert('No contacts to export');
      return;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `r7-contacts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleEditContact = async (formData) => {
    if (editingContact) {
      await updateContact(editingContact.id, formData);
      setEditingContact(null);
      setSelectedContact(null);
    }
  };

  const handleDeleteContact = async (contactId) => {
    await deleteContact(contactId);
    setSelectedContact(null);
  };

  const handleEditClick = (contact) => {
    setEditingContact(contact);
    setSelectedContact(null);
  };


  // Get next contacts for preview
  const nextColdCall = contacts.find(c =>
    !c.sequence_status || c.sequence_status === 'not_started' || c.sequence_status === 'never_contacted'
  );

  const nextSequenceContact = contacts.find(c =>
    c.sequence_status === 'active' &&
    sequenceTasks.some(t => t.contact_id === c.id && t.status === 'pending')
  );

  // Calculate tasks remaining for progress bar
  const today = new Date().toISOString().split('T')[0];

  // Count sequence tasks due today
  const sequenceTasksToday = sequenceTasks.filter(t => {
    return t.task_due_date === today && t.status === 'pending';
  }).length;

  // Count cold calls completed today
  const coldCallsCompletedToday = contacts.filter(
    c => c.sequence_start_date === today
  ).length;

  // Count cold calls remaining
  const neverContacted = getNeverContactedLeads(contacts);
  const coldCallsRemaining = Math.max(0, dailyDialGoal - coldCallsCompletedToday);

  // Total tasks = sequence tasks + cold calls remaining
  const totalTasksToday = sequenceTasksToday + coldCallsRemaining;

  // Total work for the day
  const totalWork = sequenceTasksToday + dailyDialGoal;
  const totalCompleted = sequenceTasks.filter(t => t.task_due_date === today && t.status === 'completed').length + coldCallsCompletedToday;

  // Progress percentage (cap at 100%)
  const progressPercent = totalWork > 0 ? Math.min(100, Math.round((totalCompleted / totalWork) * 100)) : 100;

  // Get recent activity from contact call history
  const getRecentActivity = () => {
    const allCalls = [];
    contacts.forEach(contact => {
      if (contact.callHistory && contact.callHistory.length > 0) {
        contact.callHistory.forEach(call => {
          allCalls.push({
            companyName: contact.companyName,
            outcome: call.outcome,
            date: call.date
          });
        });
      }
    });

    // Sort by date descending and take the last 3
    return allCalls
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
  };

  const recentActivity = getRecentActivity();

  // Contact search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const results = contacts.filter(contact =>
      contact.companyName.toLowerCase().includes(query.toLowerCase()) ||
      (contact.phone && contact.phone.includes(query)) ||
      (contact.industry && contact.industry.toLowerCase().includes(query.toLowerCase()))
    ).slice(0, 5);

    setSearchResults(results);
    setShowSearchResults(true);
  };

  const formatOutcome = (outcome) => {
    const outcomeMap = {
      'NA': 'No Answer',
      'LVM': 'Left Voicemail',
      'GK': 'Gatekeeper',
      'CB': 'Callback',
      'NI': 'Not Interested',
      'DNC': 'Do Not Call',
      'WN': 'Wrong Number',
      'MEETING': 'Meeting Booked'
    };
    return outcomeMap[outcome] || outcome;
  };

  return (
    <div className="min-h-screen bg-r7-gray-light">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Check if we have contacts */}
        {contacts.length === 0 ? (
          /* Empty State */
          <div className="card bg-white text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No Contacts Yet
            </h3>
            <p className="text-gray-500 mb-6">
              Import a CSV file to get started with your calling campaign
            </p>
            <label className="btn-primary inline-block cursor-pointer">
              <input
                type="file"
                accept=".csv"
                onChange={handleImport}
                className="hidden"
              />
              Import Your First Contacts
            </label>
          </div>
        ) : (
          /* Mission Control Dashboard */
          <>
            {/* Header: Centered Quote */}
            <div className="text-center mb-6">
              <p className="text-lg text-gray-600 font-light italic">
                Detach from the outcomes and your income will always increase.
              </p>
            </div>

            {/* Search Bar & Import - Compact */}
            <div className="mb-6 flex gap-2 justify-end items-center">
              <label className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors shadow-sm">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImport}
                  className="hidden"
                />
                Import CSV
              </label>

              <div className="relative max-w-md">
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full text-sm px-4 py-2 rounded-lg border border-gray-300 focus:border-r7-navy focus:outline-none focus:ring-1 focus:ring-r7-navy/20 transition-all bg-white shadow-sm"
                />

                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-64 overflow-y-auto">
                    {searchResults.map(contact => (
                      <div
                        key={contact.id}
                        onClick={() => {
                          setSelectedContact(contact);
                          setShowSearchResults(false);
                          setSearchQuery('');
                        }}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-semibold text-r7-navy text-sm">{contact.companyName}</div>
                        <div className="text-xs text-gray-600">{contact.phone}</div>
                        {contact.industry && (
                          <div className="text-xs text-gray-500 mt-1">{contact.industry}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mission Progress Bar */}
            <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-bold text-r7-navy">Today's Mission</h3>
                <span className="text-lg font-semibold text-gray-700">
                  {totalTasksToday} Task{totalTasksToday !== 1 ? 's' : ''} Remaining
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-2 text-right">
                {totalCompleted} of {totalWork} complete ({progressPercent}%)
              </div>
              <div className="text-xs text-gray-500 text-right mb-2">
                {sequenceTasks.filter(t => t.task_due_date === today && t.status === 'completed').length}/{sequenceTasksToday + sequenceTasks.filter(t => t.task_due_date === today && t.status === 'completed').length} sequence tasks • {coldCallsCompletedToday}/{dailyDialGoal} cold calls
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-r7-red h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{
                    width: `${progressPercent}%`
                  }}
                >
                  {progressPercent === 100 && (
                    <span className="text-white text-xs font-bold">COMPLETE</span>
                  )}
                </div>
              </div>
            </div>

            {/* Central Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Left Card - Cold Calling */}
              <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-r7-navy mb-2">Cold Calling</h2>
                  <div className="text-sm text-gray-500 mb-4">
                    Next Up: {nextColdCall ? nextColdCall.companyName : 'No contacts available'}
                  </div>
                </div>

                <button
                  onClick={() => onStartCalling(contacts.filter(c => !c.sequence_status || c.sequence_status === 'not_started' || c.sequence_status === 'never_contacted').slice(0, 10))}
                  disabled={!nextColdCall}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                >
                  Start Calling Session
                </button>

                <div className="mt-6 text-center">
                  <div className="text-3xl font-bold text-teal-600">
                    {contacts.filter(c => !c.sequence_status || c.sequence_status === 'not_started' || c.sequence_status === 'never_contacted').length}
                  </div>
                  <div className="text-sm text-gray-600">Available Leads</div>
                </div>
              </div>

              {/* Right Card - Sequences */}
              <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-r7-navy mb-2">Sequences</h2>
                  <div className="text-sm text-gray-500 mb-4">
                    Next Up: {nextSequenceContact ? nextSequenceContact.companyName : 'No tasks pending'}
                  </div>
                </div>

                <button
                  onClick={onViewSequenceTasks}
                  disabled={!nextSequenceContact}
                  className="w-full bg-r7-navy hover:bg-r7-dark text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                >
                  Execute Sequences
                </button>

                <div className="mt-6 text-center">
                  <div className="text-3xl font-bold text-r7-navy">
                    {sequenceTasksToday}
                  </div>
                  <div className="text-sm text-gray-600">Sequence Tasks Due Today</div>
                </div>
              </div>
            </div>

            {/* Recent Activity Mini-Feed */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-r7-navy mb-4">Recent Activity</h3>

              {recentActivity.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              ) : (
                <div className="flex flex-col md:flex-row md:divide-x divide-gray-200 gap-4 md:gap-0">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex-1 md:px-4 first:md:pl-0 last:md:pr-0">
                      <div className="text-sm">
                        <span className="font-medium text-r7-navy">
                          Called {activity.companyName}
                        </span>
                        <span className="text-gray-600"> - {formatOutcome(activity.outcome)}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(activity.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Contact Details Modal */}
      {selectedContact && (
        <ContactDetailsModal
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onEdit={handleEditClick}
          onDelete={handleDeleteContact}
        />
      )}

      {/* Edit Contact Modal */}
      {editingContact && (
        <ContactFormModal
          contact={editingContact}
          onSave={handleEditContact}
          onClose={() => setEditingContact(null)}
        />
      )}
    </div>
  );
}

export default Dashboard;
