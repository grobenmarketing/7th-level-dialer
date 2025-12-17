import { useState } from 'react';
import { useContacts } from '../hooks/useContacts';
import ContactDetailsModal from './ContactDetailsModal';
import ContactFormModal from './ContactFormModal';

function Dashboard({ onStartCalling, onStartFilteredSession, onViewContacts, onViewAnalytics, onViewHowToUse, onViewSettings }) {
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

  return (
    <>
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-r7-blue dark:text-r7-neon mb-2">
              R7 Creative Dialer
            </h1>
            <p className="text-muted">
              Detach from the outcomes and your income will always increase.
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted uppercase tracking-wide mb-1">Today's Goal</div>
            <div className="text-3xl font-bold text-r7-blue dark:text-r7-neon">{stats.totalDials}/50</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="hud-card">
            <div className="text-sm text-muted uppercase tracking-wide mb-2">Total Contacts</div>
            <div className="text-5xl font-bold text-r7-blue dark:text-white mb-2">
              {stats.totalContacts}
            </div>
            <div className="w-full bg-gray-200 dark:bg-white/10 h-1 rounded-full">
              <div className="bg-r7-blue dark:bg-r7-neon h-1 rounded-full" style={{width: '100%'}}></div>
            </div>
          </div>

          <div className="hud-card">
            <div className="text-sm text-muted uppercase tracking-wide mb-2">Active Contacts</div>
            <div className="text-5xl font-bold text-green-600 dark:text-green-400 mb-2">
              {stats.activeContacts}
            </div>
            <div className="text-xs text-muted">
              {stats.activeContacts > 0 ? 'Ready to dial' : 'Import contacts to begin'}
            </div>
          </div>

          <div className="hud-card">
            <div className="text-sm text-muted uppercase tracking-wide mb-2">Total Dials</div>
            <div className="text-5xl font-bold text-r7-blue dark:text-r7-neon mb-2">
              {stats.totalDials}
            </div>
            <div className="text-xs text-muted">All-time call count</div>
          </div>

          <div className="hud-card">
            <div className="text-sm text-muted uppercase tracking-wide mb-2">Meetings Booked</div>
            <div className="text-5xl font-bold text-gold mb-2">
              {stats.meetingsBooked}
            </div>
            <div className="text-xs text-muted">
              {stats.totalDials > 0 ? `${((stats.meetingsBooked / stats.totalDials) * 100).toFixed(1)}% conversion` : 'No calls yet'}
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="glass-card p-8 mb-8">
          <h2 className="text-2xl font-bold text-r7-blue dark:text-r7-neon mb-6">
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
                Call analytics & KPIs
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
          <div className="glass-card p-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-r7-blue dark:text-r7-neon">
                Recent Contacts
              </h2>
              <p className="text-sm text-muted">
                Click any contact to view details and call history
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-white/10">
                    <th className="text-left py-3 px-4 text-muted uppercase text-xs font-semibold tracking-wide">Company</th>
                    <th className="text-left py-3 px-4 text-muted uppercase text-xs font-semibold tracking-wide">Phone</th>
                    <th className="text-left py-3 px-4 text-muted uppercase text-xs font-semibold tracking-wide">Dials</th>
                    <th className="text-left py-3 px-4 text-muted uppercase text-xs font-semibold tracking-wide">OK Code</th>
                    <th className="text-left py-3 px-4 text-muted uppercase text-xs font-semibold tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.slice(0, 10).map((contact) => (
                    <tr
                      key={contact.id}
                      onClick={() => setSelectedContact(contact)}
                      className="border-b border-gray-100 dark:border-white/5 hover:bg-r7-blue/10 dark:hover:bg-r7-neon/10 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-medium">
                        {contact.companyName}
                      </td>
                      <td className="py-3 px-4 text-muted">
                        {contact.phone}
                      </td>
                      <td className="py-3 px-4 text-muted">
                        {contact.totalDials || 0}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm bg-r7-blue/10 dark:bg-r7-neon/10 text-r7-blue dark:text-r7-neon px-2 py-1 rounded">
                          {contact.currentOkCode || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-sm px-2 py-1 rounded ${
                            contact.status === 'active'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-gray-100 dark:bg-gray-800/30 text-gray-700 dark:text-gray-400'
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
          <div className="glass-card p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-bold text-r7-blue dark:text-r7-neon mb-2">
              No Contacts Yet
            </h3>
            <p className="text-muted mb-6">
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
          <div className="text-center mt-8 text-muted text-sm">
            <p>R7 Creative Dialer v1.0</p>
          </div>
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
    </>
  );
}

export default Dashboard;
