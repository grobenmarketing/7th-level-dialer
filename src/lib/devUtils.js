/**
 * Development Utilities
 *
 * Test data loading functions for development and testing.
 * These should only be used in development mode.
 */

import { storage, KEYS } from './cloudStorage';
import { generateDummyContacts } from './dummyData';
import { generateRealisticTestData } from './testDataGenerator';
import { calculateTaskDueDate } from './taskScheduler';
import { SEQUENCE_CALENDAR } from './sequenceCalendar';

/**
 * Load simple test data (8 contacts with various states)
 *
 * @param {Function} addContact - Function to add a contact
 * @returns {Promise<Object>} Result with success status
 */
export async function loadSimpleTestData(addContact) {
  const dummyContacts = generateDummyContacts();
  const baseTimestamp = Date.now();

  for (let i = 0; i < dummyContacts.length; i++) {
    const contact = dummyContacts[i];
    const contactWithUniqueId = {
      ...contact,
      id: (baseTimestamp + i).toString()
    };
    await addContact(contactWithUniqueId);
  }

  return { success: true, count: dummyContacts.length };
}

/**
 * Load realistic test data with full sequence tasks
 *
 * @param {number} count - Number of contacts to generate (default 75)
 * @returns {Promise<Object>} Result with success status and count
 */
export async function loadRealisticTestData(count = 75) {
  try {
    // Generate all contacts
    const realisticContacts = generateRealisticTestData(count);

    // Get existing contacts to add to them
    const existingContacts = await storage.get(KEYS.CONTACTS, []);

    // Add all new contacts to storage at once (much faster)
    const allContacts = [...existingContacts, ...realisticContacts];
    await storage.set(KEYS.CONTACTS, allContacts);

    // Generate sequence tasks for active contacts
    const activeContacts = realisticContacts.filter(c => c.sequence_status === 'active');
    const allTasks = [];
    let taskIdCounter = 0;

    for (const contact of activeContacts) {
      const sequenceStartDate = contact.sequence_start_date;

      Object.keys(SEQUENCE_CALENDAR).forEach(day => {
        const dayNumber = parseInt(day);
        const dayTasks = SEQUENCE_CALENDAR[day];

        // Only generate tasks up to current day and a few days ahead
        if (dayNumber > contact.sequence_current_day + 5) return;

        dayTasks.forEach(taskType => {
          // Skip based on channel availability
          if (taskType.includes('email') && !contact.has_email) return;
          if (taskType.includes('linkedin') && !contact.has_linkedin) return;
          if (taskType.includes('social') && !contact.has_social_media) return;
          if (taskType === 'physical_mail' && !contact.has_email) return;

          // Calculate due date
          const dueDate = calculateTaskDueDate(sequenceStartDate, dayNumber);

          // Determine status based on day
          let status = 'pending';
          let completed_at = null;

          if (dayNumber < contact.sequence_current_day) {
            // Past days should be completed
            status = 'completed';
            const completedDate = new Date(dueDate);
            completedDate.setHours(Math.floor(Math.random() * 8) + 9); // 9am-5pm
            completed_at = completedDate.toISOString();
          } else if (dayNumber === contact.sequence_current_day) {
            // Current day - some completed, some pending
            if (Math.random() > 0.4) {
              status = 'completed';
              const completedDate = new Date();
              completedDate.setHours(Math.floor(Math.random() * 8) + 9);
              completed_at = completedDate.toISOString();
            }
          }

          taskIdCounter++;
          allTasks.push({
            id: `task_${Date.now()}_${taskIdCounter}_${contact.id}_${dayNumber}_${taskType}`,
            contact_id: contact.id,
            task_due_date: dueDate,
            sequence_day: dayNumber,
            task_type: taskType,
            task_description: taskType,
            status,
            completed_at,
            notes: ''
          });
        });
      });
    }

    // Save all tasks at once
    const existingTasks = await storage.get(KEYS.SEQUENCE_TASKS, []);
    await storage.set(KEYS.SEQUENCE_TASKS, [...existingTasks, ...allTasks]);

    return { success: true, count: realisticContacts.length, tasks: allTasks.length };
  } catch (error) {
    console.error('Error loading test data:', error);
    return { success: false, error: error.message };
  }
}
