# NEPQ Integration - Practical Implementation Guide

## 🎯 Purpose
This guide provides **specific, actionable steps** to add NEPQ functionality to your existing R7 Dialer without breaking what already works.

---

## 📦 COMPONENT BREAKDOWN

### New Components Needed

#### 1. Avatar Manager (`/src/components/avatar-manager.jsx`)
**Purpose:** Create and manage avatar/ICP templates

```javascript
// Avatar data structure
const Avatar = {
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
    level2: ["Lack of real-time data", "No preventive maintenance process"],
    level3: ["Downtime costs $50K/day", "Quality issues up 15% YoY"],
    level4: ["Competitors gaining market share", "Risk losing major clients"]
  },
  
  coldCallHooks: [
    "We work with manufacturing directors who are frustrated with unexpected downtime...",
    "I noticed your company recently expanded - have capacity issues come up?"
  ]
};
```

**UI Components:**
```jsx
function AvatarManager() {
  return (
    <>
      <AvatarList /> {/* Shows all avatars */}
      <AvatarForm /> {/* Create/edit avatar */}
      <AvatarImporter /> {/* Import from Excel */}
    </>
  );
}
```

---

#### 2. NEPQ Journey Tracker (`/src/components/nepq-journey-tracker.jsx`)
**Purpose:** Visualize and update NEPQ progress per contact

```javascript
const NEPQPhases = [
  { id: 'connection', name: 'Connection', icon: '🤝' },
  { id: 'situation', name: 'Situation', icon: '📋' },
  { id: 'problem-awareness', name: 'Problem Awareness', icon: '🔍' },
  { id: 'solution-awareness', name: 'Solution Awareness', icon: '💡' },
  { id: 'consequence', name: 'Consequence', icon: '⚠️' },
  { id: 'commitment', name: 'Commitment', icon: '🤝' },
  { id: 'presentation', name: 'Presentation', icon: '📊' }
];

const ProblemLevels = [
  { level: 1, name: 'Obvious (Wants/Not Wants)', color: 'blue' },
  { level: 2, name: 'Common (Lack of...)', color: 'green' },
  { level: 3, name: 'Specific (Quantified)', color: 'yellow' },
  { level: 4, name: 'Mission Critical (Cost of Inaction)', color: 'red' }
];
```

**UI Component:**
```jsx
function NEPQJourneyTracker({ contact, onUpdate }) {
  return (
    <div className="nepq-journey">
      <PhaseProgressBar phases={NEPQPhases} current={contact.nepqPhase} />
      <ProblemLevelIndicator levels={contact.problemsIdentified} />
      <PhaseHistory calls={contact.callHistory} />
    </div>
  );
}
```

---

#### 3. Question Suggester (`/src/components/question-suggester.jsx`)
**Purpose:** Show relevant questions based on context

```javascript
// Question library structure
const QuestionLibrary = {
  connection: [
    "What attracted your attention to us?",
    "What are you currently doing about [problem]?"
  ],
  situation: [
    "How long has [problem] been an issue?",
    "What's the current process for [task]?"
  ],
  problemAwareness: {
    level1: ["What would you like to see change?"],
    level2: ["What's been preventing you from solving this?"],
    level3: ["How is this affecting your operations?"],
    level4: ["What happens if this continues for 6 more months?"]
  },
  solutionAwareness: [
    "What would be your ideal criteria for a solution?",
    "What would this do for you personally?"
  ],
  consequence: [
    "What's the cost of not solving this?",
    "Who else is affected by this problem?"
  ]
};
```

**UI Component:**
```jsx
function QuestionSuggester({ phase, problemLevel, avatar, onCopyQuestion }) {
  const questions = getRelevantQuestions(phase, problemLevel, avatar);
  
  return (
    <div className="question-suggester">
      <h4>💡 Suggested Questions ({phase})</h4>
      {questions.map(q => (
        <div key={q.id} className="question-card">
          <p>{q.text}</p>
          <button onClick={() => onCopyQuestion(q.text)}>📋 Copy</button>
        </div>
      ))}
    </div>
  );
}
```

---

#### 4. Enhanced Calling Interface (`/src/components/enhanced-calling-interface.jsx`)
**Purpose:** Calling interface with NEPQ guidance

```jsx
function EnhancedCallingInterface({ contact, onSave }) {
  const [mode, setMode] = useState('full'); // 'full' or 'quick'
  const [outcome, setOutcome] = useState(null);
  const [phaseReached, setPhaseReached] = useState(null);
  const [problemsDiscovered, setProblemsDiscovered] = useState([]);
  const [nextSteps, setNextSteps] = useState('');
  
  if (mode === 'quick') {
    return <QuickCallingMode />; // Simplified UI
  }
  
  return (
    <div className="enhanced-calling-interface">
      <ContactCard contact={contact} />
      
      {contact.avatar && (
        <AvatarContext avatar={contact.avatar} />
      )}
      
      {contact.callHistory.length > 0 && (
        <NEPQJourneyTracker contact={contact} />
      )}
      
      {contact.callHistory.length > 0 && (
        <QuestionSuggester 
          phase={contact.nepqPhase}
          problemLevel={contact.problemLevel}
          avatar={contact.avatar}
        />
      )}
      
      <CallButton phone={contact.phone} />
      
      <CallOutcomeSelector onChange={setOutcome} />
      
      {outcome === 'DM' && (
        <>
          <NEPQPhaseSelector onChange={setPhaseReached} />
          <ProblemDiscoveryTracker onChange={setProblemsDiscovered} />
          <NextStepsPlanner onChange={setNextSteps} />
        </>
      )}
      
      <OKCodeSelector />
      <NotesInput />
      
      <div className="actions">
        <button onClick={onSave}>💾 Save & Next</button>
        <button onClick={() => setMode('quick')}>⚡ Quick Mode</button>
      </div>
    </div>
  );
}
```

---

## 🔧 IMPLEMENTATION STEPS

### Step 1: Enhance Data Model (2-3 hours)

**File:** `/src/utils/storage.js`

Add new fields to contact schema:

```javascript
const ENHANCED_CONTACT = {
  // Existing fields
  id: "",
  companyName: "",
  phone: "",
  website: "",
  
  // NEW: Avatar classification
  avatarId: null, // links to avatar template
  industry: "",
  companySize: "",
  
  // NEW: NEPQ journey tracking
  nepqPhase: "connection", // current phase
  problemLevel: 0, // 0-4, highest level reached
  problemsIdentified: [
    // { level: 1, statement: "", date: "" }
  ],
  dealStage: "prospect", // prospect | contacted | qualified | proposal | closed
  
  // NEW: Strategic planning
  nextAction: {
    targetPhase: "",
    followUpDate: "",
    preparation: "",
    suggestedQuestions: []
  },
  
  // Enhanced call history
  callHistory: [
    {
      date: "",
      outcome: "", // NA | GK | DM
      okCode: "",
      notes: "",
      
      // NEW: NEPQ tracking per call
      nepqPhaseReached: null,
      problemLevelReached: 0,
      problemsDiscovered: [], // IDs of problems
      duration: null,
      questionsAsked: [],
      nextSteps: ""
    }
  ],
  
  // Existing fields
  dials: 0,
  lastCall: null,
  createdAt: ""
};
```

**Migration function for existing contacts:**

```javascript
function migrateContactsToNEPQ() {
  const contacts = Storage.get('r7_contacts', []);
  
  const upgraded = contacts.map(contact => ({
    ...contact,
    // Add new fields with defaults
    avatarId: null,
    industry: "",
    companySize: "",
    nepqPhase: "connection",
    problemLevel: 0,
    problemsIdentified: [],
    dealStage: "prospect",
    nextAction: {
      targetPhase: "connection",
      followUpDate: null,
      preparation: "",
      suggestedQuestions: []
    },
    // Enhance call history
    callHistory: (contact.callHistory || []).map(call => ({
      ...call,
      nepqPhaseReached: null,
      problemLevelReached: 0,
      problemsDiscovered: [],
      duration: null,
      questionsAsked: [],
      nextSteps: ""
    }))
  }));
  
  Storage.set('r7_contacts', upgraded);
  return upgraded;
}
```

---

### Step 2: Create Avatar System (4-5 hours)

**File:** `/src/utils/avatars.js`

```javascript
// Avatar storage
export const AvatarStorage = {
  getAll: () => Storage.get('r7_avatars', []),
  
  getById: (id) => {
    const avatars = AvatarStorage.getAll();
    return avatars.find(a => a.id === id);
  },
  
  create: (avatar) => {
    const avatars = AvatarStorage.getAll();
    const newAvatar = {
      ...avatar,
      id: `avatar-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    avatars.push(newAvatar);
    Storage.set('r7_avatars', avatars);
    return newAvatar;
  },
  
  update: (id, updates) => {
    const avatars = AvatarStorage.getAll();
    const index = avatars.findIndex(a => a.id === id);
    if (index > -1) {
      avatars[index] = { ...avatars[index], ...updates };
      Storage.set('r7_avatars', avatars);
      return avatars[index];
    }
    return null;
  },
  
  delete: (id) => {
    const avatars = AvatarStorage.getAll();
    const filtered = avatars.filter(a => a.id !== id);
    Storage.set('r7_avatars', filtered);
  }
};

// Import avatars from Excel data
export function importAvatarsFromExcel(excelData) {
  const avatars = [];
  
  excelData.forEach(row => {
    const avatar = {
      name: row['Position'] || 'Untitled Avatar',
      position: row['Position'] || '',
      isDecisionMaker: row['Main Decision Maker?'] === 'Yes',
      personality: row['Personality'] || '',
      sophistication: row['Simple or Sophisticated?'] || 'simple',
      
      momentsInTime: parseArray(row['Possible Moments in Time']),
      
      problems: {
        level1: parseArray(row['Level 1 Problems']),
        level2: parseArray(row['Level 2 Problems']),
        level3: parseArray(row['Level 3 Problems']),
        level4: parseArray(row['Level 4 Problems'])
      },
      
      coldCallHooks: [],
      objectionHandling: {}
    };
    
    avatars.push(AvatarStorage.create(avatar));
  });
  
  return avatars;
}
```

---

### Step 3: Add NEPQ Tracking to Calling Interface (6-8 hours)

**File:** `/src/components/enhanced-calling-interface.jsx`

Key additions to the calling flow:

1. **Show avatar context at top:**
```jsx
{contact.avatarId && (
  <AvatarBadge avatar={getAvatar(contact.avatarId)} />
)}
```

2. **Show NEPQ journey progress:**
```jsx
{contact.callHistory.length > 0 && (
  <NEPQProgress 
    currentPhase={contact.nepqPhase}
    problemLevel={contact.problemLevel}
    problemsIdentified={contact.problemsIdentified}
  />
)}
```

3. **Conditional NEPQ tracking (only for Decision Maker conversations):**
```jsx
{outcome === 'DM' && (
  <div className="nepq-tracking">
    <h4>🎯 NEPQ Progress This Call</h4>
    
    <label>Phase Reached:</label>
    <select value={phaseReached} onChange={e => setPhaseReached(e.target.value)}>
      <option value="">Select phase...</option>
      <option value="connection">Connection</option>
      <option value="situation">Situation</option>
      <option value="problem-awareness">Problem Awareness</option>
      <option value="solution-awareness">Solution Awareness</option>
      <option value="consequence">Consequence</option>
      <option value="commitment">Commitment</option>
    </select>
    
    <label>Problems Discovered:</label>
    <ProblemCheckboxes 
      problems={contact.avatarId ? getAvatar(contact.avatarId).problems : {}}
      selected={problemsDiscovered}
      onChange={setProblemsDiscovered}
    />
    
    <label>Next Call Goal:</label>
    <input 
      type="text" 
      placeholder="e.g., Uncover Level 3 problem"
      value={nextSteps}
      onChange={e => setNextSteps(e.target.value)}
    />
  </div>
)}
```

4. **Save enhanced data:**
```javascript
const handleSave = () => {
  const callData = {
    date: new Date().toISOString(),
    outcome: outcome,
    okCode: selectedOkCode,
    notes: notes,
    
    // NEPQ data (only if DM conversation)
    nepqPhaseReached: outcome === 'DM' ? phaseReached : null,
    problemLevelReached: problemsDiscovered.length > 0 ? Math.max(...problemsDiscovered.map(p => p.level)) : 0,
    problemsDiscovered: problemsDiscovered,
    nextSteps: nextSteps
  };
  
  // Update contact's current NEPQ state
  const updatedContact = {
    ...contact,
    nepqPhase: phaseReached || contact.nepqPhase,
    problemLevel: Math.max(contact.problemLevel, callData.problemLevelReached),
    problemsIdentified: [
      ...contact.problemsIdentified,
      ...problemsDiscovered.map(p => ({
        level: p.level,
        statement: p.statement,
        date: new Date().toISOString()
      }))
    ],
    callHistory: [...contact.callHistory, callData],
    lastCall: new Date().toISOString(),
    dials: contact.dials + 1
  };
  
  onSave(updatedContact);
};
```

---

### Step 4: Add Question Suggester (3-4 hours)

**File:** `/src/components/question-suggester.jsx`

```jsx
function QuestionSuggester({ contact, onCopyQuestion }) {
  const [collapsed, setCollapsed] = useState(false);
  
  // Determine which questions to show
  const phase = contact.nepqPhase;
  const problemLevel = contact.problemLevel;
  const avatar = contact.avatarId ? getAvatar(contact.avatarId) : null;
  
  // Get questions for this context
  const questions = getQuestionsFor(phase, problemLevel, avatar);
  
  if (collapsed) {
    return (
      <button onClick={() => setCollapsed(false)}>
        💡 Show Suggested Questions
      </button>
    );
  }
  
  return (
    <div className="question-suggester">
      <div className="header">
        <h4>💡 Suggested Questions ({phase})</h4>
        <button onClick={() => setCollapsed(true)}>Collapse</button>
      </div>
      
      <div className="questions-list">
        {questions.map(q => (
          <div key={q.id} className="question-card">
            <p>{q.text}</p>
            <div className="actions">
              <button onClick={() => onCopyQuestion(q.text)}>
                📋 Copy
              </button>
              <span className="context">
                {q.targetLevel && `Target: Level ${q.targetLevel}`}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {avatar && (
        <div className="cold-call-hooks">
          <h5>🎣 Cold Call Hooks</h5>
          {avatar.coldCallHooks.map((hook, i) => (
            <div key={i} className="hook-card">
              <p>{hook}</p>
              <button onClick={() => onCopyQuestion(hook)}>📋 Copy</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Question selection logic:**

```javascript
function getQuestionsFor(phase, problemLevel, avatar) {
  const baseQuestions = QuestionLibrary[phase] || [];
  
  // Add avatar-specific questions if available
  let questions = [...baseQuestions];
  
  if (avatar && avatar.problems) {
    // Add questions targeting next problem level
    const targetLevel = problemLevel + 1;
    if (targetLevel <= 4 && avatar.problems[`level${targetLevel}`]) {
      questions = [
        ...questions,
        ...generateQuestionsForProblems(avatar.problems[`level${targetLevel}`], targetLevel)
      ];
    }
  }
  
  return questions.slice(0, 5); // Limit to 5 questions
}
```

---

### Step 5: Add NEPQ Analytics (4-5 hours)

**File:** `/src/components/nepq-analytics.jsx`

```jsx
function NEPQAnalytics({ contacts }) {
  const metrics = calculateNEPQMetrics(contacts);
  
  return (
    <div className="nepq-analytics">
      <h3>📊 NEPQ Performance</h3>
      
      {/* Phase Funnel */}
      <div className="funnel-chart">
        <h4>NEPQ Phase Funnel</h4>
        {Object.entries(metrics.phaseFunnel).map(([phase, count]) => (
          <div key={phase} className="funnel-stage">
            <span>{phase}</span>
            <div className="bar" style={{ width: `${(count / metrics.totalContacts) * 100}%` }}>
              {count}
            </div>
          </div>
        ))}
      </div>
      
      {/* Problem Depth Distribution */}
      <div className="problem-depth">
        <h4>Problem Discovery Depth</h4>
        <div className="problem-levels">
          {[1, 2, 3, 4].map(level => (
            <div key={level} className={`level level-${level}`}>
              <div className="label">Level {level}</div>
              <div className="count">{metrics.problemLevels[level] || 0}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Avatar Performance */}
      {metrics.avatarPerformance.length > 0 && (
        <div className="avatar-performance">
          <h4>Performance by Avatar</h4>
          <table>
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Contacts</th>
                <th>Avg Problem Level</th>
                <th>Conversion Rate</th>
              </tr>
            </thead>
            <tbody>
              {metrics.avatarPerformance.map(avatar => (
                <tr key={avatar.id}>
                  <td>{avatar.name}</td>
                  <td>{avatar.contactCount}</td>
                  <td>{avatar.avgProblemLevel.toFixed(1)}</td>
                  <td>{(avatar.conversionRate * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Conversion Rates by Phase */}
      <div className="conversion-rates">
        <h4>Phase-to-Phase Conversion</h4>
        {Object.entries(metrics.conversionRates).map(([transition, rate]) => (
          <div key={transition} className="conversion-stat">
            <span>{transition}</span>
            <span className="rate">{(rate * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Metrics calculation:**

```javascript
function calculateNEPQMetrics(contacts) {
  const metrics = {
    totalContacts: contacts.length,
    phaseFunnel: {},
    problemLevels: {},
    conversionRates: {},
    avatarPerformance: []
  };
  
  // Calculate phase funnel
  contacts.forEach(contact => {
    const phase = contact.nepqPhase;
    metrics.phaseFunnel[phase] = (metrics.phaseFunnel[phase] || 0) + 1;
    
    // Track problem levels
    const level = contact.problemLevel;
    if (level > 0) {
      metrics.problemLevels[level] = (metrics.problemLevels[level] || 0) + 1;
    }
  });
  
  // Calculate conversion rates
  const phases = ['connection', 'situation', 'problem-awareness', 'solution-awareness', 'consequence', 'commitment'];
  for (let i = 0; i < phases.length - 1; i++) {
    const fromPhase = phases[i];
    const toPhase = phases[i + 1];
    const fromCount = metrics.phaseFunnel[fromPhase] || 0;
    const toCount = metrics.phaseFunnel[toPhase] || 0;
    
    if (fromCount > 0) {
      metrics.conversionRates[`${fromPhase} → ${toPhase}`] = toCount / fromCount;
    }
  }
  
  // Calculate avatar performance
  const avatarStats = {};
  contacts.forEach(contact => {
    if (contact.avatarId) {
      if (!avatarStats[contact.avatarId]) {
        avatarStats[contact.avatarId] = {
          id: contact.avatarId,
          name: getAvatar(contact.avatarId)?.name || 'Unknown',
          contactCount: 0,
          totalProblemLevel: 0,
          conversions: 0
        };
      }
      
      const stats = avatarStats[contact.avatarId];
      stats.contactCount++;
      stats.totalProblemLevel += contact.problemLevel;
      if (contact.dealStage === 'closed-won') {
        stats.conversions++;
      }
    }
  });
  
  metrics.avatarPerformance = Object.values(avatarStats).map(stats => ({
    ...stats,
    avgProblemLevel: stats.totalProblemLevel / stats.contactCount,
    conversionRate: stats.conversions / stats.contactCount
  }));
  
  return metrics;
}
```

---

## 🎨 UI/UX CONSIDERATIONS

### 1. **Progressive Disclosure**
Don't show all NEPQ features at once. Start simple:

**Phase 1:** Basic tracking
- Avatar selection
- Phase reached per call
- Simple notes

**Phase 2:** Add depth
- Problem level checkboxes
- Suggested questions
- Next steps planner

**Phase 3:** Full system
- Automatic question suggestions
- Avatar-specific hooks
- Full analytics

### 2. **Quick Mode Toggle**
Always provide an escape hatch:

```jsx
<div className="mode-toggle">
  <button 
    className={mode === 'quick' ? 'active' : ''}
    onClick={() => setMode('quick')}
  >
    ⚡ Quick Mode
  </button>
  <button 
    className={mode === 'full' ? 'active' : ''}
    onClick={() => setMode('full')}
  >
    📊 Full NEPQ Mode
  </button>
</div>
```

### 3. **Smart Defaults**
Learn from user behavior:

```javascript
// Track user's typical workflow
const userPreferences = {
  defaultMode: 'quick', // or 'full'
  autoExpandQuestions: false,
  typicalPhasesPerCall: 2, // user usually progresses 2 phases
  usesAvatars: true
};

// Apply preferences on load
useEffect(() => {
  const prefs = Storage.get('r7_user_preferences', userPreferences);
  setMode(prefs.defaultMode);
  setQuestionsPanelExpanded(prefs.autoExpandQuestions);
}, []);
```

---

## 📱 KEYBOARD SHORTCUTS

Add keyboard shortcuts for power users:

```javascript
const shortcuts = {
  'n': 'Next contact',
  's': 'Save call',
  'q': 'Toggle quick mode',
  '1-7': 'Select NEPQ phase (1=Connection, 7=Presentation)',
  'cmd+c': 'Copy suggested question',
  'cmd+k': 'Toggle questions panel'
};

useEffect(() => {
  const handleKeyPress = (e) => {
    if (e.metaKey || e.ctrlKey) {
      switch(e.key) {
        case 'c':
          // Copy first suggested question
          break;
        case 'k':
          // Toggle questions
          break;
      }
    } else {
      switch(e.key) {
        case 'n':
          onNextContact();
          break;
        case 's':
          handleSave();
          break;
        case 'q':
          toggleMode();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
          selectPhase(parseInt(e.key) - 1);
          break;
      }
    }
  };
  
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

---

## ⚠️ COMMON PITFALLS TO AVOID

### 1. **Over-Engineering the Data Model**
❌ Don't try to capture EVERY detail of every conversation
✅ Focus on actionable data: phase, problem level, next steps

### 2. **Making NEPQ Tracking Required**
❌ Don't force users to fill in NEPQ data for every call
✅ Make it optional, show value through analytics

### 3. **Slow UI**
❌ Don't load all avatars, questions, and history on every render
✅ Use lazy loading, memoization, and component splitting

### 4. **Analysis Paralysis**
❌ Don't show 20 charts and graphs that nobody understands
✅ Show 3-5 key metrics that drive action

### 5. **Ignoring Mobile**
❌ Don't assume desktop-only usage
✅ Make sure NEPQ tracking works on phone (touch-friendly)

---

## 🧪 TESTING CHECKLIST

Before launch, test:

- [ ] Create contact with avatar
- [ ] Make call, track phase progression
- [ ] Log problem discovery (levels 1-4)
- [ ] View NEPQ history on contact
- [ ] Switch between quick/full mode
- [ ] Copy suggested question
- [ ] View NEPQ analytics dashboard
- [ ] Import avatars from Excel
- [ ] Export contacts with NEPQ data
- [ ] Test on mobile device
- [ ] Test with 100+ contacts
- [ ] Migrate existing contacts to new schema

---

## 📈 ROLLOUT STRATEGY

### Week 1: Foundation
- Deploy enhanced data model
- Add avatar creation UI
- Test with 5 manually created avatars

### Week 2: Basic Tracking
- Add phase selector to calling interface
- Add problem level tracking
- Test with 10 calls

### Week 3: Questions & Guidance
- Add question suggester
- Import script builder data
- Test context-aware suggestions

### Week 4: Analytics
- Build NEPQ dashboard
- Add phase funnel visualization
- Add avatar performance comparison

### Week 5: Polish & Launch
- Add keyboard shortcuts
- Optimize performance
- Create user guide
- Full launch

---

## 🎯 SUCCESS METRICS

Track these to measure success:

1. **Adoption Rate**
   - % of contacts with avatars assigned
   - % of DM calls with NEPQ tracking
   - Average problem level reached

2. **Efficiency**
   - Time per call (should not increase significantly)
   - Calls per hour (maintain or improve)

3. **Quality**
   - % of contacts reaching Level 3+ problems
   - % of contacts progressing past Problem Awareness
   - Conversion rate by NEPQ phase

4. **User Satisfaction**
   - Jordan's feedback on usefulness
   - Frequency of quick mode vs. full mode usage
   - Feature utilization (which features get used?)

---

**Ready to start building? Let's clarify any questions and get to work!**
