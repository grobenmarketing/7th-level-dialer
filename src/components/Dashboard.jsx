import { useState } from 'react';
import { useContacts } from '../hooks/useContacts';
import ContactDetailsModal from './ContactDetailsModal';
import ContactFormModal from './ContactFormModal';
import { generateDummyContacts } from '../lib/dummyData';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-r7-light to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-r7-blue mb-2">
            R7 Creative Dialer
          </h1>
          <p className="text-sm text-gray-600">
            Detach from the outcomes and your income will always increase.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-white hover:shadow-lg transition-shadow">
            <div className="text-sm text-gray-500 mb-1">Total Contacts</div>
            <div className="text-4xl font-bold text-r7-blue">
              {stats.totalContacts}
            </div>
          </div>

          <div className="card bg-white hover:shadow-lg transition-shadow">
            <div className="text-sm text-gray-500 mb-1">Active Contacts</div>
            <div className="text-4xl font-bold text-green-600">
              {stats.activeContacts}
            </div>
          </div>

          <div className="card bg-white hover:shadow-lg transition-shadow">
            <div className="text-sm text-gray-500 mb-1">Total Dials</div>
            <div className="text-4xl font-bold text-blue-600">
              {stats.totalDials}
            </div>
          </div>

          <div className="card bg-white hover:shadow-lg transition-shadow">
            <div className="text-sm text-gray-500 mb-1">Meetings Booked</div>
            <div className="text-4xl font-bold text-r7-red">
              {stats.meetingsBooked}
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="card bg-white mb-8">
          <h2 className="text-2xl font-bold text-r7-blue mb-6">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Start Calling Button */}
            <button
              onClick={onStartCalling}
              disabled={activeContacts.length === 0}
              className={`p-8 rounded-lg text-center transition-all ${
                activeContacts.length === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-r7-blue text-white hover:bg-r7-dark hover:shadow-xl transform hover:scale-105'
              }`}
            >
              <div className="text-4xl mb-2">📞</div>
              <div className="text-2xl font-bold">Start Calling</div>
              <div className="text-sm mt-2 opacity-90">
                {activeContacts.length} contacts ready
              </div>
            </button>

            {/* Start Filtered Session Button */}
            <button
              onClick={onStartFilteredSession}
              disabled={contacts.length === 0}
              className={`p-8 rounded-lg text-center transition-all ${
                contacts.length === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-br from-teal-600 to-teal-700 text-white hover:from-teal-700 hover:to-teal-800 hover:shadow-xl transform hover:scale-105'
              }`}
            >
              <div className="text-4xl mb-2">🎯</div>
              <div className="text-2xl font-bold">Filtered Session</div>
              <div className="text-sm mt-2 opacity-90">
                Call by OK code & date
              </div>
            </button>

            {/* View All Contacts */}
            <button
              onClick={onViewContacts}
              className="p-8 rounded-lg text-center bg-purple-600 text-white hover:bg-purple-700 cursor-pointer transition-all hover:shadow-xl transform hover:scale-105"
            >
              <div className="text-4xl mb-2">📇</div>
              <div className="text-2xl font-bold">View Contacts</div>
              <div className="text-sm mt-2 opacity-90">
                Browse {contacts.length} contacts
              </div>
            </button>

            {/* Analytics Dashboard */}
            <button
              onClick={onViewAnalytics}
              className="p-8 rounded-lg text-center bg-orange-600 text-white hover:bg-orange-700 cursor-pointer transition-all hover:shadow-xl transform hover:scale-105"
            >
              <div className="text-4xl mb-2">📊</div>
              <div className="text-2xl font-bold">Analytics</div>
              <div className="text-sm mt-2 opacity-90">
                NEPQ insights & metrics
              </div>
            </button>

            {/* Sequence Tasks */}
            <button
              onClick={onViewSequenceTasks}
              className="p-8 rounded-lg text-center bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 cursor-pointer transition-all hover:shadow-xl transform hover:scale-105"
            >
              <div className="text-4xl mb-2">🔄</div>
              <div className="text-2xl font-bold">Sequence Tasks</div>
              <div className="text-sm mt-2 opacity-90">
                Manage 27-touch sequence
              </div>
            </button>

            {/* Import Contacts */}
            <label className="p-8 rounded-lg text-center bg-green-600 text-white hover:bg-green-700 cursor-pointer transition-all hover:shadow-xl transform hover:scale-105">
              <input
                type="file"
                accept=".csv"
                onChange={handleImport}
                className="hidden"
              />
              <div className="text-4xl mb-2">📥</div>
              <div className="text-2xl font-bold">Import CSV</div>
              <div className="text-sm mt-2 opacity-90">
                Upload contact list
              </div>
            </label>

            {/* How to Use */}
            <button
              onClick={onViewHowToUse}
              className="p-8 rounded-lg text-center bg-yellow-600 text-white hover:bg-yellow-700 cursor-pointer transition-all hover:shadow-xl transform hover:scale-105"
            >
              <div className="text-4xl mb-2">📖</div>
              <div className="text-2xl font-bold">How to Use</div>
              <div className="text-sm mt-2 opacity-90">
                Learn the system
              </div>
            </button>

            {/* Settings */}
            <button
              onClick={onViewSettings}
              className="p-8 rounded-lg text-center bg-gray-600 text-white hover:bg-gray-700 cursor-pointer transition-all hover:shadow-xl transform hover:scale-105"
            >
              <div className="text-4xl mb-2">⚙️</div>
              <div className="text-2xl font-bold">Settings</div>
              <div className="text-sm mt-2 opacity-90">
                Admin controls
              </div>
            </button>

            {/* Load Test Data */}
            <button
              onClick={handleLoadTestData}
              className="p-8 rounded-lg text-center bg-gradient-to-br from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 cursor-pointer transition-all hover:shadow-xl transform hover:scale-105"
            >
              <div className="text-4xl mb-2">🧪</div>
              <div className="text-2xl font-bold">Load Test Data</div>
              <div className="text-sm mt-2 opacity-90">
                Add demo contacts
              </div>
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={contacts.length === 0}
            className={`w-full mt-4 p-4 rounded-lg transition-all ${
              contacts.length === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <span className="text-xl mr-2">📤</span>
            Export Contacts to CSV
          </button>
        </div>

        {/* Recent Contacts Preview */}
        {contacts.length > 0 && (
          <div className="card bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-r7-blue">
                Recent Contacts
              </h2>
              <p className="text-sm text-gray-500">
                Click any contact to view details and call history
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">Company</th>
                    <th className="text-left py-3 px-4">Phone</th>
                    <th className="text-left py-3 px-4">Dials</th>
                    <th className="text-left py-3 px-4">OK Code</th>
                    <th className="text-left py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.slice(0, 10).map((contact) => (
                    <tr
                      key={contact.id}
                      onClick={() => setSelectedContact(contact)}
                      className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-medium">
                        {contact.companyName}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {contact.phone}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {contact.totalDials || 0}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {contact.currentOkCode || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-sm px-2 py-1 rounded ${
                            contact.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {contact.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {contacts.length === 0 && (
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
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>R7 Creative Dialer v1.0</p>
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
