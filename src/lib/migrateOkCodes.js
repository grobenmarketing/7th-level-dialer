import { storage, KEYS } from './cloudStorage';

/**
 * Migrates OK codes from label format to ID format
 * Old format: "Not Interested", "Meeting Scheduled", etc.
 * New format: "OK-1", "OK-10", etc.
 */

// Mapping of old label formats to new ID formats
const OK_CODE_MIGRATION_MAP = {
  // Old format -> New format
  'Not Interested': 'OK-1',
  'Do Not Call': 'OK-2',
  'Not A Fit': 'OK-3',
  'No Answer - Try Again': 'OK-4',
  'Owner Unavailable': 'OK-5',
  'Voicemail - Left Message': 'OK-6',
  'Call Back - Follow Up': 'OK-7',
  'More Information Email': 'OK-8',
  'Interested / Finished Lead': 'OK-9',
  'Meeting Scheduled': 'OK-10',

  // Other variations that might exist
  'Interested - Follow Up': 'OK-9',
  'Callback Requested': 'OK-7',
  'Not Interested - Budget': 'OK-1',
  'Gatekeeper Block': 'OK-5',

  // Old formats without proper standardization
  'OK1': 'OK-1',
  'OK2': 'OK-2',
  'OK3': 'OK-3',
  'OK4': 'OK-4',
  'OK5': 'OK-5',
  'OK6': 'OK-6',
  'OK7': 'OK-7',
  'OK8': 'OK-8',
  'OK9': 'OK-9',
  'OK10': 'OK-10',
};

/**
 * Migrates a single OK code from old format to new format
 */
function migrateOkCode(okCode) {
  if (!okCode) return null;

  // Already in correct format
  if (okCode.match(/^OK-\d+$/)) {
    return okCode;
  }

  // Try to find in migration map
  return OK_CODE_MIGRATION_MAP[okCode] || okCode;
}

/**
 * Migrates all contacts to use the new OK code format
 */
export async function migrateContactOkCodes() {
  try {
    console.log('🔄 Starting OK code migration...');

    const contacts = await storage.get(KEYS.CONTACTS, []);
    let migratedCount = 0;

    const updatedContacts = contacts.map(contact => {
      let updated = false;
      const updatedContact = { ...contact };

      // Migrate currentOkCode
      if (contact.currentOkCode) {
        const newOkCode = migrateOkCode(contact.currentOkCode);
        if (newOkCode !== contact.currentOkCode) {
          updatedContact.currentOkCode = newOkCode;
          updated = true;
          console.log(`  Migrating ${contact.companyName}: "${contact.currentOkCode}" -> "${newOkCode}"`);
        }
      }

      // Migrate call history OK codes
      if (contact.callHistory && contact.callHistory.length > 0) {
        updatedContact.callHistory = contact.callHistory.map(call => {
          if (call.okCode) {
            const newOkCode = migrateOkCode(call.okCode);
            if (newOkCode !== call.okCode) {
              updated = true;
              return { ...call, okCode: newOkCode };
            }
          }
          return call;
        });
      }

      if (updated) {
        migratedCount++;
      }

      return updatedContact;
    });

    if (migratedCount > 0) {
      await storage.set(KEYS.CONTACTS, updatedContacts);
      console.log(`✅ Migration complete! Updated ${migratedCount} contacts.`);
      return { success: true, migratedCount };
    } else {
      console.log('✅ No contacts needed migration.');
      return { success: true, migratedCount: 0 };
    }

  } catch (error) {
    console.error('❌ Error during OK code migration:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Checks if migration is needed
 */
export async function needsOkCodeMigration() {
  try {
    const contacts = await storage.get(KEYS.CONTACTS, []);

    for (const contact of contacts) {
      // Check currentOkCode
      if (contact.currentOkCode && !contact.currentOkCode.match(/^OK-\d+$/)) {
        return true;
      }

      // Check call history
      if (contact.callHistory) {
        for (const call of contact.callHistory) {
          if (call.okCode && !call.okCode.match(/^OK-\d+$/)) {
            return true;
          }
        }
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
}
