# R7 Creative Dialer - Developer Guide

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [File Structure](#file-structure)
- [Key Concepts](#key-concepts)
- [Touchpoint Sequences](#touchpoint-sequences)
- [Code Simplifications (2024)](#code-simplifications-2024)
- [Development Guide](#development-guide)

## Overview

R7 Creative Dialer is a React-based sales calling application designed for cold prospecting and outbound sales teams. It provides contact management, call tracking, multi-touch sequence automation, and performance analytics.

### Tech Stack
- **Frontend**: React 18.3, Vite 6.0
- **Styling**: Tailwind CSS 3.4
- **Storage**: Netlify Blob (production) / localStorage (development)
- **Deployment**: Netlify with serverless functions

## Architecture

### Data Flow
```
User Action → Component → Custom Hook → Storage Layer → Netlify Functions/Blob
                ↓
         State Updates
                ↓
          Re-render UI
```

### Storage Strategy
- **Development**: localStorage only
- **Production**: Netlify Blob with localStorage fallback
- **Migration**: Automatic migration from localStorage to cloud on first production load

## File Structure

```
/7th-level-dialer/
├── src/
│   ├── components/          # React components (20 files)
│   │   ├── Dashboard.jsx    # Main landing page (~300 lines)
│   │   ├── CallingInterface.jsx  # Call logging UI (~550 lines)
│   │   ├── Analytics.jsx    # Performance dashboard
│   │   └── ...
│   ├── hooks/               # Custom React hooks (7 files)
│   │   ├── useContacts.js   # Contact CRUD operations (~200 lines)
│   │   ├── useKPI.js        # KPI tracking (~330 lines)
│   │   ├── useCallForm.js   # Form state management (NEW)
│   │   └── useWeekAnalytics.js  # Week analytics consolidation (NEW)
│   ├── lib/                 # Utility functions (10 files)
│   │   ├── cloudStorage.js  # Storage abstraction
│   │   ├── contactSchema.js # Contact object factory (NEW)
│   │   ├── sequenceLogic.js # Multi-touch sequences
│   │   ├── devUtils.js      # Test data utilities (NEW)
│   │   └── ...
│   ├── styles/              # CSS files
│   ├── App.jsx              # Main app router (~150 lines)
│   └── main.jsx             # React entry point
├── netlify/functions/       # Serverless functions
│   ├── get-data.js          # Fetch from Netlify Blob
│   ├── set-data.js          # Save to Netlify Blob
│   └── sync-all.js          # Bulk sync
└── package.json
```

## Key Concepts

### 1. Contact Schema (`src/lib/contactSchema.js`)

**Purpose**: Single source of truth for contact object structure

```javascript
import { createContact, migrateContact, createContactFromCSV } from '../lib/contactSchema';

// Create new contact
const contact = createContact({
  companyName: 'Acme Corp',
  phone: '555-1234'
});

// Migrate old contact to new schema
const updated = migrateContact(oldContact);

// Create from CSV row
const contact = createContactFromCSV(['Acme', '555-1234', '...'], 1);
```

**Fields**:
- Identity: `id`, `companyName`, `phone`, `website`, `email`, `linkedin`, `industry`
- Call History: `callHistory[]`, `totalDials`, `lastCall`, `currentOkCode`
- Sequence: `sequence_status`, `sequence_current_day`, `sequence_start_date`, `calls_made`, etc.

### 2. Navigation (`src/App.jsx`)

**Before (13 handler functions)**:
```javascript
const handleViewContacts = () => setCurrentView('contacts')
const handleViewAnalytics = () => setCurrentView('analytics')
// ... 11 more handlers
```

**After (1 generic function)**:
```javascript
const navigate = (view, options = {}) => {
  setCurrentView(view)
  if (options.resetSession) { /* reset state */ }
  if (options.filterCriteria) { /* set filter */ }
}

// Usage
navigate('contacts')
navigate('calling', { resetSession: true })
```

### 3. Form State Management (`src/hooks/useCallForm.js`)

**Purpose**: Consolidates all calling interface form state

```javascript
const {
  outcome, okCode, notes, hadConversation, hadTriage, objection, needsEmail,
  callDuration, timerActive, isSaving,
  updateField, setIsSaving, startTimer, setCallDuration, validate
} = useCallForm(contactIndex);

// Update single field
updateField('outcome', 'DM');

// Validate before submit
const validation = validate();
if (!validation.isValid) {
  alert(validation.errors.join('\n'));
}
```

### 4. Week Analytics (`src/hooks/useWeekAnalytics.js`)

**Purpose**: Consolidates week data, totals, averages, and ratios

```javascript
const { weekData, totals, averages, ratios, topObjections } =
  useWeekAnalytics(kpiData, weekStart);

// Access all analytics in one place
console.log(totals.dials);        // 350
console.log(averages.dials);      // 70 per day
console.log(ratios.meetingsShowedRatio); // 0.85
```

### 5. Sequence Logic (`src/lib/sequenceLogic.js`)

**Key Functions**:
- `enterSequence(contactId, updateFn)` - Start 30-day sequence
- `generateSequenceTasks(contact)` - Create all tasks for contact
- `completeSequenceTask(contactId, day, taskType)` - Mark task done
- `advanceContactToNextDay(contact, updateFn)` - Move to next sequence day

**Sequence Calendar** (`src/lib/sequenceCalendar.js`):
- Day 1: Call
- Day 2: LinkedIn DM
- Day 3: Call
- ... (30 days total)

## Touchpoint Sequences

The dialer implements a **30-day, 27-touch multi-channel sequence** designed to build familiarity and engagement with prospects through strategic touchpoints.

### What Are Touchpoints?

Touchpoints are planned interactions across multiple channels (phone, email, LinkedIn, social media, physical mail) that create consistent visibility without overwhelming prospects.

**For complete documentation on touchpoints, see: [TOUCHPOINT_GUIDE.md](../TOUCHPOINT_GUIDE.md)**

### The 30-Day Sequence

| Week | Focus | Key Touchpoints |
|------|-------|----------------|
| **Week 1** | Introduction | 4 calls, 2 emails, LinkedIn DM, social follow |
| **Week 2** | Value Building | 2 emails, LinkedIn engagement, social activity |
| **Week 3** | Persistence | 1 call, 1 email, physical mail, continued social |
| **Week 4** | Final Push | Final call, final email, closing touches |

### Touchpoint Types

- **📞 Calls**: 4 total (Days 1, 8, 15, 22)
- **📧 Emails**: 6 total (Days 1, 4, 8, 10, 15, 24)
- **💼 LinkedIn DMs**: 2 total (Days 2, 12)
- **💬 LinkedIn Comments**: 5 total (Days 5, 10, 14, 21, 26)
- **👍 Social Engagement**: 4 total (Days 2, 6, 14, 19, 28)
- **📬 Physical Mail**: 1 postcard (Day 19)

### Modifying the Sequence

To customize the touchpoint sequence, edit `src/lib/sequenceCalendar.js`:

```javascript
export const SEQUENCE_CALENDAR = {
  1: ['call', 'email_1'],
  2: ['linkedin_dm_1', 'social_follow', 'social_engagement'],
  // ... add or modify days as needed
};
```

The system automatically:
- Skips tasks when channels are unavailable (e.g., no email = skip email tasks)
- Tracks completion for each touchpoint type
- Advances contacts through the sequence
- Marks sequences complete after Day 30

**For business context and best practices, see: [TOUCHPOINT_GUIDE.md](../TOUCHPOINT_GUIDE.md)**

### 6. Cloud Storage (`src/lib/cloudStorage.js`)

**Unified API**:
```javascript
import { storage, KEYS } from '../lib/cloudStorage';

// Get data
const contacts = await storage.get(KEYS.CONTACTS, []);

// Set data
await storage.set(KEYS.CONTACTS, updatedContacts);

// Remove data
await storage.remove(KEYS.CONTACTS);
```

**Storage Keys**:
- `KEYS.CONTACTS` - Contact database
- `KEYS.KPI_DATA` - Performance metrics
- `KEYS.SEQUENCE_TASKS` - Multi-touch tasks
- `KEYS.AVATARS` - Buyer personas
- `KEYS.WEEKLY_TARGETS` - Goals
- `KEYS.DAILY_DIAL_GOAL` - Daily target

## Code Simplifications (2024)

### Summary of Recent Refactoring

| Change | Before | After | Lines Saved |
|--------|--------|-------|-------------|
| Contact Schema | Duplicated in 3 places (130 lines) | `contactSchema.js` (100 lines) | ~130 lines |
| App Navigation | 13 individual handlers (60 lines) | 1 generic `navigate()` (25 lines) | ~35 lines |
| Form State | 11 `useState` calls (70 lines) | `useCallForm` hook (130 lines) | ~40 lines† |
| Test Data | Inline in Dashboard (110 lines) | `devUtils.js` (120 lines) | ~90 lines |
| Week Analytics | 4 separate functions (100 lines) | `useWeekAnalytics` (140 lines) | ~60 lines† |
| **Total** | | | **~265 lines** |

† *Net reduction in component files, utility files are reusable*

### File Size Reductions

| File | Before | After | Change |
|------|--------|-------|--------|
| `useContacts.js` | 330 lines | ~200 lines | -130 lines |
| `Dashboard.jsx` | 421 lines | ~300 lines | -121 lines |
| `App.jsx` | 184 lines | ~150 lines | -34 lines |
| `CallingInterface.jsx` | 607 lines | ~550 lines | -57 lines |

## Development Guide

### Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create `.env` file:
```
VITE_APP_PASSWORD=your_password_here
```

### Adding a New Contact Field

1. Update `src/lib/contactSchema.js`:
```javascript
export function createContact(data = {}) {
  return {
    // ... existing fields
    newField: data.newField || 'default value'
  };
}
```

2. Update migration if needed:
```javascript
export function migrateContact(contact) {
  if (!contact.hasOwnProperty('newField')) {
    return createContact({ ...contact, newField: 'default' });
  }
  return contact;
}
```

3. Update UI components to display/edit the new field

### Adding a New View

1. Create component in `src/components/NewView.jsx`
2. Update `src/App.jsx`:
```javascript
// Add to navigation
const handleViewNewView = () => navigate('newView')

// Add to render
{currentView === 'newView' && (
  <NewView onBackToDashboard={handleBackToDashboard} />
)}
```

### Adding Test Data

Use `src/lib/devUtils.js`:

```javascript
import { loadRealisticTestData } from '../lib/devUtils';

const handleLoadData = async () => {
  const result = await loadRealisticTestData(100); // 100 contacts
  if (result.success) {
    console.log(`Loaded ${result.count} contacts, ${result.tasks} tasks`);
  }
};
```

### Running Tests

```bash
# Currently no test framework configured
# Recommended: Add Vitest for unit tests
npm install -D vitest @testing-library/react
```

### Deployment

Deploys automatically to Netlify on push to main branch.

**Manual deploy**:
```bash
npm run build
netlify deploy --prod
```

## Best Practices

### 1. Always Use Schema Factory
```javascript
// ✅ Good
const contact = createContact({ companyName: 'Acme' });

// ❌ Bad - manual object creation
const contact = { id: Date.now(), companyName: 'Acme', ... };
```

### 2. Use Custom Hooks for Complex State
```javascript
// ✅ Good
const { outcome, okCode, updateField } = useCallForm(index);

// ❌ Bad - multiple useState
const [outcome, setOutcome] = useState('');
const [okCode, setOkCode] = useState('');
// ... 9 more states
```

### 3. Navigation Pattern
```javascript
// ✅ Good
navigate('contacts');
navigate('calling', { resetSession: true });

// ❌ Bad - direct state manipulation
setCurrentView('contacts');
setCurrentContactIndex(0);
setFilteredSession(null);
```

### 4. Async Storage Operations
```javascript
// ✅ Good
const contacts = await storage.get(KEYS.CONTACTS, []);
await storage.set(KEYS.CONTACTS, updatedContacts);

// ❌ Bad - synchronous in production
const contacts = storage.getSync(KEYS.CONTACTS); // Only works in dev
```

## Troubleshooting

### Storage Issues
- **Problem**: Data not persisting in production
- **Solution**: Check Netlify Blob configuration, verify API functions are deployed

### Migration Issues
- **Problem**: Contacts missing sequence fields
- **Solution**: Check `useContacts.js` migration logic, manually trigger migration

### Performance Issues
- **Problem**: Slow rendering with many contacts
- **Solution**: Use pagination, implement virtual scrolling, optimize re-renders

## Contributing

1. Keep files under 400 lines when possible
2. Extract complex logic into custom hooks
3. Use schema factories for data structures
4. Add JSDoc comments for all functions
5. Test storage operations in both dev and production

## License

Proprietary - R7 Creative
