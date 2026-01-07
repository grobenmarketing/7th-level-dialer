// 30-Day, 27-Touch Sequence Calendar
// Defines exactly which tasks happen on which days

export const SEQUENCE_CALENDAR = {
  1: ['call'],
  2: ['email_1', 'linkedin_dm_1'],
  3: ['social_follow', 'social_engagement'],
  4: ['email_2'],
  5: ['linkedin_comment_1'],
  6: ['social_engagement'],
  8: ['call', 'email_3'],
  10: ['linkedin_comment_2', 'email_4'],
  12: ['linkedin_dm_2'],
  14: ['social_engagement', 'linkedin_comment_3'],
  15: ['call', 'email_5'],
  19: ['physical_mail', 'social_engagement'],
  21: ['linkedin_comment_4'],
  22: ['call'], // Final call (4th call)
  24: ['email_6'],
  26: ['linkedin_comment_5'],
  28: ['social_engagement']
};

// Call days (only 4 calls total in the sequence)
export const CALL_DAYS = [1, 8, 15, 22];

// Maximum touch limits
export const MAX_CALLS = 4;
export const MAX_EMAILS = 6;
export const MAX_LINKEDIN_DMS = 2;
export const MAX_LINKEDIN_COMMENTS = 5;
export const MAX_SOCIAL_ENGAGEMENTS = 4;

// Task descriptions for each task type
export const TASK_DESCRIPTIONS = {
  'email_1': 'Email #1',
  'email_2': 'Email #2',
  'email_3': 'Email #3',
  'email_4': 'Email #4',
  'email_5': 'Email #5',
  'email_6': 'Email #6',
  'linkedin_dm_1': 'Send LinkedIn DM #1',
  'linkedin_dm_2': 'Send LinkedIn DM #2',
  'linkedin_comment_1': 'Comment on LinkedIn post #1',
  'linkedin_comment_2': 'Comment on LinkedIn post #2',
  'linkedin_comment_3': 'Comment on LinkedIn post #3',
  'linkedin_comment_4': 'Comment on LinkedIn post #4',
  'linkedin_comment_5': 'Comment on LinkedIn post #5',
  'social_engagement': 'React + comment on social post',
  'social_follow': 'Follow on social media',
  'physical_mail': 'Send postcard',
  'call': 'Call + leave voicemail'
};

// Get description for a specific task type and day
export function getTaskDescription(taskType, day) {
  if (taskType === 'call') {
    if (day === 22) {
      return 'Call #4 - FINAL ATTEMPT';
    }
    const callNumber = CALL_DAYS.indexOf(day) + 1;
    return `Call #${callNumber} + leave voicemail`;
  }

  return TASK_DESCRIPTIONS[taskType] || taskType;
}

// Get all tasks for a specific day
export function getTasksForDay(day) {
  return SEQUENCE_CALENDAR[day] || [];
}

// Check if a specific day has tasks
export function hasTasks(day) {
  return day in SEQUENCE_CALENDAR;
}

// Get next day with tasks
export function getNextDayWithTasks(currentDay) {
  for (let day = currentDay + 1; day <= 30; day++) {
    if (hasTasks(day)) {
      return day;
    }
  }
  return null; // No more tasks (sequence complete)
}

// Check if contact should skip a task based on available channels
export function shouldSkipTask(contact, taskType) {
  // Email tasks are always included - user can skip manually if no email

  // Skip LinkedIn tasks if no LinkedIn
  if (taskType.includes('linkedin') && !contact.has_linkedin) {
    return true;
  }

  // Skip social tasks if no social media
  if ((taskType.includes('social') || taskType === 'social_follow') && !contact.has_social_media) {
    return true;
  }

  // Skip calls if already made 4 calls
  if (taskType === 'call' && contact.calls_made >= MAX_CALLS) {
    return true;
  }

  return false;
}

// Get total impressions count for a contact
export function getTotalImpressions(contact) {
  const calls = contact.calls_made || 0;
  const voicemails = contact.voicemails_left || 0; // Note: voicemails count as calls
  const emails = contact.emails_sent || 0;
  const linkedinDMs = contact.linkedin_dms_sent || 0;
  const linkedinComments = contact.linkedin_comments_made || 0;
  const socialReactions = contact.social_reactions || 0;
  const socialComments = contact.social_comments || 0;
  const physicalMail = contact.physical_mail_sent ? 1 : 0;

  return calls + emails + linkedinDMs + linkedinComments + socialReactions + socialComments + physicalMail;
}
