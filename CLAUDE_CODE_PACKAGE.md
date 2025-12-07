# R7 NEPQ Dialer - Complete Documentation Package for Claude Code

This package contains all the documentation needed to build the R7 NEPQ Dialer from scratch.

---

## 📚 TABLE OF CONTENTS

1. [Technology Stack & Project Setup](#technology-stack--project-setup)
2. [NEPQ Methodology Overview](#nepq-methodology-overview)
3. [Data Model & Schema](#data-model--schema)
4. [Component Architecture](#component-architecture)
5. [Implementation Roadmap](#implementation-roadmap)
6. [Quick Reference](#quick-reference)

---

## TECHNOLOGY STACK & PROJECT SETUP

### Recommended Stack
- **Frontend:** React + Vite + Tailwind CSS
- **Storage:** LocalStorage (Phase 1.5) → Netlify Blob Storage (Phase 2)
- **Deployment:** Netlify (auto-deploy from GitHub)

### Project Structure
```
r7-nepq-dialer/
├── package.json
├── vite.config.js
├── netlify.toml
├── tailwind.config.js
├── index.html
├── README.md
│
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   │
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── CallingInterface.jsx
│   │   ├── ContactCard.jsx
│   │   ├── NEPQTracker.jsx
│   │   ├── QuestionSuggester.jsx
│   │   ├── AvatarManager.jsx
│   │   └── Analytics.jsx
│   │
│   ├── hooks/
│   │   ├── useContacts.js
│   │   ├── useAvatars.js
│   │   └── useStats.js
│   │
│   ├── lib/
│   │   ├── storage.js
│   │   ├── nepq.js
│   │   └── constants.js
│   │
│   └── styles/
│       └── index.css
│
└── netlify/
    └── functions/
```

### Initial Setup Commands
```bash
npm create vite@latest . -- --template react
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## NEPQ METHODOLOGY OVERVIEW

### What is NEPQ?
**NEPQ (Neuro-Emotional Persuasion Questioning)** is Jeremy Miner's 7th Level sales methodology that uses strategic questioning to help prospects persuade themselves.

### The 7 NEPQ Phases
1. **Connection** 🤝 - Build rapport
2. **Situation** 📋 - Understand current state
3. **Problem Awareness** 🔍 - Uncover pain points
4. **Solution Awareness** 💡 - Explore ideal criteria
5. **Consequence** ⚠️ - Show cost of inaction
6. **Commitment** 🤝 - Get agreement to proceed
7. **Presentation** 📊 - Demo/proposal

### The 4 Problem Levels
| Level | Type | Description | Example |
|-------|------|-------------|---------|
| **L1** | Obvious | Wants/Not Wants | "Want more qualified leads" |
| **L2** | Common | Lack of: process, knowledge, resources | "No lead scoring process" |
| **L3** | Specific | Quantified impact | "Waste 10 hrs/week, $2K per bad lead" |
| **L4** | Mission Critical | Cost of inaction | "Will lose clients to competitors" |

**Key Insight:** Getting prospects to Level 3-4 problems = dramatically higher close rates.

### Core Principles
1. **Problem-finding over product-pushing** - Discover problems, don't pitch
2. **Question-led conversations** - Strategic questions guide the journey
3. **Emotional + logical** - Address both pain and logic
4. **Non-pushy** - Help prospects persuade themselves
5. **Curiosity-driven** - Discovery, not interrogation

---

## DATA MODEL & SCHEMA

### Enhanced Contact Schema
```javascript
{
  // Basic Info
  id: "unique-id",
  companyName: "ABC Corp",
  phone: "(555) 123-4567",
  website: "https://abc.com",
  
  // Classification
  avatarId: "avatar-1", // Links to Avatar/ICP template
  industry: "Manufacturing",
  companySize: "50-200",
  
  // NEPQ Journey Tracking
  nepqPhase: "problem-awareness", // current phase
  problemLevel: 2, // 0-4, highest level uncovered
  problemsIdentified: [
    {
      level: 1,
      statement: "They want more qualified leads",
      date: "2024-12-04"
    },
    {
      level: 2,
      statement: "Lack of process for lead qualification",
      date: "2024-12-04"
    }
  ],
  
  // Deal Management
  dealStage: "qualified", // prospect | contacted | qualified | proposal | negotiation | closed-won | closed-lost
  
  // Strategic Planning
  nextAction: {
    targetPhase: "solution-awareness",
    followUpDate: "2024-12-12",
    preparation: "Calculate ROI based on $2K/bad lead",
    suggestedQuestions: []
  },
  
  // Call History
  callHistory: [
    {
      date: "2024-12-04T10:30:00Z",
      outcome: "DM", // NA | GK | DM
      okCode: "OK-01",
      notes: "Spoke with CEO...",
      
      // NEPQ tracking per call
      nepqPhaseReached: "problem-awareness",
      problemLevelReached: 2,
      problemsDiscovered: [],
      duration: 180, // seconds
      nextSteps: ""
    }
  ],
  
  // Metadata
  totalDials: 3,
  lastCall: "2024-12-04T10:30:00Z",
  nextFollowUp: "2024-12-11T14:00:00Z",
  currentOkCode: "OK-01",
  status: "active", // active | do-not-call | closed-won | closed-lost
  createdAt: "2024-11-01T10:00:00Z"
}
```

### Avatar/ICP Schema
```javascript
{
  id: "avatar-1",
  name: "Operations Director - Manufacturing",
  position: "Director of Operations",
  isDecisionMaker: true,
  personality: "analytical",
  sophistication: "high",
  
  momentsInTime: [
    "New equipment purchase",
    "Quality control issues",
    "Scaling production"
  ],
  
  problems: {
    level1: ["Want to reduce downtime", "Don't want quality issues"],
    level2: ["Lack of real-time data", "No preventive maintenance"],
    level3: ["Downtime costs $50K/day", "Quality issues up 15% YoY"],
    level4: ["Competitors gaining share", "Risk losing major clients"]
  },
  
  coldCallHooks: [
    "We work with manufacturing directors frustrated with unexpected downtime...",
    "I noticed your company recently expanded - have capacity issues come up?"
  ],
  
  objectionHandling: {
    "not-interested": [
      "I understand - just curious though, what specifically isn't a fit?",
      "That makes sense. Can I ask how you're currently handling [problem]?"
    ]
  }
}
```

### Constants (OK Codes)
```javascript
export const OK_CODES = [
  { code: 'OK-01', label: 'Interested - Follow Up', color: 'green' },
  { code: 'OK-02', label: 'Not Interested - Budget', color: 'red' },
  { code: 'OK-03', label: 'Not Interested - No Need', color: 'red' },
  { code: 'OK-04', label: 'Already Using Competitor', color: 'yellow' },
  { code: 'OK-05', label: 'Wrong Contact', color: 'gray' },
  { code: 'OK-06', label: 'Do Not Call', color: 'red' },
  { code: 'OK-07', label: 'Callback Requested', color: 'blue' },
  { code: 'OK-08', label: 'Gatekeeper Block', color: 'yellow' },
  { code: 'OK-09', label: 'Voicemail - Left Message', color: 'blue' },
  { code: 'OK-10', label: 'No Answer - Try Again', color: 'gray' },
  { code: 'OK-11', label: 'Meeting Scheduled', color: 'green' },
  { code: 'OK-12', label: 'Qualified Lead - Hot', color: 'green' }
];
```

---

## COMPONENT ARCHITECTURE

### App Flow
```
App.jsx (Root)
├─ Dashboard.jsx (Home screen)
│  ├─ Stats Overview
│  ├─ Contact Count
│  ├─ Import/Export
│  └─ Start Calling Button
│
└─ CallingInterface.jsx (Active calling)
   ├─ ContactCard.jsx (Contact info + history)
   ├─ NEPQTracker.jsx (Phase progress + problems)
   ├─ QuestionSuggester.jsx (Context-aware questions)
   ├─ Call Outcome Selector (NA/GK/DM)
   ├─ NEPQ Phase Selector (if DM)
   ├─ Problem Discovery Tracker (L1-L4)
   ├─ OK Code Selector
   ├─ Notes Textarea
   └─ Save & Next Button
```

### Key Components to Build

#### 1. **Dashboard.jsx**
- Shows overview stats (total contacts, dials, meetings)
- Displays NEPQ funnel metrics
- Import/export contacts (CSV)
- Start calling button
- Avatar management access

#### 2. **CallingInterface.jsx**
- Main calling screen
- Loads contact data
- Shows suggested questions
- Tracks call outcome
- Records NEPQ progress
- Saves to storage

#### 3. **ContactCard.jsx**
- Displays contact info (name, phone, website)
- Shows avatar badge
- Lists previous call history
- Shows NEPQ journey progress
- Displays last problems discovered

#### 4. **NEPQTracker.jsx**
- Visual phase progress bar (Connection → Presentation)
- Problem level indicator (L1-L4)
- Problems discovered list
- Next action planner

#### 5. **QuestionSuggester.jsx**
- Context-aware question suggestions
- Based on: current phase + problem level + avatar
- Quick-copy functionality
- Collapsible panel
- Shows cold call hooks for first calls

#### 6. **AvatarManager.jsx**
- Create/edit avatars
- Import from Excel (Avatars.xlsx)
- Link avatars to contacts
- Manage problem statements per avatar

#### 7. **Analytics.jsx**
- NEPQ funnel visualization (phase progression)
- Problem depth distribution
- Avatar performance comparison
- Conversion rates by phase
- Win rate analysis

---

## IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Start Here)
**Goal:** Basic calling interface with localStorage

**Build:**
1. ✅ Project setup (Vite + React + Tailwind)
2. ✅ Core file structure
3. ✅ Basic Dashboard
4. ✅ Simple CallingInterface
5. ✅ Contact storage (localStorage)
6. ✅ OK code tracking
7. ✅ CSV import/export

**Deliverable:** Working dialer that tracks basic call data

---

### Phase 2: NEPQ Foundation
**Goal:** Add NEPQ phase tracking and problem discovery

**Build:**
1. Enhanced contact schema (add NEPQ fields)
2. Avatar system (create/manage avatars)
3. NEPQ phase selector in calling interface
4. Problem level tracker (L1-L4 checkboxes)
5. NEPQ progress visualization
6. Call history with NEPQ data

**Deliverable:** Dialer that tracks NEPQ journey per contact

---

### Phase 3: Intelligence Layer
**Goal:** Add question suggestions and analytics

**Build:**
1. Question library system
2. Context-aware question suggester
3. Script builder integration (parse Excel)
4. NEPQ analytics dashboard
5. Avatar performance metrics
6. Funnel visualization

**Deliverable:** Smart dialer that guides conversations

---

### Phase 4: Cloud Storage
**Goal:** Replace localStorage with Netlify Blob Storage

**Build:**
1. Netlify Blob Storage setup
2. Migration from localStorage
3. API wrapper for storage operations
4. Multi-device sync
5. Data backup/restore

**Deliverable:** Cloud-backed dialer with sync

---

### Phase 5: Advanced Features (Future)
**Goal:** Polish and optimize

**Build:**
1. Keyboard shortcuts
2. Mobile optimization
3. Call timer/duration tracking
4. Energy management integration
5. Revenue calculator
6. Automated reporting

**Deliverable:** Production-ready sales system

---

## COMPONENT CODE TEMPLATES

### src/lib/constants.js
```javascript
export const NEPQ_PHASES = [
  { id: 'connection', name: 'Connection', icon: '🤝', order: 1 },
  { id: 'situation', name: 'Situation', icon: '📋', order: 2 },
  { id: 'problem-awareness', name: 'Problem Awareness', icon: '🔍', order: 3 },
  { id: 'solution-awareness', name: 'Solution Awareness', icon: '💡', order: 4 },
  { id: 'consequence', name: 'Consequence', icon: '⚠️', order: 5 },
  { id: 'commitment', name: 'Commitment', icon: '🤝', order: 6 },
  { id: 'presentation', name: 'Presentation', icon: '📊', order: 7 }
];

export const PROBLEM_LEVELS = [
  { level: 1, name: 'Obvious', description: 'Wants/Not Wants', color: 'blue' },
  { level: 2, name: 'Common', description: 'Lack of...', color: 'green' },
  { level: 3, name: 'Specific', description: 'Quantified Impact', color: 'yellow' },
  { level: 4, name: 'Mission Critical', description: 'Cost of Inaction', color: 'red' }
];

export const OK_CODES = [
  { code: 'OK-01', label: 'Interested - Follow Up', color: 'green' },
  { code: 'OK-02', label: 'Not Interested - Budget', color: 'red' },
  { code: 'OK-03', label: 'Not Interested - No Need', color: 'red' },
  { code: 'OK-04', label: 'Already Using Competitor', color: 'yellow' },
  { code: 'OK-05', label: 'Wrong Contact', color: 'gray' },
  { code: 'OK-06', label: 'Do Not Call', color: 'red' },
  { code: 'OK-07', label: 'Callback Requested', color: 'blue' },
  { code: 'OK-08', label: 'Gatekeeper Block', color: 'yellow' },
  { code: 'OK-09', label: 'Voicemail - Left Message', color: 'blue' },
  { code: 'OK-10', label: 'No Answer - Try Again', color: 'gray' },
  { code: 'OK-11', label: 'Meeting Scheduled', color: 'green' },
  { code: 'OK-12', label: 'Qualified Lead - Hot', color: 'green' }
];

export const DEAL_STAGES = [
  'prospect',
  'contacted',
  'qualified',
  'proposal',
  'negotiation',
  'closed-won',
  'closed-lost'
];
```

### src/lib/storage.js
```javascript
const KEYS = {
  CONTACTS: 'r7_contacts',
  AVATARS: 'r7_avatars',
  STATS: 'r7_stats',
  USER: 'r7_user',
  BADGES: 'r7_badges',
  QUESTIONS: 'r7_questions'
};

export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.error(`Storage read error (${key}):`, error);
      return defaultValue;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Storage write error (${key}):`, error);
      return false;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Storage remove error (${key}):`, error);
      return false;
    }
  },

  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }
};

export { KEYS };
```

### src/lib/nepq.js
```javascript
import { NEPQ_PHASES, PROBLEM_LEVELS } from './constants';

export const nepqHelpers = {
  getPhaseIndex: (phaseId) => {
    return NEPQ_PHASES.findIndex(p => p.id === phaseId);
  },

  getNextPhase: (currentPhaseId) => {
    const index = nepqHelpers.getPhaseIndex(currentPhaseId);
    if (index === -1 || index === NEPQ_PHASES.length - 1) return null;
    return NEPQ_PHASES[index + 1];
  },

  isPhaseComplete: (contact, phaseId) => {
    const phaseIndex = nepqHelpers.getPhaseIndex(phaseId);
    const currentIndex = nepqHelpers.getPhaseIndex(contact.nepqPhase);
    return currentIndex >= phaseIndex;
  },

  getProblemLevelColor: (level) => {
    const problemLevel = PROBLEM_LEVELS.find(pl => pl.level === level);
    return problemLevel?.color || 'gray';
  },

  getProgressPercentage: (contact) => {
    const currentIndex = nepqHelpers.getPhaseIndex(contact.nepqPhase);
    return ((currentIndex + 1) / NEPQ_PHASES.length) * 100;
  },

  getPhasesByOrder: () => {
    return [...NEPQ_PHASES].sort((a, b) => a.order - b.order);
  },

  canProgressToPhase: (contact, targetPhaseId) => {
    const currentIndex = nepqHelpers.getPhaseIndex(contact.nepqPhase);
    const targetIndex = nepqHelpers.getPhaseIndex(targetPhaseId);
    return targetIndex <= currentIndex + 1;
  }
};
```

---

## QUICK REFERENCE

### Decision Tree: What to Track When

```
Make Call
    │
    ▼
Outcome?
    │
    ├─ No Answer → Log OK code → Next
    ├─ Gatekeeper → Log OK code + notes → Next
    └─ Decision Maker
        │
        ▼
    Had Conversation?
        │
        ├─ NO → Log OK code → Next
        └─ YES
            │
            ▼
        Track NEPQ Data:
        1. Phase reached
        2. Problem level (L1-L4)
        3. Problem statements
        4. Next steps
        5. OK code
        6. Notes
            │
            ▼
        Save & Next Contact
```

### UI/UX Principles

1. **Speed First** - Quick mode for rapid dials
2. **Progressive Disclosure** - Show NEPQ features when relevant
3. **Smart Defaults** - Learn from user behavior
4. **Mobile-Friendly** - Touch-friendly buttons
5. **Keyboard Shortcuts** - For power users

### Key Metrics to Track

**Activity Metrics:**
- Total dials
- Pickups (GK + DM)
- Conversations
- Meetings booked

**NEPQ Metrics:**
- Phase progression rates
- Average problem level
- % reaching L3+ problems
- Conversion by phase

**Avatar Metrics:**
- Win rate by avatar
- Avg problem level by avatar
- Best performing avatars

---

## CRITICAL REMINDERS

### ✅ DO:
- Keep interface fast (< 30 sec per call including NEPQ tracking)
- Make NEPQ tracking optional (show value first)
- Use progressive disclosure (hide advanced features)
- Test on mobile devices
- Start with MVP, iterate based on usage

### ❌ DON'T:
- Force NEPQ tracking on every call
- Over-engineer the data model
- Create a slow UI with too many fields
- Assume desktop-only usage
- Build all features at once

### 🎯 Success Criteria
- Jordan uses it daily
- Call time increase < 20%
- 60%+ of DM calls tracked with NEPQ
- Average problem level ≥ 2.0
- Conversion rate improves 10%+

---

## NETLIFY DEPLOYMENT

### netlify.toml
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Deployment Steps
1. Push to GitHub
2. Connect repository to Netlify
3. Netlify auto-detects Vite settings
4. Click "Deploy site"
5. Every push = auto-deploy

---

## CSV IMPORT/EXPORT FORMAT

### Expected CSV Format
```csv
Company Name,Phone,Website,Industry,Company Size
ABC Manufacturing,(555) 123-4567,https://abc.com,Manufacturing,50-200
XYZ Corp,(555) 987-6543,https://xyz.com,Technology,200-500
```

### CSV Handler Functions
```javascript
export const CSVHandler = {
  parseCSV: (text) => {
    // Parse CSV text into contact objects
    // Handle quoted fields
    // Map columns to contact schema
  },
  
  exportCSV: (contacts) => {
    // Convert contacts to CSV format
    // Include NEPQ data if present
    // Download as file
  }
};
```

---

## PHASE 1 CHECKLIST

Before adding NEPQ features, ensure Phase 1 is solid:

- [ ] Vite + React project setup
- [ ] Tailwind CSS configured
- [ ] Basic Dashboard component
- [ ] CallingInterface component
- [ ] Contact storage (localStorage)
- [ ] CSV import functionality
- [ ] CSV export functionality
- [ ] OK code tracking
- [ ] Call notes
- [ ] Save & Next workflow
- [ ] Netlify deployment working
- [ ] Mobile responsive

Once Phase 1 is complete, move to Phase 2 (NEPQ features).

---

## QUESTIONS TO CLARIFY WITH USER

Before building NEPQ features:

1. How strictly does Jordan follow NEPQ phases?
2. Does he need multiple calls to progress through phases?
3. Which Excel file does he reference most during calls?
4. What's his biggest cold calling frustration?
5. How important is tracking individual problem levels (L1-L4)?
6. Would he use question suggestions actively?
7. Does he want deep analytics or just basic tracking?

---

**This documentation package contains everything needed to build the R7 NEPQ Dialer from scratch using Claude Code.**
