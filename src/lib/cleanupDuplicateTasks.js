// Utility to clean up duplicate sequence tasks
// This fixes any existing duplicates in storage

import { storage, KEYS } from './cloudStorage';

/**
 * Remove duplicate tasks from storage
 * Keeps the most recently completed/updated task if there are duplicates
 * For pending tasks, keeps the one with the earliest due date
 */
export async function cleanupDuplicateTasks() {
  const allTasks = await storage.get(KEYS.SEQUENCE_TASKS, []);

  console.log(`🔍 Starting duplicate cleanup - found ${allTasks.length} total tasks`);

  // Group tasks by unique key: contact_id + sequence_day + task_type
  const taskGroups = new Map();

  allTasks.forEach(task => {
    const key = `${task.contact_id}-${task.sequence_day}-${task.task_type}`;

    if (!taskGroups.has(key)) {
      taskGroups.set(key, []);
    }

    taskGroups.get(key).push(task);
  });

  // Find and resolve duplicates
  const uniqueTasks = [];
  let duplicatesFound = 0;

  taskGroups.forEach((tasks, key) => {
    if (tasks.length === 1) {
      // No duplicates for this task
      uniqueTasks.push(tasks[0]);
    } else {
      // Found duplicates!
      duplicatesFound += tasks.length - 1;
      console.log(`⚠️ Found ${tasks.length} duplicates for ${key}`);

      // Choose the best task to keep
      const bestTask = chooseBestTask(tasks);
      uniqueTasks.push(bestTask);

      console.log(`   ✓ Kept task with status: ${bestTask.status}, completed_at: ${bestTask.completed_at || 'N/A'}`);
    }
  });

  console.log(`\n📊 Cleanup Summary:`);
  console.log(`   - Original tasks: ${allTasks.length}`);
  console.log(`   - Unique tasks: ${uniqueTasks.length}`);
  console.log(`   - Duplicates removed: ${duplicatesFound}`);

  // Save cleaned tasks back to storage
  if (duplicatesFound > 0) {
    await storage.set(KEYS.SEQUENCE_TASKS, uniqueTasks);
    console.log(`✅ Cleanup complete! Removed ${duplicatesFound} duplicate tasks`);
    return {
      success: true,
      removedCount: duplicatesFound,
      remainingCount: uniqueTasks.length
    };
  } else {
    console.log(`✅ No duplicates found - storage is clean!`);
    return {
      success: true,
      removedCount: 0,
      remainingCount: uniqueTasks.length
    };
  }
}

/**
 * Choose the best task to keep from a set of duplicates
 * Priority:
 * 1. Completed/skipped tasks (most recent)
 * 2. Pending tasks (earliest due date)
 */
function chooseBestTask(tasks) {
  // Separate completed/skipped from pending
  const completedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'skipped');
  const pendingTasks = tasks.filter(t => t.status === 'pending');

  if (completedTasks.length > 0) {
    // If there are completed/skipped tasks, keep the most recent one
    completedTasks.sort((a, b) => {
      const aTime = new Date(a.completed_at || 0).getTime();
      const bTime = new Date(b.completed_at || 0).getTime();
      return bTime - aTime; // Most recent first
    });
    return completedTasks[0];
  } else {
    // If all are pending, keep the one with the earliest due date
    pendingTasks.sort((a, b) => {
      const aDate = new Date(a.task_due_date || '9999-12-31').getTime();
      const bDate = new Date(b.task_due_date || '9999-12-31').getTime();
      return aDate - bDate; // Earliest first
    });
    return pendingTasks[0];
  }
}

/**
 * Get duplicate statistics without cleaning
 * Useful for checking if cleanup is needed
 */
export async function getDuplicateStats() {
  const allTasks = await storage.get(KEYS.SEQUENCE_TASKS, []);

  // Group tasks by unique key
  const taskGroups = new Map();

  allTasks.forEach(task => {
    const key = `${task.contact_id}-${task.sequence_day}-${task.task_type}`;

    if (!taskGroups.has(key)) {
      taskGroups.set(key, []);
    }

    taskGroups.get(key).push(task);
  });

  // Count duplicates
  let duplicateGroups = 0;
  let totalDuplicates = 0;
  const duplicateDetails = [];

  taskGroups.forEach((tasks, key) => {
    if (tasks.length > 1) {
      duplicateGroups++;
      totalDuplicates += tasks.length - 1;

      duplicateDetails.push({
        key,
        count: tasks.length,
        tasks: tasks.map(t => ({
          id: t.id,
          status: t.status,
          due_date: t.task_due_date,
          completed_at: t.completed_at
        }))
      });
    }
  });

  return {
    totalTasks: allTasks.length,
    uniqueTasks: taskGroups.size,
    duplicateGroups,
    totalDuplicates,
    duplicateDetails
  };
}
