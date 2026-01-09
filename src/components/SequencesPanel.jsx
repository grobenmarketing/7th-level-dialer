import { useState, useMemo, useEffect } from 'react';
import { isTaskOverdue, isTaskDueToday, getDaysOverdue } from '../lib/taskScheduler';
import { getTaskDescription } from '../lib/sequenceCalendar';
import { completeSequenceTask, skipSequenceTask, getCounterUpdates, applyCounterUpdates, checkAllDayTasksComplete, advanceContactToNextDay } from '../lib/sequenceLogic';
import ContactDetailsModal from './ContactDetailsModal';

function SequencesPanel({ contacts, tasks, updateContact, onViewAllSequences, reloadTasks }) {
  const [expandedContact, setExpandedContact] = useState(null);
  const [optimisticallyCompleted, setOptimisticallyCompleted] = useState(new Set());
  const [optimisticallySkipped, setOptimisticallySkipped] = useState(new Set());
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactDetails, setShowContactDetails] = useState(false);

  // Auto-clear optimistic state when tasks are actually completed/skipped in real data
  useEffect(() => {
    // Get IDs of tasks that are actually completed
    const actuallyCompletedIds = new Set(
      tasks
        .filter(t => t.status === 'completed')
        .map(t => `${t.contact_id}-${t.sequence_day}-${t.task_type}`)
    );

    // Remove from optimistic set if actually completed
    setOptimisticallyCompleted(prev => {
      const newSet = new Set();
      prev.forEach(id => {
        if (!actuallyCompletedIds.has(id)) {
          newSet.add(id); // Keep in optimistic set only if NOT actually completed yet
        }
      });
      return newSet.size === prev.size ? prev : newSet; // Only update if changed
    });

    // Get IDs of tasks that are actually skipped
    const actuallySkippedIds = new Set(
      tasks
        .filter(t => t.status === 'skipped')
        .map(t => `${t.contact_id}-${t.sequence_day}-${t.task_type}`)
    );

    // Remove from optimistic set if actually skipped
    setOptimisticallySkipped(prev => {
      const newSet = new Set();
      prev.forEach(id => {
        if (!actuallySkippedIds.has(id)) {
          newSet.add(id); // Keep in optimistic set only if NOT actually skipped yet
        }
      });
      return newSet.size === prev.size ? prev : newSet; // Only update if changed
    });
  }, [tasks]);

  // Get active contacts and group tasks by contact (memoized for performance)
  const contactsWithTasks = useMemo(() => {
    const activeContacts = contacts.filter(c => c.sequence_status === 'active');

    // Group tasks by contact
    const grouped = activeContacts.map(contact => {
      const contactTasks = tasks.filter(t => t.contact_id === contact.id);

      // Get pending tasks (overdue or due today)
      const pendingTasks = contactTasks.filter(t =>
        t.status === 'pending' && (isTaskOverdue(t) || isTaskDueToday(t))
      );

      const overdueTasks = pendingTasks.filter(isTaskOverdue);
      const dueTodayTasks = pendingTasks.filter(isTaskDueToday);

      return {
        contact,
        pendingTasks,
        overdueTasks,
        dueTodayTasks,
        hasOverdue: overdueTasks.length > 0
      };
    }).filter(item => item.pendingTasks.length > 0); // Only show contacts with pending tasks

    // Sort: contacts with overdue tasks first
    grouped.sort((a, b) => {
      if (a.hasOverdue && !b.hasOverdue) return -1;
      if (!a.hasOverdue && b.hasOverdue) return 1;
      return 0;
    });

    return grouped;
  }, [contacts, tasks, optimisticallyCompleted, optimisticallySkipped]);

  const totalPendingTasks = useMemo(() => {
    return contactsWithTasks.reduce(
      (sum, item) => sum + item.pendingTasks.length,
      0
    );
  }, [contactsWithTasks]);

  // Handle task completion
  const handleCompleteTask = async (task, contact) => {
    // Optimistically mark as completed immediately
    const taskId = `${contact.id}-${task.sequence_day}-${task.task_type}`;
    setOptimisticallyCompleted(prev => new Set([...prev, taskId]));

    try {
      // Mark task as complete
      await completeSequenceTask(
        contact.id,
        task.sequence_day,
        task.task_type,
        ''
      );

      // Update contact counters
      const counterUpdates = getCounterUpdates(task.task_type);
      const updatedContactData = applyCounterUpdates(contact, counterUpdates);

      await updateContact(contact.id, {
        ...updatedContactData,
        last_contact_date: new Date().toISOString().split('T')[0]
      });

      // Reload tasks - the useEffect will auto-clear optimistic state when new data arrives
      await reloadTasks();

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
        await reloadTasks();
      }
    } catch (error) {
      // On error, remove optimistic state immediately
      console.error('Error completing task:', error);
      setOptimisticallyCompleted(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
      alert('Error completing task. Please try again.');
    }
  };

  // Handle task skip
  const handleSkipTask = async (task, contact) => {
    // Optimistically mark as skipped immediately
    const taskId = `${contact.id}-${task.sequence_day}-${task.task_type}`;
    setOptimisticallySkipped(prev => new Set([...prev, taskId]));

    try {
      // Mark task as skipped
      await skipSequenceTask(
        contact.id,
        task.sequence_day,
        task.task_type,
        'Skipped by user'
      );

      // Reload tasks - the useEffect will auto-clear optimistic state when new data arrives
      await reloadTasks();

      // Check if all tasks for this day are complete (including skipped)
      const allComplete = await checkAllDayTasksComplete(contact);

      if (allComplete) {
        // Advance to next day
        await advanceContactToNextDay(contact, updateContact);
        await reloadTasks();
      }
    } catch (error) {
      // On error, remove optimistic state immediately
      console.error('Error skipping task:', error);
      setOptimisticallySkipped(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
      alert('Error skipping task. Please try again.');
    }
  };

  return (
    <div className="card bg-white h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">
          🔄 Sequence Tasks
        </h3>
        <span className="text-sm font-medium text-gray-600 bg-purple-100 px-3 py-1 rounded-full">
          {totalPendingTasks} pending
        </span>
      </div>

      {contactsWithTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">✅</div>
          <p className="text-gray-600 font-medium">No tasks due today!</p>
          <p className="text-sm text-gray-500 mt-2">
            All sequence tasks are complete or scheduled for future dates
          </p>
        </div>
      ) : (
        <>
          {/* View All Button */}
          <button
            onClick={onViewAllSequences}
            className="w-full mb-4 p-3 rounded-lg text-center bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all shadow-md"
          >
            <div className="text-sm font-bold">📋 View All Sequences</div>
            <div className="text-xs mt-1 opacity-90">
              Full task manager & contact controls
            </div>
          </button>

          {/* Contacts with Tasks */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {contactsWithTasks.map(({ contact, pendingTasks, overdueTasks, dueTodayTasks, hasOverdue }) => {
              const isExpanded = expandedContact === contact.id;
              const displayTasks = isExpanded ? pendingTasks : pendingTasks.slice(0, 3);

              return (
                <div
                  key={contact.id}
                  className={`border rounded-lg p-3 transition-all ${
                    hasOverdue
                      ? 'bg-red-50 border-red-300'
                      : 'bg-purple-50 border-purple-200'
                  }`}
                >
                  {/* Contact Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-bold text-gray-900 truncate cursor-pointer hover:text-purple-600 transition-colors"
                        onClick={() => {
                          setSelectedContact(contact);
                          setShowContactDetails(true);
                        }}
                        title="Click to view contact details"
                      >
                        {contact.companyName}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Day {contact.sequence_current_day} of 30
                      </div>
                    </div>
                    {hasOverdue && (
                      <span className="flex-shrink-0 ml-2 text-xs font-bold text-red-700 bg-red-200 px-2 py-1 rounded">
                        ⚠️ {overdueTasks.length} Overdue
                      </span>
                    )}
                  </div>

                  {/* Task Counts */}
                  <div className="text-xs text-gray-600 mb-3">
                    {overdueTasks.length > 0 && (
                      <span className="text-red-700 font-medium">
                        {overdueTasks.length} overdue
                      </span>
                    )}
                    {overdueTasks.length > 0 && dueTodayTasks.length > 0 && (
                      <span className="mx-1">•</span>
                    )}
                    {dueTodayTasks.length > 0 && (
                      <span className="text-blue-700 font-medium">
                        {dueTodayTasks.length} due today
                      </span>
                    )}
                  </div>

                  {/* Task List */}
                  <div className="space-y-2">
                    {displayTasks.map(task => {
                      const taskId = `${contact.id}-${task.sequence_day}-${task.task_type}`;
                      const isOptimisticallyCompleted = optimisticallyCompleted.has(taskId);
                      const isOptimisticallySkipped = optimisticallySkipped.has(taskId);
                      const effectiveStatus = isOptimisticallyCompleted ? 'completed' : isOptimisticallySkipped ? 'skipped' : task.status;
                      const isOverdue = effectiveStatus === 'pending' && isTaskOverdue(task);
                      const daysOverdue = isOverdue ? getDaysOverdue(task.task_due_date) : 0;

                      return (
                        <div
                          key={task.id}
                          className={`flex items-start gap-2 p-2 rounded ${
                            isOverdue ? 'bg-red-100' : 'bg-white'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={effectiveStatus === 'completed'}
                            onChange={() => handleCompleteTask(task, contact)}
                            className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                            disabled={effectiveStatus === 'completed' || effectiveStatus === 'skipped'}
                          />
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm ${
                              effectiveStatus === 'completed' || effectiveStatus === 'skipped'
                                ? 'line-through text-gray-500'
                                : 'text-gray-900'
                            }`}>
                              {getTaskDescription(task.task_type, task.sequence_day)}
                            </div>
                            {isOverdue && (
                              <div className="text-xs text-red-700 font-medium mt-1">
                                {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue
                              </div>
                            )}
                          </div>
                          {effectiveStatus === 'pending' && (
                            <button
                              onClick={() => handleSkipTask(task, contact)}
                              className="px-2 py-1 text-xs bg-gray-400 hover:bg-gray-500 text-white rounded"
                              title="Skip this task"
                            >
                              Skip
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Expand/Collapse */}
                  {pendingTasks.length > 3 && (
                    <button
                      onClick={() => setExpandedContact(isExpanded ? null : contact.id)}
                      className="w-full mt-2 py-1 text-xs text-purple-700 hover:text-purple-800 font-medium"
                    >
                      {isExpanded
                        ? '▲ Show Less'
                        : `▼ Show ${pendingTasks.length - 3} More Tasks`
                      }
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Stats Footer */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-600 text-center">
              <span className="font-medium">{activeContacts.length} active sequences</span>
              {' • '}
              <span>{contactsWithTasks.length} need attention today</span>
            </div>
          </div>
        </>
      )}

      {/* Contact Details Modal */}
      {showContactDetails && selectedContact && (
        <ContactDetailsModal
          contact={selectedContact}
          onClose={() => {
            setShowContactDetails(false);
            setSelectedContact(null);
          }}
          onEdit={() => {
            // Close modal when edit is clicked - user can edit in the full database view
            setShowContactDetails(false);
            setSelectedContact(null);
          }}
          onDelete={async (contactId) => {
            // This would need to be passed down from parent component
            // For now, just close the modal
            setShowContactDetails(false);
            setSelectedContact(null);
          }}
          onUpdate={updateContact}
        />
      )}
    </div>
  );
}

export default SequencesPanel;
