// Sequence management logic
// Handles entering sequences, advancing days, and managing sequence state

import { getTasksForDay, getNextDayWithTasks, shouldSkipTask } from './sequenceCalendar';
import { storage, KEYS } from './cloudStorage';

// Enter a contact into the sequence (called on first call)
export async function enterSequence(contactId, updateContactFn) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  const sequenceData = {
    sequence_status: 'active',
    sequence_current_day: 1,
    sequence_start_date: today,
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

  console.log(`✅ Contact ${contactId} entered sequence on Day 1`);
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

// Check if all tasks for a day are complete
export async function checkAllDayTasksComplete(contact) {
  const dayTasks = getTasksForDay(contact.sequence_current_day);

  if (dayTasks.length === 0) {
    return true; // No tasks for this day
  }

  // Get sequence tasks from storage
  const allTasks = await storage.get(KEYS.SEQUENCE_TASKS, []);
  const contactTasks = allTasks.filter(
    task => task.contact_id === contact.id && task.sequence_day === contact.sequence_current_day
  );

  // Check if all tasks are complete or skipped
  const allComplete = dayTasks.every(taskType => {
    // Skip if contact doesn't have the required channel
    if (shouldSkipTask(contact, taskType)) {
      return true;
    }

    // Check if task is marked as complete or skipped
    const task = contactTasks.find(t => t.task_type === taskType);
    return task && (task.status === 'completed' || task.status === 'skipped');
  });

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

  const taskIndex = allTasks.findIndex(
    task =>
      task.contact_id === contactId &&
      task.sequence_day === sequenceDay &&
      task.task_type === taskType
  );

  if (taskIndex !== -1) {
    // Update existing task
    allTasks[taskIndex].status = 'completed';
    allTasks[taskIndex].completed_at = new Date().toISOString();
    if (notes) {
      allTasks[taskIndex].notes = notes;
    }
  } else {
    // Create new task record
    allTasks.push({
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contact_id: contactId,
      task_date: new Date().toISOString().split('T')[0],
      sequence_day: sequenceDay,
      task_type: taskType,
      task_description: taskType,
      status: 'completed',
      completed_at: new Date().toISOString(),
      notes: notes || ''
    });
  }

  await storage.set(KEYS.SEQUENCE_TASKS, allTasks);
  console.log(`✅ Task completed: ${taskType} for contact ${contactId} on Day ${sequenceDay}`);
}

// Generate initial sequence tasks for a contact (called when entering sequence)
export async function generateSequenceTasks(contact) {
  const tasks = [];
  const today = new Date().toISOString().split('T')[0];

  // Generate tasks for Day 1 only (will generate more as they progress)
  const day1Tasks = getTasksForDay(1);

  day1Tasks.forEach(taskType => {
    // Skip if contact doesn't have the required channel
    if (shouldSkipTask(contact, taskType)) {
      return;
    }

    // Don't create a task for the first call - it's already being made
    if (taskType === 'call') {
      return;
    }

    tasks.push({
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contact_id: contact.id,
      task_date: today,
      sequence_day: 1,
      task_type: taskType,
      task_description: taskType,
      status: 'pending',
      completed_at: null,
      notes: ''
    });
  });

  // Save tasks
  const allTasks = await storage.get(KEYS.SEQUENCE_TASKS, []);
  await storage.set(KEYS.SEQUENCE_TASKS, [...allTasks, ...tasks]);

  console.log(`📋 Generated ${tasks.length} tasks for contact ${contact.id} on Day 1`);
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
