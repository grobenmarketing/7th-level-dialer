# Database Schema Documentation

Complete data structure reference for all 3 data stores in the 7th Level Dialer application.

---

## 1. CONTACTS/CRM DATABASE

**Storage Key:** `r7_contacts`
**Currently displayed in table:** Company name, phone, last call date, OK code
**Schema Definition:** `src/lib/contactSchema.js:22-64`

### All Available Fields:

| Field Name | Type | Description | Currently in Table View? |
|------------|------|-------------|--------------------------|
| `id` | string | Unique identifier (timestamp-based) | No |
| `companyName` | string | Company name | ✅ YES (sortable) |
| `phone` | string | Phone number | ✅ YES |
| `website` | string | Company website URL | No |
| `address` | string | Physical address | No |
| `linkedin` | string | LinkedIn profile URL | No |
| `email` | string | Email address | No |
| `industry` | string | Industry classification | No |
| `callHistory` | array | Array of call records (see below) | No (count only) |
| `totalDials` | number | Total number of calls made | No (used for sorting) |
| `lastCall` | ISO date | Date of most recent call | ✅ YES (sortable) |
| `nextFollowUp` | ISO date | Scheduled follow-up date | No |
| `currentOkCode` | string | Current OK code status | ✅ YES |
| `needsEmail` | boolean | Flag if contact needs email | No |
| `status` | string | `active`, `inactive`, `client` | No (used for filtering) |
| `createdAt` | ISO date | Date contact was created | No |

### Sequence Fields:

| Field Name | Type | Description | Currently in Table View? |
|------------|------|-------------|--------------------------|
| `sequence_status` | string | `never_contacted`, `active`, `paused`, `completed`, `dead`, `converted` | No |
| `sequence_current_day` | number | Current day in sequence (1-30) | No |
| `sequence_start_date` | ISO date | Date sequence started | No |
| `last_contact_date` | ISO date | Date of last contact attempt | No |
| `has_email` | boolean | Contact has email address | No |
| `has_linkedin` | boolean | Contact has LinkedIn profile | No |
| `has_social_media` | boolean | Contact has social media | No |
| `calls_made` | number | Number of calls in sequence | No |
| `voicemails_left` | number | Number of voicemails left | No |
| `emails_sent` | number | Number of emails sent | No |
| `linkedin_dms_sent` | number | Number of LinkedIn DMs sent | No |
| `linkedin_comments_made` | number | Number of LinkedIn comments made | No |
| `social_reactions` | number | Number of social media reactions | No |
| `social_comments` | number | Number of social media comments | No |
| `physical_mail_sent` | boolean | Whether physical mail was sent | No |
| `dead_reason` | string | Reason contact marked as dead | No |
| `converted_date` | ISO date | Date contact converted to client | No |

**Total Fields:** 37 (8 core + 29 sequence/tracking fields)

### Call History Record Structure:

Each entry in `callHistory` array contains:

```javascript
{
  date: "2024-01-15T10:30:00.000Z",      // ISO 8601 timestamp
  outcome: "DM" | "VM" | "NA",           // Decision Maker, Voicemail, No Answer
  okCode: "OK-1" | "OK-2" | ... | "OK-10" | null,
  notes: "string",                        // Call notes
  duration: number,                       // Duration in seconds
  hadConversation: boolean,               // Whether a conversation occurred
  hadTriage: boolean,                     // Whether triage occurred
  objection: "string"                     // Objection if any
}
```

### CSV Import/Export Format:

**Import headers:**
`Company Name, Phone, Website, Address, LinkedIn, Industry`

**Export headers:**
`Company Name, Phone, Website, Address, LinkedIn, Industry, Total Dials, Last Call, OK Code, Needs Email, Status`

**Template file:** `sample-contacts.csv`

### Current Implementation:

**✅ Implemented Features:**
- Full table view with sorting (company name, total dials, last call date, status)
- Multi-field search (company, phone, industry, website, address, LinkedIn)
- Status and email filtering
- Add single entry (form modal)
- Edit single entry (form modal)
- Delete single entry
- Delete all (with double confirmation)
- CSV import
- CSV export
- Infinite scroll (50 contacts at a time)

**❌ Missing Features:**
- Bulk select with checkboxes
- Bulk delete (delete all exists but no checkbox selection)
- Bulk edit/update
- Single entry export
- Contact deduplication
- Advanced search (regex, date ranges)

**Files:**
- Main UI: `src/components/ContactsPage.jsx`
- Details modal: `src/components/ContactDetailsModal.jsx`
- Add/Edit form: `src/components/ContactFormModal.jsx`
- Hook: `src/hooks/useContacts.js`
- Schema: `src/lib/contactSchema.js`

---

## 2. KPI/ANALYTICS DATABASE

**Storage Keys:**
- `r7_kpi_data` (daily metrics)
- `r7_weekly_targets` (goals)
- `r7_daily_dial_goal` (daily goal)

**Currently displayed:** Weekly grid with all metrics below
**Hook Definition:** `src/hooks/useKPI.js:98-109`

### Daily Metrics (per date key):

| Field Name | Type | Description | Currently in Table View? |
|------------|------|-------------|--------------------------|
| `date` | string | Date key (YYYY-MM-DD format) | ✅ YES |
| `dials` | number | Number of calls made | ✅ YES (editable) |
| `pickups` | number | Number of pickups (Decision Maker) | ✅ YES (editable) |
| `conversations` | number | Number of conversations | ✅ YES (editable) |
| `triage` | number | Number of triage calls | ✅ YES (editable) |
| `bookedMeetings` | number | Number of meetings booked | ✅ YES (editable) |
| `meetingsRan` | number | Number of meetings actually ran | ✅ YES (editable) |
| `objections` | array of strings | List of objections heard | No (separate view) |

**Total Fields:** 7 daily metrics + objections array

### Weekly Targets:

| Field Name | Type | Description |
|------------|------|-------------|
| `dials` | number | Weekly dial target (default: 125) |

### Daily Goal:

| Field Name | Type | Description |
|------------|------|-------------|
| `dailyDialGoal` | number | Daily dial goal (default: 25) |

### Calculated/Derived Metrics:

These are computed from the raw data (not stored):

| Metric | Calculation | Currently Displayed? |
|--------|-------------|----------------------|
| Weekly totals | Sum of all days Mon-Fri | ✅ YES |
| Daily averages | Total / days worked | ✅ YES |
| Show rate | `meetingsRan / bookedMeetings` | ✅ YES |
| Conversion rate | `bookedMeetings / conversations` | ✅ YES |
| Triage rate | `triage / conversations` | ✅ YES |
| Pickup rate | `conversations / pickups` | ✅ YES |
| Objection frequency | Count of each unique objection | ✅ YES (separate table) |
| Days worked | Count of days with >0 dials | ✅ YES |

### Data Structure Example:

```javascript
// r7_kpi_data
{
  "2024-01-15": {
    dials: 25,
    pickups: 12,
    conversations: 8,
    triage: 3,
    bookedMeetings: 2,
    meetingsRan: 1,
    objections: ["too expensive", "need to think about it"]
  },
  "2024-01-16": {
    dials: 30,
    pickups: 15,
    conversations: 10,
    triage: 4,
    bookedMeetings: 3,
    meetingsRan: 2,
    objections: ["not interested", "too busy"]
  }
}

// r7_weekly_targets
{
  dials: 125
}

// r7_daily_dial_goal
25
```

### Current Implementation:

**✅ Implemented Features:**
- Weekly table view (Monday-Friday only)
- Week navigation (previous/next/this week)
- Edit-in-place for daily metrics
- Rebuild from call history
- Weekly totals and averages
- Performance ratios
- Objection frequency analysis
- Daily goal editor

**❌ Missing Features:**
- CSV import/export
- Add/delete individual KPI entries
- Bulk edit across multiple days
- KPI templates or presets
- KPI comparison/forecasting tools
- Bulk select with checkboxes

**Files:**
- Main UI: `src/components/Analytics.jsx`
- Settings reset: `src/components/Settings.jsx:195-246`
- Daily goal editor: `src/components/Dashboard.jsx:326-371`
- Hook: `src/hooks/useKPI.js`

---

## 3. SEQUENCE TASKS DATABASE

**Storage Key:** `r7_sequence_tasks`
**Currently displayed:** Tasks grouped by sequence day, filterable by today/overdue/all/upcoming
**Logic:** `src/lib/sequenceLogic.js`
**Calendar:** `src/lib/sequenceCalendar.js:4-21`

### Task Record Fields:

| Field Name | Type | Description | Currently in Table View? |
|------------|------|-------------|--------------------------|
| `id` | string | Unique task identifier | No |
| `contact_id` | string | ID of related contact | No (grouped by contact) |
| `task_due_date` | string | Due date (YYYY-MM-DD) | ✅ YES |
| `sequence_day` | number | Sequence day number (1-30) | ✅ YES (grouping) |
| `task_type` | string | Type of task (see below) | ✅ YES |
| `task_description` | string | Human-readable description | ✅ YES |
| `status` | string | `pending`, `completed`, `skipped` | ✅ YES (checkbox) |
| `completed_at` | ISO date | Timestamp when completed | No |
| `notes` | string | Task notes | No |

**Total Fields:** 9 fields

### Task Types:

All possible values for `task_type`:

| Task Type | Description | Max Count in Sequence |
|-----------|-------------|----------------------|
| `call` | Call + leave voicemail | 4 total |
| `email_1` | Email #1: "Quick Question" | 6 emails total |
| `email_2` | Email #2: "Value Bomb" | |
| `email_3` | Email #3: "Social Proof" | |
| `email_4` | Email #4: "Breakup Email" | |
| `email_5` | Email #5: "Competitive Angle" | |
| `email_6` | Email #6: "Free Resource" | |
| `linkedin_dm_1` | Send LinkedIn DM #1 | 2 total |
| `linkedin_dm_2` | Send LinkedIn DM #2 | |
| `linkedin_comment_1` | Comment on LinkedIn post #1 | 5 total |
| `linkedin_comment_2` | Comment on LinkedIn post #2 | |
| `linkedin_comment_3` | Comment on LinkedIn post #3 | |
| `linkedin_comment_4` | Comment on LinkedIn post #4 | |
| `linkedin_comment_5` | Comment on LinkedIn post #5 | |
| `social_engagement` | React + comment on social post | 4 total |
| `social_follow` | Follow on social media | 1 total |
| `physical_mail` | Send postcard | 1 total |

**Total Task Types:** 17 unique types
**Total Touches in Full Sequence:** 27 touches over 30 days

### 30-Day Sequence Calendar:

Distribution of tasks across the 30-day sequence:

| Day | Tasks Scheduled |
|-----|-----------------|
| 1 | Call, Email #1 |
| 2 | LinkedIn DM #1, Social follow, Social engagement |
| 4 | Email #2 |
| 5 | LinkedIn comment #1 |
| 6 | Social engagement |
| 8 | Call, Email #3 |
| 10 | LinkedIn comment #2, Email #4 |
| 12 | LinkedIn DM #2 |
| 14 | Social engagement, LinkedIn comment #3 |
| 15 | Call, Email #5 |
| 19 | Physical mail, Social engagement |
| 21 | LinkedIn comment #4 |
| 22 | Call (FINAL ATTEMPT) |
| 24 | Email #6 |
| 26 | LinkedIn comment #5 |
| 28 | Social engagement |

**Call Days:** Days 1, 8, 15, 22 (4 calls total)
**Days with No Tasks:** 3, 7, 9, 11, 13, 16-18, 20, 23, 25, 27, 29-30

### Task Lifecycle:

1. **Generation:** All tasks auto-generated when contact enters sequence
2. **Status Flow:** `pending` → `completed` or `skipped`
3. **Deletion:** All tasks deleted when contact marked as dead/converted
4. **Skipping Logic:** Tasks auto-skipped if contact missing required channel (email, LinkedIn, social media)

### Data Structure Example:

```javascript
{
  id: "task_1234567890_abc123_1_email_1",
  contact_id: "1234567890",
  task_due_date: "2024-01-15",
  sequence_day: 1,
  task_type: "email_1",
  task_description: "Email #1: 'Quick Question'",
  status: "pending",
  completed_at: null,
  notes: ""
}
```

### Current Implementation:

**✅ Implemented Features:**
- Table view grouped by sequence day
- Filter by: today, overdue, all, upcoming
- Mark task complete (checkbox)
- Auto-generation when entering sequence
- Auto-skip for missing channels
- Task deletion when contact dead/converted
- Due date calculation
- Overdue task detection

**❌ Missing Features:**
- Manual task creation/addition
- Task deletion or modification UI
- Bulk task operations
- Bulk select with checkboxes
- Custom task types
- Task templates or presets
- CSV import/export
- Task history/audit log
- Task reassignment
- Task notes editing UI

**Files:**
- Main UI: `src/components/SequenceTasksPage.jsx`
- Dashboard panel: `src/components/SequencesPanel.jsx`
- Logic: `src/lib/sequenceLogic.js`
- Calendar: `src/lib/sequenceCalendar.js`
- Task scheduler: `src/lib/taskScheduler.js`

---

## Storage Architecture

### Primary Storage System:

**Production (Netlify):** Netlify Blobs via serverless functions
- `/api/get-data` - Read operations
- `/api/set-data` - Write operations
- `/api/sync-all` - Bulk sync operations

**Development (localhost):** localStorage (in-browser)

**Fallback Strategy:**
- Cloud operations fail → Automatic fallback to localStorage
- All writes saved to BOTH cloud + localStorage as backup

**Detection Logic:**
```javascript
const isProduction = () => {
  return window.location.hostname !== 'localhost' &&
         window.location.hostname !== '127.0.0.1' &&
         !window.location.hostname.includes('192.168');
};
```

### All Storage Keys:

```javascript
const KEYS = {
  CONTACTS: 'r7_contacts',
  AVATARS: 'r7_avatars',
  STATS: 'r7_stats',
  USER: 'r7_user',
  BADGES: 'r7_badges',
  KPI_DATA: 'r7_kpi_data',
  WEEKLY_TARGETS: 'r7_weekly_targets',
  DAILY_DIAL_GOAL: 'r7_daily_dial_goal',
  MIGRATION_STATUS: 'r7_migration_status',
  SEQUENCE_TASKS: 'r7_sequence_tasks',
  MEETINGS: 'r7_meetings'
};
```

**Migration System:**
- Auto-migration from localStorage to Netlify Blobs on first production load
- Tracks migration status to prevent duplicate migrations
- Bulk upload via `/api/sync-all` endpoint

**Files:**
- Storage abstraction: `src/lib/cloudStorage.js`

---

## Summary for UI/UX Design

### 3 Main Data Stores:

1. **Contacts/CRM** - 37 fields total
   - 8 core contact fields
   - 29 sequence/tracking fields
   - Call history array

2. **KPI/Analytics** - 7 daily metrics + derived calculations
   - Daily metrics (dials, pickups, conversations, etc.)
   - Weekly targets and goals
   - Calculated performance ratios

3. **Sequence Tasks** - 9 fields + 17 task types
   - 30-day calendar with 27 touches
   - Auto-generated from contact data
   - Status tracking and completion

### Common Features Needed for All Tables:

- ✅ Sortable columns
- ✅ Filterable/searchable data
- ⚠️ Inline editing capabilities (partial)
- ❌ Bulk selection with checkboxes
- ⚠️ Export to CSV (Contacts only)
- ⚠️ Import from CSV (Contacts only)
- ⚠️ Add/delete single entries (varies)
- Responsive design for mobile

### Feature Gaps to Address:

**All 3 Data Stores:**
- Bulk select with checkboxes
- Bulk operations (delete, edit)
- CSV import/export (KPIs and Sequences)
- CSV templates (KPIs and Sequences)

**Contacts:**
- Bulk checkbox selection (delete all exists but no UI)
- Contact deduplication
- Advanced filtering

**KPIs:**
- Manual entry add/delete
- Bulk editing across dates
- Templates and presets

**Sequences:**
- Full CRUD UI for tasks
- Manual task creation
- Task modification
- Custom task types
- Task templates

---

## Notes for Implementation

**Design Considerations:**
- All dates stored in ISO 8601 format (YYYY-MM-DD or full timestamp)
- All async operations (Promise-based)
- Real-time sync via event bus for KPIs
- Infinite scroll for large datasets (Contacts)
- Optimistic UI updates with cloud backup

**Data Validation:**
- Phone numbers: Free-form strings (no validation currently)
- Emails: Boolean flag `has_email` based on presence
- URLs: Free-form strings (no validation currently)
- Dates: ISO 8601 format required

**Performance:**
- Contacts loaded 50 at a time (infinite scroll)
- KPI data organized by week (5 days Mon-Fri)
- Sequence tasks grouped by day and filtered by status
- Local caching with cloud backup strategy
