# Firebase Configuration

## Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Create a project" or use existing project
3. Enter project name: "apna-pg"
4. Accept Firebase terms
5. Click "Create project"

## Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Click **Email/Password** provider
4. Toggle **Enable**
5. Click **Save**

## Step 3: Create Firestore Database

1. Go to **Firestore Database** in Firebase Console
2. Click **Create database**
3. Choose **Start in production mode**
4. Select region: **asia-south1** (India) or your region
5. Click **Create**

## Step 4: Get Firebase Credentials

1. Go to **Project Settings** (⚙️ icon)
2. Click **Service accounts**
3. Select **Node.js** SDK
4. Click **Generate new private key**
5. Copy your Web App credentials (click Web icon)
6. Copy the config object

## Step 5: Create .env.local File

In `client/` directory, create `.env.local`:

```
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT_ID.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT_ID.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

Replace values with your actual Firebase config.

## Step 6: Deploy Firestore Security Rules

1. In Firebase Console, go to **Firestore Database → Rules**
2. Replace all with content from `firestore-rules.txt`
3. Click **Publish**

## Step 7: Create Firestore Indexes (Optional)

Firebase will prompt to create indexes automatically when needed.

## Step 8: Install Dependencies

```bash
cd client
npm install
```

## Step 9: Run Development Server

```bash
npm run dev
```

App will be running at http://localhost:5173

## Troubleshooting

**Login not working?**
- Check Firestore Rules are published
- Verify .env.local file loaded (restart dev server)
- Check browser console for errors

**Users not signing up?**
- Enable Email/Password in Authentication
- Check Firebase limits (free tier = 50K auth users/month)
- Verify privacy rules allow user creation

**Real-time updates not working?**
- Enable Firestore listeners (they start automatically)
- Check browser network tab for Firestore calls
- Verify Firestore Rules allow reads

**CORS or API errors?**
- This uses client-side Firebase SDK (no backend needed for auth)
- All data operations go directly to Firestore
- No CORS issues with Firebase

## Important: Database Migration

If you have existing MongoDB data:
1. Export MongoDB data
2. Import to Firestore using Firebase Admin SDK
3. Run migration script (see `migration/` folder if exists)

## Security Checklist

- [ ] Firestore Rules deployed
- [ ] Email/Password auth enabled
- [ ] .env.local created with credentials
- [ ] Firebase free tier limits understood
- [ ] Backups configured
- [ ] User data policy clear
