import { useState, useMemo } from 'react';
import { useContacts } from '../hooks/useContacts';
import ContactDetailsModal from './ContactDetailsModal';
import ContactFormModal from './ContactFormModal';

function ContactsPage({ onBackToDashboard }) {
  const { contacts, addContact, updateContact, deleteContact, getStats, exportToCSV } = useContacts();
  const stats = getStats();

  const [selectedContact, setSelectedContact] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('company');

  // Filter and search contacts
  const filteredContacts = useMemo(() => {
    let filtered = [...contacts];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    // Apply search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.companyName?.toLowerCase().includes(search) ||
        c.phone?.includes(search) ||
        c.industry?.toLowerCase().includes(search) ||
        c.website?.toLowerCase().includes(search)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'company':
          return (a.companyName || '').localeCompare(b.companyName || '');
        case 'dials':
          return (b.totalDials || 0) - (a.totalDials || 0);
        case 'lastCall':
          return new Date(b.lastCall || 0) - new Date(a.lastCall || 0);
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [contacts, searchTerm, statusFilter, sortBy]);

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

  const handleAddContact = (formData) => {
    addContact(formData);
  };

  const handleEditContact = (formData) => {
    if (editingContact) {
      updateContact(editingContact.id, formData);
      setEditingContact(null);
      setSelectedContact(null);
    }
  };

  const handleDeleteContact = (contactId) => {
    deleteContact(contactId);
  };

  const handleDeleteAll = () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ALL ${contacts.length} contacts?\n\nThis will permanently remove all contacts and their call history. This action cannot be undone.`
    );

    if (confirmed) {
      const doubleConfirm = window.confirm(
        'This is your final warning. Click OK to permanently delete all contacts.'
      );

      if (doubleConfirm) {
        contacts.forEach(contact => deleteContact(contact.id));
        alert('All contacts have been deleted.');
      }
    }
  };

  const handleEditClick = (contact) => {
    setEditingContact(contact);
    setSelectedContact(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-r7-light to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-r7-blue mb-2">
                📇 Contact Database
              </h1>
              <p className="text-gray-600">
                Manage and review your contact list
              </p>
            </div>
            <button
              onClick={onBackToDashboard}
              className="btn-secondary"
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card bg-white">
              <div className="text-sm text-gray-500 mb-1">Total Contacts</div>
              <div className="text-3xl font-bold text-r7-blue">
                {stats.totalContacts}
              </div>
            </div>
            <div className="card bg-white">
              <div className="text-sm text-gray-500 mb-1">Active</div>
              <div className="text-3xl font-bold text-green-600">
                {stats.activeContacts}
              </div>
            </div>
            <div className="card bg-white">
              <div className="text-sm text-gray-500 mb-1">Total Dials</div>
              <div className="text-3xl font-bold text-blue-600">
                {stats.totalDials}
              </div>
            </div>
            <div className="card bg-white">
              <div className="text-sm text-gray-500 mb-1">Meetings Booked</div>
              <div className="text-3xl font-bold text-r7-red">
                {stats.meetingsBooked}
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card bg-white mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Search Contacts
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Company, phone, industry, website..."
                className="input-field"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="do-not-call">Do Not Call</option>
                <option value="closed-won">Closed Won</option>
                <option value="closed-lost">Closed Lost</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field"
              >
                <option value="company">Company Name</option>
                <option value="dials">Total Dials</option>
                <option value="lastCall">Last Call Date</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>

          {/* Results Count and Actions */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredContacts.length}</span> of{' '}
              <span className="font-semibold">{contacts.length}</span> contacts
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary text-sm"
              >
                + Add Contact
              </button>
              <button
                onClick={handleExport}
                disabled={contacts.length === 0}
                className="btn-secondary text-sm"
              >
                <span className="mr-2">📤</span>
                Export All
              </button>
              <button
                onClick={handleDeleteAll}
                disabled={contacts.length === 0}
                className={`text-sm px-4 py-2 rounded-lg transition-colors ${
                  contacts.length === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                Delete All
              </button>
            </div>
          </div>
        </div>

        {/* Contacts Grid */}
        {filteredContacts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className="card bg-white hover:shadow-xl cursor-pointer transition-all transform hover:scale-105"
              >
                {/* Company Name */}
                <div className="mb-3">
                  <h3 className="text-xl font-bold text-r7-blue mb-1 truncate">
                    {contact.companyName || 'Unknown Company'}
                  </h3>
                  {contact.industry && (
                    <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                      {contact.industry}
                    </span>
                  )}
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4 text-sm">
                  {contact.phone && (
                    <div className="flex items-center text-gray-600">
                      <span className="mr-2">📞</span>
                      <span className="truncate">{contact.phone}</span>
                    </div>
                  )}
                  {contact.website && (
                    <div className="flex items-center text-gray-600">
                      <span className="mr-2">🌐</span>
                      <span className="truncate">{contact.website}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-3 p-2 bg-gray-50 rounded">
                  <div className="text-center">
                    <div className="text-lg font-bold text-r7-blue">
                      {contact.totalDials || 0}
                    </div>
                    <div className="text-xs text-gray-600">Dials</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {contact.callHistory?.length || 0}
                    </div>
                    <div className="text-xs text-gray-600">Calls</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-semibold text-gray-700 mt-1">
                      {contact.currentOkCode || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-600">OK Code</div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex justify-between items-center">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      contact.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : contact.status === 'closed-won'
                        ? 'bg-blue-100 text-blue-700'
                        : contact.status === 'closed-lost'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {contact.status}
                  </span>
                  {contact.lastCall && (
                    <span className="text-xs text-gray-500">
                      {new Date(contact.lastCall).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card bg-white text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No Contacts Found
            </h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Import contacts to get started'}
            </p>
          </div>
        )}

        {/* Contact Details Modal */}
        {selectedContact && (
          <ContactDetailsModal
            contact={selectedContact}
            onClose={() => setSelectedContact(null)}
            onEdit={handleEditClick}
            onDelete={handleDeleteContact}
          />
        )}

        {/* Add Contact Modal */}
        {showAddForm && (
          <ContactFormModal
            onSave={handleAddContact}
            onClose={() => setShowAddForm(false)}
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
    </div>
  );
}

export default ContactsPage;
