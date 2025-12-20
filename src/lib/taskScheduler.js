// Task scheduler for date-based sequence management
// Handles due date calculations, overdue detection, and task filtering

/**
 * Calculate the due date for a task based on sequence start date and day number
 * @param {string} sequenceStartDate - YYYY-MM-DD format
 * @param {number} sequenceDay - Day number in sequence (1-30)
 * @returns {string} Due date in YYYY-MM-DD format
 */
export function calculateTaskDueDate(sequenceStartDate, sequenceDay) {
  const startDate = new Date(sequenceStartDate + 'T00:00:00');
  const dueDate = new Date(startDate);

  // Day 1 = start date, Day 2 = start date + 1, etc.
  dueDate.setDate(startDate.getDate() + (sequenceDay - 1));

  return dueDate.toISOString().split('T')[0];
}

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string}
 */
export function getToday() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Compare two dates
 * @param {string} date1 - YYYY-MM-DD
 * @param {string} date2 - YYYY-MM-DD
 * @returns {number} -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export function compareDates(date1, date2) {
  const d1 = new Date(date1 + 'T00:00:00');
  const d2 = new Date(date2 + 'T00:00:00');

  if (d1 < d2) return -1;
  if (d1 > d2) return 1;
  return 0;
}

/**
 * Check if a task is overdue
 * @param {object} task - Task object with task_due_date
 * @returns {boolean}
 */
export function isTaskOverdue(task) {
  if (!task.task_due_date) return false;
  return compareDates(task.task_due_date, getToday()) < 0;
}

/**
 * Check if a task is due today
 * @param {object} task - Task object with task_due_date
 * @returns {boolean}
 */
export function isTaskDueToday(task) {
  if (!task.task_due_date) return false;
  return compareDates(task.task_due_date, getToday()) === 0;
}

/**
 * Check if a task is upcoming (future)
 * @param {object} task - Task object with task_due_date
 * @returns {boolean}
 */
export function isTaskUpcoming(task) {
  if (!task.task_due_date) return false;
  return compareDates(task.task_due_date, getToday()) > 0;
}

/**
 * Filter tasks by status relative to today
 * @param {array} tasks - Array of task objects
 * @returns {object} Object with overdue, dueToday, upcoming arrays
 */
export function categorizeTasksByDueDate(tasks) {
  return {
    overdue: tasks.filter(t => isTaskOverdue(t) && t.status === 'pending'),
    dueToday: tasks.filter(t => isTaskDueToday(t) && t.status === 'pending'),
    upcoming: tasks.filter(t => isTaskUpcoming(t) && t.status === 'pending'),
    completed: tasks.filter(t => t.status === 'completed')
  };
}

/**
 * Get all pending tasks (overdue + due today)
 * @param {array} tasks - Array of task objects
 * @returns {array} Tasks that need attention now
 */
export function getPendingTasks(tasks) {
  return tasks.filter(
    t => t.status === 'pending' &&
    (isTaskOverdue(t) || isTaskDueToday(t))
  );
}

/**
 * Get tasks for a specific contact that are overdue or due today
 * @param {array} allTasks - All tasks
 * @param {string} contactId - Contact ID
 * @returns {array} Pending tasks for this contact
 */
export function getPendingTasksForContact(allTasks, contactId) {
  const contactTasks = allTasks.filter(t => t.contact_id === contactId);
  return getPendingTasks(contactTasks);
}

/**
 * Check if a contact has overdue tasks
 * @param {array} allTasks - All tasks
 * @param {string} contactId - Contact ID
 * @returns {boolean}
 */
export function hasOverdueTasks(allTasks, contactId) {
  const contactTasks = allTasks.filter(
    t => t.contact_id === contactId && t.status === 'pending'
  );
  return contactTasks.some(isTaskOverdue);
}

/**
 * Get summary of tasks due today grouped by type
 * @param {array} tasks - All tasks
 * @returns {object} Summary with counts by task type
 */
export function getTodaysTaskSummary(tasks) {
  const todaysTasks = tasks.filter(t => isTaskDueToday(t) && t.status === 'pending');

  const summary = {
    total: todaysTasks.length,
    calls: 0,
    emails: 0,
    linkedinDMs: 0,
    linkedinComments: 0,
    socialEngagement: 0,
    physicalMail: 0
  };

  todaysTasks.forEach(task => {
    if (task.task_type === 'call') summary.calls++;
    else if (task.task_type.includes('email')) summary.emails++;
    else if (task.task_type.includes('linkedin_dm')) summary.linkedinDMs++;
    else if (task.task_type.includes('linkedin_comment')) summary.linkedinComments++;
    else if (task.task_type.includes('social')) summary.socialEngagement++;
    else if (task.task_type === 'physical_mail') summary.physicalMail++;
  });

  return summary;
}

/**
 * Get count of overdue tasks
 * @param {array} tasks - All tasks
 * @returns {number}
 */
export function getOverdueCount(tasks) {
  return tasks.filter(t => isTaskOverdue(t) && t.status === 'pending').length;
}

/**
 * Get never-contacted leads for cold calling
 * @param {array} contacts - All contacts
 * @param {number} limit - Max number to return (optional)
 * @returns {array} Never-contacted contacts
 */
export function getNeverContactedLeads(contacts, limit = null) {
  const neverContacted = contacts.filter(
    c => c.sequence_status === 'never_contacted'
  );

  if (limit) {
    return neverContacted.slice(0, limit);
  }

  return neverContacted;
}

/**
 * Format date for display
 * @param {string} dateString - YYYY-MM-DD
 * @returns {string} Formatted date like "Dec 20, 2025"
 */
export function formatDate(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Get days overdue
 * @param {string} dueDate - YYYY-MM-DD
 * @returns {number} Number of days overdue (0 if not overdue)
 */
export function getDaysOverdue(dueDate) {
  const today = new Date(getToday() + 'T00:00:00');
  const due = new Date(dueDate + 'T00:00:00');

  if (today <= due) return 0;

  const diffTime = today - due;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
