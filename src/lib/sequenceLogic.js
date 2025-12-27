// Sequence management logic
// Handles entering sequences, advancing days, and managing sequence state

import { getTasksForDay, getNextDayWithTasks, shouldSkipTask, SEQUENCE_CALENDAR } from './sequenceCalendar';
import { storage, KEYS } from './cloudStorage';
import { calculateTaskDueDate, hasOverdueTasks, isTaskOverdue, isTaskDueToday } from './taskScheduler';

// Enter a contact into the sequence (called on first call)
export async function enterSequence(contactId, updateContactFn) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  const sequenceData = {
    sequence_status: 'active',
    sequence_current_day: 1, // Start on Day 1 - the cold call just made IS the Day 1 call
    sequence_start_date: today, // Sequence starts today
    last_contact_date: today,
    calls_made: 1, // First call counts
    voicemails_left: 0,
    emails_sent: 0,
    linkedin_dms_sent: 0,
    linkedin_comments_made: 0,
    social_reactions: 0,
    social_comments: 0,
    physical_mail_sent: false,
    has_email: false, // Will be set manually or detected
    has_linkedin: false, // Will be set manually or detected
    has_social_media: false // Will be set manually or detected
  };

  // Update contact with sequence data
  await updateContactFn(contactId, sequenceData);

  console.log(`✅ Contact ${contactId} entered sequence on Day 1 - cold call counts as Day 1 call!`);
}

// Update contact counters based on task type
export function getCounterUpdates(taskType) {
  const updates = {};

  if (taskType.includes('email')) {
    updates.emails_sent = 'increment';
  }
  if (taskType === 'call') {
    updates.calls_made = 'increment';
  }
  if (taskType.includes('linkedin_dm')) {
    updates.linkedin_dms_sent = 'increment';
  }
  if (taskType.includes('linkedin_comment')) {
    updates.linkedin_comments_made = 'increment';
  }
  if (taskType === 'social_engagement' || taskType === 'social_follow') {
    updates.social_reactions = 'increment';
    updates.social_comments = 'increment';
  }
  if (taskType === 'physical_mail') {
    updates.physical_mail_sent = true;
  }

  return updates;
}

// Apply counter updates to a contact
export function applyCounterUpdates(contact, updates) {
  const updatedContact = { ...contact };

  Object.keys(updates).forEach(key => {
    if (updates[key] === 'increment') {
      updatedContact[key] = (contact[key] || 0) + 1;
    } else {
      updatedContact[key] = updates[key];
    }
  });

  return updatedContact;
}

// Check if all tasks for current day are complete (and no overdue tasks exist)
export async function checkAllDayTasksComplete(contact) {
  // Get all tasks for this contact
  const allTasks = await storage.get(KEYS.SEQUENCE_TASKS, []);
  const contactTasks = allTasks.filter(task => task.contact_id === contact.id);

  // First, check if there are ANY overdue tasks - if so, can't advance
  const overdueTasksExist = contactTasks.some(
    task => task.status === 'pending' && isTaskOverdue(task)
  );

  if (overdueTasksExist) {
    console.log(`⚠️ Contact ${contact.id} has overdue tasks - cannot advance`);
    return false;
  }

  // Get tasks for current day
  const currentDayTasks = contactTasks.filter(
    task => task.sequence_day === contact.sequence_current_day
  );

  if (currentDayTasks.length === 0) {
    return true; // No tasks for this day
  }

  // Check if all current day tasks are complete
  const allComplete = currentDayTasks.every(
    task => task.status === 'completed' || task.status === 'skipped'
  );

  return allComplete;
}

// Advance contact to next day in sequence
export async function advanceContactToNextDay(contact, updateContactFn) {
  const nextDay = getNextDayWithTasks(contact.sequence_current_day);

  if (!nextDay) {
    // Sequence complete (past day 30 or no more tasks)
    console.log(`✅ Contact ${contact.id} completed sequence!`);
    await updateContactFn(contact.id, {
      sequence_status: 'completed',
      sequence_current_day: 30
    });
    return;
  }

  // Advance to next day
  console.log(`➡️ Contact ${contact.id} advanced from Day ${contact.sequence_current_day} to Day ${nextDay}`);
  await updateContactFn(contact.id, {
    sequence_current_day: nextDay
  });
}

// Mark a sequence task as complete
export async function completeSequenceTask(contactId, sequenceDay, taskType, notes = '') {
  const allTasks = await storage.get(KEYS.SEQUENCE_TASKS, []);

  console.log(`🔍 Looking for task: contactId=${contactId}, sequenceDay=${sequenceDay}, taskType=${taskType}`);
  console.log(`📋 Total tasks in storage: ${allTasks.length}`);

  const contactTasks = allTasks.filter(t => t.contact_id === contactId);
  console.log(`📋 Tasks for this contact: ${contactTasks.length}`);

  // Find ALL matching tasks (in case of duplicates) and update them
  let updatedCount = 0;
  allTasks.forEach((task, index) => {
    if (task.contact_id === contactId &&
        task.sequence_day === sequenceDay &&
        task.task_type === taskType) {
      console.log(`✓ Found existing task at index ${index}:`, allTasks[index]);
      allTasks[index].status = 'completed';
      allTasks[index].completed_at = new Date().toISOString();
      if (notes) {
        allTasks[index].notes = notes;
      }
      updatedCount++;
    }
  });

  if (updatedCount === 0) {
    // No existing task - create new completed task record
    console.log(`⚠️ Task not found in storage - creating new task record`);
    const newTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contact_id: contactId,
      task_date: new Date().toISOString().split('T')[0],
      task_due_date: new Date().toISOString().split('T')[0], // Set due date to today
      sequence_day: sequenceDay,
      task_type: taskType,
      task_description: taskType,
      status: 'completed',
      completed_at: new Date().toISOString(),
      notes: notes || ''
    };
    console.log(`📝 Creating new task:`, newTask);
    allTasks.push(newTask);
    updatedCount = 1;
  }

  await storage.set(KEYS.SEQUENCE_TASKS, allTasks);
  console.log(`✅ Task completed: ${taskType} for contact ${contactId} on Day ${sequenceDay} (${updatedCount} task(s) updated)`);
}

// Skip a sequence task (manual skip by user)
export async function skipSequenceTask(contactId, sequenceDay, taskType, reason = '') {
  const allTasks = await storage.get(KEYS.SEQUENCE_TASKS, []);

  console.log(`⏭️ Skipping task: contactId=${contactId}, sequenceDay=${sequenceDay}, taskType=${taskType}`);

  // Find ALL matching tasks (in case of duplicates) and update them
  let updatedCount = 0;
  allTasks.forEach((task, index) => {
    if (task.contact_id === contactId &&
        task.sequence_day === sequenceDay &&
        task.task_type === taskType) {
      console.log(`✓ Found task to skip at index ${index}`);
      allTasks[index].status = 'skipped';
      allTasks[index].completed_at = new Date().toISOString();
      allTasks[index].notes = reason ? `Skipped: ${reason}` : 'Skipped by user';
      updatedCount++;
    }
  });

  if (updatedCount === 0) {
    // No existing task - create new skipped task record
    console.log(`⚠️ Task not found in storage - creating skipped task record`);
    const newTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contact_id: contactId,
      task_date: new Date().toISOString().split('T')[0],
      task_due_date: new Date().toISOString().split('T')[0],
      sequence_day: sequenceDay,
      task_type: taskType,
      task_description: taskType,
      status: 'skipped',
      completed_at: new Date().toISOString(),
      notes: reason ? `Skipped: ${reason}` : 'Skipped by user'
    };
    console.log(`📝 Creating skipped task:`, newTask);
    allTasks.push(newTask);
    updatedCount = 1;
  }

  await storage.set(KEYS.SEQUENCE_TASKS, allTasks);
  console.log(`⏭️ Task skipped: ${taskType} for contact ${contactId} on Day ${sequenceDay} (${updatedCount} task(s) updated)`);
}

// Generate ALL sequence tasks for a contact (called when entering sequence)
export async function generateSequenceTasks(contact) {
  const tasks = [];
  const sequenceStartDate = contact.sequence_start_date;

  // Generate tasks for ALL days in the sequence (1-30)
  Object.keys(SEQUENCE_CALENDAR).forEach(day => {
    const dayNumber = parseInt(day);
    const dayTasks = SEQUENCE_CALENDAR[day];

    dayTasks.forEach(taskType => {
      // Skip if contact doesn't have the required channel
      if (shouldSkipTask(contact, taskType)) {
        return;
      }

      // Skip Day 1 call task - the cold call on Day 0 counts as completing this
      if (dayNumber === 1 && taskType === 'call') {
        return;
      }

      // Calculate due date for this task
      const dueDate = calculateTaskDueDate(sequenceStartDate, dayNumber);

      tasks.push({
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${dayNumber}_${taskType}`,
        contact_id: contact.id,
        task_due_date: dueDate,
        sequence_day: dayNumber,
        task_type: taskType,
        task_description: taskType,
        status: 'pending',
        completed_at: null,
        notes: ''
      });
    });
  });

  // Save tasks
  const allTasks = await storage.get(KEYS.SEQUENCE_TASKS, []);
  await storage.set(KEYS.SEQUENCE_TASKS, [...allTasks, ...tasks]);

  console.log(`📋 Generated ${tasks.length} tasks for contact ${contact.id} for full 30-day sequence`);
}

// Delete all future sequence tasks for a contact (when marked dead/converted)
export async function deleteSequenceTasks(contactId) {
  const allTasks = await storage.get(KEYS.SEQUENCE_TASKS, []);
  const remainingTasks = allTasks.filter(task => task.contact_id !== contactId);
  await storage.set(KEYS.SEQUENCE_TASKS, remainingTasks);
  console.log(`🗑️ Deleted all sequence tasks for contact ${contactId}`);
}

// Pause sequence for a contact
export async function pauseSequence(contactId, updateContactFn) {
  await updateContactFn(contactId, { sequence_status: 'paused' });
  console.log(`⏸️ Sequence paused for contact ${contactId}`);
}

// Resume sequence for a contact
export async function resumeSequence(contactId, updateContactFn) {
  await updateContactFn(contactId, { sequence_status: 'active' });
  console.log(`▶️ Sequence resumed for contact ${contactId}`);
}

// Mark contact as dead
export async function markContactDead(contactId, reason, updateContactFn) {
  await updateContactFn(contactId, {
    sequence_status: 'dead',
    dead_reason: reason,
    status: 'inactive'
  });
  await deleteSequenceTasks(contactId);
  console.log(`☠️ Contact ${contactId} marked as dead: ${reason}`);
}

// Convert contact to client
export async function convertToClient(contactId, updateContactFn) {
  const today = new Date().toISOString().split('T')[0];

  await updateContactFn(contactId, {
    sequence_status: 'converted',
    converted_date: today,
    status: 'client'
  });
  await deleteSequenceTasks(contactId);
  console.log(`🎉 Contact ${contactId} converted to client!`);
}
