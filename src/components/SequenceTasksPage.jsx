import { useState, useEffect } from 'react';
import { useContacts } from '../hooks/useContacts';
import { storage, KEYS } from '../lib/cloudStorage';
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
  hasOverdueTasks,
  processAllSequenceAdvancement
} from '../lib/sequenceAutomation';

function SequenceTasksPage({ onBackToDashboard }) {
  const { contacts, updateContact, deleteContact } = useContacts();
  const [sequenceTasks, setSequenceTasks] = useState([]);
  const [viewMode, setViewMode] = useState('today'); // 'today' or 'all'
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [showDeadModal, setShowDeadModal] = useState(false);
  const [deadReason, setDeadReason] = useState('');
  const [editingContact, setEditingContact] = useState(null);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [taskToSkip, setTaskToSkip] = useState(null);

  // Load sequence tasks from storage on mount and when contacts change
  useEffect(() => {
    loadSequenceTasks();
  }, [contacts]); // Reload when contacts array changes

  // Reload tasks when page becomes visible (handles updates from calling interface)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadSequenceTasks();
      }
    };

    const handleFocus = () => {
      loadSequenceTasks();
    };

    // Also poll every 2 seconds when page is visible to catch updates
    const pollInterval = setInterval(() => {
      if (!document.hidden) {
        loadSequenceTasks();
      }
    }, 2000);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const loadSequenceTasks = async () => {
    const tasks = await storage.get(KEYS.SEQUENCE_TASKS, []);
    setSequenceTasks(tasks);
  };

  // Get active contacts in sequence
  const activeSequenceContacts = contacts.filter(
    c => c.sequence_status === 'active'
  );

  // Group contacts by sequence day for display
  const groupedContacts = activeSequenceContacts.reduce((acc, contact) => {
    const day = contact.sequence_current_day;
    if (!acc[day]) acc[day] = [];
    acc[day].push(contact);
    return acc;
  }, {});

  // Handle task completion
  const handleCompleteTask = async (contact, taskType) => {
    // Mark task as complete in storage
    await completeSequenceTask(
      contact.id,
      contact.sequence_current_day,
      taskType,
      ''
    );

    // Update contact counters
    const counterUpdates = getCounterUpdates(taskType);
    const updatedContactData = applyCounterUpdates(contact, counterUpdates);

    await updateContact(contact.id, {
      ...updatedContactData,
      last_contact_date: new Date().toISOString().split('T')[0]
    });

    // Reload tasks to update progress bar immediately
    await loadSequenceTasks();

    // Check if all tasks for this day are complete
    const allComplete = await checkAllDayTasksComplete({
      ...contact,
      ...updatedContactData
    });

    if (allComplete) {
      // Advance to next day
      await advanceContactToNextDay(
        { ...contact, ...updatedContactData },
        updateContact
      );
      // Reload tasks again after advancing to next day
      await loadSequenceTasks();
    }
  };

  // Handle task skip
  const handleSkipTask = async (contact, taskType, sequenceDay, reason = '') => {
    // Mark task as skipped in storage
    await skipSequenceTask(contact.id, sequenceDay, taskType, reason);

    // Reload tasks to update UI
    await loadSequenceTasks();

    // Check if all tasks for this day are complete (including skipped)
    const allComplete = await checkAllDayTasksComplete(contact);

    if (allComplete) {
      // Advance to next day
      await advanceContactToNextDay(contact, updateContact);
      // Reload tasks again after advancing
      await loadSequenceTasks();
    }
  };

  // Handle sequence controls
  const handlePause = async (contact) => {
    await pauseSequence(contact.id, updateContact);
  };

  const handleResume = async (contact) => {
    await resumeSequence(contact.id, updateContact);
  };

  const handleMarkDead = async () => {
    if (!selectedContact || !deadReason.trim()) return;

    await markContactDead(selectedContact.id, deadReason, updateContact);
    setShowDeadModal(false);
    setDeadReason('');
    setSelectedContact(null);
  };

  const handleConvert = async (contact) => {
    if (confirm(`Mark ${contact.companyName} as converted to client?`)) {
      await convertToClient(contact.id, updateContact);
    }
  };

  const handleEditClick = (contact) => {
    setEditingContact(contact);
    setShowContactDetails(false);
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
    setShowContactDetails(false);
  };

  // Get tasks for a contact (respects viewMode)
  const getContactTasks = (contact) => {
    // Get visible tasks based on view mode
    const visibleTasks = getVisibleTasks(contact, sequenceTasks, viewMode);

    // Return all tasks (with their full data) sorted by sequence day
    return visibleTasks.sort((a, b) => a.sequence_day - b.sequence_day);
  };

  // Check if task is complete
  const isTaskComplete = (contact, taskType) => {
    const task = sequenceTasks.find(
      t => t.contact_id === contact.id &&
           t.sequence_day === contact.sequence_current_day &&
           t.task_type === taskType
    );
    return task && task.status === 'completed';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-r7-light to-gray-100">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-r7-blue">📋 Sequence Tasks</h1>
            <p className="text-gray-600 mt-1">
              Manage your 27-touch sequence tasks
            </p>
          </div>
          <div className="flex gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-white rounded-lg border-2 border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode('today')}
                className={`px-4 py-2 font-semibold transition-colors ${
                  viewMode === 'today'
                    ? 'bg-r7-blue text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                📅 Today's Tasks
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`px-4 py-2 font-semibold transition-colors ${
                  viewMode === 'all'
                    ? 'bg-r7-blue text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                📆 All Tasks
              </button>
            </div>
            <button
              onClick={onBackToDashboard}
              className="btn bg-gray-500 hover:bg-gray-600"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card bg-white p-4">
            <div className="text-2xl font-bold text-r7-blue">
              {activeSequenceContacts.length}
            </div>
            <div className="text-sm text-gray-600">Active Sequences</div>
          </div>
          <div className="card bg-white p-4">
            <div className="text-2xl font-bold text-green-600">
              {contacts.filter(c => c.sequence_status === 'converted').length}
            </div>
            <div className="text-sm text-gray-600">Converted</div>
          </div>
          <div className="card bg-white p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {contacts.filter(c => c.sequence_status === 'paused').length}
            </div>
            <div className="text-sm text-gray-600">Paused</div>
          </div>
          <div className="card bg-white p-4">
            <div className="text-2xl font-bold text-purple-600">
              {contacts.filter(c => c.sequence_status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>

        {/* Active Sequences */}
        <div className="card bg-white">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Active Sequences
          </h2>

          {activeSequenceContacts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-gray-600">No active sequences</p>
              <p className="text-sm text-gray-500 mt-2">
                Make calls to enter contacts into the sequence
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.keys(groupedContacts)
                .sort((a, b) => Number(a) - Number(b))
                .map(day => (
                  <div key={day} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">
                      Day {day} of 30
                    </h3>

                    <div className="space-y-4">
                      {groupedContacts[day].map(contact => {
                        const tasks = getContactTasks(contact);
                        const completedTasks = tasks.filter(t => t.status === 'completed').length;
                        const skippedTasks = tasks.filter(t => t.status === 'skipped').length;
                        const pendingTasks = tasks.filter(t => t.status === 'pending').length;
                        const hasOverdue = hasOverdueTasks(contact, sequenceTasks);
                        const overdueCount = getOverdueTasks(contact, sequenceTasks).length;

                        return (
                          <div key={contact.id} className={`rounded-lg p-3 ${hasOverdue ? 'bg-red-50 border-2 border-red-300' : 'bg-gray-50'}`}>
                            {/* Contact Header - More Compact */}
                            <div className="flex items-center justify-between mb-2">
                              <div
                                className="cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors flex-1"
                                onClick={() => {
                                  setSelectedContact(contact);
                                  setShowContactDetails(true);
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-gray-800 text-sm">
                                    {contact.companyName}
                                  </h4>
                                  {hasOverdue && (
                                    <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">
                                      🚨 {overdueCount}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <span>📞 {contact.phone}</span>
                                  <span>•</span>
                                  <span>{completedTasks} done, {skippedTasks} skipped, {pendingTasks} pending</span>
                                  <span>•</span>
                                  <span>{getTotalImpressions(contact)} touches</span>
                                </div>
                              </div>

                              {/* Action Buttons - Smaller */}
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handlePause(contact)}
                                  className="px-2 py-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                                  title="Pause sequence"
                                >
                                  ⏸️
                                </button>
                                <button
                                  onClick={() => handleConvert(contact)}
                                  className="px-2 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded"
                                  title="Mark as converted"
                                >
                                  🎉
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedContact(contact);
                                    setShowDeadModal(true);
                                  }}
                                  className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded"
                                  title="Mark as dead"
                                >
                                  ☠️
                                </button>
                              </div>
                            </div>

                            {/* Compact Task List */}
                            <div className="space-y-1">
                              {tasks.map(task => {
                                const today = new Date().toISOString().split('T')[0];
                                const isOverdue = task.status === 'pending' && task.task_due_date < today;
                                const isDueToday = task.status === 'pending' && task.task_due_date === today;
                                const isFuture = task.status === 'pending' && task.task_due_date > today;

                                return (
                                  <div
                                    key={task.id}
                                    className={`flex items-center gap-2 px-2 py-1 rounded text-sm ${
                                      task.status === 'completed'
                                        ? 'bg-green-100'
                                        : task.status === 'skipped'
                                        ? 'bg-gray-200'
                                        : isOverdue
                                        ? 'bg-red-100 border border-red-400'
                                        : isDueToday
                                        ? 'bg-yellow-50 border border-yellow-300'
                                        : 'bg-white border border-gray-200'
                                    }`}
                                  >
                                    {/* Checkbox or Status Icon */}
                                    {task.status === 'completed' ? (
                                      <span className="text-green-600 text-lg">✓</span>
                                    ) : task.status === 'skipped' ? (
                                      <span className="text-gray-500 text-lg">⊘</span>
                                    ) : (
                                      <input
                                        type="checkbox"
                                        checked={false}
                                        onChange={() => handleCompleteTask(contact, task.task_type)}
                                        className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                                      />
                                    )}

                                    {/* Day Badge */}
                                    <span className="text-xs font-semibold text-gray-500 min-w-[3rem]">
                                      Day {task.sequence_day}
                                    </span>

                                    {/* Task Description */}
                                    <span className={`flex-1 text-xs ${
                                      task.status === 'completed' || task.status === 'skipped'
                                        ? 'line-through text-gray-500'
                                        : 'text-gray-800'
                                    }`}>
                                      {getTaskDescription(task.task_type, task.sequence_day)}
                                    </span>

                                    {/* Due Date (for 'all' view mode) */}
                                    {viewMode === 'all' && (
                                      <span className="text-xs text-gray-500">
                                        {isOverdue ? '🚨' : isDueToday ? '📅' : isFuture ? '📆' : ''} {task.task_due_date}
                                      </span>
                                    )}

                                    {/* Status Badge */}
                                    {task.status === 'completed' && (
                                      <span className="text-green-600 text-xs font-semibold">Done</span>
                                    )}
                                    {task.status === 'skipped' && (
                                      <span className="text-gray-600 text-xs font-semibold">Skipped</span>
                                    )}
                                    {isOverdue && task.status === 'pending' && (
                                      <span className="px-1.5 py-0.5 bg-red-600 text-white text-xs font-bold rounded">
                                        OVERDUE
                                      </span>
                                    )}

                                    {/* Skip Button (only for pending tasks) */}
                                    {task.status === 'pending' && (
                                      <button
                                        onClick={() => handleSkipTask(contact, task.task_type, task.sequence_day, 'Skipped by user')}
                                        className="px-2 py-0.5 text-xs bg-gray-400 hover:bg-gray-500 text-white rounded"
                                        title="Skip this task"
                                      >
                                        Skip
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Compact Progress Bar */}
                            {tasks.length > 0 && (
                              <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className="bg-green-500 h-1.5 rounded-full transition-all"
                                    style={{ width: `${((completedTasks + skippedTasks) / tasks.length) * 100}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Paused Sequences */}
        {contacts.filter(c => c.sequence_status === 'paused').length > 0 && (
          <div className="card bg-white mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              ⏸️ Paused Sequences
            </h2>
            <div className="space-y-3">
              {contacts
                .filter(c => c.sequence_status === 'paused')
                .map(contact => (
                  <div key={contact.id} className="bg-yellow-50 rounded-lg p-4 flex items-center justify-between">
                    <div
                      className="cursor-pointer hover:bg-yellow-100 p-2 rounded transition-colors flex-1"
                      onClick={() => {
                        setSelectedContact(contact);
                        setShowContactDetails(true);
                      }}
                    >
                      <h4 className="font-bold text-gray-800">{contact.companyName}</h4>
                      <div className="text-sm text-gray-600 mt-1">
                        Paused on Day {contact.sequence_current_day} • {contact.calls_made} calls made
                      </div>
                    </div>
                    <button
                      onClick={() => handleResume(contact)}
                      className="btn-sm bg-green-500 hover:bg-green-600"
                    >
                      ▶️ Resume
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Contact Details Modal */}
      {showContactDetails && selectedContact && (() => {
        // Prepare sequence tasks for the modal
        const tasks = getContactTasks(selectedContact);
        const sequenceTasksData = tasks.map(taskType => ({
          taskType,
          isComplete: isTaskComplete(selectedContact, taskType)
        }));

        return (
          <ContactDetailsModal
            contact={selectedContact}
            onClose={() => {
              setShowContactDetails(false);
              setSelectedContact(null);
            }}
            onEdit={handleEditClick}
            onDelete={handleDeleteContact}
            sequenceTasks={selectedContact.sequence_status === 'active' ? sequenceTasksData : null}
            sequenceDay={selectedContact.sequence_current_day}
            onCompleteTask={handleCompleteTask}
          />
        );
      })()}

      {/* Edit Contact Modal */}
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
              Why is {selectedContact?.companyName} not a good fit?
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
                  setSelectedContact(null);
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
  );
}

export default SequenceTasksPage;
