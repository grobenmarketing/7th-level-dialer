# 📞 R7 Creative Dialer

A modern, web-based sales calling system designed for cold prospecting and outbound sales teams. Built with React and optimized for high-volume dialing with automated multi-channel sequence management.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.3-61dafb.svg)
![Vite](https://img.shields.io/badge/Vite-6.0-646cff.svg)

---

## 🌟 Key Features

### 🎯 Smart Calling Interface
- **Live Call Timer** - Track call duration in real-time
- **Quick OK Code Selection** - Keyboard shortcuts (1-9) for rapid logging
- **Three-Outcome System** - No Answer, Gatekeeper, or Decision Maker
- **Quality Tracking** - Conversation depth, triage completion, objections
- **Session Summaries** - End-of-session insights and follow-up recommendations

### 📊 Comprehensive Analytics
- **KPI Dashboard** - Weekly, monthly, and overall performance metrics
- **Performance Ratios** - Contact rate, meeting conversion, show rate
- **Objection Tracking** - Identify most common objections
- **Call Duration Analytics** - Average talk time by outcome type
- **Custom Targets** - Set and track weekly dial goals

### 🔄 30-Day Sequence Automation
- **27-Touch Multi-Channel Cadence** - Phone, email, LinkedIn, social, physical mail
- **Automatic Task Scheduling** - Daily tasks generated based on sequence calendar
- **Progress Tracking** - Visual progress indicators for each contact
- **Smart Advancement** - Auto-advance to next day when tasks complete
- **Overdue Alerts** - Highlighted overdue tasks with counts

### 👥 Contact Management (CRM)
- **CSV Import/Export** - Bulk contact management with template
- **Advanced Filtering** - By status, OK code, or search terms
- **Bulk Operations** - Delete or export multiple contacts at once
- **Contact History** - Full call history with notes and outcomes
- **Status Management** - Active, Client, Inactive (Dead) tracking

### 📈 Daily Dial Tracking
- **Goal Setting** - Customizable daily dial targets
- **Progress Monitoring** - Real-time progress toward goals
- **Never-Contacted Queue** - Automatic filtering of cold leads
- **Filtered Sessions** - Create custom calling lists by status/OK code

---

## 🚀 Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | React | 18.3.1 |
| **Build Tool** | Vite | 6.0.3 |
| **Styling** | Tailwind CSS | 3.4.17 |
| **Animations** | Framer Motion | 12.23.26 |
| **Backend** | Netlify Functions | Serverless |
| **Storage** | Netlify Blob | Cloud |
| **Deployment** | Netlify | CI/CD |

---

## 📦 Installation

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn
- Git

### Quick Start

1. **Clone the repository:**
```bash
git clone https://github.com/grobenmarketing/7th-level-dialer.git
cd 7th-level-dialer
```

2. **Install dependencies:**
```bash
npm install
```

3. **Run development server:**
```bash
npm run dev
```

4. **Open your browser:**
```
http://localhost:5173
```

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

---

## 🏗️ Project Structure

```
7th-level-dialer/
├── src/
│   ├── components/              # React components
│   │   ├── Dashboard.jsx        # Main dashboard (504 lines)
│   │   ├── CallingInterface.jsx # Call logging UI (788 lines)
│   │   ├── DatabaseManager.jsx  # CRM/KPI/Tasks hub (1,733 lines)
│   │   ├── FilteredSessionPage.jsx # Filtered calling setup
│   │   ├── ContactDetailsModal.jsx
│   │   ├── ContactFormModal.jsx
│   │   ├── SequencesPanel.jsx   # Sequence task overview
│   │   ├── TodaysSummary.jsx    # Daily stats widget
│   │   ├── ColdCallsPanel.jsx   # Cold call queue
│   │   ├── SessionReviewPage.jsx
│   │   ├── Settings.jsx
│   │   ├── OkCodesAdmin.jsx
│   │   └── database/            # Database UI sub-components
│   │       ├── SearchBar.jsx
│   │       ├── FilterButtons.jsx
│   │       ├── TableWrapper.jsx
│   │       ├── TableHeader.jsx
│   │       ├── StatusBadge.jsx
│   │       ├── ActionButtons.jsx
│   │       └── BulkActions.jsx
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useContacts.js       # Contact CRUD + CSV (282 lines)
│   │   ├── useKPI.js            # Performance metrics (430 lines)
│   │   ├── useCallForm.js       # Call form state (130 lines)
│   │   ├── useOkCodes.js        # OK code management
│   │   ├── useStats.js          # Analytics calculations
│   │   ├── useWeekAnalytics.js  # Weekly analytics
│   │   ├── useAuth.js           # Authentication
│   │   └── useCloudStorage.js   # Cloud storage wrapper
│   │
│   ├── lib/                     # Utilities and business logic
│   │   ├── cloudStorage.js      # Netlify Blob + localStorage (272 lines)
│   │   ├── sequenceLogic.js     # Sequence state management (309 lines)
│   │   ├── sequenceAutomation.js # Auto-advancement engine (273 lines)
│   │   ├── sequenceCalendar.js  # 30-day schedule definition (124 lines)
│   │   ├── taskScheduler.js     # Due date calculation (268 lines)
│   │   ├── contactFilters.js    # Reusable filters (NEW)
│   │   ├── contactSchema.js     # Contact factory
│   │   ├── eventBus.js          # Pub/sub events
│   │   ├── phoneUtils.js        # Phone formatting
│   │   └── constants.js         # OK codes, outcomes
│   │
│   ├── styles/
│   │   └── index.css            # Tailwind base + custom styles
│   │
│   ├── App.jsx                  # Main router (177 lines)
│   └── main.jsx                 # React entry point
│
├── netlify/
│   └── functions/               # Serverless API endpoints
│       ├── get-data.js          # Fetch from Netlify Blob
│       ├── set-data.js          # Save to Netlify Blob
│       └── sync-all.js          # Bulk read/write operations
│
├── public/                      # Static assets
├── REFACTORING_GUIDE.md         # Code audit & improvement roadmap
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## 🎨 Architecture Overview

### State Management
- **React Hooks** - Local component state
- **Custom Hooks** - Shared business logic (useContacts, useKPI, etc.)
- **EventBus** - Cross-component communication for real-time updates

### Data Flow
```
User Action → Component → Custom Hook → Cloud Storage API → Netlify Blob
                                     ↓
                                  EventBus
                                     ↓
                           Other Components (sync)
```

### Storage Strategy
- **Development**: Browser localStorage for rapid iteration
- **Production**: Netlify Blob storage for cloud persistence
- **Automatic Migration**: Seamlessly transitions on first load
- **CSV Export**: Manual backup capability anytime

### API Endpoints (Netlify Functions)
- `GET /api/get-data` - Fetch single key-value pair
- `POST /api/set-data` - Save single key-value pair
- `GET/POST /api/sync-all` - Bulk operations (multiple keys)

---

## ⚙️ Configuration

### Environment Variables
No environment variables required for basic usage. Netlify Blob storage is configured automatically on deployment.

### Custom OK Codes
OK codes can be customized in Settings → OK Codes Admin:
- Add custom codes with labels and colors
- Reorder codes by priority
- Edit existing codes

### Sequence Calendar
The 30-day sequence is defined in `src/lib/sequenceCalendar.js`. Modify this file to customize:
- Touch channels (phone, email, LinkedIn, etc.)
- Task types per day
- Sequence duration

---

## 📊 Recent Performance Improvements

### v1.1 (January 2026)
✅ **Critical performance fix**: Removed Dashboard polling (95% reduction in API calls)
✅ **Optimization**: Added memoization to CallingInterface and SequencesPanel
✅ **Code quality**: Created reusable contact filter utilities
✅ **Documentation**: Comprehensive refactoring guide for future improvements

### Performance Metrics
- **Dashboard re-renders**: 30+/min → ~0/min (-95%)
- **Memoized operations**: 19 → 23 (+21%)
- **Code reusability**: Centralized 13 duplicate filter operations

See `REFACTORING_GUIDE.md` for detailed audit report.

---

## 🚀 Deployment

### Deploy to Netlify (Recommended)

#### Option 1: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Deploy to production
netlify deploy --prod
```

#### Option 2: GitHub Integration (Recommended)
1. Push code to GitHub
2. Go to [Netlify Dashboard](https://app.netlify.com)
3. Click **"Add new site"** → **"Import an existing project"**
4. Select your GitHub repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 18.0.0 or higher
6. Click **"Deploy site"**

#### Environment Setup
- Netlify Blob storage is automatically configured
- No additional environment variables required
- HTTPS enabled by default

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Contact CRUD operations (Create, Read, Update, Delete)
- [ ] CSV import/export functionality
- [ ] Call logging with all three outcomes
- [ ] OK code selection and tracking
- [ ] Sequence task completion/skipping
- [ ] KPI data accuracy (weekly/monthly views)
- [ ] Search and filtering
- [ ] Bulk operations
- [ ] Session summaries

### Browser Compatibility
- ✅ Chrome 90+ (Recommended)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

## 📱 Mobile Support

The app is responsive and works on mobile devices, but is optimized for desktop use. For best experience:
- **Recommended**: Desktop/laptop (1280px+ width)
- **Supported**: Tablets in landscape mode
- **Limited**: Mobile phones (UI may be cramped)

---

## 🔐 Data Privacy & Security

- **Local First**: Development data stays in your browser
- **Cloud Storage**: Production data stored in Netlify Blob (encrypted at rest)
- **No Third Parties**: No external analytics or tracking
- **User Control**: Export all data to CSV anytime
- **HTTPS Only**: Secure connection enforced in production

---

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test thoroughly (see Testing checklist above)
5. Commit with descriptive messages
6. Push to your fork
7. Open a Pull Request

### Code Style
- **Components**: PascalCase (e.g., `ContactDetailsModal.jsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useContacts.js`)
- **Utilities**: camelCase (e.g., `contactFilters.js`)
- **Formatting**: 2-space indentation, semicolons optional
- **File Size**: Keep components under 500 lines (see REFACTORING_GUIDE.md)

### Reporting Issues
Open an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS information
- Screenshots if applicable

---

## 📚 Documentation

- **[REFACTORING_GUIDE.md](./REFACTORING_GUIDE.md)** - Code audit, architecture decisions, and improvement roadmap
- **[Component Documentation](#)** - JSDoc comments in source files
- **[API Reference](#)** - Netlify Functions documentation

---

## 🗺️ Roadmap

### Planned Features
- [ ] Email integration for automated sequence emails
- [ ] LinkedIn automation via Chrome extension
- [ ] Team collaboration (multi-user support)
- [ ] Advanced reporting (conversion funnels, cohort analysis)
- [ ] Mobile app (React Native)
- [ ] AI-powered call script suggestions
- [ ] Voicemail drop integration

### Code Quality Improvements
- [ ] Split DatabaseManager into 3 tab components (1,733 → 500 lines each)
- [ ] Split CallingInterface into panels (788 → 250 lines each)
- [ ] Apply filter utilities across all components
- [ ] Add comprehensive unit tests
- [ ] Implement TypeScript migration

See `REFACTORING_GUIDE.md` for detailed improvement plan.

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 👨‍💻 Author

**R7 Creative**

---

## 🙏 Acknowledgments

- Built with [React](https://react.dev)
- Powered by [Vite](https://vitejs.dev)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Hosted on [Netlify](https://netlify.com)
- Animations by [Framer Motion](https://www.framer.com/motion/)

---

## 📞 Support

For questions, issues, or feature requests:
- 🐛 [Open an issue](https://github.com/grobenmarketing/7th-level-dialer/issues)
- 📧 Contact: [your-email@example.com]
- 📖 Documentation: See REFACTORING_GUIDE.md

---

**Built for sales teams who demand performance, reliability, and results.** 🚀
