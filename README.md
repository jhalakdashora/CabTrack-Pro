# CabTrack Pro

A clean, mobile-friendly cab-owner dashboard to record daily earnings, CNG cost, trips, hours worked, and auto-calculate earnings split (Owner vs Driver).

## 🚀 Features

- **Authentication**: Email/password login system
- **Dashboard**: Today's summary with 7-day earnings chart
- **Add Entry**: Form with live auto-calculations
- **Entries List**: View all entries with sorting and CRUD operations
- **Monthly Summary**: Detailed analytics with charts
- **Dark Mode**: Toggle between light and dark themes
- **Mobile Responsive**: Works seamlessly on all devices

## 🛠️ Tech Stack

- **React 18** + **Vite** - Fast development and build
- **Firebase** - Firestore DB + Auth + Hosting
- **TailwindCSS** - Modern, responsive UI
- **Chart.js** - Beautiful analytics charts
- **React Router** - Client-side routing

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account (free tier)

## 🔧 Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd "CabTrack Pro"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Firebase:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project (or use existing)
   - Enable Authentication → Email/Password
   - Create a Firestore database (start in test mode for development)
   - Go to Project Settings → General → Your apps → Web app
   - Copy the Firebase configuration

4. **Create environment file:**
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

5. **Set up Firestore Security Rules:**
   In Firebase Console → Firestore Database → Rules, use:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /entries/{entryId} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

## 🚀 Development

Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📦 Build

Create a production build:
```bash
npm run build
```

The build output will be in the `dist` directory.

## 🌐 Deployment to Firebase Hosting

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```

### Step 3: Initialize Firebase (if not already done)
```bash
firebase init
```

When prompted:
- Select **Hosting**
- Select your Firebase project
- Set public directory as: `dist`
- Configure as single-page app: **Yes**
- Set up automatic builds: **No** (or Yes if using CI/CD)

### Step 4: Build and Deploy
```bash
npm run build
firebase deploy
```

Your app will be live at: `https://your-project-id.web.app`

## 📁 Project Structure

```
CabTrack Pro/
├── src/
│   ├── components/
│   │   └── Navbar.jsx          # Navigation bar component
│   ├── context/
│   │   └── AuthContext.jsx      # Authentication context
│   ├── firebase/
│   │   ├── config.js            # Firebase configuration
│   │   └── entries.js           # Firestore CRUD operations
│   ├── pages/
│   │   ├── Login.jsx            # Login/Signup page
│   │   ├── Dashboard.jsx        # Dashboard with today's summary
│   │   ├── AddEntry.jsx         # Add/Edit entry form
│   │   ├── EntriesList.jsx      # List all entries
│   │   └── MonthlySummary.jsx   # Monthly analytics
│   ├── App.jsx                  # Main app component with routing
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles with Tailwind
├── firebase.json                 # Firebase hosting config
├── .firebaserc                   # Firebase project config
├── package.json                  # Dependencies
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # TailwindCSS configuration
└── README.md                     # This file
```

## 🔢 Auto-Calculations

The app automatically calculates:
- **Net Earnings** = Gross Earnings - CNG Cost
- **Owner Earnings** = Net Earnings × 0.5 (50%)
- **Driver Earnings** = Net Earnings × 0.5 (50%)
- **KM Difference** = KM End - KM Start

These calculations happen in real-time in the Add Entry form and are stored in Firestore.

## 🎨 Features in Detail

### Dashboard
- Today's summary cards (Gross, CNG, Net, Owner, Driver, Trips, Hours)
- Interactive bar chart showing last 7 days' gross earnings
- Quick "Add Entry" button

### Add Entry
- Form with all required fields
- Live calculation preview panel
- Auto-calculates all derived fields
- Supports editing existing entries

### Entries List
- Table view of all entries
- Sort by: Date, Highest Earnings, Highest Trips, Most Hours
- Edit and Delete functionality
- Responsive table design

### Monthly Summary
- Month selector
- Total statistics for the month
- Daily earnings chart for the entire month
- Average daily gross calculation

## 🔒 Security

- All Firestore operations require authentication
- User session managed via Firebase Auth
- Protected routes that redirect to login if not authenticated

## 📱 Mobile Support

The app is fully responsive and works great on:
- Mobile phones (iOS & Android)
- Tablets
- Desktop browsers

## 🐛 Troubleshooting

**Issue: Firebase connection errors**
- Check your `.env` file has correct Firebase config
- Verify Firebase project settings
- Ensure Firestore is enabled in Firebase Console

**Issue: Build fails**
- Run `npm install` again
- Clear `node_modules` and reinstall
- Check Node.js version (should be v16+)

**Issue: Charts not showing**
- Ensure Chart.js dependencies are installed
- Check browser console for errors

## 📝 License

This project is open source and available for personal use.

## 🤝 Support

For issues or questions, please check the code comments or Firebase documentation.

---

**Built with ❤️ for cab owners**

