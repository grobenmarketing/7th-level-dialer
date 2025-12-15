# Field Alignment Audit: Frontend ↔ Notion ↔ Netlify Blobs

**Generated:** 2025-12-15
**Dialer:** R7 Prospecting Dialer (r7-prospecting.netlify.app)

---

## Executive Summary

This audit compares the data fields across three systems:
1. **Frontend UI** - Web dialer interface
2. **Notion CRM** - Your CRM database
3. **Netlify Blobs** - Cloud storage for redundancy

### Key Findings:
- ✅ **8 fields are aligned** across all three systems
- ⚠️ **4 fields exist in Notion but are MISSING from Frontend**
- ⚠️ **3 fields exist in Frontend but are MISSING from Notion**
- ⚠️ **Data type mismatches** detected for call history storage

---

## Complete Field Mapping Table

| Field Name (Standardized) | Frontend UI Element | Frontend Data Type | Notion Field | Notion Type | Netlify Blob Key | Status |
|---------------------------|---------------------|-------------------|--------------|-------------|------------------|---------|
| **CONTACT INFORMATION** |
| Company Name | Input (required) | text | ❌ MISSING | - | companyName | 🔴 Missing in Notion |
| Phone | Input (required, type=tel) | text | Phone | text/phone | phone | ✅ Aligned |
| Website | Input (type=url) | text | Website | url | website | ✅ Aligned |
| Address | ❌ MISSING | - | Address | text | ❌ MISSING | 🔴 Missing in Frontend & Blobs |
| LinkedIn | ❌ MISSING | - | Linkedin | url | ❌ MISSING | 🔴 Missing in Frontend & Blobs |
| Industry | Input (text) | text | Industry | select/text | industry | ✅ Aligned |
| Company Size | Select dropdown | text | ❌ MISSING | - | companySize | 🔴 Missing in Notion |
| **CALL TRACKING** |
| Total Dials | Auto-calculated counter | number | Total Dials | number | totalDials | ✅ Aligned |
| Last Call | Auto-set timestamp | ISO date | Last Call | date | lastCall | ✅ Aligned |
| Next Follow Up Date | Auto-set (nullable) | ISO date | Next Follow Up Date | date | nextFollowUp | ✅ Aligned |
| Current OK Code | Latest OK code stored | text | Ok Code | select/text | currentOkCode | ✅ Aligned |
| Status | Select (active/do-not-call/closed-won/closed-lost) | text | ❌ MISSING | - | status | 🔴 Missing in Notion |
| **PER-CALL DATA** |
| Outcome | Select buttons (DM/GK/NA) per call | text (in callHistory array) | Outcome | select | (in callHistory) | ⚠️ Storage Mismatch |
| Duration | Call timer (seconds) per call | number (in callHistory array) | Duration | number | (in callHistory) | ⚠️ Storage Mismatch |
| Had Conversation | Checkbox per call | boolean (in callHistory array) | Had Conversation | checkbox | (in callHistory) | ⚠️ Storage Mismatch |
| Had Triage | Checkbox per call | boolean (in callHistory array) | Had Triage | checkbox | (in callHistory) | ⚠️ Storage Mismatch |
| Objection | Text input per call | text (in callHistory array) | Objection | text | (in callHistory) | ⚠️ Storage Mismatch |
| Call Notes | Textarea per call | text (in callHistory array) | ❌ MISSING | - | notes (in callHistory) | 🔴 Missing in Notion |
| Call Date | Auto-set per call | ISO date (in callHistory array) | ❌ MISSING | - | date (in callHistory) | 🔴 Missing in Notion |
| **METADATA** |
| Contact ID | Auto-generated timestamp | text | ❌ MISSING | - | id | 🔴 Missing in Notion |
| Created At | Auto-set on creation | ISO date | ❌ MISSING | - | createdAt | 🔴 Missing in Notion |

---

## Gap Analysis

### 🔴 CRITICAL: Missing Fields in Frontend UI

These Notion fields have **NO corresponding input/display** in your frontend:

| Notion Field | Data Type | Impact | Recommendation |
|-------------|-----------|--------|----------------|
| **Address** | text | Medium | Add to ContactFormModal.jsx as optional input field |
| **Linkedin** | url | Medium | Add to ContactFormModal.jsx as optional URL input |

**Action Required:**
- Add "Address" input field to contact form (line 126 in ContactFormModal.jsx)
- Add "LinkedIn" URL input field to contact form (line 126 in ContactFormModal.jsx)
- Display these fields in ContactDetailsModal.jsx and ContactCard.jsx

---

### 🔴 CRITICAL: Missing Fields in Notion CRM

These frontend fields have **NO corresponding column** in Notion:

| Frontend Field | Data Type | Used For | Recommendation |
|---------------|-----------|----------|----------------|
| **Company Name** | text | Primary contact identifier | Add to Notion as text field (REQUIRED) |
| **Company Size** | text | Contact segmentation | Add to Notion as select field with options: 1-10, 11-50, 51-200, 201-500, 501-1000, 1000+ |
| **Status** | text | Lead status tracking | Add to Notion as select field with options: active, do-not-call, closed-won, closed-lost |
| **Call Notes** | text (per call) | Detailed call documentation | Add to Notion (see storage structure issue below) |
| **Call Date** | date (per call) | When each call occurred | Add to Notion (see storage structure issue below) |
| **Contact ID** | text | Unique identifier | Add to Notion as text/number field for sync tracking |
| **Created At** | date | When contact was added | Add to Notion as date field |

**Action Required:**
- Add these 7 fields to your Notion database immediately

---

### ⚠️ CRITICAL: Data Storage Structure Mismatch

**THE BIGGEST ISSUE:** Frontend vs Notion store call history differently.

#### Frontend Storage Model:
```javascript
contact = {
  companyName: "Acme Corp",
  phone: "555-1234",
  callHistory: [
    {
      date: "2025-12-15T10:30:00Z",
      outcome: "DM",
      okCode: "OK-01",
      notes: "Interested in product",
      duration: 180,
      hadConversation: true,
      hadTriage: true,
      objection: "Price concerns"
    },
    {
      date: "2025-12-10T14:20:00Z",
      outcome: "GK",
      okCode: "OK-06",
      notes: "Gatekeeper blocked",
      duration: 45,
      hadConversation: false,
      hadTriage: false,
      objection: ""
    }
  ],
  totalDials: 2
}
```

**Frontend stores:** Multiple calls per contact in an array (`callHistory[]`)

#### Notion Storage Model (Current):
```
Each contact has these fields as SINGLE VALUES:
- Outcome: "DM" (only ONE value - latest call?)
- Duration: 180 (only ONE value - latest call?)
- Had Conversation: true (only ONE value - latest call?)
- Had Triage: true (only ONE value - latest call?)
- Objection: "Price concerns" (only ONE value - latest call?)
```

**Notion stores:** Only ONE set of call data per contact (likely the latest call)

#### The Problem:
- **Frontend**: Tracks complete history of ALL calls (array)
- **Notion**: Can only store ONE call's data per contact (single values)
- **Result**: You will LOSE historical call data when syncing to Notion!

#### Solution Options:

**Option 1: Store Only Latest Call in Notion** ⭐ RECOMMENDED
- Keep Notion fields as-is (single values)
- Sync only the MOST RECENT call data to Notion
- Use Netlify Blobs as the "source of truth" for complete call history
- Notion becomes a "summary view" of latest status

**Option 2: Use Notion Relations (Advanced)**
- Create a second Notion database called "Call History"
- Each call becomes a separate row in "Call History"
- Link calls to contacts via Notion Relations
- More complex but preserves all history in Notion
- Requires major Notion restructure

**Option 3: Store JSON in Notion (Hacky)**
- Add a "Call History JSON" text field in Notion
- Store the entire `callHistory` array as JSON string
- Not human-readable in Notion
- Not recommended

---

## Recommended Naming Conventions

To ensure consistency across all three systems, use these standardized names:

| Standard Name | Frontend | Notion | Netlify Blob |
|--------------|----------|--------|--------------|
| Company Name | companyName | Company Name | companyName |
| Phone Number | phone | Phone | phone |
| Website URL | website | Website | website |
| Physical Address | address | Address | address |
| LinkedIn URL | linkedin | LinkedIn | linkedin |
| Industry | industry | Industry | industry |
| Company Size | companySize | Company Size | companySize |
| Contact Status | status | Status | status |
| Total Dials | totalDials | Total Dials | totalDials |
| Last Call Date | lastCall | Last Call | lastCall |
| Next Follow-Up | nextFollowUp | Next Follow Up Date | nextFollowUp |
| Current OK Code | currentOkCode | Ok Code | currentOkCode |
| Contact ID | id | Contact ID | id |
| Created Date | createdAt | Created At | createdAt |

**Per-Call Fields** (if using Option 2 - separate Call History table):
| Standard Name | Frontend | Notion Call History | Netlify Blob |
|--------------|----------|-------------------|--------------|
| Call Date | date | Call Date | date |
| Call Outcome | outcome | Outcome | outcome |
| OK Code | okCode | OK Code | okCode |
| Call Notes | notes | Notes | notes |
| Duration (seconds) | duration | Duration | duration |
| Had Conversation | hadConversation | Had Conversation | hadConversation |
| Had Triage | hadTriage | Had Triage | hadTriage |
| Objection | objection | Objection | objection |

---

## Data Type Specifications

| Field | Frontend Type | Notion Type | Netlify Type | Notes |
|-------|--------------|-------------|--------------|-------|
| companyName | string | text | string | Required |
| phone | string (tel) | phone/text | string | Required, formatted |
| website | string (url) | url | string | Must start with http:// or https:// |
| address | string | text | string | Full address |
| linkedin | string (url) | url | string | LinkedIn profile URL |
| industry | string | select/text | string | Free text or dropdown |
| companySize | string | select | string | Values: "1-10", "11-50", "51-200", "201-500", "501-1000", "1000+" |
| status | string | select | string | Values: "active", "do-not-call", "closed-won", "closed-lost" |
| totalDials | number | number | number | Auto-incremented counter |
| lastCall | ISO 8601 string | date | string | Format: "2025-12-15T10:30:00Z" |
| nextFollowUp | ISO 8601 string (nullable) | date | string/null | Format: "2025-12-15T10:30:00Z" or null |
| currentOkCode | string | select/text | string | Values: "OK-01" through "OK-12" |
| id | string | text/number | string | Unique identifier (timestamp-based) |
| createdAt | ISO 8601 string | date | string | Format: "2025-12-15T10:30:00Z" |
| **Per-Call Fields** |
| date | ISO 8601 string | date | string | When call occurred |
| outcome | string | select | string | Values: "DM", "GK", "NA" |
| okCode | string | select/text | string | Values: "OK-01" through "OK-12" |
| notes | string | text | string | Free text, can be long |
| duration | number | number | number | Call duration in seconds |
| hadConversation | boolean | checkbox | boolean | true/false |
| hadTriage | boolean | checkbox | boolean | true/false |
| objection | string | text | string | Free text describing objection |

---

## Frontend UI Elements Inventory

### ContactFormModal.jsx (Add/Edit Contact Form)

**Input Fields:**
1. **Company Name** - Text input (line 85-93)
   - Label: "Company Name *"
   - Type: text
   - Required: Yes
   - Placeholder: "Acme Corporation"

2. **Phone Number** - Tel input (line 101-109)
   - Label: "Phone Number *"
   - Type: tel
   - Required: Yes
   - Placeholder: "555-123-4567"

3. **Website** - URL input (line 117-124)
   - Label: "Website"
   - Type: url
   - Required: No
   - Placeholder: "https://example.com"

4. **Industry** - Text input (line 132-139)
   - Label: "Industry"
   - Type: text
   - Required: No
   - Placeholder: "Technology, Healthcare, Finance, etc."

5. **Company Size** - Select dropdown (line 147-161)
   - Label: "Company Size"
   - Type: select
   - Required: No
   - Options: "", "1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"

6. **Status** - Select dropdown (line 168-178)
   - Label: "Status"
   - Type: select
   - Required: No (defaults to "active")
   - Options: "active", "do-not-call", "closed-won", "closed-lost"

**Buttons:**
- Cancel (line 185-189)
- Add Contact / Save Changes (line 191-196)

---

### CallingInterface.jsx (During Call Logging)

**Call Outcome Selection** (line 292-309):
- Three buttons with icons:
  - 📵 No Answer (NA)
  - 🚪 Gatekeeper (GK)
  - 👤 Decision Maker (DM)

**OK Code Selection** (line 317-329):
- Dropdown (filtered based on outcome)
- Shows: "OK-01 - Label" format
- Required field

**Call Quality Tracking** (line 363-406):

1. **Had Conversation** - Checkbox (line 363-376)
   - Label: "💬 Had Conversation"
   - Type: checkbox
   - Description: "Meaningful discussion occurred"

2. **Had Triage** - Checkbox (line 378-391)
   - Label: "🎯 Triage Completed"
   - Type: checkbox
   - Description: "Got specific details about their situation"

3. **Objection** - Text input (line 395-405)
   - Label: "⚠️ Objection (if any)"
   - Type: text
   - Placeholder: "e.g., Not interested, No budget, Wrong timing..."

4. **Call Notes** - Textarea (line 409-419)
   - Label: "📝 Call Notes"
   - Type: textarea
   - Rows: 4
   - Placeholder: "Add notes about this call..."

**Call Timer** (CallTimer.jsx component, line 259-264):
- Displays elapsed time during call
- Auto-tracks duration in seconds
- Starts when "Call Now" button clicked

**Buttons:**
- Skip Contact (line 425-429)
- Save & Next (line 431-436)

---

### ContactDetailsModal.jsx (View Contact Details)

**Displayed Information:**

1. **Header Section** (line 34-56):
   - Company name (large heading)
   - Industry badge
   - Company size badge
   - Status badge (color-coded)

2. **Contact Information** (line 73-104):
   - Phone (clickable tel: link)
   - Website (clickable external link)

3. **Call Statistics** (line 113-144):
   - Total Dials (number)
   - Calls Logged (number)
   - Total Talk Time (formatted duration)
   - Avg Call Duration (formatted duration)
   - Last OK Code (if exists)

4. **Call History** (line 147-195):
   - List of all calls (newest first)
   - Each call shows:
     - Outcome icon and label
     - Duration (if > 0)
     - Date and time
     - OK Code (if exists)
     - Notes (if exists)

**Buttons:**
- Delete (line 206-211)
- Edit Contact (line 213-218)
- Close (line 219-224)

---

### ContactsPage.jsx (Contact List View)

**Search and Filters** (line 163-213):

1. **Search Input** (line 170-176):
   - Searches: company, phone, industry, website
   - Type: text
   - Placeholder: "Company, phone, industry, website..."

2. **Status Filter** (line 184-194):
   - Type: select
   - Options: "All Statuses", "Active", "Do Not Call", "Closed Won", "Closed Lost"

3. **Sort By** (line 203-211):
   - Type: select
   - Options: "Company Name", "Total Dials", "Last Call Date", "Status"

**Contacts Table** (line 254-366):

Displays these columns:
1. Company (with industry sub-text)
2. Phone
3. Website (clickable link)
4. Dials (total count)
5. Calls (logged count)
6. OK Code (current)
7. Status (badge)
8. Last Call (date)
9. Actions (View button)

**Buttons:**
- Back to Dashboard (line 125-130)
- Add Contact (line 222-227)
- Export All (line 228-235)
- Delete All (line 236-246)

---

## Netlify Blobs Storage Keys

Current storage structure in Netlify Blobs (from cloudStorage.js):

| Key Name | Data Stored | Data Type |
|----------|-------------|-----------|
| `r7_contacts` | Full array of all contacts | Array of Contact objects |
| `r7_avatars` | Avatar data | Object |
| `r7_stats` | Legacy stats | Object |
| `r7_user` | User profile | Object |
| `r7_badges` | Achievement badges | Array |
| `r7_kpi_data` | KPI metrics by date | Object |
| `r7_weekly_targets` | Weekly targets | Object |
| `r7_daily_dial_goal` | Daily dial goal | Number |
| `r7_migration_status` | Migration tracking | Object |

**For Notion sync, you will only need:** `r7_contacts`

---

## Recommendations Summary

### IMMEDIATE ACTIONS (Do Before Building Integration):

#### 1️⃣ Update Notion Database - Add These Fields:
- [ ] **Company Name** (text, required)
- [ ] **Company Size** (select: 1-10, 11-50, 51-200, 201-500, 501-1000, 1000+)
- [ ] **Status** (select: active, do-not-call, closed-won, closed-lost)
- [ ] **Contact ID** (text/number - for sync tracking)
- [ ] **Created At** (date)
- [ ] **Call Notes** (text - if using Option 1: Latest Call Only)
- [ ] **Call Date** (date - if using Option 1: Latest Call Only)

#### 2️⃣ Update Frontend - Add These Fields:
- [ ] **Address** (text input in ContactFormModal.jsx)
- [ ] **LinkedIn** (URL input in ContactFormModal.jsx)
- [ ] Display Address & LinkedIn in ContactDetailsModal.jsx
- [ ] Display Address & LinkedIn in ContactCard.jsx
- [ ] Update CSV import/export to include Address & LinkedIn

#### 3️⃣ Decide on Call History Strategy:
Choose ONE approach:

**Option A: Latest Call Only (RECOMMENDED)** ✅
- Simpler implementation
- Notion shows "current status" of each contact
- Complete history remains in Netlify Blobs (source of truth)
- When syncing: Only send the most recent call data to Notion

**Option B: Separate Call History Table**
- More complex Notion setup
- Preserves full history in Notion
- Requires Notion API relations/linked databases
- More integration code required

#### 4️⃣ Standardize Field Names:
Update your Notion field names to match this convention:
- "Ok Code" → "Current OK Code" (clarifies it's the latest)
- "Outcome" → "Last Call Outcome" (if using Option A)
- "Duration" → "Last Call Duration" (if using Option A)

#### 5️⃣ Netlify Blobs Updates:
- [ ] No changes needed - structure is already correct
- [ ] After frontend updates, ensure address/linkedin are saved to contacts

---

## Next Steps for Integration

Once field alignment is complete:

1. **Frontend Changes**
   - Add Address and LinkedIn fields
   - Update contact object structure in useContacts.js

2. **Notion Changes**
   - Add missing fields to database
   - Rename fields for clarity

3. **Build Sync Logic**
   - Create Notion API integration
   - Map fields using this document
   - Implement chosen call history strategy
   - Handle data type conversions
   - Add error handling for missing fields

4. **Testing**
   - Test with sample contact
   - Verify all fields sync correctly
   - Confirm no data loss
   - Test bidirectional sync (if planned)

---

## Current Status: NOT READY FOR INTEGRATION ❌

**Blocking Issues:**
1. 🔴 Frontend missing 2 Notion fields (Address, LinkedIn)
2. 🔴 Notion missing 7 Frontend fields
3. 🔴 Call history storage strategy not decided
4. 🔴 Field naming inconsistencies

**Estimated Time to Align:**
- Frontend updates: 1-2 hours
- Notion database updates: 30 minutes
- Testing alignment: 30 minutes
- **Total: ~2-3 hours of prep work before integration**

---

## Questions to Answer Before Integration:

1. **Call History Strategy**: Which option do you prefer?
   - Option A: Latest call only in Notion?
   - Option B: Separate Call History table in Notion?

2. **Sync Direction**:
   - One-way (Frontend → Notion)?
   - Two-way (bidirectional)?
   - Netlify Blobs ← → Notion only (skip frontend)?

3. **Sync Frequency**:
   - Real-time (after each call)?
   - Manual (user clicks "Sync to Notion" button)?
   - Scheduled (every X minutes)?

4. **Conflict Resolution**:
   - If Notion data differs from Blobs, which wins?
   - Always trust Netlify Blobs as source of truth?

5. **Field Priority**:
   - Are all fields equally important?
   - Can we skip syncing some fields (like createdAt, id)?

---

**End of Audit**
