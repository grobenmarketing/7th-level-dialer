// Enhanced test data generator for realistic testing
// Creates 50-100 contacts with various sequence states and due dates

const COMPANY_NAMES = [
  'Acme Manufacturing', 'TechCorp Solutions', 'Global Logistics Inc', 'Prime Retail Group',
  'BlueSky Consulting', 'Apex Industries', 'NextGen Software', 'Coastal Shipping Co',
  'Mountain Hardware', 'Valley Tech Solutions', 'Summit Enterprises', 'Horizon Systems',
  'Pacific Trading Co', 'Atlantic Ventures', 'Metro Services Group', 'Capital Investments',
  'Elite Manufacturing', 'Premier Solutions Inc', 'United Logistics', 'Superior Products',
  'Dynamic Systems Corp', 'Innovative Tech Labs', 'Strategic Partners LLC', 'Quantum Solutions',
  'Vertex Technologies', 'Pinnacle Services', 'Omega Industries', 'Alpha Enterprises',
  'Beta Systems Inc', 'Gamma Solutions Group', 'Delta Manufacturing', 'Epsilon Tech',
  'Zeta Logistics Co', 'Eta Consulting Services', 'Theta Industries Ltd', 'Iota Software',
  'Kappa Retail Group', 'Lambda Ventures', 'Mu Technologies', 'Nu Solutions Inc',
  'Xi Manufacturing Co', 'Omicron Systems', 'Pi Consulting Group', 'Rho Enterprises',
  'Sigma Tech Solutions', 'Tau Industries', 'Upsilon Services', 'Phi Manufacturing',
  'Chi Software Labs', 'Psi Logistics Corp', 'Omega Prime Industries', 'Zenith Solutions',
  'Meridian Tech Group', 'Nexus Enterprises', 'Catalyst Solutions', 'Vanguard Systems',
  'Titan Industries', 'Atlas Manufacturing', 'Phoenix Solutions', 'Genesis Tech Corp',
  'Cornerstone Services', 'Foundation Systems', 'Keystone Industries', 'Benchmark Solutions',
  'Flagship Enterprises', 'Premier Tech Labs', 'Elite Systems Group', 'Supreme Solutions',
  'Ultimate Manufacturing', 'Prime Tech Corp', 'Superior Systems Inc', 'Prestige Industries',
  'Excellence Solutions', 'Quality Tech Group', 'Precision Manufacturing', 'Advance Systems',
  'Progress Solutions', 'Innovation Labs Inc', 'Discovery Tech Corp', 'Venture Systems',
  'Growth Industries', 'Success Solutions', 'Achievement Tech', 'Victory Enterprises',
  'Champion Systems', 'Leader Industries', 'Pioneer Solutions', 'Trailblazer Tech',
  'Explorer Systems', 'Navigator Solutions', 'Pathfinder Industries', 'Compass Tech Corp',
  'Guide Systems Inc', 'Direction Solutions', 'Focus Industries', 'Vision Tech Group',
  'Insight Solutions', 'Wisdom Systems Corp', 'Knowledge Industries', 'Expert Solutions',
  'Mastery Tech Labs', 'Skill Systems Inc', 'Talent Solutions Group', 'Genius Industries'
];

const INDUSTRIES = [
  'Manufacturing', 'Technology', 'Logistics', 'Retail', 'Consulting',
  'Software', 'Healthcare', 'Finance', 'Construction', 'Real Estate',
  'Marketing', 'Education', 'Hospitality', 'Transportation', 'Energy'
];

const STREETS = [
  'Main St', 'Oak Ave', 'Maple Dr', 'Elm Street', 'Park Blvd',
  'Washington Ave', 'Lincoln Rd', 'Jefferson Pkwy', 'Madison St', 'Adams Way'
];

const CITIES = [
  'Los Angeles, CA', 'New York, NY', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
  'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
  'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC',
  'San Francisco, CA', 'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Boston, MA'
];

function generatePhoneNumber() {
  const area = Math.floor(Math.random() * 900) + 100;
  const prefix = Math.floor(Math.random() * 900) + 100;
  const line = Math.floor(Math.random() * 9000) + 1000;
  return `(${area}) ${prefix}-${line}`;
}

function generateEmail(companyName) {
  const domain = companyName.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 15);
  return `info@${domain}.com`;
}

function generateWebsite(companyName) {
  const domain = companyName.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 15);
  return `https://${domain}.com`;
}

function generateLinkedIn(companyName) {
  const handle = companyName.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .substring(0, 20);
  return `https://linkedin.com/company/${handle}`;
}

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

function generateCallHistory(callCount, startDate) {
  const history = [];
  for (let i = 0; i < callCount; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const okCodes = ['OK1', 'OK2', 'OK3', 'OK4', 'OK5', 'VM'];
    history.push({
      timestamp: new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000)).toISOString(),
      okCode: getRandomItem(okCodes),
      notes: 'Test call'
    });
  }
  return history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export function generateRealisticTestData(count = 75) {
  const contacts = [];
  const baseId = Date.now();

  // Use a subset of company names to avoid duplicates
  const selectedCompanies = COMPANY_NAMES.slice(0, Math.min(count, COMPANY_NAMES.length));

  for (let i = 0; i < count; i++) {
    const companyName = selectedCompanies[i % selectedCompanies.length];
    const industry = getRandomItem(INDUSTRIES);
    const phone = generatePhoneNumber();
    const hasEmail = Math.random() > 0.1; // 90% have email
    const hasLinkedIn = Math.random() > 0.2; // 80% have LinkedIn
    const hasSocial = Math.random() > 0.3; // 70% have social

    let contact = {
      id: `${baseId + i}`,
      companyName: i >= selectedCompanies.length ? `${companyName} ${Math.floor(i / selectedCompanies.length) + 1}` : companyName,
      phone,
      website: generateWebsite(companyName),
      address: `${Math.floor(Math.random() * 9000) + 1000} ${getRandomItem(STREETS)}, ${getRandomItem(CITIES)}`,
      linkedin: hasLinkedIn ? generateLinkedIn(companyName) : '',
      industry,
      callHistory: [],
      totalDials: 0,
      lastCall: null,
      currentOkCode: null,
      status: 'active',
      has_email: hasEmail,
      has_linkedin: hasLinkedIn,
      has_social_media: hasSocial
    };

    // Distribute contacts across different states
    const rand = Math.random();

    if (rand < 0.50) {
      // 50% - Never contacted (for cold calling)
      contact.sequence_status = 'never_contacted';
      contact.sequence_current_day = 0;
      contact.calls_made = 0;
      contact.voicemails_left = 0;
      contact.emails_sent = 0;
      contact.linkedin_dms_sent = 0;
      contact.linkedin_comments_made = 0;
      contact.social_reactions = 0;
      contact.social_comments = 0;
      contact.physical_mail_sent = false;

    } else if (rand < 0.75) {
      // 25% - Active in sequence (various days)
      const daysInSequence = Math.floor(Math.random() * 20) + 1; // Days 1-20
      const daysAgoStarted = Math.floor(Math.random() * 15); // Started 0-15 days ago

      contact.sequence_status = 'active';
      contact.sequence_current_day = daysInSequence;
      contact.sequence_start_date = getRandomDate(daysAgoStarted);
      contact.last_contact_date = getRandomDate(Math.floor(Math.random() * daysAgoStarted));

      // Set counters based on progress
      contact.calls_made = Math.min(Math.floor(daysInSequence / 7) + 1, 4);
      contact.voicemails_left = Math.floor(Math.random() * contact.calls_made);
      contact.emails_sent = hasEmail ? Math.min(Math.floor(daysInSequence / 5), 6) : 0;
      contact.linkedin_dms_sent = hasLinkedIn ? Math.min(Math.floor(daysInSequence / 10), 2) : 0;
      contact.linkedin_comments_made = hasLinkedIn ? Math.min(Math.floor(daysInSequence / 6), 5) : 0;
      contact.social_reactions = hasSocial ? Math.floor(Math.random() * 3) : 0;
      contact.social_comments = hasSocial ? Math.floor(Math.random() * 3) : 0;
      contact.physical_mail_sent = daysInSequence >= 19;

      contact.callHistory = generateCallHistory(contact.calls_made, contact.sequence_start_date);
      contact.totalDials = contact.calls_made;
      contact.lastCall = contact.callHistory[0]?.timestamp || null;
      contact.currentOkCode = contact.callHistory[0]?.okCode || null;

    } else if (rand < 0.85) {
      // 10% - Paused sequences
      const daysInSequence = Math.floor(Math.random() * 15) + 1;
      const daysAgoStarted = Math.floor(Math.random() * 20);

      contact.sequence_status = 'paused';
      contact.sequence_current_day = daysInSequence;
      contact.sequence_start_date = getRandomDate(daysAgoStarted);
      contact.last_contact_date = getRandomDate(Math.floor(Math.random() * 10));

      contact.calls_made = Math.min(Math.floor(daysInSequence / 7) + 1, 3);
      contact.voicemails_left = Math.floor(Math.random() * contact.calls_made);
      contact.emails_sent = hasEmail ? Math.min(Math.floor(daysInSequence / 5), 4) : 0;
      contact.linkedin_dms_sent = 0;
      contact.linkedin_comments_made = 0;
      contact.social_reactions = 0;
      contact.social_comments = 0;
      contact.physical_mail_sent = false;

      contact.callHistory = generateCallHistory(contact.calls_made, contact.sequence_start_date);
      contact.totalDials = contact.calls_made;
      contact.lastCall = contact.callHistory[0]?.timestamp || null;
      contact.currentOkCode = contact.callHistory[0]?.okCode || null;

    } else if (rand < 0.92) {
      // 7% - Completed sequences
      contact.sequence_status = 'completed';
      contact.sequence_current_day = 30;
      contact.sequence_start_date = getRandomDate(35);
      contact.last_contact_date = getRandomDate(5);

      contact.calls_made = 4;
      contact.voicemails_left = 2;
      contact.emails_sent = hasEmail ? 6 : 0;
      contact.linkedin_dms_sent = hasLinkedIn ? 2 : 0;
      contact.linkedin_comments_made = hasLinkedIn ? 5 : 0;
      contact.social_reactions = hasSocial ? 4 : 0;
      contact.social_comments = hasSocial ? 4 : 0;
      contact.physical_mail_sent = true;

      contact.callHistory = generateCallHistory(4, contact.sequence_start_date);
      contact.totalDials = 4;
      contact.lastCall = contact.callHistory[0]?.timestamp || null;
      contact.currentOkCode = contact.callHistory[0]?.okCode || null;

    } else if (rand < 0.97) {
      // 5% - Converted to client
      const daysInSequence = Math.floor(Math.random() * 20) + 5;
      const daysAgoStarted = Math.floor(Math.random() * 30);

      contact.sequence_status = 'converted';
      contact.sequence_current_day = daysInSequence;
      contact.sequence_start_date = getRandomDate(daysAgoStarted);
      contact.last_contact_date = getRandomDate(Math.floor(Math.random() * 7));
      contact.converted_date = contact.last_contact_date;
      contact.status = 'client';

      contact.calls_made = Math.min(Math.floor(daysInSequence / 7) + 1, 4);
      contact.voicemails_left = 1;
      contact.emails_sent = hasEmail ? Math.min(Math.floor(daysInSequence / 5), 5) : 0;
      contact.linkedin_dms_sent = hasLinkedIn ? 1 : 0;
      contact.linkedin_comments_made = hasLinkedIn ? Math.floor(Math.random() * 3) : 0;
      contact.social_reactions = hasSocial ? Math.floor(Math.random() * 2) : 0;
      contact.social_comments = hasSocial ? Math.floor(Math.random() * 2) : 0;
      contact.physical_mail_sent = false;

      contact.callHistory = generateCallHistory(contact.calls_made, contact.sequence_start_date);
      contact.totalDials = contact.calls_made;
      contact.lastCall = contact.callHistory[0]?.timestamp || null;
      contact.currentOkCode = 'OK5'; // Assume they were interested when converted

    } else {
      // 3% - Dead/not a fit
      const daysInSequence = Math.floor(Math.random() * 10) + 1;
      const daysAgoStarted = Math.floor(Math.random() * 20);

      contact.sequence_status = 'dead';
      contact.sequence_current_day = daysInSequence;
      contact.sequence_start_date = getRandomDate(daysAgoStarted);
      contact.last_contact_date = getRandomDate(Math.floor(Math.random() * 15));
      contact.dead_reason = getRandomItem([
        'No budget',
        'Wrong timing',
        'Not interested',
        'Already using competitor',
        'Company too small',
        'Not the right industry'
      ]);
      contact.status = 'inactive';

      contact.calls_made = Math.floor(Math.random() * 3) + 1;
      contact.voicemails_left = Math.floor(Math.random() * contact.calls_made);
      contact.emails_sent = hasEmail ? Math.floor(Math.random() * 2) : 0;
      contact.linkedin_dms_sent = 0;
      contact.linkedin_comments_made = 0;
      contact.social_reactions = 0;
      contact.social_comments = 0;
      contact.physical_mail_sent = false;

      contact.callHistory = generateCallHistory(contact.calls_made, contact.sequence_start_date);
      contact.totalDials = contact.calls_made;
      contact.lastCall = contact.callHistory[0]?.timestamp || null;
      contact.currentOkCode = contact.callHistory[0]?.okCode || null;
    }

    contacts.push(contact);
  }

  return contacts;
}
