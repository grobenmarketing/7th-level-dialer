# 📞 R7 NEPQ Dialer

A web-based sales calling system built for cold prospecting using Jeremy Miner's 7th Level NEPQ (Neuro-Emotional Persuasion Questioning) methodology.

## 🚀 Features

### Phase 1 - Foundation ✅
- ✅ Modern React + Vite + Tailwind CSS stack
- ✅ Contact management with localStorage
- ✅ CSV import/export functionality
- ✅ Streamlined calling interface
- ✅ Call outcome tracking (No Answer / Gatekeeper / Decision Maker)
- ✅ OK code system (12 predefined codes)
- ✅ Call history and notes
- ✅ Activity dashboard with stats
- ✅ **Full contact database viewer with search & filters**
- ✅ **Detailed contact history modal with all notes**
- ✅ Mobile-responsive design
- ✅ One-click deployment to Netlify

### Phase 2 - NEPQ Foundation ✅
- ✅ **NEPQ phase tracking** (Connection → Presentation)
- ✅ **Problem discovery levels** (L1-L4)
- ✅ **Visual NEPQ progress tracker** with phase indicators
- ✅ **Problem level tracking** for each call
- ✅ **Avatar/ICP management system**
- ✅ **Enhanced calling interface** with NEPQ tracking for Decision Maker calls
- ✅ **Problem statement capture** with level-based categorization
- ✅ **NEPQ journey visualization** in contact cards and details

### Phase 3 - Intelligence Layer ✅ (COMPLETE!)
- ✅ **Question Library System** with 80+ pre-loaded NEPQ questions
- ✅ **Context-aware Question Suggester** that shows relevant questions based on:
  - Current NEPQ phase (Connection → Presentation)
  - Contact's assigned avatar/ICP
  - Current problem discovery level (L1-L4)
- ✅ **Cold call hooks** for first-time contacts (pulled from avatar data)
- ✅ **Quick-copy functionality** to grab questions during live calls
- ✅ **Comprehensive Analytics Dashboard** with:
  - NEPQ funnel visualization (phase progression rates)
  - Problem depth distribution (L1-L4 breakdown)
  - Avatar performance comparison metrics
  - Phase-to-phase conversion rates
  - OK code distribution analysis
  - Top performing contacts by NEPQ progress
- ✅ **One-click question library seeding** with expert NEPQ questions

### Coming Soon
- Phase 4: Call timer and duration tracking
- Phase 5: Cloud storage with Netlify Blob Storage
- Phase 6: Team collaboration features

## 📋 Setup Instructions

### Prerequisites
- Node.js 18+ installed
- A modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd 7th-level-dialer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Visit http://localhost:5173
   - The app will hot-reload as you make changes

### Build for Production

```bash
npm run build
```

The optimized build will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## 🌐 Deployment to Netlify

### Method 1: GitHub Auto-Deploy (Recommended)

1. Push your code to GitHub
2. Go to [Netlify](https://netlify.com) and sign in
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repository
5. Netlify will auto-detect settings from `netlify.toml`
6. Click "Deploy site"
7. Every push to main branch = automatic deployment!

### Method 2: Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

## 📊 How to Use

### 1. Import Contacts

Create a CSV file with this format:

```csv
Company Name,Phone,Website,Industry,Company Size
ABC Manufacturing,(555) 123-4567,https://abc.com,Manufacturing,50-200
XYZ Corp,(555) 987-6543,https://xyz.com,Technology,200-500
```

Then:
- Click "Import CSV" on the Dashboard
- Select your CSV file
- Contacts will be loaded automatically

### 2. Start Calling

- Click "Start Calling" button
- Review contact information
- Click the phone number to dial (or use your phone)
- After each call:
  1. Select outcome (No Answer / Gatekeeper / Decision Maker)
  2. Choose appropriate OK code
  3. Add notes
  4. Click "Save & Next"

### 3. View & Manage Contacts

- Click "View Contacts" on the Dashboard to access your full contact database
- **Search** by company name, phone, industry, or website
- **Filter** by status (Active, Do Not Call, Closed Won, Closed Lost)
- **Sort** by company name, total dials, last call date, or status
- **Click any contact** to view complete details and call history with notes
- All interactions are tracked and accessible from the contact details modal

### 4. Use the Question Suggester (Phase 3)

During Decision Maker calls:
- The **Question Suggester** automatically appears in the left panel
- Shows context-aware questions based on:
  - Current NEPQ phase you're in
  - Contact's avatar/ICP (if assigned)
  - Current problem level discovered
- **Cold call hooks** display for first-time contacts
- Click the **copy icon** to quickly grab questions
- Questions update as you progress through NEPQ phases

To load the question library:
- Click "Load Questions" button on Dashboard
- 80+ expert NEPQ questions will be imported
- Questions are organized by phase (Connection → Presentation) and problem level (L1-L4)

### 5. View Analytics (Phase 3)

Access the Analytics Dashboard to see:
- **NEPQ Funnel** - Visual funnel showing contact progression through phases
- **Problem Discovery** - Distribution of contacts at each problem level (L1-L4)
- **Avatar Performance** - Compare which buyer personas convert best
- **Conversion Rates** - Phase-to-phase progression and drop-off analysis
- **Top Contacts** - Highest NEPQ progress ranked contacts
- **OK Code Distribution** - See which outcomes are most common

### 6. Track Progress

- View stats on the Dashboard
- Export data anytime with "Export to CSV"
- All data persists in your browser's localStorage

## 🎯 OK Code Reference

| Code | Meaning | When to Use |
|------|---------|-------------|
| OK-01 | Interested - Follow Up | Prospect wants to continue conversation |
| OK-02 | Not Interested - Budget | No budget available |
| OK-03 | Not Interested - No Need | Doesn't see the need |
| OK-04 | Already Using Competitor | Using another solution |
| OK-05 | Wrong Contact | Not the decision maker |
| OK-06 | Do Not Call | Requested removal |
| OK-07 | Callback Requested | Asked to call back later |
| OK-08 | Gatekeeper Block | Couldn't get past gatekeeper |
| OK-09 | Voicemail - Left Message | Left voicemail |
| OK-10 | No Answer - Try Again | No pickup, no voicemail |
| OK-11 | Meeting Scheduled | Booked a meeting! |
| OK-12 | Qualified Lead - Hot | Ready to buy |

## 🛠 Tech Stack

- **Frontend Framework:** React 18
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS 3
- **Storage:** localStorage (Phase 1)
- **Deployment:** Netlify
- **Future:** Netlify Blob Storage (Phase 4)

## 📁 Project Structure

```
r7-nepq-dialer/
├── src/
│   ├── components/              # React components
│   │   ├── Dashboard.jsx
│   │   ├── CallingInterface.jsx
│   │   ├── ContactCard.jsx
│   │   ├── ContactsPage.jsx        # Full contact database view
│   │   ├── ContactDetailsModal.jsx # Contact history modal
│   │   ├── NEPQTracker.jsx         # NEPQ progress visualization
│   │   ├── AvatarManager.jsx       # Avatar/ICP management
│   │   ├── QuestionSuggester.jsx   # Phase 3: Context-aware questions
│   │   └── Analytics.jsx           # Phase 3: Analytics dashboard
│   ├── hooks/                   # Custom React hooks
│   │   ├── useContacts.js
│   │   ├── useAvatars.js
│   │   ├── useQuestions.js         # Phase 3: Question library
│   │   └── useStats.js             # Phase 3: Analytics calculations
│   ├── lib/                     # Utilities and helpers
│   │   ├── storage.js
│   │   ├── constants.js
│   │   ├── nepq.js
│   │   └── seedQuestions.js        # Phase 3: 80+ NEPQ questions
│   ├── styles/                  # CSS files
│   │   └── index.css
│   ├── App.jsx                  # Root component
│   └── main.jsx                 # Entry point
├── public/                      # Static assets
├── index.html                   # HTML template
├── package.json
├── vite.config.js
├── tailwind.config.js
└── netlify.toml                # Netlify config
```

## 💾 Data Storage

Phase 1 uses browser localStorage:
- Data persists between sessions
- Stored locally in your browser
- Export regularly as backup
- No account or login needed

Phase 4+ will migrate to cloud storage for:
- Multi-device sync
- Team collaboration
- Automatic backups

## 🎨 Customization

### Brand Colors

Edit `tailwind.config.js` to change colors:

```javascript
colors: {
  r7: {
    blue: '#1d4460',    // Primary brand color
    red: '#cf071d',     // Accent color
    light: '#f2f7f9',   // Light background
    dark: '#0f2430',    // Dark variant
  }
}
```

## 🐛 Troubleshooting

### Data Not Saving
- Check browser localStorage is enabled
- Clear cache and reload
- Try a different browser

### CSV Import Failed
- Ensure CSV format matches template
- Check for special characters
- Verify file encoding (UTF-8)

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📖 NEPQ Methodology

This dialer is built around the 7th Level NEPQ framework:

1. **Connection** 🤝 - Build rapport
2. **Situation** 📋 - Understand current state
3. **Problem Awareness** 🔍 - Uncover pain points (L1-L4)
4. **Solution Awareness** 💡 - Explore ideal criteria
5. **Consequence** ⚠️ - Show cost of inaction
6. **Commitment** 🤝 - Get agreement to proceed
7. **Presentation** 📊 - Demo/proposal

### Problem Discovery Levels (L1-L4)

The dialer tracks problem depth using the NEPQ framework:

- **L1: Obvious** - Surface wants/not wants ("We want faster processing")
- **L2: Common** - Lack of capabilities ("We're missing automation")
- **L3: Specific** - Quantified impact ("Costing us $50K/year in lost productivity")
- **L4: Mission Critical** - Cost of inaction ("If we don't fix this, we'll miss our annual targets")

**Phase 3 Complete!** Get AI-powered question suggestions based on your current phase and problem level, plus comprehensive analytics to optimize your NEPQ performance!

## 🤝 Contributing

This is a personal project for Jordan's sales operation. Future phases will add:
- Call timer and duration tracking
- Cloud storage with multi-device sync
- Team collaboration features
- Advanced reporting and exports

## 📝 License

Private use only.

## 🙏 Credits

- Built for R7 by Claude Code
- Methodology: Jeremy Miner's 7th Level NEPQ
- Stack: React + Vite + Tailwind CSS

---

**Ready to start calling? Run `npm run dev` and let's go! 🚀**
