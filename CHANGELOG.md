# Changelog

All notable changes to the R7 Creative Dialer project will be documented in this file.

## [1.0.0] - 2025-12-07

### 🎯 Major Simplification Release

This release significantly streamlines the application by removing the NEPQ methodology tracking system in favor of a simpler, more focused calling experience.

### Removed
- **NEPQ Phase Tracking System**
  - Removed 7-phase NEPQ journey tracking (Connection → Presentation)
  - Removed NEPQ progress visualization components
  - Removed phase-based call logging

- **Problem Discovery Framework**
  - Removed L1-L4 problem level tracking
  - Removed problem statement categorization
  - Removed problem discovery analytics

- **Question Suggester System**
  - Removed question library (80+ pre-loaded questions)
  - Removed context-aware question suggester component
  - Removed question management interface
  - Removed cold call hooks system

- **NEPQ-Specific Analytics**
  - Removed NEPQ funnel visualization
  - Removed phase conversion rate tracking
  - Removed problem level distribution charts
  - Removed avatar performance metrics tied to NEPQ
  - Removed top contacts by NEPQ progress

- **Data Model Changes**
  - Removed `nepqPhase` field from contacts
  - Removed `problemLevel` field from contacts
  - Removed `problemsIdentified` array from contacts
  - Removed `dealStage` field from contacts
  - Removed NEPQ tracking from call history records

### Changed
- **Simplified Analytics Dashboard**
  - Focused on core KPIs: Contact Rate, Meeting Rate, Call Duration
  - Streamlined OK Code distribution
  - Removed complex multi-tab interface

- **Streamlined Calling Interface**
  - Removed NEPQ phase selector
  - Removed problem discovery tracker
  - Simplified to: Outcome + OK Code + Notes

- **Updated Documentation**
  - Rewrote README.md without NEPQ references
  - Simplified How to Use guide
  - Updated all user-facing documentation

### Maintained
- ✅ Contact management system
- ✅ CSV import/export
- ✅ Call outcome tracking (NA/GK/DM)
- ✅ OK code system (12 codes)
- ✅ Call history and notes
- ✅ Call timer and duration tracking
- ✅ Avatar/ICP management
- ✅ Contact list viewer with search
- ✅ Cloud storage (Netlify Blob)
- ✅ Mobile-responsive design

### Technical Changes
- Deleted 5 component files: `QuestionSuggester.jsx`, `NEPQTracker.jsx`, `useQuestions.js`, `seedQuestions.js`, `nepq.js`
- Removed NEPQ constants: `NEPQ_PHASES`, `PROBLEM_LEVELS`, `DEAL_STAGES`
- Simplified `useStats.js` by removing 6 NEPQ-related analytics functions
- Updated cloud storage to remove question library handling
- Reduced application complexity by ~30%

### Migration Notes
For existing users:
- NEPQ data in contacts will be ignored (not deleted from storage, just not displayed)
- Question library data will no longer be used
- No action required - the app will continue to work with existing data

---

## [0.9.0] - Previous Version

### Added
- Complete NEPQ methodology implementation
- Question library with 80+ pre-loaded questions
- Advanced analytics dashboard
- Problem discovery tracking
- Phase-based call progression

---

**Note:** This project follows [Semantic Versioning](https://semver.org/).
