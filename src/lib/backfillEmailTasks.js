// Utility to backfill missing email tasks for contacts already in sequences
// This is needed after removing the email requirement from sequence task generation

import { storage, KEYS } from './cloudStorage';
import { SEQUENCE_CALENDAR } from './sequenceCalendar';
import { calculateTaskDueDate } from './taskScheduler';

/**
 * Backfills missing email tasks for all active contacts in sequences
 * @returns {Promise<{added: number, checked: number}>} - Number of tasks added and contacts checked
 */
export async function backfillEmailTasks() {
  console.log('🔄 Starting email tasks backfill...');

  // Get all contacts and tasks
  const allContacts = await storage.get(KEYS.CONTACTS, []);
  const allTasks = await storage.get(KEYS.SEQUENCE_TASKS, []);

  // Filter to only active sequence contacts
  const activeContacts = allContacts.filter(
    contact => contact.sequence_status === 'active'
  );

  console.log(`📊 Found ${activeContacts.length} active contacts in sequences`);

  // Email task days from the sequence calendar
  const emailDays = [];
  Object.keys(SEQUENCE_CALENDAR).forEach(day => {
    const dayNumber = parseInt(day);
    SEQUENCE_CALENDAR[day].forEach(taskType => {
      if (taskType.includes('email')) {
        emailDays.push({ day: dayNumber, taskType });
      }
    });
  });

  console.log(`📧 Email tasks in sequence:`, emailDays);

  let tasksAdded = 0;
  const newTasks = [];

  // For each active contact, check for missing email tasks
  for (const contact of activeContacts) {
    if (!contact.sequence_start_date) {
      console.log(`⚠️ Contact ${contact.id} has no sequence_start_date, skipping`);
      continue;
    }

    const contactTasks = allTasks.filter(task => task.contact_id === contact.id);

    for (const { day, taskType } of emailDays) {
      // Check if this email task already exists
      const taskExists = contactTasks.some(
        task => task.sequence_day === day && task.task_type === taskType
      );

      if (!taskExists) {
        // Calculate due date for this task
        const dueDate = calculateTaskDueDate(contact.sequence_start_date, day);

        // Create the missing task
        const newTask = {
          id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${day}_${taskType}`,
          contact_id: contact.id,
          task_due_date: dueDate,
          sequence_day: day,
          task_type: taskType,
          task_description: taskType,
          status: 'pending',
          completed_at: null,
          notes: 'Backfilled email task'
        };

        newTasks.push(newTask);
        tasksAdded++;
        console.log(`✅ Added missing task for contact ${contact.companyName || contact.id}: ${taskType} on Day ${day}`);
      }
    }
  }

  // Save all new tasks
  if (newTasks.length > 0) {
    await storage.set(KEYS.SEQUENCE_TASKS, [...allTasks, ...newTasks]);
    console.log(`💾 Saved ${newTasks.length} new email tasks to storage`);
  }

  console.log(`✅ Backfill complete! Added ${tasksAdded} email tasks for ${activeContacts.length} contacts`);

  return {
    added: tasksAdded,
    checked: activeContacts.length
  };
}
