# CabTrack Pro

A clean, mobile-friendly cab-owner dashboard to record daily earnings, CNG cost, trips, hours worked, and auto-calculate earnings split (Owner vs Driver).

## 🚀 Features

- **Authentication**: Email/password login system
- **Dashboard**: Today's summary with 7-day earnings chart
- **Add Entry**: Form with live auto-calculations including:
  - Online amount settlements (credited to owner but belongs to driver)
  - Driver pass tracking (optional 50-50 split)
- **Entries List**: View all entries with sorting and CRUD operations
- **Monthly Summary**: Detailed analytics with charts
- **Advanced Earnings Split**: 
  - Base 50-50 split
  - Online settlement adjustments
  - Driver pass contributions (50-50)
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

The app automatically calculates earnings using the following logic:

### Step 1: Net Earnings
```
Net Earnings = Gross Earnings - CNG Cost
```

### Step 2: Base 50-50 Split
```
Base Owner = Net Earnings × 0.5
Base Driver = Net Earnings × 0.5
```

### Step 3: Online Settlement Adjustment
When online amounts are credited to owner but belong to driver:
```
Owner After Online = Base Owner - Online Amount to Driver
Driver After Online = Base Driver + Online Amount to Driver
```

### Step 4: Driver Pass (if purchased)
Driver pass is split 50-50 between owner and driver:
```
Owner Pass Contribution = Driver Pass Amount × 0.5
Driver Pass Contribution = Driver Pass Amount × 0.5
```

### Step 5: Final Earnings
```
Final Owner Earnings = Owner After Online - Owner Pass Contribution
Final Driver Earnings = Driver After Online - Driver Pass Contribution
```

### Step 6: KM Difference
```
KM Difference = KM End - KM Start
```

All calculations happen in real-time in the Add Entry form and are stored in Firestore.

## 🎨 Features in Detail

### Dashboard
- Today's summary cards including:
  - Gross Earnings
  - CNG Cost
  - Online Adjustments (to driver)
  - Driver Pass (50-50 split)
  - Final Owner Earnings
  - Final Driver Earnings
  - Trips and Hours
- Interactive bar chart showing last 7 days' gross earnings
- Quick "Add Entry" button

### Add Entry
- Form with all required fields:
  - Date, Gross Earnings, CNG
  - Online Amount to Driver (optional)
  - Driver Pass (checkbox + amount, optional)
  - Trips, Hours Worked
  - KM Start/End, Notes
- Live calculation preview panel showing:
  - Net Earnings
  - Base 50-50 split
  - Online settlement effects
  - Driver pass contributions
  - Final owner and driver earnings
- Auto-calculates all derived fields
- Supports editing existing entries

### Entries List
- Table view of all entries with columns:
  - Date, Gross, CNG, Online Adjust., Net, Owner, Driver, Pass, Trips, Hours
- Sort by: Date, Highest Earnings, Highest Trips, Most Hours
- Edit and Delete functionality
- Responsive table design

### Monthly Summary
- Month selector
- Total statistics for the month including:
  - Total Gross Earnings
  - Total CNG Paid
  - Total Online Settlements
  - Total Driver Pass (with 50-50 split info)
  - Total Net Earnings
  - Total Owner Earnings
  - Total Driver Earnings
  - Total Trips and Hours
  - Average daily gross
- Daily earnings chart for the entire month

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

