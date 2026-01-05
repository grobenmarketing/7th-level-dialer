import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useContacts } from '../hooks/useContacts';
import { useKPI } from '../hooks/useKPI';
import { useStats } from '../hooks/useStats';
import { useOkCodes } from '../hooks/useOkCodes';
import { storage, KEYS } from '../lib/cloudStorage';
import { formatDuration } from '../lib/constants';
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
  skipSequenceTask,
  advanceContactToNextDay,
  checkAllDayTasksComplete,
  pauseSequence,
  resumeSequence,
  markContactDead,
  convertToClient,
  applyCounterUpdates,
  getCounterUpdates
} from '../lib/sequenceLogic';
import {
  getVisibleTasks,
  getOverdueTasks,
  getTodaysTasks,
  hasOverdueTasks
} from '../lib/sequenceAutomation';

function DatabaseManager({ onBackToDashboard }) {
  // Tab state
  const [activeTab, setActiveTab] = useState('contacts'); // 'contacts', 'kpi', 'tasks'

  // Hooks
  const {
    contacts,
    addContact,
    updateContact,
    deleteContact,
    deleteBulkContacts,
    deleteAllContacts,
    exportToCSV,
    importFromCSV,
    getStats
  } = useContacts();

  const { okCodes } = useOkCodes();

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
    dailyDialGoal,
    getWeekStart,
    getMonthStart,
    getWeeksInMonth,
    getMonthData,
    getMonthlyTotals
  } = useKPI();

  const {
    getActivityStats,
    getOKCodeDistribution
  } = useStats();

  // Contacts state
  const [searchTerm, setSearchTerm] = useState('');
  const [contactsFilter, setContactsFilter] = useState('all');
  const [selectedOkCode, setSelectedOkCode] = useState('all');
  const [contactsSort, setContactsSort] = useState({ key: 'companyName', direction: 'asc' });
  const [selectedContacts, setSelectedContacts] = useState(new Set());
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  // KPI state
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart());
  const [currentMonthStart, setCurrentMonthStart] = useState(getMonthStart());
  const [kpiView, setKpiView] = useState('weekly'); // 'weekly', 'monthly', or 'overall'
  const [editingTargets, setEditingTargets] = useState(false);
  const [tempTargets, setTempTargets] = useState(weeklyTargets);
  const [syncing, setSyncing] = useState(false);

  // Tasks state
  const [sequenceTasks, setSequenceTasks] = useState([]);
  const [tasksFilter, setTasksFilter] = useState('all');
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [showDeadModal, setShowDeadModal] = useState(false);
  const [deadReason, setDeadReason] = useState('');
  const [contactToMarkDead, setContactToMarkDead] = useState(null);
  const [optimisticallyCompleted, setOptimisticallyCompleted] = useState(new Set());
  const [optimisticallySkipped, setOptimisticallySkipped] = useState(new Set());
  const [expandedContacts, setExpandedContacts] = useState(new Set());

  const stats = getStats();
  const activityStats = getActivityStats();
  const okCodeDistribution = getOKCodeDistribution();

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

    // Apply OK code filter
    if (selectedOkCode !== 'all') {
      filtered = filtered.filter(c => c.currentOkCode === selectedOkCode);
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
  }, [contacts, searchTerm, contactsFilter, selectedOkCode, contactsSort]);

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
      await deleteBulkContacts(selectedContacts);
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

  const handleDownloadTemplate = () => {
    const headers = 'Company Name,Phone,Website,Address,LinkedIn,Industry';
    // Example row showing that commas in company names are supported with quotes
    const exampleRow = '"Atlas Butler Heating, Cooling & Plumbing",(614) 681-2167,https://atlasbutler.com,4849 Evanswood Dr,https://linkedin.com/company/atlas-butler,HVAC';
    const csvContent = `${headers}\n${exampleRow}`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts-import-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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

  // Monthly data
  const monthData = getMonthData(currentMonthStart);
  const monthlyTotals = getMonthlyTotals(currentMonthStart);

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

  const handlePreviousMonth = () => {
    const date = new Date(currentMonthStart);
    date.setMonth(date.getMonth() - 1);
    setCurrentMonthStart(getMonthStart(date));
  };

  const handleNextMonth = () => {
    const date = new Date(currentMonthStart);
    date.setMonth(date.getMonth() + 1);
    setCurrentMonthStart(getMonthStart(date));
  };

  const handleThisMonth = () => {
    setCurrentMonthStart(getMonthStart());
  };

  const handleSaveTargets = async () => {
    await updateWeeklyTargets(tempTargets);
    setEditingTargets(false);
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

  const handleCompleteTask = async (contact, task) => {
    // Optimistically mark as completed immediately
    const taskId = `${contact.id}-${task.sequence_day}-${task.task_type}`;
    setOptimisticallyCompleted(prev => new Set([...prev, taskId]));

    // Perform async operations
    await completeSequenceTask(
      contact.id,
      task.sequence_day,
      task.task_type,
      ''
    );

    const counterUpdates = getCounterUpdates(task.task_type);
    const updatedContactData = applyCounterUpdates(contact, counterUpdates);

    await updateContact(contact.id, {
      ...updatedContactData,
      last_contact_date: new Date().toISOString().split('T')[0]
    });

    await loadSequenceTasks();

    // Clear optimistic state after React renders the new data
    setTimeout(() => {
      setOptimisticallyCompleted(new Set());
      setOptimisticallySkipped(new Set());
    }, 100);

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

  const handleSkipTask = async (contact, task) => {
    // Optimistically mark as skipped immediately
    const taskId = `${contact.id}-${task.sequence_day}-${task.task_type}`;
    setOptimisticallySkipped(prev => new Set([...prev, taskId]));

    // Perform async operations
    await skipSequenceTask(
      contact.id,
      task.sequence_day,
      task.task_type,
      'Skipped by user'
    );

    await loadSequenceTasks();

    // Clear optimistic state after React renders the new data
    setTimeout(() => {
      setOptimisticallyCompleted(new Set());
      setOptimisticallySkipped(new Set());
    }, 100);

    const allComplete = await checkAllDayTasksComplete(contact);

    if (allComplete) {
      await advanceContactToNextDay(contact, updateContact);
      await loadSequenceTasks();
    }
  };

  // Sequence control handlers
  const handlePauseSequence = async (contact) => {
    await pauseSequence(contact.id, updateContact);
  };

  const handleResumeSequence = async (contact) => {
    await resumeSequence(contact.id, updateContact);
  };

  const handleConvertToClient = async (contact) => {
    if (confirm(`Mark ${contact.companyName} as converted to client?`)) {
      await convertToClient(contact.id, updateContact);
      await loadSequenceTasks();
    }
  };

  const handleMarkDead = async () => {
    if (!contactToMarkDead || !deadReason.trim()) return;

    await markContactDead(contactToMarkDead.id, deadReason, updateContact);
    await loadSequenceTasks();
    setShowDeadModal(false);
    setDeadReason('');
    setContactToMarkDead(null);
  };

  const toggleContactExpanded = (contactId) => {
    const newExpanded = new Set(expandedContacts);
    if (newExpanded.has(contactId)) {
      newExpanded.delete(contactId);
    } else {
      newExpanded.add(contactId);
    }
    setExpandedContacts(newExpanded);
  };

  const getContactTasks = (contact) => {
    // Get all tasks for this contact based on filter
    let tasks;

    if (tasksFilter === 'all') {
      // Show all tasks (entire 30-day sequence)
      tasks = getVisibleTasks(contact, sequenceTasks, 'all');
    } else if (tasksFilter === 'today') {
      // Show only tasks due today
      tasks = getTodaysTasks(contact, sequenceTasks);
    } else if (tasksFilter === 'overdue') {
      // Show only overdue tasks
      tasks = getOverdueTasks(contact, sequenceTasks);
    } else if (tasksFilter === 'upcoming') {
      // Show future tasks (not due yet)
      const allTasks = getVisibleTasks(contact, sequenceTasks, 'all');
      const today = new Date().toISOString().split('T')[0];
      tasks = allTasks.filter(t => t.status === 'pending' && t.task_due_date > today);
    } else {
      // Default: show visible tasks (due today or overdue)
      tasks = getVisibleTasks(contact, sequenceTasks, 'today');
    }

    return tasks.sort((a, b) => a.sequence_day - b.sequence_day);
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
              <div className="flex items-center gap-2">
                <label htmlFor="okCodeFilter" className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                  OK Code:
                </label>
                <select
                  id="okCodeFilter"
                  value={selectedOkCode}
                  onChange={(e) => setSelectedOkCode(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:border-r7-blue focus:outline-none focus:ring-2 focus:ring-r7-blue focus:border-transparent transition-all"
                >
                  <option value="all">All OK Codes</option>
                  {okCodes.map(code => (
                    <option key={code.id} value={code.label}>
                      {code.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end flex-wrap items-start">
              <div className="flex flex-col gap-1">
                <button
                  onClick={handleImportContacts}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm shadow-sm"
                >
                  📥 Import CSV
                </button>
                <button
                  onClick={handleDownloadTemplate}
                  className="text-xs text-green-600 hover:text-green-700 hover:underline transition-colors"
                >
                  📄 Download Template
                </button>
              </div>
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
                        <span className="inline-flex px-3 py-1 text-sm font-semibold text-gray-700">
                          {contact.totalDials || 0}
                        </span>
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
            {/* Syncing Overlay */}
            {syncing && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-md text-center">
                  <div className="text-6xl mb-4">⏳</div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Syncing Data...</h2>
                  <p className="text-gray-600">
                    Building KPI metrics from your call history.
                  </p>
                </div>
              </div>
            )}

            {/* View Toggle & Actions */}
            <div className="flex gap-2 flex-wrap items-center">
              <button
                onClick={() => setKpiView('weekly')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  kpiView === 'weekly'
                    ? 'bg-r7-blue text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                📅 Weekly View
              </button>
              <button
                onClick={() => setKpiView('monthly')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  kpiView === 'monthly'
                    ? 'bg-r7-blue text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                📆 Monthly View
              </button>
              <button
                onClick={() => setKpiView('overall')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  kpiView === 'overall'
                    ? 'bg-r7-blue text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                📈 Overall Analytics
              </button>
              <button
                onClick={handleSyncFromCallHistory}
                disabled={syncing}
                className="ml-auto px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                title="Rebuild all KPI data from contact call history"
              >
                {syncing ? '⏳ Syncing...' : '🔄 Re-sync All Data'}
              </button>
            </div>

            {kpiView === 'weekly' ? (
              <>
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

                {/* Weekly Targets & Progress */}
                <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 p-6">
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

                  <div className="space-y-2">
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

                {/* Objection Frequency */}
                {objectionFrequency.length > 0 && (
                  <div className="card bg-white p-6">
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
              </>
            ) : kpiView === 'monthly' ? (
              <>
                {/* Month Navigation */}
                <div className="card bg-white p-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handlePreviousMonth}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors"
                    >
                      ← Previous Month
                    </button>
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-800">
                        {new Date(currentMonthStart).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </div>
                      <button
                        onClick={handleThisMonth}
                        className="text-sm text-r7-blue hover:underline"
                      >
                        Jump to This Month
                      </button>
                    </div>
                    <button
                      onClick={handleNextMonth}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors"
                    >
                      Next Month →
                    </button>
                  </div>
                </div>

                {/* Monthly Summary Card */}
                <div className="card bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 p-6">
                  <h3 className="text-xl font-bold text-gray-700 mb-4">
                    📊 Monthly Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Total Dials</div>
                      <div className="text-3xl font-bold text-purple-700">{monthlyTotals.dials}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Pickups (DM)</div>
                      <div className="text-3xl font-bold text-green-700">{monthlyTotals.pickups}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Conversations</div>
                      <div className="text-3xl font-bold text-blue-700">{monthlyTotals.conversations}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Meetings Booked</div>
                      <div className="text-3xl font-bold text-orange-700">{monthlyTotals.bookedMeetings}</div>
                    </div>
                  </div>
                </div>

                {/* Week-by-Week Breakdown */}
                <div className="card bg-white p-6">
                  <h3 className="text-xl font-bold text-gray-700 mb-4">
                    📅 Week-by-Week Breakdown
                  </h3>
                  <div className="space-y-4">
                    {monthData.map((week, index) => (
                      <div key={week.weekStart} className="border-2 border-gray-200 rounded-lg p-4 hover:border-r7-blue transition-colors">
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <div className="font-bold text-lg text-gray-800">
                              Week {index + 1} - {new Date(week.weekStart).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-600">
                              Days Worked: {week.dailyAverages.daysWorked}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setCurrentWeekStart(week.weekStart);
                              setKpiView('weekly');
                            }}
                            className="px-3 py-1 bg-r7-blue text-white text-sm rounded hover:bg-r7-dark transition-colors"
                          >
                            View Details →
                          </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="text-gray-600">Dials</div>
                            <div className="font-bold text-gray-800">{week.weeklyTotals.dials}</div>
                          </div>
                          <div className="bg-green-50 p-2 rounded">
                            <div className="text-gray-600">Pickups</div>
                            <div className="font-bold text-green-700">{week.weeklyTotals.pickups}</div>
                          </div>
                          <div className="bg-blue-50 p-2 rounded">
                            <div className="text-gray-600">Conversations</div>
                            <div className="font-bold text-blue-700">{week.weeklyTotals.conversations}</div>
                          </div>
                          <div className="bg-yellow-50 p-2 rounded">
                            <div className="text-gray-600">Triage</div>
                            <div className="font-bold text-yellow-700">{week.weeklyTotals.triage}</div>
                          </div>
                          <div className="bg-orange-50 p-2 rounded">
                            <div className="text-gray-600">Meetings</div>
                            <div className="font-bold text-orange-700">{week.weeklyTotals.bookedMeetings}</div>
                          </div>
                          <div className="bg-purple-50 p-2 rounded">
                            <div className="text-gray-600">Showed</div>
                            <div className="font-bold text-purple-700">{week.weeklyTotals.meetingsRan}</div>
                          </div>
                        </div>

                        {week.dailyAverages.daysWorked > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="text-xs text-gray-600 mb-1">Daily Averages:</div>
                            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                              <div>Dials: <span className="font-semibold">{week.dailyAverages.dials.toFixed(1)}</span></div>
                              <div>Pickups: <span className="font-semibold">{week.dailyAverages.pickups.toFixed(1)}</span></div>
                              <div>Convos: <span className="font-semibold">{week.dailyAverages.conversations.toFixed(1)}</span></div>
                              <div>Triage: <span className="font-semibold">{week.dailyAverages.triage.toFixed(1)}</span></div>
                              <div>Meetings: <span className="font-semibold">{week.dailyAverages.bookedMeetings.toFixed(1)}</span></div>
                              <div>Showed: <span className="font-semibold">{week.dailyAverages.meetingsRan.toFixed(1)}</span></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Overall Analytics View */}
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
                <div className="card bg-white p-6">
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
                      {activityStats.avgDmDuration > 0 && (
                        <div className="text-xs text-purple-600 font-semibold mt-1">
                          ⏱️ Avg: {formatDuration(activityStats.avgDmDuration)}
                        </div>
                      )}
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
                      {activityStats.avgGkDuration > 0 && (
                        <div className="text-xs text-purple-600 font-semibold mt-1">
                          ⏱️ Avg: {formatDuration(activityStats.avgGkDuration)}
                        </div>
                      )}
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
                  <div className="card bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 p-6">
                    <h3 className="text-xl font-bold text-gray-700 mb-4">⏱️ Call Duration Analytics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-700">
                          {formatDuration(activityStats.totalDuration)}
                        </div>
                        <div className="text-xs text-gray-600">Total Talk Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-700">
                          {formatDuration(activityStats.avgDuration)}
                        </div>
                        <div className="text-xs text-gray-600">Average per Call</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-700">
                          {formatDuration(activityStats.avgDmDuration)}
                        </div>
                        <div className="text-xs text-gray-600">Avg DM Call</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-700">
                          {activityStats.avgDmDuration > 0 && activityStats.avgDuration > 0
                            ? ((activityStats.avgDmDuration / activityStats.avgDuration) * 100).toFixed(0)
                            : 0}%
                        </div>
                        <div className="text-xs text-gray-600">DM vs Avg</div>
                      </div>
                    </div>
                    <div className="text-sm text-purple-800">
                      💡 <strong>Insight:</strong> Longer DM calls often indicate deeper problem discovery and higher engagement.
                    </div>
                  </div>
                )}

                {/* OK Code Distribution */}
                {okCodeDistribution.length > 0 && (
                  <div className="card bg-white p-6">
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
              </>
            )}
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
                  const completedTasks = tasks.filter(t => t.status === 'completed').length;
                  const skippedTasks = tasks.filter(t => t.status === 'skipped').length;
                  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
                  const hasOverdue = hasOverdueTasks(contact, sequenceTasks);
                  const overdueCount = getOverdueTasks(contact, sequenceTasks).length;
                  const isExpanded = expandedContacts.has(contact.id);
                  const displayTasks = isExpanded ? tasks : tasks.slice(0, 3);

                  return (
                    <div key={contact.id} className={`card p-6 ${hasOverdue ? 'bg-red-50 border-2 border-red-300' : 'bg-white'}`}>
                      {/* Contact Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors flex-1"
                          onClick={() => toggleContactExpanded(contact.id)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">
                              {isExpanded ? '▼' : '▶'}
                            </span>
                            <h4 className="text-lg font-bold text-gray-900">
                              {contact.companyName}
                            </h4>
                            {hasOverdue && (
                              <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">
                                🚨 {overdueCount} OVERDUE
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-600 mt-1 ml-8">
                            <span>📞 {contact.phone}</span>
                            <span>•</span>
                            <span>Day {contact.sequence_current_day} of 30</span>
                            <span>•</span>
                            <span>
                              {completedTasks} done, {skippedTasks} skipped, {pendingTasks} pending
                            </span>
                            <span>•</span>
                            <span>{getTotalImpressions(contact)} total touches</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handlePauseSequence(contact)}
                            className="px-3 py-1.5 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded font-medium"
                            title="Pause sequence"
                          >
                            ⏸️ Pause
                          </button>
                          <button
                            onClick={() => handleConvertToClient(contact)}
                            className="px-3 py-1.5 text-xs bg-green-500 hover:bg-green-600 text-white rounded font-medium"
                            title="Mark as converted"
                          >
                            🎉 Convert
                          </button>
                          <button
                            onClick={() => {
                              setContactToMarkDead(contact);
                              setShowDeadModal(true);
                            }}
                            className="px-3 py-1.5 text-xs bg-red-500 hover:bg-red-600 text-white rounded font-medium"
                            title="Mark as dead"
                          >
                            ☠️ Dead
                          </button>
                        </div>
                      </div>

                      {/* Task List - Only show when expanded */}
                      {isExpanded && (
                        <div className="space-y-2 ml-8">
                          {tasks.length === 0 ? (
                            <div className="text-center py-4 text-gray-500 text-sm">
                              No tasks for this filter
                            </div>
                          ) : (
                          tasks.map(task => {
                            const today = new Date().toISOString().split('T')[0];
                            const taskId = `${contact.id}-${task.sequence_day}-${task.task_type}`;
                            const isOptimisticallyCompleted = optimisticallyCompleted.has(taskId);
                            const isOptimisticallySkipped = optimisticallySkipped.has(taskId);
                            const effectiveStatus = isOptimisticallyCompleted ? 'completed' : isOptimisticallySkipped ? 'skipped' : task.status;
                            const isOverdue = effectiveStatus === 'pending' && task.task_due_date < today;
                            const isDueToday = effectiveStatus === 'pending' && task.task_due_date === today;
                            const isFuture = effectiveStatus === 'pending' && task.task_due_date > today;

                            return (
                              <div
                                key={task.id}
                                className={`flex items-center gap-3 p-3 rounded-lg border ${
                                  effectiveStatus === 'completed'
                                    ? 'bg-green-50 border-green-200'
                                    : effectiveStatus === 'skipped'
                                    ? 'bg-gray-100 border-gray-300'
                                    : isOverdue
                                    ? 'bg-red-100 border-red-400 border-2'
                                    : isDueToday
                                    ? 'bg-yellow-50 border-yellow-300'
                                    : 'bg-gray-50 border-gray-200'
                                }`}
                              >
                                {/* Checkbox or Status Icon */}
                                {effectiveStatus === 'completed' ? (
                                  <span className="text-green-600 text-xl">✓</span>
                                ) : effectiveStatus === 'skipped' ? (
                                  <span className="text-gray-500 text-xl">⊘</span>
                                ) : (
                                  <input
                                    type="checkbox"
                                    checked={false}
                                    onChange={() => handleCompleteTask(contact, task)}
                                    className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500 cursor-pointer accent-green-600"
                                  />
                                )}

                                {/* Day Badge */}
                                <span className="text-xs font-semibold text-gray-600 min-w-[3.5rem] bg-white px-2 py-1 rounded border border-gray-300">
                                  Day {task.sequence_day}
                                </span>

                                {/* Task Description */}
                                <span className={`flex-1 text-sm ${
                                  effectiveStatus === 'completed' || effectiveStatus === 'skipped'
                                    ? 'line-through text-gray-500'
                                    : 'text-gray-800 font-medium'
                                }`}>
                                  {getTaskDescription(task.task_type, task.sequence_day)}
                                </span>

                                {/* Due Date */}
                                <span className="text-xs text-gray-500 min-w-[5rem]">
                                  {isOverdue ? '🚨' : isDueToday ? '📅' : isFuture ? '📆' : ''} {task.task_due_date}
                                </span>

                                {/* Status Badges */}
                                {effectiveStatus === 'completed' && (
                                  <span className="text-green-600 text-sm font-semibold">Done</span>
                                )}
                                {effectiveStatus === 'skipped' && (
                                  <span className="text-gray-600 text-sm font-semibold">Skipped</span>
                                )}
                                {isOverdue && effectiveStatus === 'pending' && (
                                  <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
                                    OVERDUE
                                  </span>
                                )}

                                {/* Skip Button */}
                                {effectiveStatus === 'pending' && (
                                  <button
                                    onClick={() => handleSkipTask(contact, task)}
                                    className="px-3 py-1 text-xs bg-gray-400 hover:bg-gray-500 text-white rounded font-medium"
                                    title="Skip this task"
                                  >
                                    Skip
                                  </button>
                                )}
                              </div>
                            );
                          })
                        )}

                          {/* Progress Bar */}
                          {tasks.length > 0 && (
                            <div className="mt-4">
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                  className="bg-green-500 h-3 rounded-full transition-all"
                                  style={{ width: `${((completedTasks + skippedTasks) / tasks.length) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Collapsed Summary - Show 2-3 tasks preview when collapsed */}
                      {!isExpanded && tasks.length > 0 && (
                        <div className="ml-8 text-sm text-gray-600">
                          <div className="space-y-1">
                            {tasks.slice(0, 3).map(task => {
                              const taskId = `${contact.id}-${task.sequence_day}-${task.task_type}`;
                              const isOptimisticallyCompleted = optimisticallyCompleted.has(taskId);
                              const isOptimisticallySkipped = optimisticallySkipped.has(taskId);
                              const effectiveStatus = isOptimisticallyCompleted ? 'completed' : isOptimisticallySkipped ? 'skipped' : task.status;

                              return (
                                <div key={task.id} className="flex items-center gap-2">
                                  {effectiveStatus === 'completed' ? (
                                    <span className="text-green-600">✓</span>
                                  ) : effectiveStatus === 'skipped' ? (
                                    <span className="text-gray-500">⊘</span>
                                  ) : (
                                    <span className="text-gray-400">○</span>
                                  )}
                                  <span className={effectiveStatus === 'pending' ? 'text-gray-900' : 'text-gray-500 line-through'}>
                                    Day {task.sequence_day}: {getTaskDescription(task.task_type, task.sequence_day)}
                                  </span>
                                </div>
                              );
                            })}
                            {tasks.length > 3 && (
                              <div className="text-xs text-gray-500 italic mt-2">
                                ... and {tasks.length - 3} more tasks (click to expand)
                              </div>
                            )}
                          </div>
                        </div>
                      )}
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
            onUpdate={updateContact}
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

        {/* Mark Dead Modal */}
        {showDeadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Mark as Dead Lead
              </h3>
              <p className="text-gray-600 mb-4">
                Why is {contactToMarkDead?.companyName} not a good fit?
              </p>
              <textarea
                value={deadReason}
                onChange={(e) => setDeadReason(e.target.value)}
                placeholder="e.g., No budget, wrong timing, not interested..."
                className="w-full border border-gray-300 rounded-lg p-3 mb-4 h-24"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeadModal(false);
                    setDeadReason('');
                    setContactToMarkDead(null);
                  }}
                  className="btn flex-1 bg-gray-500 hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkDead}
                  disabled={!deadReason.trim()}
                  className="btn flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300"
                >
                  Mark as Dead
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DatabaseManager;
