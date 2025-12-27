// Automatic time-based sequence progression
// Handles auto-advancing contacts through sequences based on calendar dates

import { storage, KEYS } from './cloudStorage';
import { getNextDayWithTasks, getTasksForDay, shouldSkipTask } from './sequenceCalendar';
import { calculateTaskDueDate, getToday, compareDates } from './taskScheduler';

/**
 * Check if a contact should be auto-advanced based on calendar date
 * A contact should advance if the due date for their current day has passed
 * AND all tasks for that day are complete (or skipped)
 *
 * @param {object} contact - Contact with sequence data
 * @param {array} allTasks - All sequence tasks
 * @returns {boolean} Whether contact should be advanced
 */
export function shouldAutoAdvance(contact, allTasks) {
  if (!contact.sequence_status || contact.sequence_status !== 'active') {
    return false;
  }

  const today = getToday();
  const currentDayDueDate = calculateTaskDueDate(
    contact.sequence_start_date,
    contact.sequence_current_day
  );

  // If current day's due date hasn't passed yet, don't advance
  if (compareDates(today, currentDayDueDate) < 0) {
    return false;
  }

  // Check if all current day tasks are complete
  const currentDayTasks = allTasks.filter(
    task => task.contact_id === contact.id &&
            task.sequence_day === contact.sequence_current_day
  );

  // If no tasks for this day (or all skipped), can advance
  if (currentDayTasks.length === 0) {
    return true;
  }

  // All tasks must be completed or skipped
  const allComplete = currentDayTasks.every(
    task => task.status === 'completed' || task.status === 'skipped'
  );

  return allComplete;
}

/**
 * Auto-advance a contact to the next appropriate day based on calendar
 * This accounts for skipping days that have already passed
 *
 * @param {object} contact - Contact to advance
 * @param {function} updateContactFn - Function to update contact
 * @returns {object|null} Updated contact data or null if sequence complete
 */
export async function autoAdvanceContact(contact, updateContactFn) {
  const today = getToday();
  let nextDay = contact.sequence_current_day;

  // Keep advancing until we find a day that's not past due or reach end
  while (nextDay <= 30) {
    nextDay = getNextDayWithTasks(nextDay);

    if (!nextDay) {
      // Sequence complete
      console.log(`✅ Auto-complete: Contact ${contact.id} finished 30-day sequence`);
      await updateContactFn(contact.id, {
        sequence_status: 'completed',
        sequence_current_day: 30
      });
      return { sequence_status: 'completed', sequence_current_day: 30 };
    }

    const nextDayDueDate = calculateTaskDueDate(contact.sequence_start_date, nextDay);

    // If this day is today or in the future, stop here
    if (compareDates(nextDayDueDate, today) >= 0) {
      console.log(`➡️ Auto-advance: Contact ${contact.id} from Day ${contact.sequence_current_day} to Day ${nextDay}`);
      await updateContactFn(contact.id, {
        sequence_current_day: nextDay
      });
      return { sequence_current_day: nextDay };
    }

    // This day is in the past, check if it has any incomplete tasks
    const dayTasks = getTasksForDay(nextDay).filter(
      taskType => !shouldSkipTask(contact, taskType)
    );

    if (dayTasks.length > 0) {
      // There are tasks for this past day - stop here and mark as overdue
      console.log(`⚠️ Auto-advance: Contact ${contact.id} stopped at Day ${nextDay} (has overdue tasks)`);
      await updateContactFn(contact.id, {
        sequence_current_day: nextDay
      });
      return { sequence_current_day: nextDay };
    }

    // This day has no tasks (or all skipped), continue to next day
  }

  // Reached day 30+
  console.log(`✅ Auto-complete: Contact ${contact.id} reached end of sequence`);
  await updateContactFn(contact.id, {
    sequence_status: 'completed',
    sequence_current_day: 30
  });
  return { sequence_status: 'completed', sequence_current_day: 30 };
}

/**
 * Process all active contacts and auto-advance them as needed
 * This should be called on app startup or periodically
 *
 * @param {array} contacts - All contacts
 * @param {function} updateContactFn - Function to update contact
 * @returns {object} Summary of actions taken
 */
export async function processAllSequenceAdvancement(contacts, updateContactFn) {
  const allTasks = await storage.get(KEYS.SEQUENCE_TASKS, []);
  const activeContacts = contacts.filter(c => c.sequence_status === 'active');

  const summary = {
    processed: 0,
    advanced: 0,
    completed: 0,
    stuck: 0
  };

  for (const contact of activeContacts) {
    summary.processed++;

    if (shouldAutoAdvance(contact, allTasks)) {
      const result = await autoAdvanceContact(contact, updateContactFn);

      if (result.sequence_status === 'completed') {
        summary.completed++;
      } else {
        summary.advanced++;
      }
    } else {
      // Check if contact is stuck with overdue tasks
      const today = getToday();
      const currentDayDueDate = calculateTaskDueDate(
        contact.sequence_start_date,
        contact.sequence_current_day
      );

      if (compareDates(currentDayDueDate, today) < 0) {
        summary.stuck++;
      }
    }
  }

  if (summary.advanced > 0 || summary.completed > 0 || summary.stuck > 0) {
    console.log(`🔄 Sequence Auto-Advancement Summary:`, summary);
  }

  return summary;
}

/**
 * Get overdue tasks for a contact
 *
 * @param {object} contact - Contact to check
 * @param {array} allTasks - All sequence tasks
 * @returns {array} Overdue tasks
 */
export function getOverdueTasks(contact, allTasks) {
  const today = getToday();

  return allTasks.filter(task => {
    if (task.contact_id !== contact.id) return false;
    if (task.status !== 'pending') return false;

    return compareDates(task.task_due_date, today) < 0;
  });
}

/**
 * Get tasks that are due today for a contact
 *
 * @param {object} contact - Contact to check
 * @param {array} allTasks - All sequence tasks
 * @returns {array} Tasks due today
 */
export function getTodaysTasks(contact, allTasks) {
  const today = getToday();

  return allTasks.filter(task => {
    if (task.contact_id !== contact.id) return false;
    if (task.status !== 'pending') return false;

    return compareDates(task.task_due_date, today) === 0;
  });
}

/**
 * Get tasks that should be visible (due today or overdue, not future)
 * Supports two view modes:
 * - 'today': Only show tasks due today/overdue + completed tasks (default)
 * - 'all': Show all tasks for the contact (entire 30-day sequence)
 *
 * @param {object} contact - Contact to check
 * @param {array} allTasks - All sequence tasks
 * @param {string} viewMode - 'today' or 'all' (default: 'today')
 * @returns {array} Visible tasks
 */
export function getVisibleTasks(contact, allTasks, viewMode = 'today') {
  const today = getToday();

  return allTasks.filter(task => {
    if (task.contact_id !== contact.id) return false;

    // If viewMode is 'all', show all tasks for this contact
    if (viewMode === 'all') {
      return true;
    }

    // Otherwise, only show tasks due today or overdue (default 'today' mode)
    // Show completed and skipped tasks
    if (task.status === 'completed' || task.status === 'skipped') return true;

    // Show pending tasks that are today or overdue (not future)
    if (task.status === 'pending') {
      return compareDates(task.task_due_date, today) <= 0;
    }

    return false;
  });
}

/**
 * Get ALL tasks for a contact (entire sequence)
 * Convenience wrapper for getVisibleTasks with 'all' mode
 *
 * @param {object} contact - Contact to check
 * @param {array} allTasks - All sequence tasks
 * @returns {array} All tasks for contact
 */
export function getAllTasks(contact, allTasks) {
  return getVisibleTasks(contact, allTasks, 'all');
}

/**
 * Check if a contact has any overdue tasks
 *
 * @param {object} contact - Contact to check
 * @param {array} allTasks - All sequence tasks
 * @returns {boolean}
 */
export function hasOverdueTasks(contact, allTasks) {
  return getOverdueTasks(contact, allTasks).length > 0;
}

/**
 * Get count of contacts with overdue tasks
 *
 * @param {array} contacts - All contacts
 * @param {array} allTasks - All sequence tasks
 * @returns {number}
 */
export function getOverdueContactsCount(contacts, allTasks) {
  const activeContacts = contacts.filter(c => c.sequence_status === 'active');

  return activeContacts.filter(contact =>
    hasOverdueTasks(contact, allTasks)
  ).length;
}
