import { useState, useMemo } from 'react';
import { useContacts } from '../hooks/useContacts';
import ContactDetailsModal from './ContactDetailsModal';
import ContactFormModal from './ContactFormModal';

function ContactsPage({ onBackToDashboard }) {
  const { contacts, addContact, updateContact, deleteContact, deleteAllContacts, getStats, exportToCSV } = useContacts();
  const stats = getStats();

  const [selectedContact, setSelectedContact] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [emailFilter, setEmailFilter] = useState('all');
  const [sortBy, setSortBy] = useState('company');

  // Filter and search contacts
  const filteredContacts = useMemo(() => {
    let filtered = [...contacts];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    // Apply email filter
    if (emailFilter === 'needs-email') {
      filtered = filtered.filter(c => c.needsEmail === true);
    } else if (emailFilter === 'no-email') {
      filtered = filtered.filter(c => !c.needsEmail);
    }

    // Apply search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.companyName?.toLowerCase().includes(search) ||
        c.phone?.includes(search) ||
        c.industry?.toLowerCase().includes(search) ||
        c.website?.toLowerCase().includes(search) ||
        c.address?.toLowerCase().includes(search) ||
        c.linkedin?.toLowerCase().includes(search)
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
  }, [contacts, searchTerm, statusFilter, emailFilter, sortBy]);

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

  const handleAddContact = async (formData) => {
    await addContact(formData);
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

  const handleDeleteAll = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ALL ${contacts.length} contacts?\n\nThis will permanently remove all contacts and their call history. This action cannot be undone.`
    );

    if (confirmed) {
      const doubleConfirm = window.confirm(
        'This is your final warning. Click OK to permanently delete all contacts.'
      );

      if (doubleConfirm) {
        // Delete all contacts in one operation
        await deleteAllContacts();
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

            {/* Email Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📧 Email Filter
              </label>
              <select
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">All Contacts</option>
                <option value="needs-email">Needs Email</option>
                <option value="no-email">No Email Needed</option>
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

        {/* Contacts Table */}
        {filteredContacts.length > 0 ? (
          <div className="card bg-white overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Website
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dials
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Calls
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    OK Code
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Call
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedContact(contact)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-semibold text-r7-blue">
                          {contact.companyName || 'Unknown Company'}
                        </div>
                        {contact.industry && (
                          <span className="text-xs text-gray-500">
                            {contact.industry}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {contact.phone || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                      {contact.website ? (
                        <a
                          href={contact.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-r7-blue hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {contact.website}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium text-r7-blue">
                      {contact.totalDials || 0}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium text-green-600">
                      {contact.callHistory?.length || 0}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-xs text-gray-700">
                      {contact.currentOkCode || 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
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
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-500">
                      {contact.lastCall
                        ? new Date(contact.lastCall).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedContact(contact);
                        }}
                        className="text-r7-blue hover:text-r7-dark font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
