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
  advanceContactToNextDay,
  checkAllDayTasksComplete,
  pauseSequence,
  resumeSequence,
  markContactDead,
  convertToClient,
  applyCounterUpdates,
  getCounterUpdates
} from '../lib/sequenceLogic';

function SequenceTasksPage({ onBackToDashboard }) {
  const { contacts, updateContact, deleteContact } = useContacts();
  const [sequenceTasks, setSequenceTasks] = useState([]);
  const [filter, setFilter] = useState('today'); // 'today', 'overdue', 'all', 'upcoming'
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [showDeadModal, setShowDeadModal] = useState(false);
  const [deadReason, setDeadReason] = useState('');
  const [editingContact, setEditingContact] = useState(null);

  // Load sequence tasks from storage
  useEffect(() => {
    loadSequenceTasks();
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

    // Reload tasks
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

  // Get tasks for a contact
  const getContactTasks = (contact) => {
    const dayTasks = getTasksForDay(contact.sequence_current_day);
    return dayTasks.filter(taskType => !shouldSkipTask(contact, taskType));
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
          <button
            onClick={onBackToDashboard}
            className="btn bg-gray-500 hover:bg-gray-600"
          >
            ← Back to Dashboard
          </button>
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
                        const completedTasks = tasks.filter(t => isTaskComplete(contact, t)).length;

                        return (
                          <div key={contact.id} className="bg-gray-50 rounded-lg p-4">
                            {/* Contact Header */}
                            <div className="flex items-center justify-between mb-3">
                              <div
                                className="cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors flex-1"
                                onClick={() => {
                                  setSelectedContact(contact);
                                  setShowContactDetails(true);
                                }}
                              >
                                <h4 className="font-bold text-gray-800">
                                  {contact.companyName}
                                </h4>
                                <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                                  <span>📞 {contact.phone}</span>
                                  <span>•</span>
                                  <span>
                                    {completedTasks} of {tasks.length} tasks complete
                                  </span>
                                  <span>•</span>
                                  <span>{getTotalImpressions(contact)} total touches</span>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handlePause(contact)}
                                  className="btn-sm bg-yellow-500 hover:bg-yellow-600"
                                  title="Pause sequence"
                                >
                                  ⏸️ Pause
                                </button>
                                <button
                                  onClick={() => handleConvert(contact)}
                                  className="btn-sm bg-green-500 hover:bg-green-600"
                                  title="Mark as converted"
                                >
                                  🎉 Convert
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedContact(contact);
                                    setShowDeadModal(true);
                                  }}
                                  className="btn-sm bg-red-500 hover:bg-red-600"
                                  title="Mark as dead"
                                >
                                  ☠️ Dead
                                </button>
                              </div>
                            </div>

                            {/* Task List */}
                            <div className="space-y-2">
                              {tasks.map(taskType => {
                                const isComplete = isTaskComplete(contact, taskType);

                                return (
                                  <div
                                    key={taskType}
                                    className={`flex items-center gap-3 p-2 rounded ${
                                      isComplete ? 'bg-green-100' : 'bg-white'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isComplete}
                                      onChange={() => !isComplete && handleCompleteTask(contact, taskType)}
                                      className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                                      disabled={isComplete}
                                    />
                                    <span className={`flex-1 ${isComplete ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                                      {getTaskDescription(taskType, contact.sequence_current_day)}
                                    </span>
                                    {isComplete && (
                                      <span className="text-green-600 text-sm">✓ Complete</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-3">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full transition-all"
                                  style={{ width: `${(completedTasks / tasks.length) * 100}%` }}
                                />
                              </div>
                            </div>
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
      {showContactDetails && selectedContact && (
        <ContactDetailsModal
          contact={selectedContact}
          onClose={() => {
            setShowContactDetails(false);
            setSelectedContact(null);
          }}
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
