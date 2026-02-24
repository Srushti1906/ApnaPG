# Apna PG - Firebase Implementation Guide

## 🔥 Complete Architecture Change: MongoDB → Firebase

This document explains the complete Firebase implementation for Apna PG.

---

## 📋 What Changed

### Before (MongoDB + Express)
```
Client → API Server → MongoDB
(JWT Auth)  (Node.js)
```

### After (Firebase)
```
Client → Firebase Auth
      → Firestore Database
      → Real-time Listeners
(No backend needed for auth/data)
```

### Benefits
✅ **No Backend Required** - Firebase handles auth & database
✅ **Real-time Updates** - Data syncs instantly across devices
✅ **Better Security** - Role-based rules at database level
✅ **Auto Scaling** - Firestore scales automatically
✅ **Free Tier** - 1GB storage + 50K auth users/month

---

## 🚀 Quick Start (5 Min Setup)

### 1. Firebase Project Setup
```bash
# Create Firebase Project at https://console.firebase.google.com
# Enable: Authentication (Email/Password) + Firestore
# Get credentials from: Project Settings > Web App
```

### 2. Environment Configuration
```bash
cd client
cp .env.local.example .env.local
# Edit .env.local with your Firebase credentials
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Deploy Security Rules
```
Firebase Console → Firestore → Rules
Copy content from firestore-rules.txt and Publish
```

### 5. Start Development
```bash
npm run dev
```

---

## 📁 New File Structure

```
client/src/
├── config/
│   └── firebase.js              ← Firebase initialization
├── context/
│   └── AuthContext.jsx          ← Auth state management
├── services/
│   ├── api.js                   ← (Can be removed - kept for future API)
│   ├── firestore.js             ← Firestore CRUD operations
│   └── index.js
├── hooks/
│   └── useFirestore.js          ← Real-time listener hooks
├── pages/
│   ├── Login.jsx                ← Updated for Firebase
│   ├── Register.jsx             ← Updated for Firebase
│   ├── ProtectedRoute.jsx       ← Updated for Firebase
│   ├── Home.jsx                 ← Needs PG listing update
│   ├── Browse.jsx               ← Needs PG browsing update
│   ├── PGDetails.jsx            ← Needs room/review update
│   └── MyBookings.jsx           ← Needs booking list update
└── components/
    ├── Navbar.jsx               ← Updated for Firebase
    └── AuthForms.jsx            ← Already compatible
```

---

## 🔐 Authentication Flow

### Signup
```
1. User fills form (name, email, password, role)
2. Firebase creates auth user (firebaseUser.uid)
3. Create profile in Firestore:
   users/{uid} = {
     name, email, role, gender, 
     emergencyContact, createdAt
   }
4. Auth state auto-updates
5. Redirect based on role
```

**Code:**
```javascript
import { useAuth } from '../context/AuthContext';

const { register } = useAuth();
const result = await register({
  name: 'John',
  email: 'john@example.com',
  password: 'secure123',
  role: 'User',
  gender: 'Male',
  emergencyContact: '+919876543210'
});
```

### Login
```
1. Firebase authenticates email + password
2. onAuthStateChanged triggers
3. Fetch user profile from Firestore
4. Redirect based on role
```

**Code:**
```javascript
const { login } = useAuth();
const result = await login('john@example.com', 'secure123');
```

### Logout
```
1. Firebase signs out user
2. Clear auth state
3. Redirect to home
```

**Code:**
```javascript
const { logout } = useAuth();
await logout();
```

### Check Authentication
```javascript
const { isAuthenticated, userProfile } = useAuth();

if (isAuthenticated()) {
  console.log('User role:', userProfile?.role);
}
```

---

## 🗄️ Firestore Database Structure

### Collections

#### `users/`
```
{
  uid: "user123",
  name: "John Doe",
  email: "john@example.com",
  gender: "Male",
  role: "User", // or "Owner"
  emergencyContact: "+919876543210",
  createdAt: "2024-02-18T...",
  updatedAt: "2024-02-18T..."
}
```

#### `pgs/`
```
{
  pgId: auto-generated,
  ownerId: "owner123",
  title: "Cozy PG in Delhi",
  genderAllowed: "boys", // boys, girls, family
  pricePerDay: 500,
  pricePerMonth: 10000,
  amenities: ["WiFi", "AC", "Food"],
  location: "Delhi, India",
  oneDayStayAllowed: true,
  createdAt: "2024-02-18T..."
}
```

#### `pgs/{pgId}/rooms/`
```
{
  roomId: auto-generated,
  pgId: "pg123",
  sharingType: "2-sharing", // 1, 2, 3-sharing, etc.
  totalBeds: 2,
  availableBeds: 1,
  roomType: "AC", // AC, Non-AC
  price: 5000
}
```

#### `bookings/`
```
{
  bookingId: auto-generated,
  userId: "user123",
  pgId: "pg123",
  roomId: "room123",
  ownerId: "owner123",
  stayType: "monthly", // daily or monthly
  bookingDate: "2024-02-18",
  checkInDate: "2024-02-20",
  checkOutDate: "2024-03-20",
  status: "pending", // pending, approved, rejected, cancelled
  totalPrice: 15000,
  createdAt: "2024-02-18T..."
}
```

#### `reviews/`
```
{
  reviewId: auto-generated,
  userId: "user123",
  pgId: "pg123",
  bookingId: "booking123",
  rating: 4, // 1-5
  comment: "Great PG!",
  createdAt: "2024-02-18T..."
}
```

---

## 📚 Usage Examples

### Get All PGs (Real-time)
```javascript
import { usePGs } from '../hooks/useFirestore';

function BrowsePage() {
  const { pgs, loading } = usePGs();
  
  return (
    <div>
      {loading ? <p>Loading...</p> : 
        pgs.map(pg => <PGCard key={pg.pgId} pg={pg} />)
      }
    </div>
  );
}
```

### Get PG Rooms (Real-time)
```javascript
import { usePGRooms } from '../hooks/useFirestore';

function PGDetailsPage({ pgId }) {
  const { rooms, loading } = usePGRooms(pgId);
  
  return (
    <div>
      {rooms.map(room => <RoomCard key={room.roomId} room={room} />)}
    </div>
  );
}
```

### Create Booking
```javascript
import { bookingService } from '../services/firestore';
import { useAuth } from '../context/AuthContext';

function BookingForm({ pgId, roomId }) {
  const { user, userProfile } = useAuth();
  
  async function handleBook() {
    await bookingService.createBooking({
      userId: user.uid,
      pgId,
      roomId,
      stayType: 'monthly',
      checkInDate: '2024-02-20',
      checkOutDate: '2024-03-20',
      totalPrice: 15000
    });
  }
  
  return <button onClick={handleBook}>Book Now</button>;
}
```

### Get User Bookings (Real-time)
```javascript
import { useUserBookings } from '../hooks/useFirestore';
import { useAuth } from '../context/AuthContext';

function MyBookingsPage() {
  const { user } = useAuth();
  const { bookings, loading } = useUserBookings(user?.uid);
  
  return (
    <div>
      {bookings.map(b => (
        <BookingCard 
          key={b.bookingId} 
          booking={b}
          status={b.status}
        />
      ))}
    </div>
  );
}
```

### Write Review
```javascript
import { reviewService } from '../services/firestore';

async function createReview(pgId, bookingId, rating, comment) {
  await reviewService.createReview({
    userId: user.uid,
    pgId,
    bookingId,
    rating, // 1-5
    comment
  });
}
```

---

## 🛡️ Security Rules Explained

### Rule: Users can only modify their own data
```javascript
allow update: if request.auth.uid == userId;
```

### Rule: Owners can only edit their PGs
```javascript
allow update: if resource.data.ownerId == request.auth.uid;
```

### Rule: Reviews need valid booking
```javascript
exists(/databases/$(database)/documents/bookings/$(bookingId))
```

### Rule: Gender restrictions enforced
```
Handled in app logic:
if (userGender != pgGenderAllowed) reject
```

---

## 🚨 Common Issues & Fixes

### "Authentication not working"
**Cause:** Email/Password auth not enabled
**Fix:**
```
Firebase Console → Authentication → Email/Password → Enable
```

### "Firestore writes failing"
**Cause:** Security rules blocking access
**Fix:**
```
1. Check .env.local has correct Firebase credentials
2. Verify Firestore Rules deployed
3. Check user role matches rule requirements
```

### "Real-time updates not working"
**Cause:** Listener not subscribed
**Fix:**
```javascript
// Use hook - it auto-subscribes
const { pgs } = usePGs();

// OR manually subscribe
useEffect(() => {
  const unsub = pgService.subscribeAllPGs(setPGs);
  return () => unsub();
}, []);
```

### "Can't create user during signup"
**Cause:** Firestore rule requires user to create own document
**Fix:** AuthContext already handles this:
```javascript
await setDoc(doc(db, 'users', firebaseUser.uid), profileData);
```

### "Old API still being called"
**Cause:** Components using old `authService`
**Fix:** Use `useAuth()` hook instead
```javascript
// OLD ❌
const response = await authService.login(email, password);

// NEW ✅
const { login } = useAuth();
await login(email, password);
```

---

## 📦 Deployment Checklist

### Pre-Deployment
- [ ] Firebase project created
- [ ] Email/Password auth enabled
- [ ] Firestore database created
- [ ] .env.local created with credentials
- [ ] Firestore security rules deployed
- [ ] `npm install` completed
- [ ] Test login/signup locally

### Build
```bash
npm run build
```

### Environments

**Development**
```bash
npm run dev
# Uses .env.local
```

**Production**
```bash
npm run build
# Create .env.production.local with production Firebase config
# (or same Firebase project)
```

### Hosting Options

**Option 1: Firebase Hosting** (Recommended)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Build folder: dist
firebase deploy
```

**Option 2: Vercel**
```bash
npm install -g vercel
vercel
```

**Option 3: Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Post-Deployment
- [ ] Test login/signup in production
- [ ] Verify real-time updates
- [ ] Check console for errors
- [ ] Monitor Firebase quota

---

## 🔄 Migration from MongoDB

If you have existing MongoDB data:

### Step 1: Export MongoDB
```bash
mongodump --db apna-pg --out ./mongo-backup
```

### Step 2: Transform Data Format
```javascript
// Example: Convert MongoDB user to Firestore format
const mongoUser = {
  _id: ObjectId("..."),
  fullName: "John",
  email: "john@example.com",
  role: "User"
};

const firestoreUser = {
  uid: mongoUser._id.toString(),
  name: mongoUser.fullName, // Field renamed
  email: mongoUser.email,
  role: mongoUser.role,
  createdAt: new Date().toISOString()
};
```

### Step 3: Import to Firestore
```javascript
// Use Firebase Admin SDK
const admin = require('firebase-admin');
const db = admin.firestore();

const users = require('./mongo-users.json');
for (const user of users) {
  await db.collection('users').doc(user.uid).set(user);
}
```

---

## 📞 Support

**Firebase Documentation:** https://firebase.google.com/docs
**Firestore Guide:** https://firebase.google.com/docs/firestore
**Authentication Guide:** https://firebase.google.com/docs/auth
**Pricing:** https://firebase.google.com/pricing

---

## 🎯 Next Steps

1. ✅ Set up Firebase (see FIREBASE_SETUP.md)
2. ✅ Deploy security rules
3. ✅ Update environment variables
4. ✅ Install dependencies (`npm install`)
5. ⬜ Update remaining pages (Browse, PGDetails, etc.)
6. ⬜ Create Owner dashboard
7. ⬜ Test all features
8. ⬜ Deploy to production

**Current Status:** Auth & Core infrastructure ✅ Complete
**Remaining:** Page-level integrations ⬜ Start here

---

## 📝 Notes

- All timestamps are ISO 8601 format
- UIDs match Firebase Auth UIDs
- Real-time listeners auto-cleanup on unmount
- Password hashing handled by Firebase Auth
- HTTPS enforced by Firebase
- All data encrypted in transit & at rest
