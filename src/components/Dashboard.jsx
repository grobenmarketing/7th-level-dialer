import { useState, useEffect } from 'react';
import { useContacts } from '../hooks/useContacts';
import ContactDetailsModal from './ContactDetailsModal';
import ContactFormModal from './ContactFormModal';
import TodaysSummary from './TodaysSummary';
import ColdCallsPanel from './ColdCallsPanel';
import SequencesPanel from './SequencesPanel';
import { generateDummyContacts } from '../lib/dummyData';
import { generateRealisticTestData } from '../lib/testDataGenerator';
import { storage, KEYS } from '../lib/cloudStorage';
import { generateSequenceTasks } from '../lib/sequenceLogic';
import { calculateTaskDueDate } from '../lib/taskScheduler';
import { SEQUENCE_CALENDAR } from '../lib/sequenceCalendar';

function Dashboard({ onStartCalling, onStartFilteredSession, onViewContacts, onViewAnalytics, onViewHowToUse, onViewSettings, onViewSequenceTasks }) {
  const {
    contacts,
    addContact,
    updateContact,
    deleteContact,
    getActiveContacts,
    getStats,
    importFromCSV,
    exportToCSV
  } = useContacts();

  const stats = getStats();
  const activeContacts = getActiveContacts();
  const [selectedContact, setSelectedContact] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [sequenceTasks, setSequenceTasks] = useState([]);

  // Load sequence tasks
  useEffect(() => {
    loadSequenceTasks();
  }, []);

  const loadSequenceTasks = async () => {
    const tasks = await storage.get(KEYS.SEQUENCE_TASKS, []);
    setSequenceTasks(tasks);
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

  const handleLoadTestData = async () => {
    if (confirm('This will add 8 test contacts to your database. Continue?')) {
      const dummyContacts = generateDummyContacts();
      const baseTimestamp = Date.now();

      // Add each dummy contact with unique ID
      for (let i = 0; i < dummyContacts.length; i++) {
        const contact = dummyContacts[i];
        // Override the ID with a unique timestamp-based ID
        const contactWithUniqueId = {
          ...contact,
          id: (baseTimestamp + i).toString()
        };
        await addContact(contactWithUniqueId);
      }

      alert('✅ Test data loaded! 8 contacts added with various sequence states.');
    }
  };

  const handleLoadRealisticTestData = async () => {
    if (confirm('This will add 75 realistic test contacts with proper sequence tasks and due dates. Continue?')) {
      const realisticContacts = generateRealisticTestData(75);

      // Add all contacts
      for (let i = 0; i < realisticContacts.length; i++) {
        const contact = realisticContacts[i];
        await addContact(contact);
      }

      // Generate sequence tasks for active contacts
      const activeContacts = realisticContacts.filter(c => c.sequence_status === 'active');
      const allTasks = [];

      for (const contact of activeContacts) {
        // Generate tasks for this contact
        const tasks = [];
        const sequenceStartDate = contact.sequence_start_date;

        Object.keys(SEQUENCE_CALENDAR).forEach(day => {
          const dayNumber = parseInt(day);
          const dayTasks = SEQUENCE_CALENDAR[day];

          // Only generate tasks up to current day and a few days ahead
          if (dayNumber > contact.sequence_current_day + 5) return;

          dayTasks.forEach(taskType => {
            // Skip based on channel availability
            if (taskType.includes('email') && !contact.has_email) return;
            if (taskType.includes('linkedin') && !contact.has_linkedin) return;
            if (taskType.includes('social') && !contact.has_social_media) return;
            if (taskType === 'physical_mail' && !contact.has_email) return;

            // Calculate due date
            const dueDate = calculateTaskDueDate(sequenceStartDate, dayNumber);

            // Determine status based on day
            let status = 'pending';
            let completed_at = null;

            if (dayNumber < contact.sequence_current_day) {
              // Past days should be completed
              status = 'completed';
              const completedDate = new Date(dueDate);
              completedDate.setHours(Math.floor(Math.random() * 8) + 9); // 9am-5pm
              completed_at = completedDate.toISOString();
            } else if (dayNumber === contact.sequence_current_day) {
              // Current day - some completed, some pending
              if (Math.random() > 0.4) {
                status = 'completed';
                const completedDate = new Date();
                completedDate.setHours(Math.floor(Math.random() * 8) + 9);
                completed_at = completedDate.toISOString();
              }
            }

            tasks.push({
              id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${dayNumber}_${taskType}`,
              contact_id: contact.id,
              task_due_date: dueDate,
              sequence_day: dayNumber,
              task_type: taskType,
              task_description: taskType,
              status,
              completed_at,
              notes: ''
            });
          });
        });

        allTasks.push(...tasks);
      }

      // Save all tasks at once
      await storage.set(KEYS.SEQUENCE_TASKS, allTasks);

      // Reload tasks in UI
      await loadSequenceTasks();

      alert(`✅ Realistic test data loaded!\n\n${realisticContacts.length} contacts added:\n- ${realisticContacts.filter(c => c.sequence_status === 'never_contacted').length} never contacted (for cold calling)\n- ${activeContacts.length} active sequences with ${allTasks.length} tasks\n- ${realisticContacts.filter(c => c.sequence_status === 'paused').length} paused\n- ${realisticContacts.filter(c => c.sequence_status === 'completed').length} completed\n- ${realisticContacts.filter(c => c.sequence_status === 'converted').length} converted\n- ${realisticContacts.filter(c => c.sequence_status === 'dead').length} dead`);
    }
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
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
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
                onClick={handleLoadRealisticTestData}
                className="p-4 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
              >
                <div className="text-3xl mb-1">🎲</div>
                <div className="text-sm font-medium text-blue-900">Load 75 Test Contacts</div>
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
                  onClick={handleLoadRealisticTestData}
                  className="p-3 rounded-lg bg-pink-100 hover:bg-pink-200 transition-colors text-center"
                >
                  <div className="text-2xl mb-1">🎲</div>
                  <div className="text-xs font-medium text-pink-900">Add 75 Test</div>
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
