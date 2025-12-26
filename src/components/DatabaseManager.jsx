import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useContacts } from '../hooks/useContacts';
import { useKPI } from '../hooks/useKPI';
import { storage, KEYS } from '../lib/cloudStorage';
import SearchBar from './database/SearchBar';
import FilterButtons from './database/FilterButtons';
import TableWrapper from './database/TableWrapper';
import TableHeader from './database/TableHeader';
import StatusBadge from './database/StatusBadge';
import ActionButtons from './database/ActionButtons';
import BulkActions from './database/BulkActions';
import ContactDetailsModal from './ContactDetailsModal';
import ContactFormModal from './ContactFormModal';
import {
  getTasksForDay,
  getTaskDescription,
  shouldSkipTask,
  getTotalImpressions
} from '../lib/sequenceCalendar';
import {
  completeSequenceTask,
  advanceContactToNextDay,
  checkAllDayTasksComplete,
  applyCounterUpdates,
  getCounterUpdates
} from '../lib/sequenceLogic';

function DatabaseManager({ onBackToDashboard }) {
  // Tab state
  const [activeTab, setActiveTab] = useState('contacts'); // 'contacts', 'kpi', 'tasks'

  // Hooks
  const {
    contacts,
    addContact,
    updateContact,
    deleteContact,
    deleteAllContacts,
    exportToCSV,
    importFromCSV,
    getStats
  } = useContacts();

  const {
    getWeekData,
    getWeeklyTotals,
    getDailyAverages,
    getPerformanceRatios,
    getObjectionFrequency,
    updateKPIForDate,
    weeklyTargets,
    dailyDialGoal,
    getWeekStart
  } = useKPI();

  // Contacts state
  const [searchTerm, setSearchTerm] = useState('');
  const [contactsFilter, setContactsFilter] = useState('all');
  const [contactsSort, setContactsSort] = useState({ key: 'companyName', direction: 'asc' });
  const [selectedContacts, setSelectedContacts] = useState(new Set());
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  // KPI state
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart());

  // Tasks state
  const [sequenceTasks, setSequenceTasks] = useState([]);
  const [tasksFilter, setTasksFilter] = useState('all');
  const [selectedTasks, setSelectedTasks] = useState(new Set());

  const stats = getStats();

  // Load sequence tasks
  const loadSequenceTasks = useCallback(async () => {
    const tasks = await storage.get(KEYS.SEQUENCE_TASKS, []);
    setSequenceTasks(tasks);
  }, []);

  // Load tasks on mount and when switching to tasks tab
  useEffect(() => {
    if (activeTab === 'tasks') {
      loadSequenceTasks();
    }
  }, [activeTab, loadSequenceTasks]);

  // ==================== CONTACTS TAB ====================
  const contactFilters = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Clients', value: 'client' },
  ];

  const filteredAndSortedContacts = useMemo(() => {
    let filtered = [...contacts];

    // Apply filter
    if (contactsFilter !== 'all') {
      filtered = filtered.filter(c => c.status === contactsFilter);
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
      const { key, direction } = contactsSort;
      let aVal, bVal;

      switch (key) {
        case 'companyName':
          aVal = a.companyName || '';
          bVal = b.companyName || '';
          break;
        case 'phone':
          aVal = a.phone || '';
          bVal = b.phone || '';
          break;
        case 'totalDials':
          aVal = a.totalDials || 0;
          bVal = b.totalDials || 0;
          break;
        case 'lastCall':
          aVal = new Date(a.lastCall || 0).getTime();
          bVal = new Date(b.lastCall || 0).getTime();
          break;
        case 'status':
          aVal = a.status || '';
          bVal = b.status || '';
          break;
        default:
          return 0;
      }

      if (typeof aVal === 'string') {
        return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return filtered;
  }, [contacts, searchTerm, contactsFilter, contactsSort]);

  const handleContactsSort = (key) => {
    setContactsSort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAllContacts = (e) => {
    if (e.target.checked) {
      setSelectedContacts(new Set(filteredAndSortedContacts.map(c => c.id)));
    } else {
      setSelectedContacts(new Set());
    }
  };

  const handleSelectContact = (contactId) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const handleBulkDeleteContacts = async () => {
    if (selectedContacts.size === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedContacts.size} selected contact(s)? This action cannot be undone.`
    );

    if (confirmed) {
      for (const contactId of selectedContacts) {
        await deleteContact(contactId);
      }
      setSelectedContacts(new Set());
    }
  };

  const handleExportContacts = () => {
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

  const handleImportContacts = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
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
    input.click();
  };

  const handleAddContact = async (formData) => {
    await addContact(formData);
    setShowAddForm(false);
  };

  const handleEditContact = async (formData) => {
    if (editingContact) {
      await updateContact(editingContact.id, formData);
      setEditingContact(null);
      setShowContactDetails(false);
    }
  };

  const handleDeleteContact = async (contactId) => {
    const confirmed = window.confirm('Are you sure you want to delete this contact?');
    if (confirmed) {
      await deleteContact(contactId);
      setShowContactDetails(false);
      setSelectedContact(null);
    }
  };

  const handleEditClick = (contact) => {
    setEditingContact(contact);
    setShowContactDetails(false);
  };

  // ==================== KPI TAB ====================
  const weekData = getWeekData(currentWeekStart);
  const weeklyTotals = getWeeklyTotals(currentWeekStart);
  const dailyAverages = getDailyAverages(currentWeekStart);
  const performanceRatios = getPerformanceRatios(currentWeekStart);
  const objectionFrequency = getObjectionFrequency(currentWeekStart);

  const handleEditDay = async (date, field, value) => {
    await updateKPIForDate(date, { [field]: parseInt(value) || 0 });
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

  // ==================== TASKS TAB ====================
  const tasksFilters = [
    { label: 'All', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'Overdue', value: 'overdue' },
    { label: 'Upcoming', value: 'upcoming' },
  ];

  const activeSequenceContacts = contacts.filter(
    c => c.sequence_status === 'active'
  );

  const handleCompleteTask = async (contact, taskType) => {
    await completeSequenceTask(
      contact.id,
      contact.sequence_current_day,
      taskType,
      ''
    );

    const counterUpdates = getCounterUpdates(taskType);
    const updatedContactData = applyCounterUpdates(contact, counterUpdates);

    await updateContact(contact.id, {
      ...updatedContactData,
      last_contact_date: new Date().toISOString().split('T')[0]
    });

    await loadSequenceTasks();

    const allComplete = await checkAllDayTasksComplete({
      ...contact,
      ...updatedContactData
    });

    if (allComplete) {
      await advanceContactToNextDay(
        { ...contact, ...updatedContactData },
        updateContact
      );
      await loadSequenceTasks();
    }
  };

  const getContactTasks = (contact) => {
    const dayTasks = getTasksForDay(contact.sequence_current_day);
    return dayTasks.filter(taskType => !shouldSkipTask(contact, taskType));
  };

  const isTaskComplete = (contact, taskType) => {
    const task = sequenceTasks.find(
      t => t.contact_id === contact.id &&
           t.sequence_day === contact.sequence_current_day &&
           t.task_type === taskType
    );
    return task && task.status === 'completed';
  };

  // ==================== RENDER ====================
  const contactsColumns = [
    { key: 'companyName', label: 'Company Name', sortable: true, width: '25%' },
    { key: 'phone', label: 'Phone', sortable: true, width: '15%' },
    { key: 'totalDials', label: 'Calls', sortable: true, width: '10%', className: 'text-center' },
    { key: 'lastCall', label: 'Last Call', sortable: true, width: '15%' },
    { key: 'currentOkCode', label: 'OK Code', sortable: false, width: '12%', className: 'text-center' },
    { key: 'status', label: 'Status', sortable: true, width: '12%', className: 'text-center' },
    { key: 'actions', label: 'Actions', sortable: false, width: '11%', className: 'text-right' },
  ];

  const kpiColumns = [
    { key: 'date', label: 'Date', sortable: false, width: '15%' },
    { key: 'dials', label: 'Dials', sortable: false, width: '12%', className: 'text-center' },
    { key: 'pickups', label: 'Pickups', sortable: false, width: '12%', className: 'text-center' },
    { key: 'conversations', label: 'Convos', sortable: false, width: '12%', className: 'text-center' },
    { key: 'triage', label: 'Triage', sortable: false, width: '12%', className: 'text-center' },
    { key: 'bookedMeetings', label: 'Meetings Booked', sortable: false, width: '15%', className: 'text-center' },
    { key: 'meetingsRan', label: 'Meetings Ran', sortable: false, width: '15%', className: 'text-center' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                📊 Database Manager
              </h1>
              <p className="text-gray-600">
                Manage your contacts, KPIs, and sequence tasks
              </p>
            </div>
            <button
              onClick={onBackToDashboard}
              className="btn-secondary"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-0 mb-6 border-b-2 border-gray-200 bg-white rounded-t-lg shadow-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex-1 min-w-[200px] px-6 py-4 font-semibold text-base transition-all border-b-3 ${
              activeTab === 'contacts'
                ? 'text-r7-blue border-b-4 border-r7-blue bg-blue-50'
                : 'text-gray-600 border-b-4 border-transparent hover:text-r7-blue hover:bg-blue-50'
            }`}
          >
            📇 Contacts/CRM
          </button>
          <button
            onClick={() => setActiveTab('kpi')}
            className={`flex-1 min-w-[200px] px-6 py-4 font-semibold text-base transition-all border-b-3 ${
              activeTab === 'kpi'
                ? 'text-r7-blue border-b-4 border-r7-blue bg-blue-50'
                : 'text-gray-600 border-b-4 border-transparent hover:text-r7-blue hover:bg-blue-50'
            }`}
          >
            📊 KPI Analytics
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 min-w-[200px] px-6 py-4 font-semibold text-base transition-all border-b-3 ${
              activeTab === 'tasks'
                ? 'text-r7-blue border-b-4 border-r7-blue bg-blue-50'
                : 'text-gray-600 border-b-4 border-transparent hover:text-r7-blue hover:bg-blue-50'
            }`}
          >
            ✓ Sequence Tasks
          </button>
        </div>

        {/* CONTACTS TAB */}
        {activeTab === 'contacts' && (
          <div className="space-y-6">
            {/* Controls */}
            <div className="flex gap-4 flex-wrap items-center">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search by company name, phone, or industry..."
              />
              <FilterButtons
                filters={contactFilters}
                activeFilter={contactsFilter}
                onFilterChange={setContactsFilter}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end flex-wrap">
              <button
                onClick={handleImportContacts}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm shadow-sm"
              >
                📥 Import CSV
              </button>
              <button
                onClick={handleExportContacts}
                disabled={contacts.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                📤 Export CSV
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-r7-blue text-white rounded-lg hover:bg-r7-dark transition-colors font-medium text-sm shadow-sm"
              >
                + Add Contact
              </button>
            </div>

            {/* Table */}
            <TableWrapper
              footer={
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>
                    Showing <span className="font-semibold">{filteredAndSortedContacts.length}</span> of{' '}
                    <span className="font-semibold">{contacts.length}</span> contacts
                  </span>
                  <span>Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
              }
            >
              <TableHeader
                columns={contactsColumns}
                sortBy={contactsSort.key}
                sortDirection={contactsSort.direction}
                onSort={handleContactsSort}
                showCheckbox={true}
                onCheckAll={handleSelectAllContacts}
                allChecked={selectedContacts.size === filteredAndSortedContacts.length && filteredAndSortedContacts.length > 0}
              />
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredAndSortedContacts.length > 0 ? (
                  filteredAndSortedContacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className="hover:bg-blue-50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedContact(contact);
                        setShowContactDetails(true);
                      }}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedContacts.has(contact.id)}
                          onChange={() => handleSelectContact(contact.id)}
                          className="w-5 h-5 cursor-pointer accent-r7-blue rounded focus:ring-2 focus:ring-r7-blue"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900">
                            {contact.companyName || 'Unknown Company'}
                          </span>
                          {contact.industry && (
                            <span className="text-xs text-gray-500">
                              {contact.industry}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <a
                          href={`tel:${contact.phone}`}
                          className="text-r7-blue hover:underline font-mono"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {contact.phone || '-'}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={contact.totalDials || 0} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {contact.lastCall
                          ? new Date(contact.lastCall).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={contact.currentOkCode} type="okCode" />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={contact.status || 'active'} />
                      </td>
                      <td className="px-4 py-3">
                        <ActionButtons
                          onView={() => {
                            setSelectedContact(contact);
                            setShowContactDetails(true);
                          }}
                          onDelete={() => handleDeleteContact(contact.id)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={contactsColumns.length + 1} className="px-4 py-12 text-center">
                      <div className="text-6xl mb-4 opacity-50">🔍</div>
                      <h3 className="text-xl font-bold text-gray-700 mb-2">
                        No Contacts Found
                      </h3>
                      <p className="text-gray-500">
                        {searchTerm || contactsFilter !== 'all'
                          ? 'Try adjusting your search or filters'
                          : 'Click "Add Contact" or "Import CSV" to get started'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </TableWrapper>

            {/* Bulk Actions */}
            <BulkActions
              selectedCount={selectedContacts.size}
              totalCount={filteredAndSortedContacts.length}
              onDelete={handleBulkDeleteContacts}
              onExport={handleExportContacts}
            />
          </div>
        )}

        {/* KPI TAB */}
        {activeTab === 'kpi' && (
          <div className="space-y-6">
            {/* Week Navigation */}
            <div className="card bg-white p-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePreviousWeek}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors"
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
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors"
                >
                  Next Week →
                </button>
              </div>
            </div>

            {/* Weekly Progress */}
            <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 p-6">
              <h3 className="text-xl font-bold text-gray-700 mb-4">
                🎯 Weekly Progress
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-700">📞 Dials</span>
                  <span className="font-bold text-gray-800">
                    {weeklyTotals.dials} / {weeklyTargets.dials}
                  </span>
                </div>
                <div className="bg-gray-200 rounded-full h-8">
                  <div
                    className="bg-r7-red rounded-full h-8 flex items-center justify-center text-white font-bold text-sm transition-all"
                    style={{ width: `${Math.min((weeklyTotals.dials / weeklyTargets.dials) * 100, 100)}%` }}
                  >
                    {((weeklyTotals.dials / weeklyTargets.dials) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>

            {/* KPI Table */}
            <TableWrapper
              footer={
                <div className="text-sm font-semibold text-gray-700">
                  Weekly Total: {weeklyTotals.dials} Dials | Goal: {weeklyTargets.dials} | Avg: {dailyAverages.dials.toFixed(1)}/day | Days Worked: {dailyAverages.daysWorked}
                </div>
              }
            >
              <TableHeader
                columns={kpiColumns}
                sortBy={null}
                sortDirection="asc"
                onSort={null}
              />
              <tbody className="bg-white divide-y divide-gray-100">
                {weekData.map((day) => (
                  <tr key={day.date} className="hover:bg-blue-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800">{day.dayName}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(day.date).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        value={day.dials || 0}
                        onChange={(e) => handleEditDay(day.date, 'dials', e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-r7-blue focus:border-transparent"
                        min="0"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        value={day.pickups || 0}
                        onChange={(e) => handleEditDay(day.date, 'pickups', e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-r7-blue focus:border-transparent"
                        min="0"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        value={day.conversations || 0}
                        onChange={(e) => handleEditDay(day.date, 'conversations', e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-r7-blue focus:border-transparent"
                        min="0"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        value={day.triage || 0}
                        onChange={(e) => handleEditDay(day.date, 'triage', e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-r7-blue focus:border-transparent"
                        min="0"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        value={day.bookedMeetings || 0}
                        onChange={(e) => handleEditDay(day.date, 'bookedMeetings', e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-r7-blue focus:border-transparent"
                        min="0"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        value={day.meetingsRan || 0}
                        onChange={(e) => handleEditDay(day.date, 'meetingsRan', e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-r7-blue focus:border-transparent"
                        min="0"
                      />
                    </td>
                  </tr>
                ))}
                {/* Totals Row */}
                <tr className="bg-blue-100 font-bold border-t-2 border-blue-300">
                  <td className="px-4 py-3">TOTAL</td>
                  <td className="px-4 py-3 text-center">{weeklyTotals.dials}</td>
                  <td className="px-4 py-3 text-center">{weeklyTotals.pickups}</td>
                  <td className="px-4 py-3 text-center">{weeklyTotals.conversations}</td>
                  <td className="px-4 py-3 text-center">{weeklyTotals.triage}</td>
                  <td className="px-4 py-3 text-center">{weeklyTotals.bookedMeetings}</td>
                  <td className="px-4 py-3 text-center">{weeklyTotals.meetingsRan}</td>
                </tr>
                {/* Daily Average Row */}
                <tr className="bg-green-50 font-semibold">
                  <td className="px-4 py-3">
                    Daily Avg
                    <br />
                    <span className="text-xs font-normal text-gray-600">
                      ({dailyAverages.daysWorked} {dailyAverages.daysWorked === 1 ? 'day' : 'days'} worked)
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">{dailyAverages.dials.toFixed(1)}</td>
                  <td className="px-4 py-3 text-center">{dailyAverages.pickups.toFixed(1)}</td>
                  <td className="px-4 py-3 text-center">{dailyAverages.conversations.toFixed(1)}</td>
                  <td className="px-4 py-3 text-center">{dailyAverages.triage.toFixed(1)}</td>
                  <td className="px-4 py-3 text-center">{dailyAverages.bookedMeetings.toFixed(1)}</td>
                  <td className="px-4 py-3 text-center">{dailyAverages.meetingsRan.toFixed(1)}</td>
                </tr>
              </tbody>
            </TableWrapper>

            {/* Performance Ratios */}
            <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 p-6">
              <h3 className="text-xl font-bold text-gray-700 mb-4">📈 Performance Ratios</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-r7-red">
                    {(performanceRatios.meetingsShowedRatio * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-700 mt-1 font-semibold">Meetings Showed</div>
                  <div className="text-xs text-gray-500 mt-1">Ran / Booked</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-r7-red">
                    {(performanceRatios.conversationsToMeetings * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-700 mt-1 font-semibold">Convos to Meetings</div>
                  <div className="text-xs text-gray-500 mt-1">Booked / Convos</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-r7-red">
                    {(performanceRatios.triageToConversations * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-700 mt-1 font-semibold">Triage Rate</div>
                  <div className="text-xs text-gray-500 mt-1">Triage / Convos</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-r7-red">
                    {(performanceRatios.pickupsToConversations * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-700 mt-1 font-semibold">Pickup to Convo</div>
                  <div className="text-xs text-gray-500 mt-1">Convos / Pickups</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEQUENCE TASKS TAB */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {/* Controls */}
            <div className="flex gap-4 flex-wrap items-center justify-between">
              <FilterButtons
                filters={tasksFilters}
                activeFilter={tasksFilter}
                onFilterChange={setTasksFilter}
              />
              <div className="text-sm text-gray-600">
                <span className="font-semibold">{activeSequenceContacts.length}</span> active sequences
              </div>
            </div>

            {/* Tasks List */}
            {activeSequenceContacts.length === 0 ? (
              <div className="card bg-white text-center py-12">
                <div className="text-6xl mb-4 opacity-50">📭</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                  No Active Sequences
                </h3>
                <p className="text-gray-500">
                  Make calls to enter contacts into the sequence
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {activeSequenceContacts.map((contact) => {
                  const tasks = getContactTasks(contact);
                  const completedTasks = tasks.filter(t => isTaskComplete(contact, t)).length;

                  return (
                    <div key={contact.id} className="card bg-white p-6">
                      {/* Contact Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors flex-1"
                          onClick={() => {
                            setSelectedContact(contact);
                            setShowContactDetails(true);
                          }}
                        >
                          <h4 className="text-lg font-bold text-gray-900">
                            {contact.companyName}
                          </h4>
                          <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                            <span>📞 {contact.phone}</span>
                            <span>•</span>
                            <span>Day {contact.sequence_current_day} of 30</span>
                            <span>•</span>
                            <span>
                              {completedTasks} of {tasks.length} tasks complete
                            </span>
                            <span>•</span>
                            <span>{getTotalImpressions(contact)} total touches</span>
                          </div>
                        </div>
                      </div>

                      {/* Task List */}
                      <div className="space-y-2">
                        {tasks.map(taskType => {
                          const isComplete = isTaskComplete(contact, taskType);

                          return (
                            <div
                              key={taskType}
                              className={`flex items-center gap-3 p-3 rounded-lg border ${
                                isComplete
                                  ? 'bg-green-50 border-green-200'
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isComplete}
                                onChange={() => !isComplete && handleCompleteTask(contact, taskType)}
                                className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500 cursor-pointer accent-green-600"
                                disabled={isComplete}
                              />
                              <span className={`flex-1 text-sm ${isComplete ? 'line-through text-gray-500' : 'text-gray-800 font-medium'}`}>
                                {getTaskDescription(taskType, contact.sequence_current_day)}
                              </span>
                              {isComplete && (
                                <span className="text-green-600 text-sm font-semibold">✓ Complete</span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-green-500 h-3 rounded-full transition-all"
                            style={{ width: `${(completedTasks / tasks.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        {showContactDetails && selectedContact && (
          <ContactDetailsModal
            contact={selectedContact}
            onClose={() => {
              setShowContactDetails(false);
              setSelectedContact(null);
            }}
            onEdit={handleEditClick}
            onDelete={() => handleDeleteContact(selectedContact.id)}
          />
        )}

        {showAddForm && (
          <ContactFormModal
            onSave={handleAddContact}
            onClose={() => setShowAddForm(false)}
          />
        )}

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

export default DatabaseManager;
