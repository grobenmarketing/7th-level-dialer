import { useState, useEffect } from 'react';
import { useContacts } from '../hooks/useContacts';
import ContactDetailsModal from './ContactDetailsModal';
import ContactFormModal from './ContactFormModal';
import TodaysSummary from './TodaysSummary';
import ColdCallsPanel from './ColdCallsPanel';
import SequencesPanel from './SequencesPanel';
import { storage, KEYS } from '../lib/cloudStorage';

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

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
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


  return (
    <div className="min-h-screen bg-gradient-to-br from-r7-light to-gray-100">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-r7-blue mb-2">
            R7 Creative Dialer
          </h1>
          <p className="text-sm text-gray-600">
            Detach from the outcomes and your income will always increase.
          </p>
        </div>

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

            {/* Quick Actions for Empty State */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <button
                onClick={onViewContacts}
                className="p-4 rounded-lg bg-purple-100 hover:bg-purple-200 transition-colors"
              >
                <div className="text-3xl mb-1">📇</div>
                <div className="text-sm font-medium text-purple-900">Contacts</div>
              </button>
              <button
                onClick={onViewAnalytics}
                className="p-4 rounded-lg bg-orange-100 hover:bg-orange-200 transition-colors"
              >
                <div className="text-3xl mb-1">📊</div>
                <div className="text-sm font-medium text-orange-900">Analytics</div>
              </button>
              <button
                onClick={onViewSettings}
                className="p-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <div className="text-3xl mb-1">⚙️</div>
                <div className="text-sm font-medium text-gray-900">Settings</div>
              </button>
            </div>
          </div>
        ) : (
          /* Main Dashboard with 3-Section Layout */
          <>
            {/* Today's Summary - Top Section */}
            <TodaysSummary tasks={sequenceTasks} contacts={contacts} />

            {/* Two-Column Layout - Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Left Column - Cold Calls */}
              <ColdCallsPanel
                contacts={contacts}
                onStartCalling={onStartCalling}
              />

              {/* Right Column - Sequence Tasks */}
              <SequencesPanel
                contacts={contacts}
                tasks={sequenceTasks}
                updateContact={updateContact}
                onViewAllSequences={onViewSequenceTasks}
                reloadTasks={loadSequenceTasks}
              />
            </div>

            {/* Quick Actions Bar */}
            <div className="card bg-white">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                <button
                  onClick={onViewContacts}
                  className="p-3 rounded-lg bg-purple-100 hover:bg-purple-200 transition-colors text-center"
                >
                  <div className="text-2xl mb-1">📇</div>
                  <div className="text-xs font-medium text-purple-900">Contacts</div>
                </button>

                <button
                  onClick={onViewAnalytics}
                  className="p-3 rounded-lg bg-orange-100 hover:bg-orange-200 transition-colors text-center"
                >
                  <div className="text-2xl mb-1">📊</div>
                  <div className="text-xs font-medium text-orange-900">Analytics</div>
                </button>

                <button
                  onClick={onViewSequenceTasks}
                  className="p-3 rounded-lg bg-purple-100 hover:bg-purple-200 transition-colors text-center"
                >
                  <div className="text-2xl mb-1">🔄</div>
                  <div className="text-xs font-medium text-purple-900">All Sequences</div>
                </button>

                <button
                  onClick={onStartFilteredSession}
                  disabled={contacts.length === 0}
                  className="p-3 rounded-lg bg-teal-100 hover:bg-teal-200 transition-colors text-center disabled:opacity-50"
                >
                  <div className="text-2xl mb-1">🎯</div>
                  <div className="text-xs font-medium text-teal-900">Filtered</div>
                </button>

                <label className="p-3 rounded-lg bg-green-100 hover:bg-green-200 transition-colors text-center cursor-pointer">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleImport}
                    className="hidden"
                  />
                  <div className="text-2xl mb-1">📥</div>
                  <div className="text-xs font-medium text-green-900">Import</div>
                </label>

                <button
                  onClick={handleExport}
                  disabled={contacts.length === 0}
                  className="p-3 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors text-center disabled:opacity-50"
                >
                  <div className="text-2xl mb-1">📤</div>
                  <div className="text-xs font-medium text-blue-900">Export</div>
                </button>

                <button
                  onClick={onViewSettings}
                  className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-center"
                >
                  <div className="text-2xl mb-1">⚙️</div>
                  <div className="text-xs font-medium text-gray-900">Settings</div>
                </button>
              </div>
            </div>

            {/* Stats Footer */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="card bg-white p-4 text-center">
                <div className="text-2xl font-bold text-r7-blue">{stats.totalContacts}</div>
                <div className="text-xs text-gray-600">Total Contacts</div>
              </div>
              <div className="card bg-white p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.activeContacts}</div>
                <div className="text-xs text-gray-600">Active</div>
              </div>
              <div className="card bg-white p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalDials}</div>
                <div className="text-xs text-gray-600">Total Dials</div>
              </div>
              <div className="card bg-white p-4 text-center">
                <div className="text-2xl font-bold text-r7-red">{stats.meetingsBooked}</div>
                <div className="text-xs text-gray-600">Meetings</div>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          <p>R7 Creative Dialer v2.0 - Daily Workload Dashboard</p>
        </div>
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
