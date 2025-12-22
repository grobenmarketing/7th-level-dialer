# 📞 R7 Creative Dialer

A streamlined web-based sales calling system for cold prospecting and outbound sales teams.

## 🚀 Features

### Core Functionality
- ✅ Modern React + Vite + Tailwind CSS stack
- ✅ Contact management with cloud storage (Netlify Blob)
- ✅ CSV import/export functionality
- ✅ Streamlined calling interface
- ✅ Call outcome tracking (No Answer / Gatekeeper / Decision Maker)
- ✅ OK code system (12 predefined codes)
- ✅ Call history and notes per contact
- ✅ **30-day, 27-touch multi-channel sequence automation**
- ✅ Activity dashboard with key metrics
- ✅ Full contact database viewer with search & filters
- ✅ Detailed contact history modal
- ✅ Live call timer with automatic duration tracking
- ✅ Avatar/ICP management system
- ✅ Mobile-responsive design
- ✅ One-click deployment to Netlify

### Analytics Dashboard
- 📊 Contact rate (% reaching decision makers)
- 📊 Meeting rate (conversion to meetings/qualified leads)
- 📊 Call duration analytics
- 📊 Call outcome breakdown (DM/GK/NA)
- 📊 OK code distribution
- 📊 Call history tracking

## 🛠️ Tech Stack

- **Frontend:** React 18 + Vite 6
- **Styling:** Tailwind CSS 3.4
- **Storage:** Netlify Blob (cloud) with localStorage fallback
- **Deployment:** Netlify

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm

### Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd 7th-level-dialer
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## 🌐 Deployment to Netlify

### Option 1: Deploy via Netlify CLI (Recommended)

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login to Netlify:
```bash
netlify login
```

3. Initialize and deploy:
```bash
netlify init
netlify deploy --prod
```

### Option 2: Deploy via Netlify Dashboard

1. Push your code to GitHub
2. Go to [Netlify](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Select your GitHub repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

## 📊 How to Use

### 1. Import Contacts
- Click "Import CSV" on the dashboard
- Upload a CSV file with columns: Company Name, Phone, Website, Industry, Company Size
- Contacts will be loaded into your active list

### 2. Create Avatars (Optional)
- Define buyer personas or ideal customer profiles
- Assign contacts to avatars for better organization
- Track performance by avatar type

### 3. Start Calling
- Click "Start Calling" to begin your session
- The system will guide you through each contact
- For each call:
  1. Select outcome (NA/GK/DM)
  2. Choose an OK code
  3. Add notes
  4. Save & move to next contact

### 4. Review Analytics
- Track your performance metrics
- Identify patterns in call outcomes
- Optimize your approach based on data

## 📁 Project Structure

```
src/
├── components/        # React components
│   ├── Dashboard.jsx          # Main dashboard
│   ├── CallingInterface.jsx   # Call logging interface
│   ├── Analytics.jsx          # Analytics dashboard
│   ├── ContactList.jsx        # Contact table view
│   ├── AvatarManager.jsx      # Avatar/ICP management
│   └── ...
├── hooks/            # Custom React hooks
│   ├── useContacts.js        # Contact state management
│   ├── useStats.js           # Analytics calculations
│   └── useAvatars.js         # Avatar management
├── lib/              # Utilities and constants
│   ├── cloudStorage.js       # Cloud/local storage abstraction
│   └── constants.js          # App constants (OK codes, etc.)
└── App.jsx           # Main app component
```

## 🔑 Key Concepts

### OK Codes
Pre-defined outcome codes for categorizing calls:
- **OK-01:** No Answer
- **OK-02:** Not Interested
- **OK-03:** Hung Up
- **OK-04:** Gatekeeper Block
- **OK-05:** DM Unavailable
- **OK-06:** Voicemail - Left Message
- **OK-07:** Not A Fit
- **OK-08:** Meeting Scheduled ✅
- **OK-09:** Wrong Contact

### Call Outcomes
- **NA (No Answer):** Voicemail, busy, or no response
- **GK (Gatekeeper):** Reached receptionist or assistant
- **DM (Decision Maker):** Spoke with the prospect directly

### Avatars/ICPs
Buyer personas or ideal customer profiles used to:
- Organize contacts by type
- Track performance by segment
- Tailor calling approaches

### Multi-Touch Sequences
The dialer implements a **30-day, 27-touch sequence** across multiple channels:
- 📞 4 phone calls (weekly cadence)
- 📧 6 emails (strategic timing)
- 💼 2 LinkedIn DMs
- 💬 5 LinkedIn comments
- 👍 4 social media engagements
- 📬 1 physical mail postcard

**For complete touchpoint documentation, see: [TOUCHPOINT_GUIDE.md](TOUCHPOINT_GUIDE.md)**

## 📝 Data Storage

- **Development:** Uses browser localStorage
- **Production:** Automatically migrates to Netlify Blob storage
- **Backup:** Export contacts to CSV anytime

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

Built with modern web technologies for sales teams who need a simple, effective calling system.

---

**Happy Calling!** 📞✨
