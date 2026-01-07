// Migration script to regenerate sequence tasks with full 27-touch sequence
// This adds LinkedIn and social tasks that were previously filtered out

import { storage, KEYS } from './cloudStorage';
import { generateSequenceTasks } from './sequenceLogic';

const MIGRATION_KEY = 'sequence_tasks_regeneration_2026';

/**
 * Check if this migration has already been run
 */
export async function needsTaskRegeneration() {
  const migrationStatus = await storage.get(KEYS.MIGRATION_STATUS, {});
  return !migrationStatus[MIGRATION_KEY];
}

/**
 * Mark this migration as complete
 */
async function markMigrationComplete() {
  const migrationStatus = await storage.get(KEYS.MIGRATION_STATUS, {});
  migrationStatus[MIGRATION_KEY] = new Date().toISOString();
  await storage.set(KEYS.MIGRATION_STATUS, migrationStatus);
  console.log('✅ Migration marked as complete');
}

/**
 * Regenerate all sequence tasks for active contacts
 * This will add LinkedIn and social tasks that were previously skipped
 */
export async function regenerateAllSequenceTasks() {
  console.log('🔄 Starting sequence task regeneration...');

  try {
    // Load all contacts
    const allContacts = await storage.get(KEYS.CONTACTS, []);
    console.log(`📋 Total contacts in database: ${allContacts.length}`);

    // Find contacts in active sequences
    const activeSequenceContacts = allContacts.filter(
      contact => contact.sequence_status === 'active'
    );
    console.log(`✅ Found ${activeSequenceContacts.length} contacts in active sequences`);

    if (activeSequenceContacts.length === 0) {
      console.log('ℹ️ No active sequence contacts found. Nothing to regenerate.');
      return {
        success: true,
        regeneratedCount: 0,
        message: 'No active sequence contacts found'
      };
    }

    // Load all existing tasks
    const allTasks = await storage.get(KEYS.SEQUENCE_TASKS, []);
    console.log(`📋 Total existing tasks: ${allTasks.length}`);

    let regeneratedCount = 0;
    let tasksAdded = 0;
    let tasksRemoved = 0;

    // For each active contact, regenerate their tasks
    for (const contact of activeSequenceContacts) {
      console.log(`\n🔧 Regenerating tasks for: ${contact.company_name}`);
      console.log(`   Current sequence day: ${contact.sequence_current_day}`);
      console.log(`   Sequence start date: ${contact.sequence_start_date}`);

      // Count existing tasks for this contact
      const existingContactTasks = allTasks.filter(t => t.contact_id === contact.id);
      const existingTaskCount = existingContactTasks.length;
      console.log(`   Existing tasks: ${existingTaskCount}`);

      // Delete existing tasks for this contact
      const remainingTasks = allTasks.filter(task => task.contact_id !== contact.id);
      tasksRemoved += existingTaskCount;

      // Regenerate all tasks with new logic (includes LinkedIn & social)
      await storage.set(KEYS.SEQUENCE_TASKS, remainingTasks);
      await generateSequenceTasks(contact);

      // Reload tasks to count new ones
      const updatedTasks = await storage.get(KEYS.SEQUENCE_TASKS, []);
      const newContactTasks = updatedTasks.filter(t => t.contact_id === contact.id);
      const newTaskCount = newContactTasks.length;
      console.log(`   New tasks generated: ${newTaskCount}`);
      console.log(`   Tasks added: ${newTaskCount - existingTaskCount}`);

      tasksAdded += newTaskCount;
      regeneratedCount++;

      // Update allTasks reference for next iteration
      allTasks.length = 0;
      allTasks.push(...updatedTasks);
    }

    console.log('\n✅ Task regeneration complete!');
    console.log(`   Contacts processed: ${regeneratedCount}`);
    console.log(`   Tasks removed: ${tasksRemoved}`);
    console.log(`   Tasks created: ${tasksAdded}`);
    console.log(`   Net tasks added: ${tasksAdded - tasksRemoved}`);

    // Mark migration as complete
    await markMigrationComplete();

    return {
      success: true,
      regeneratedCount,
      tasksRemoved,
      tasksAdded,
      netTasksAdded: tasksAdded - tasksRemoved
    };

  } catch (error) {
    console.error('❌ Error regenerating sequence tasks:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Expose function to browser console for manual execution
 */
if (typeof window !== 'undefined') {
  window.regenerateAllSequenceTasks = regenerateAllSequenceTasks;
}
