# R7 Creative Dialer - Code Architecture

## Quick Reference

### File Size & Complexity Guide

| File | Lines | Complexity | Purpose |
|------|-------|------------|---------|
| `CallingInterface.jsx` | ~550 | ⭐⭐⭐⭐ | Main calling UI with form, timer, sequence logic |
| `Dashboard.jsx` | ~300 | ⭐⭐⭐ | Landing page with panels and quick actions |
| `useKPI.js` | ~330 | ⭐⭐⭐ | KPI tracking and metrics calculation |
| `useContacts.js` | ~200 | ⭐⭐ | Contact CRUD operations |
| `sequenceLogic.js` | ~257 | ⭐⭐⭐ | Multi-touch sequence management |
| `App.jsx` | ~150 | ⭐⭐ | Navigation and routing |
| `cloudStorage.js` | ~273 | ⭐⭐⭐ | Storage abstraction layer |

### Recent Simplifications

✅ **Contact Schema** - Created `contactSchema.js` factory (-130 lines duplication)
✅ **Navigation** - Consolidated 13 handlers into 1 generic function (-35 lines)
✅ **Form State** - Extracted to `useCallForm` hook (-40 lines from CallingInterface)
✅ **Test Data** - Moved to `devUtils.js` (-90 lines from Dashboard)
✅ **Analytics** - Created `useWeekAnalytics` hook (consolidates 4 functions)

## Component Architecture

### Main App Flow

```
App.jsx (Router)
    ├── Dashboard.jsx
    │   ├── TodaysSummary
    │   ├── ColdCallsPanel
    │   └── SequencesPanel
    ├── CallingInterface.jsx
    │   ├── ContactCard
    │   ├── CallTimer
    │   └── SessionEndSummary
    ├── ContactsPage.jsx
    │   └── ContactDetailsModal
    ├── Analytics.jsx
    ├── SequenceTasksPage.jsx
    ├── FilteredSessionPage.jsx
    │   └── SessionReviewPage
    ├── Settings.jsx
    │   └── OkCodesAdmin
    └── HowToUse.jsx
```

## Hook Dependencies

### Custom Hooks Overview

```javascript
// Contact Management
useContacts() → contactSchema.js → cloudStorage.js

// KPI Tracking
useKPI() → cloudStorage.js

// Week Analytics (NEW)
useWeekAnalytics(kpiData) → useMemo → { weekData, totals, averages, ratios }

// Form State (NEW)
useCallForm(contactIndex) → useState, useEffect → { outcome, okCode, updateField, ... }

// Authentication
useAuth() → cloudStorage.js

// OK Codes
useOkCodes() → cloudStorage.js

// Statistics
useStats(contacts) → useMemo
```

### Hook Usage Patterns

**CallingInterface.jsx**:
```javascript
const { getActiveContacts, addCallToHistory, updateContact } = useContacts();
const { incrementMetric, addObjection, getTodayDials, dailyDialGoal } = useKPI();
const { okCodes } = useOkCodes();
const { outcome, okCode, updateField, validate } = useCallForm(contactIndex);
```

**Dashboard.jsx**:
```javascript
const { contacts, addContact, getActiveContacts, getStats } = useContacts();
```

**Analytics.jsx**:
```javascript
const { kpiData, getWeekData, getWeeklyTotals, getDailyAverages } = useKPI();
const analytics = useWeekAnalytics(kpiData, weekStart); // NEW
```

## State Management

### Global State (via Hooks)

```
useContacts
├── contacts[] (loaded from storage)
├── loading (boolean)
└── Methods: add, update, delete, import, export

useKPI
├── kpiData{} (date → metrics)
├── weeklyTargets{}
├── dailyDialGoal
└── Methods: increment, get, calculate

useCallForm (Component-level)
├── formState{} (outcome, okCode, notes, etc.)
├── callDuration
├── timerActive
└── Methods: updateField, validate, startTimer
```

### Local Storage Keys

All storage keys defined in `cloudStorage.js`:

```javascript
const KEYS = {
  CONTACTS: 'r7_contacts',
  AVATARS: 'r7_avatars',
  STATS: 'r7_stats',
  KPI_DATA: 'r7_kpi_data',
  WEEKLY_TARGETS: 'r7_weekly_targets',
  DAILY_DIAL_GOAL: 'r7_daily_dial_goal',
  SEQUENCE_TASKS: 'r7_sequence_tasks',
  MEETINGS: 'r7_meetings',
  MIGRATION_STATUS: 'r7_migration_status'
};
```

## Data Models

### Contact Object (Full Schema)

```javascript
{
  // Identity
  id: "1234567890",
  companyName: "Acme Corp",
  phone: "555-1234",
  website: "https://acme.com",
  address: "123 Main St",
  linkedin: "https://linkedin.com/company/acme",
  email: "contact@acme.com",
  industry: "Technology",

  // Call History
  callHistory: [
    {
      date: "2024-01-15T10:30:00.000Z",
      outcome: "DM",
      okCode: "OK-08",
      notes: "Interested in demo",
      duration: 180,
      hadConversation: true,
      hadTriage: true,
      objection: ""
    }
  ],

  // Metadata
  totalDials: 3,
  lastCall: "2024-01-15T10:30:00.000Z",
  nextFollowUp: null,
  currentOkCode: "OK-08",
  needsEmail: true,
  status: "active",
  createdAt: "2024-01-10T09:00:00.000Z",

  // Sequence Fields
  sequence_status: "active", // never_contacted | active | paused | dead | converted | completed
  sequence_current_day: 5,
  sequence_start_date: "2024-01-10",
  last_contact_date: "2024-01-15",
  has_email: true,
  has_linkedin: true,
  has_social_media: false,
  calls_made: 3,
  voicemails_left: 1,
  emails_sent: 2,
  linkedin_dms_sent: 1,
  linkedin_comments_made: 0,
  social_reactions: 0,
  social_comments: 0,
  physical_mail_sent: false,
  dead_reason: null,
  converted_date: null
}
```

### KPI Data Object

```javascript
{
  "2024-01-15": {
    dials: 70,
    pickups: 15,
    conversations: 10,
    triage: 5,
    bookedMeetings: 2,
    meetingsRan: 0,
    objections: ["Not interested", "No budget"]
  },
  "2024-01-16": { ... }
}
```

### Sequence Task Object

```javascript
{
  id: "task_123_456_contactId_5_call",
  contact_id: "1234567890",
  task_due_date: "2024-01-15",
  sequence_day: 5,
  task_type: "call",
  task_description: "call",
  status: "completed", // pending | completed | skipped
  completed_at: "2024-01-15T10:30:00.000Z",
  notes: "Had great conversation"
}
```

## Utility Libraries

### `contactSchema.js` - Contact Object Factory

```javascript
// Create new contact
createContact(data) → contact

// Migrate old contact
migrateContact(oldContact) → updatedContact

// Create from CSV
createContactFromCSV(values, index) → contact
```

### `sequenceLogic.js` - Sequence Management

```javascript
// Start sequence
enterSequence(contactId, updateFn) → Promise

// Generate all tasks
generateSequenceTasks(contact) → Promise

// Complete task
completeSequenceTask(contactId, day, taskType, notes) → Promise

// Advance day
advanceContactToNextDay(contact, updateFn) → Promise

// Mark dead/converted
markContactDead(contactId, reason, updateFn) → Promise
convertToClient(contactId, updateFn) → Promise
```

### `sequenceCalendar.js` - 30-Day Calendar

```javascript
const SEQUENCE_CALENDAR = {
  1: ['call'],
  2: ['linkedin_dm'],
  3: ['call'],
  4: ['email'],
  5: ['call'],
  // ... up to day 30
};

getTasksForDay(day) → taskTypes[]
getNextDayWithTasks(currentDay) → nextDay | null
shouldSkipTask(contact, taskType) → boolean
```

### `devUtils.js` - Test Data

```javascript
// Load simple test data (8 contacts)
loadSimpleTestData(addContact) → Promise<{ success, count }>

// Load realistic test data (75 contacts with tasks)
loadRealisticTestData(count) → Promise<{ success, count, tasks }>
```

## API / Serverless Functions

### Netlify Functions (`/netlify/functions/`)

**get-data.js**
```javascript
// GET /api/get-data?key=r7_contacts
// Returns: { data: [...] }
```

**set-data.js**
```javascript
// POST /api/set-data
// Body: { key: 'r7_contacts', data: [...] }
// Returns: { success: true }
```

**sync-all.js**
```javascript
// POST /api/sync-all
// Body: { items: [{ key, data }, ...] }
// Returns: { success: true, count: 5 }
```

## Performance Optimization

### Memoization

```javascript
// CallingInterface.jsx
const phoneURL = useMemo(() => {
  return generatePhoneURL(currentContact.phone);
}, [currentContact?.phone]);

// useWeekAnalytics.js
return useMemo(() => {
  // Calculate all analytics
  return { weekData, totals, averages, ratios };
}, [kpiData, startDate]);
```

### Batch Operations

```javascript
// Import contacts - batch add
const updatedContacts = [...contacts, ...newContactsData];
await saveContacts(updatedContacts); // Single write

// Generate tasks - batch create
const allTasks = [];
// ... populate allTasks
await storage.set(KEYS.SEQUENCE_TASKS, [...existingTasks, ...allTasks]);
```

### Prevent Unnecessary Re-renders

```javascript
// useCallForm - resets on contactIndex change only
useEffect(() => {
  resetForm();
}, [contactIndex]);

// Not on every state change
```

## Common Patterns

### 1. CRUD Operations

```javascript
// Create
const newContact = createContact({ companyName: 'Acme' });
await addContact(newContact);

// Read
const activeContacts = getActiveContacts();
const contact = contacts.find(c => c.id === contactId);

// Update
await updateContact(contactId, { needsEmail: true });

// Delete
await deleteContact(contactId);
```

### 2. Navigation

```javascript
// Simple navigation
navigate('contacts');

// With options
navigate('calling', { resetSession: true });
navigate('sessionReview', { filterCriteria: criteria });
```

### 3. Form Handling

```javascript
// Update field
updateField('outcome', 'DM');
updateField('okCode', 'OK-08');

// Validate
const validation = validate();
if (!validation.isValid) {
  alert(validation.errors.join('\n'));
  return;
}

// Submit
await handleSaveAndNext();
```

### 4. Storage Operations

```javascript
// Get with default
const contacts = await storage.get(KEYS.CONTACTS, []);

// Set
await storage.set(KEYS.CONTACTS, updatedContacts);

// Batch operations
const items = [
  { key: KEYS.CONTACTS, data: contacts },
  { key: KEYS.KPI_DATA, data: kpiData }
];
await Promise.all(items.map(({ key, data }) => storage.set(key, data)));
```

## Testing Strategy

### Unit Tests (Recommended - Not Implemented)

```javascript
// contactSchema.test.js
describe('createContact', () => {
  it('should create contact with default values', () => {
    const contact = createContact({});
    expect(contact.sequence_status).toBe('never_contacted');
  });
});

// useCallForm.test.js
describe('useCallForm', () => {
  it('should validate required fields', () => {
    const { validate } = useCallForm(0);
    const result = validate();
    expect(result.isValid).toBe(false);
  });
});
```

### Integration Tests (Recommended)

```javascript
// CallingInterface.integration.test.js
describe('CallingInterface flow', () => {
  it('should save call and advance to next contact', async () => {
    // Test full flow
  });
});
```

## Deployment

### Build Process

```bash
npm run build
# → dist/ folder created
# → Vite bundles React app
# → Tailwind processes CSS
```

### Netlify Configuration

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  directory = "netlify/functions"
```

## Future Improvements

### Recommended Enhancements

1. **Add React Router** - Replace manual view state with proper routing
2. **Add Testing Framework** - Vitest + React Testing Library
3. **Virtualize Contact Lists** - For 1000+ contacts
4. **Add Error Boundaries** - Graceful error handling
5. **Implement Undo/Redo** - For contact edits
6. **Add Bulk Operations** - Select and update multiple contacts
7. **Export Analytics** - Download reports as PDF/CSV
8. **Real-time Sync** - WebSocket updates for multi-user

### Code Quality

1. **TypeScript Migration** - Add type safety
2. **ESLint Configuration** - Enforce code standards
3. **Prettier Setup** - Consistent formatting
4. **Husky Pre-commit Hooks** - Run tests before commit

---

**Last Updated**: 2024-12-22
**Codebase Size**: ~7,500 lines (reduced from ~7,800)
**Components**: 20 files
**Hooks**: 7 files
**Utilities**: 10 files
