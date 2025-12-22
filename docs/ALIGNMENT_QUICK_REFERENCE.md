# Field Alignment Quick Reference

## ✅ ALIGNED FIELDS (8 fields)
These work across all three systems:

| Field | Frontend | Notion | Netlify |
|-------|----------|--------|---------|
| Phone | ✅ | ✅ | ✅ |
| Website | ✅ | ✅ | ✅ |
| Industry | ✅ | ✅ | ✅ |
| Total Dials | ✅ | ✅ | ✅ |
| Last Call | ✅ | ✅ | ✅ |
| Next Follow Up Date | ✅ | ✅ | ✅ |
| Current OK Code | ✅ | ✅ | ✅ |
| Duration | ✅ | ✅ | ✅ |

---

## 🔴 MISSING IN FRONTEND (2 fields)
Notion has these, Frontend doesn't:

| Field | Action Required |
|-------|-----------------|
| **Address** | Add text input to ContactFormModal.jsx |
| **LinkedIn** | Add URL input to ContactFormModal.jsx |

---

## 🔴 MISSING IN NOTION (7 fields)
Frontend has these, Notion doesn't:

| Field | Action Required |
|-------|-----------------|
| **Company Name** | Add text field to Notion (CRITICAL!) |
| **Company Size** | Add select field to Notion |
| **Status** | Add select field to Notion |
| **Contact ID** | Add text/number field to Notion |
| **Created At** | Add date field to Notion |
| **Call Notes** | Add text field to Notion OR use separate table |
| **Call Date** | Add date field to Notion OR use separate table |

---

## ⚠️ CRITICAL ISSUE: Call History Storage Mismatch

### Frontend Model:
```
One Contact → Many Calls (array)
contact.callHistory = [call1, call2, call3, ...]
```

### Notion Model:
```
One Contact → One Call (single values)
Outcome, Duration, Had Conversation, etc.
```

### THE PROBLEM:
❌ **You will LOSE historical call data when syncing to Notion!**

### SOLUTION:
Choose one approach:

**Option A: Latest Call Only** ⭐ RECOMMENDED
- Sync only the most recent call to Notion
- Keep complete history in Netlify Blobs
- Simpler, faster implementation

**Option B: Separate Call History Table**
- Create second Notion database for calls
- Link to contacts via relations
- Preserves all history in Notion
- More complex to build

---

## 📋 Pre-Integration Checklist

### Frontend Tasks:
- [ ] Add Address field to contact form
- [ ] Add LinkedIn field to contact form
- [ ] Update contact display components
- [ ] Update CSV import/export

### Notion Tasks:
- [ ] Add Company Name field
- [ ] Add Company Size field (select)
- [ ] Add Status field (select)
- [ ] Add Contact ID field
- [ ] Add Created At field
- [ ] Decide on call history strategy
- [ ] Add call fields based on chosen strategy

### Integration Tasks:
- [ ] Map field names (Frontend ↔ Notion)
- [ ] Handle data type conversions
- [ ] Decide sync direction (one-way vs two-way)
- [ ] Decide sync timing (real-time vs manual vs scheduled)
- [ ] Define conflict resolution rules

---

## Field Name Mapping Reference

| Concept | Frontend Key | Notion Column | Blob Key |
|---------|-------------|---------------|----------|
| Company Name | `companyName` | "Company Name" | `companyName` |
| Phone Number | `phone` | "Phone" | `phone` |
| Website | `website` | "Website" | `website` |
| Address | `address` | "Address" | `address` |
| LinkedIn | `linkedin` | "LinkedIn" | `linkedin` |
| Industry | `industry` | "Industry" | `industry` |
| Company Size | `companySize` | "Company Size" | `companySize` |
| Status | `status` | "Status" | `status` |
| Total Dials | `totalDials` | "Total Dials" | `totalDials` |
| Last Call | `lastCall` | "Last Call" | `lastCall` |
| Next Follow-Up | `nextFollowUp` | "Next Follow Up Date" | `nextFollowUp` |
| Current OK | `currentOkCode` | "Ok Code" | `currentOkCode` |
| Contact ID | `id` | "Contact ID" | `id` |
| Created | `createdAt` | "Created At" | `createdAt` |

---

## Data Type Reference

| Field | Type | Notes |
|-------|------|-------|
| companyName | text | Required |
| phone | text | Required, tel format |
| website | url | Must include http:// or https:// |
| address | text | Full address string |
| linkedin | url | LinkedIn profile URL |
| industry | text | Free text or select |
| companySize | select | Values: "1-10", "11-50", "51-200", "201-500", "501-1000", "1000+" |
| status | select | Values: "active", "do-not-call", "closed-won", "closed-lost" |
| totalDials | number | Auto-incremented |
| lastCall | date | ISO 8601 format |
| nextFollowUp | date | ISO 8601 format, nullable |
| currentOkCode | text | Values: "OK-01" through "OK-12" |
| id | text | Timestamp-based unique ID |
| createdAt | date | ISO 8601 format |

---

## Questions to Answer:

1. **Call History**: Latest only OR separate table?
2. **Sync Direction**: One-way OR bidirectional?
3. **Sync Timing**: Real-time OR manual OR scheduled?
4. **Source of Truth**: Netlify Blobs OR Notion?
5. **Conflict Resolution**: Which system wins on conflicts?

---

**Status: NOT READY - Complete alignment tasks first** ❌

**Estimated Prep Time: 2-3 hours**
