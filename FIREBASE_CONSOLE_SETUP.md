# Firebase Console Setup - Step-by-Step Guide

This guide walks you through setting up Firebase for Apna PG from scratch.

---

## Part 1: Create Firebase Project

### Step 1.1: Go to Firebase Console
1. Open https://console.firebase.google.com in browser
2. Google login (create account if needed)

### Step 1.2: Create New Project
1. Click **"Create a project"** button
2. Project name: `apna-pg`
3. Click **"Continue"**

### Step 1.3: Configure Settings
1. **Enable Google Analytics?** → NO (not needed for now)
2. Click **"Create project"**
3. Wait 1-2 minutes for project creation
4. Click **"Continue"** when ready

**Result:** You now have Firebase project `apna-pg`

---

## Part 2: Enable Email/Password Authentication

### Step 2.1: Go to Authentication
1. In Firebase Console, left sidebar
2. Click **"Build"** → **"Authentication"**
3. Click **"Get Started"** button

### Step 2.2: Enable Email/Password Provider
1. Look for **"Email/Password"** option
2. Click on it
3. Toggle **"Enable"** to ON
4. Click **"Save"**

### Step 2.3: Configure Settings
1. Leave defaults as-is
2. Providers tab shows "Email/Password: Enabled"

**Result:** Users can now signup with email/password

---

## Part 3: Create Firestore Database

### Step 3.1: Go to Firestore
1. Left sidebar → **"Build"** → **"Firestore Database"**
2. Click **"Create database"** button

### Step 3.2: Security Mode
1. Choose **"Start in production mode"**
   (We'll set proper rules manually)
2. Click **"Next"**

### Step 3.3: Select Region
1. Select **"asia-south1 (India - Mumbai)"**
   (Or closest to your users)
2. Click **"Create"**
3. Wait 1-2 minutes

**Result:** Firestore database created and ready

---

## Part 4: Register Web App & Get Credentials

### Step 4.1: Go to Project Settings
1. Top-left: click **⚙️ (Settings icon)**
2. Click **"Project settings"**

### Step 4.2: Add Web App
1. Look for **"Your apps"** section
2. Click **"</>  (Web icon)**
3. App nickname: `apna-pg-app`
4. Check **"Also set up Firebase Hosting"** → NO
5. Click **"Register app"**

### Step 4.3: Copy Firebase Config

You'll see code like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "apna-pg-xxxxx.firebaseapp.com",
  projectId: "apna-pg-xxxxx",
  storageBucket: "apna-pg-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef...",
};
```

**Copy these 6 values and paste in step below**

---

## Part 5: Configure Environment Variables

### Step 5.1: Create .env.local File

Navigate to your project folder:
```bash
cd c:\Users\user\Desktop\Apna PG\client
```

Create file `.env.local`:
```bash
# Right-click in folder → New → Text Document
# Rename to ".env.local" (not .txt)
```

### Step 5.2: Add Firebase Credentials

Copy-paste into `.env.local`:
```
VITE_FIREBASE_API_KEY=AIzaSyD...
VITE_FIREBASE_AUTH_DOMAIN=apna-pg-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=apna-pg-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=apna-pg-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef...
```

Replace with YOUR actual values from Firebase

### Step 5.3: Don't Commit This File

Add to `.gitignore`:
```bash
# Already in .gitignore, but verify:
.env.local
```

**Result:** Your app can now connect to Firebase

---

## Part 6: Deploy Firestore Security Rules

### Step 6.1: Go to Firestore Rules

1. Firebase Console
2. **"Firestore Database"** → **"Rules"** tab

### Step 6.2: Replace Default Rules

1. Select all text in editor (Ctrl+A)
2. Delete it
3. Copy entire content from file: `firestore-rules.txt`
4. Paste into editor

### Step 6.3: Publish Rules

1. Click **"Publish"** button
2. Confirm when prompted
3. Wait for "Rules updated" message

**Result:** Database is now secure with proper access control

---

## Part 7: (Optional) Create Composite Indexes

Firestore will auto-prompt when needed, but you can create manually:

### Step 7.1: Go to Indexes

1. **"Firestore Database"** → **"Indexes"** tab

### Step 7.2: Create Indexes

Firebase will suggest as you query. For now, skip this.
(They'll be created automatically)

---

## Part 8: Test Firebase Connection

### Step 8.1: Install Dependencies

```bash
cd c:\Users\user\Desktop\Apna PG\client
npm install
```

### Step 8.2: Start Dev Server

```bash
npm run dev
```

You'll see:
```
Local:   http://localhost:5173/
```

### Step 8.3: Test in Browser

1. Open http://localhost:5173
2. Click **"Register"**
3. Fill form with test data:
   - Name: Test User
   - Email: test@example.com
   - Password: Test123!
   - Gender: Male
   - Role: User
4. Click **"Register"**

### Step 8.4: Check Firebase Console

1. Go to Firestore → Data tab
2. Look for new `users` collection
3. Should see your test user with uid

**If it works:** ✅ Firebase is connected!
**If error:** Check console error + .env.local values

---

## Part 9: Test Login

### Step 9.1: Logout (if needed)

1. Click **"Logout"** in navbar

### Step 9.2: Go to Login Page

1. Click **"Login"** link
2. Enter email: test@example.com
3. Enter password: Test123!
4. Click **"Login"**

**Expected:** You get logged in, redirected to home

**If fails:**
- Check Firestore for user
- Check console errors
- Verify Email/Password auth enabled

---

## Part 10: Test RealTime Updates

### Step 10.1: Go to Browse Page

1. Click **"Browse PGs"**
2. Should see loading spinner briefly
3. Should show "No PGs available yet"

**This is normal** - No PGs created yet

---

## Part 11: Add Test Data (Optional)

### Step 11.1: Go to Firestore Console

1. Firebase Console → Firestore Database → Data
2. Click **"+ Start collection"**
3. Collection ID: `pgs`
4. Document ID: `pg1` (auto)

### Step 11.2: Add PG Fields

Create document with:
```json
{
  "title": "Cozy PG in Delhi",
  "ownerId": "[your-test-user-uid]",
  "location": "Delhi, India",
  "genderAllowed": "boys",
  "pricePerMonth": 10000,
  "pricePerDay": 500,
  "amenities": ["WiFi", "AC"],
  "oneDayStayAllowed": true,
  "createdAt": "2024-02-18T10:00:00Z"
}
```

### Step 11.3: Check Browse Page

1. Go back to Browse page
2. Refresh (Ctrl+R)
3. Should see your PG listed!

---

## Part 12: Verify Everything Works

Checklist:
- [ ] Can signup with new email
- [ ] User appears in Firestore
- [ ] Can login with credentials
- [ ] Navbar shows username when logged in
- [ ] Logout works
- [ ] Can view PGs on Browse page
- [ ] Real-time updates work
- [ ] No console errors

**If all green:** ✅ Ready to deploy!

---

## Troubleshooting

### "Firebase is not initialized"

**Cause:** .env.local not found
**Fix:**
1. Check file exists: `client/.env.local`
2. Has all 6 VITE_FIREBASE_* variables
3. Restart dev server: `npm run dev`

### "User not authenticated" on signup

**Cause:** Email/Password not enabled
**Fix:**
1. Go to Firebase Console
2. Authentication → Providers
3. Email/Password should show "Enabled"

### User created but doesn't appear in Firestore

**Cause:** Security rules blocking access
**Fix:**
1. Check rules are deployed (green checkmark)
2. User UID should match in rules
3. Check browser console for errors

### "Cannot create user - user already exists"

**Cause:** Email already used
**Fix:**
1. Use different email address
2. Or delete user from Firebase Authentication

### Firestore shows my test data, but Browse page empty

**Cause:** Real-time listener not subscribed
**Fix:**
1. Check browser console for errors
2. Verify Firestore Rules allow reads
3. Restart dev server

---

## What's Next?

After verifying everything works:

1. **Update remaining pages** (PGDetails, MyBookings, etc.)
2. **Add payment integration** (Razorpay/Stripe)
3. **Create Owner Dashboard**
4. **Deploy to production** (see DEPLOYMENT_CHECKLIST.md)

---

## Firebase Console Tips

- **Firestore Usage:** See real-time usage stats
- **Authentication:** Manage users, disable account
- **Rules:** Test mode shows warnings (use prod mode)
- **Backups:** Auto-enabled on Firestore
- **Security:** Everything encrypted end-to-end

---

## Common Discord Questions

**Q: Is Firebase free?**
A: Yes! Free tier includes 1GB storage + 50K auth users/month

**Q: Can I use my own database?**
A: Yes, but you'd need to rewrite all services (not recommended)

**Q: How do I migrate MongoDB to Firestore?**
A: See migration guide in FIREBASE_IMPLEMENTATION.md

**Q: Is real-time data syncing safe?**
A: Yes, completely. Firestore rules control who sees what.

**Q: Can I host backend separately?**
A: Yes, but not needed. Firebase does everything.

---

## Video Tutorial

For visual learners, see similar tutorials:
- YouTube: "Firebase Firestore Setup"
- Firebase Docs: https://firebase.google.com/docs/firestore/quickstart

---

**Done!** Your Firebase is configured. Now run `npm run dev` and start testing!

Any issues? Check Troubleshooting section above.
