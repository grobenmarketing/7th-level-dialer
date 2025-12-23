# R7 Creative Dialer

A web-based sales calling system for cold prospecting and outbound sales teams.

## Tech Stack

- **Frontend:** React 18 + Vite 6
- **Styling:** Tailwind CSS 3.4
- **Storage:** Netlify Blob (cloud) with localStorage fallback
- **Deployment:** Netlify

## Installation

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

## Deployment to Netlify

### Via Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

### Via Netlify Dashboard

1. Push code to GitHub
2. Go to [Netlify](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Select your GitHub repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

## Project Structure

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

## Key Features

- Contact management with CSV import/export
- Calling interface with call outcome tracking (No Answer / Gatekeeper / Decision Maker)
- OK code system for call categorization
- 30-day, 27-touch multi-channel sequence automation
- Activity dashboard with analytics
- Avatar/ICP management system
- Live call timer with duration tracking

## Data Storage

- **Development:** Uses browser localStorage
- **Production:** Automatically migrates to Netlify Blob storage
- **Backup:** Export contacts to CSV anytime

## License

MIT License
