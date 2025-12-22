/**
 * Contact Schema Factory
 *
 * Single source of truth for contact object structure.
 * Eliminates duplication across addContact, importFromCSV, and migrations.
 */

/**
 * Creates a new contact object with default values
 *
 * @param {Object} data - Partial contact data to override defaults
 * @param {string} data.id - Unique contact identifier (auto-generated if not provided)
 * @param {string} data.companyName - Company name
 * @param {string} data.phone - Phone number
 * @param {string} data.website - Company website
 * @param {string} data.address - Physical address
 * @param {string} data.linkedin - LinkedIn profile URL
 * @param {string} data.email - Email address
 * @param {string} data.industry - Industry classification
 * @returns {Object} Complete contact object with all required fields
 */
export function createContact(data = {}) {
  return {
    // Identity
    id: data.id || Date.now().toString(),
    companyName: data.companyName || '',
    phone: data.phone || '',
    website: data.website || '',
    address: data.address || '',
    linkedin: data.linkedin || '',
    email: data.email || '',
    industry: data.industry || '',

    // Call History
    callHistory: data.callHistory || [],

    // Metadata
    totalDials: data.totalDials || 0,
    lastCall: data.lastCall || null,
    nextFollowUp: data.nextFollowUp || null,
    currentOkCode: data.currentOkCode || null,
    needsEmail: data.needsEmail || false,
    status: data.status || 'active',
    createdAt: data.createdAt || new Date().toISOString(),

    // Sequence Fields
    sequence_status: data.sequence_status || 'never_contacted',
    sequence_current_day: data.sequence_current_day || 0,
    sequence_start_date: data.sequence_start_date || null,
    last_contact_date: data.last_contact_date || null,
    has_email: data.has_email ?? (!!data.email),
    has_linkedin: data.has_linkedin ?? (!!data.linkedin),
    has_social_media: data.has_social_media || false,
    calls_made: data.calls_made || 0,
    voicemails_left: data.voicemails_left || 0,
    emails_sent: data.emails_sent || 0,
    linkedin_dms_sent: data.linkedin_dms_sent || 0,
    linkedin_comments_made: data.linkedin_comments_made || 0,
    social_reactions: data.social_reactions || 0,
    social_comments: data.social_comments || 0,
    physical_mail_sent: data.physical_mail_sent || false,
    dead_reason: data.dead_reason || null,
    converted_date: data.converted_date || null
  };
}

/**
 * Migrates an old contact object to the current schema
 * Adds missing sequence fields to contacts created before sequence feature
 *
 * @param {Object} contact - Old contact object
 * @returns {Object} Migrated contact with all current fields
 */
export function migrateContact(contact) {
  // If contact already has sequence fields, return as-is
  if (contact.hasOwnProperty('sequence_status')) {
    return contact;
  }

  // Infer sequence status from call history
  const hasBeenCalled = contact.callHistory && contact.callHistory.length > 0;

  return createContact({
    ...contact,
    sequence_status: hasBeenCalled ? 'active' : 'never_contacted',
    sequence_current_day: hasBeenCalled ? 1 : 0,
    sequence_start_date: contact.lastCall || null,
    last_contact_date: contact.lastCall || null,
    calls_made: contact.callHistory ? contact.callHistory.length : 0
  });
}

/**
 * Creates a contact from CSV row data
 *
 * @param {Array<string>} values - Array of CSV values [companyName, phone, website, address, linkedin, industry]
 * @param {number} index - Row index for unique ID generation
 * @returns {Object} Contact object
 */
export function createContactFromCSV(values, index) {
  return createContact({
    id: `${Date.now()}-${index}`,
    companyName: values[0] || '',
    phone: values[1] || '',
    website: values[2] || '',
    address: values[3] || '',
    linkedin: values[4] || '',
    industry: values[5] || ''
  });
}
