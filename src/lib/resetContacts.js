/**
 * Reset Contacts Utility
 *
 * This utility clears all existing contacts and creates fresh test contacts
 * with 'never_contacted' status for testing the cold calling workflow.
 */

import { storage, KEYS } from './cloudStorage';

/**
 * Generate fresh test contacts (never contacted)
 */
function generateFreshContacts(count = 30) {
  const companies = [
    'Acme Manufacturing', 'TechCorp Solutions', 'Global Logistics Inc',
    'Premier Consulting Group', 'NextGen Software', 'Summit Financial',
    'Horizon Marketing', 'Pinnacle Construction', 'Velocity Media',
    'Quantum Analytics', 'Fusion Healthcare', 'Apex Retail',
    'Silverstone Realty', 'BlueSky Innovations', 'Cascade Energy',
    'Redwood Hospitality', 'Emerald Agriculture', 'Titan Manufacturing',
    'Phoenix Automotive', 'Stellar Aerospace', 'Crimson Pharmaceuticals',
    'Cobalt Technologies', 'Midnight Security', 'Sunrise Wellness',
    'Evergreen Landscaping', 'Platinum Insurance', 'Diamond Jewelry Co',
    'Golden Gate Imports', 'Sapphire Consulting', 'Ruby Design Studio'
  ];

  const industries = [
    'Manufacturing', 'Technology', 'Logistics', 'Consulting', 'Software',
    'Finance', 'Marketing', 'Construction', 'Media', 'Analytics',
    'Healthcare', 'Retail', 'Real Estate', 'Innovation', 'Energy',
    'Hospitality', 'Agriculture', 'Automotive', 'Aerospace', 'Pharmaceuticals',
    'Security', 'Wellness', 'Landscaping', 'Insurance', 'Jewelry',
    'Import/Export', 'Design'
  ];

  const contacts = [];
  const baseTimestamp = Date.now();

  for (let i = 0; i < count; i++) {
    const companyName = companies[i] || `Company ${i + 1}`;
    const industry = industries[i] || 'Business Services';
    const phone = `(555) ${String(100 + i).padStart(3, '0')}-${String(1000 + i).padStart(4, '0')}`;
    const domain = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');

    contacts.push({
      id: (baseTimestamp + i).toString(),
      companyName: companyName,
      phone: phone,
      website: `https://${domain}.com`,
      address: `${100 + i} Business St, Suite ${i + 1}00, Austin, TX`,
      linkedin: `https://linkedin.com/company/${domain}`,
      email: `contact@${domain}.com`,
      industry: industry,
      callHistory: [],
      totalDials: 0,
      lastCall: null,
      nextFollowUp: null,
      currentOkCode: null,
      needsEmail: false,
      status: 'active',
      createdAt: new Date().toISOString(),

      // Sequence fields - all fresh/never contacted
      sequence_status: 'never_contacted',
      sequence_current_day: 0,
      sequence_start_date: null,
      last_contact_date: null,
      has_email: true,
      has_linkedin: true,
      has_social_media: true,
      calls_made: 0,
      voicemails_left: 0,
      emails_sent: 0,
      linkedin_dms_sent: 0,
      linkedin_comments_made: 0,
      social_reactions: 0,
      social_comments: 0,
      physical_mail_sent: false,
      dead_reason: null,
      converted_date: null
    });
  }

  return contacts;
}

/**
 * Reset all contacts and create fresh ones
 */
export async function resetContactsToFresh(count = 30) {
  try {
    console.log('🧹 Clearing existing contacts and tasks...');

    // Clear contacts
    await storage.set(KEYS.CONTACTS, []);

    // Clear sequence tasks
    await storage.set(KEYS.SEQUENCE_TASKS, []);

    console.log('✅ Cleared existing data');
    console.log(`📝 Creating ${count} fresh contacts...`);

    // Generate and save fresh contacts
    const freshContacts = generateFreshContacts(count);
    await storage.set(KEYS.CONTACTS, freshContacts);

    console.log(`✅ Created ${freshContacts.length} fresh contacts`);
    console.log('🎉 Reset complete! All contacts are "never_contacted" status');

    return {
      success: true,
      count: freshContacts.length,
      contacts: freshContacts
    };
  } catch (error) {
    console.error('❌ Error resetting contacts:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
