# Quick Setup Guide

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Firebase Setup

1. **Create Firebase Project:**
   - Go to https://console.firebase.google.com/
   - Click "Add project"
   - Follow the setup wizard

2. **Enable Authentication:**
   - In Firebase Console, go to Authentication
   - Click "Get started"
   - Enable "Email/Password" sign-in method

3. **Create Firestore Database:**
   - Go to Firestore Database
   - Click "Create database"
   - Start in "test mode" (for development)
   - Choose a location

4. **Get Firebase Config:**
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps"
   - Click the web icon (`</>`)
   - Register app (nickname: "CabTrack Pro")
   - Copy the config values

5. **Create `.env` file:**
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

6. **Set Firestore Security Rules:**
   - Go to Firestore Database → Rules
   - Replace with:
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
   - Click "Publish"

## Step 3: Run the App
```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## Step 4: Create Your First Account
- Click "Sign up" on the login page
- Enter your email and password (min 6 characters)
- You'll be automatically logged in

## Step 5: Add Your First Entry
- Click "Add Entry" button
- Fill in the form
- Watch the live calculations update
- Click "Save Entry"

## 🚀 Deploy to Firebase Hosting

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login:**
   ```bash
   firebase login
   ```

3. **Initialize (if needed):**
   ```bash
   firebase init hosting
   ```
   - Select your project
   - Public directory: `dist`
   - Single-page app: Yes
   - Overwrite index.html: No

4. **Build and Deploy:**
   ```bash
   npm run build
   firebase deploy
   ```

Your app will be live at: `https://your-project-id.web.app`

## 📝 Notes

- **Firestore Indexes:** If you see an error about missing indexes when querying by date range, click the error link in the console to create the required index automatically.

- **Environment Variables:** Never commit your `.env` file to version control. It's already in `.gitignore`.

- **Production Rules:** Before going live, update Firestore security rules to be more restrictive if needed.

