# NEPQ Integration - Quick Reference Card

## 🎯 The 7 NEPQ Phases (In Order)

| Phase | Icon | Purpose | Key Questions |
|-------|------|---------|---------------|
| **1. Connection** | 🤝 | Build rapport, understand interest | "What attracted your attention to us?" |
| **2. Situation** | 📋 | Understand current state | "How long has this been an issue?" |
| **3. Problem Awareness** | 🔍 | Uncover pain (L1→L4) | "What's been preventing you from solving this?" |
| **4. Solution Awareness** | 💡 | Explore ideal criteria | "What would be your ideal solution?" |
| **5. Consequence** | ⚠️ | Show cost of inaction | "What happens if this continues 6 months?" |
| **6. Commitment** | 🤝 | Get agreement to proceed | "Do you feel this could be the answer?" |
| **7. Presentation** | 📊 | Demo/proposal | Present solution based on their needs |

---

## 🎚️ The 4 Problem Levels (Dig Deeper)

| Level | Type | Description | Example | Depth |
|-------|------|-------------|---------|-------|
| **L1** | Obvious | Wants/Not Wants | "Want more qualified leads" | 🔵 Surface |
| **L2** | Common | Lack of: process, knowledge, time, resources | "No lead scoring process" | 🟢 Deeper |
| **L3** | Specific | Quantified impact | "Waste 10 hrs/week, $2K per bad lead" | 🟡 Deep |
| **L4** | Mission Critical | Cost of inaction | "Will lose clients to competitors" | 🔴 Critical |

**Goal:** Get to Level 3-4 problems = Higher close rate

---

## 📊 What to Track Per Call

### Basic (Always)
- ✅ Call Outcome (NA / GK / DM)
- ✅ OK Code
- ✅ Notes

### NEPQ (If Decision Maker Conversation)
- ✅ Phase Reached
- ✅ Problem Level Uncovered
- ✅ Problem Statements
- ✅ Next Steps / Target for Next Call

### Optional (Power User)
- Questions Asked
- Call Duration
- Objections Raised
- Avatar Classification

---

## 🎯 Data Model at a Glance

```
CONTACT
├─ Basic Info (name, phone, website)
├─ Avatar/ICP (classification)
├─ NEPQ Journey
│  ├─ Current Phase
│  ├─ Problem Level (0-4)
│  └─ Problems Identified []
├─ Deal Stage (prospect → closed)
├─ Next Action
│  ├─ Target Phase
│  ├─ Follow-up Date
│  └─ Preparation Notes
└─ Call History []
   └─ Per Call
      ├─ Date, Outcome, OK Code, Notes
      ├─ Phase Reached
      ├─ Problem Level Reached
      └─ Problems Discovered []
```

---

## 🚦 Decision Tree: When to Track What

```
┌─────────────────┐
│   Make Call     │
└────────┬────────┘
         │
         ▼
    ┌─────────┐
    │ Outcome?│
    └────┬────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
 [NO ANS]  [GATEKEEPER]  [DECISION MAKER]
    │         │              │
    │         │              ▼
    │         │         ┌──────────┐
    │         │         │Had Convo?│
    │         │         └────┬─────┘
    │         │              │
    │         │         ┌────┴────┐
    │         │         │         │
    │         │         ▼         ▼
    │         │      [YES]      [NO]
    │         │         │         │
    │         │         ▼         │
    │         │   Track NEPQ     │
    │         │   (Phase +        │
    │         │    Problems)      │
    │         │         │         │
    └─────────┴─────────┴─────────┘
              │
              ▼
        [OK Code + Notes]
              │
              ▼
        [Save & Next]
```

---

## 🎨 UI Component Map

```
CALLING INTERFACE
├─ Contact Card
│  ├─ Basic Info (name, phone, etc.)
│  ├─ Avatar Badge (if assigned)
│  └─ Last Call Summary
│
├─ NEPQ Journey Tracker (if has history)
│  ├─ Phase Progress Bar
│  ├─ Problem Level Indicator
│  └─ Problems Discovered List
│
├─ Question Suggester (collapsible)
│  ├─ Suggested Questions (context-aware)
│  ├─ Cold Call Hooks (avatar-specific)
│  └─ Quick Copy Buttons
│
├─ Call Outcome Selector
│  └─ NA / GK / DM buttons
│
├─ NEPQ Tracking (if DM selected)
│  ├─ Phase Selector
│  ├─ Problem Level Checkboxes
│  └─ Next Steps Planner
│
├─ OK Code Selector
│
├─ Notes Textarea
│
└─ Actions
   ├─ Save & Next
   └─ Quick Mode Toggle
```

---

## ⚡ Quick Mode vs. Full Mode

### Quick Mode (Speed)
- Minimal UI
- Just: Outcome → OK Code → Next
- For: Rapid prospecting, no-answer calls

### Full Mode (Depth)
- Complete NEPQ tracking
- Questions, phases, problems
- For: Decision maker conversations

**Toggle:** Switch mid-session as needed

---

## 📈 Key Metrics to Track

### Activity Metrics (Already Have ✅)
- Dials
- Pickups (GK / DM)
- Conversations
- Meetings Booked

### NEPQ Metrics (Adding 🆕)
- Phase Progression Rate
  - Connection → Situation: X%
  - Situation → Problem: Y%
  - Problem → Solution: Z%
- Problem Discovery Depth
  - Avg Problem Level: 2.3
  - % Reaching L3+: 42%
- Avatar Performance
  - Win Rate by Avatar
  - Avg Problem Level by Avatar
- Deal Velocity
  - Days from Contact → Qualified
  - Days from Qualified → Closed

---

## 🔧 Implementation Phases

### Phase 1.5: NEPQ Foundation (3-5 weeks)
**Week 1:** Data model + Avatar system  
**Week 2:** Enhanced calling interface  
**Week 3:** Script builder + Questions  
**Week 4:** NEPQ analytics  
**Week 5:** Polish + Testing  

### Phase 2: Netlify Database (2-3 weeks)
**After Phase 1.5 is solid**

### Phase 3: Advanced Features (Future)
- AI-powered question suggestions
- Automatic call summaries
- Energy management scheduling
- Revenue calculator integration

---

## ✅ Testing Checklist (Before Launch)

- [ ] Create contact with avatar
- [ ] Make call, track phase
- [ ] Log problem discovery (L1-L4)
- [ ] View NEPQ history
- [ ] Toggle quick/full mode
- [ ] Copy suggested question
- [ ] View NEPQ analytics
- [ ] Import avatars from Excel
- [ ] Export contacts with NEPQ data
- [ ] Test on mobile
- [ ] Test with 100+ contacts
- [ ] Migrate existing contacts

---

## 🎯 Success Criteria

### Adoption
- ✅ 80%+ of contacts have avatars
- ✅ 60%+ of DM calls tracked with NEPQ
- ✅ Avg problem level ≥ 2.0

### Efficiency
- ✅ Call time increase < 20%
- ✅ Calls per hour maintained
- ✅ Jordan reports it's helpful

### Quality
- ✅ 40%+ contacts reach L3+ problems
- ✅ 50%+ contacts pass Problem Awareness
- ✅ Conversion rate improves by 10%+

---

## 💡 Pro Tips

1. **Don't Force It:** Make NEPQ tracking optional, show value
2. **Start Simple:** Avatar + Phase tracking = MVP
3. **Iterate Fast:** Add features based on actual usage
4. **Keep It Fast:** Every extra click is friction
5. **Mobile Matters:** Test on phone, not just desktop
6. **Learn From Data:** Which avatars convert best?
7. **Celebrate Wins:** "You reached L4 problem! 🎉"

---

## 📞 Integration with Excel Files

| File | Current Use | Target Integration |
|------|-------------|-------------------|
| **Avatars.xlsx** | Manual reference | Avatar template library |
| **Script_Builder.xlsx** | Static doc | Dynamic question suggester |
| **KPI_Tracker.xlsx** | Manual tracking | Auto-populated from dialer |
| **Monthly_Know_Your_Numbers.xlsx** | Goal planning | Revenue calculator (Phase 3) |
| **Energy_Management.xlsx** | Peak time tracking | Smart scheduling (Phase 3) |

---

## 🚀 Getting Started

1. **Read** → [R7_DIALER_FOUNDATION.md](computer:///mnt/user-data/outputs/R7_DIALER_FOUNDATION.md)
2. **Visualize** → [SYSTEM_COMPARISON_VISUAL.md](computer:///mnt/user-data/outputs/SYSTEM_COMPARISON_VISUAL.md)
3. **Build** → [IMPLEMENTATION_GUIDE.md](computer:///mnt/user-data/outputs/IMPLEMENTATION_GUIDE.md)
4. **Execute** → [PROJECT_SUMMARY.md](computer:///mnt/user-data/outputs/PROJECT_SUMMARY.md)

---

## ❓ Quick Answers

**Q: Will this slow down Jordan's calling?**  
A: No - Quick mode keeps speed, Full mode adds depth when needed

**Q: Do we need to track EVERY NEPQ detail?**  
A: No - Start with phase + problem level, add more later

**Q: What if Jordan doesn't use avatars?**  
A: Optional - system works without them, but they add value

**Q: How long to implement MVP?**  
A: 2-3 weeks for Avatar + Phase tracking + Problem levels

**Q: Can we do this before Netlify DB?**  
A: YES - recommended. Data model matters more than storage tech

**Q: What if this is too complex?**  
A: Progressive disclosure - hide advanced features until ready

---

**Print this card and keep it handy! 📄**
