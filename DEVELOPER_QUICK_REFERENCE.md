# Apna PG - Firebase Developer Quick Reference

Quick lookup for common tasks while developing.

---

## Authentication

### Check if User is Logged In
```javascript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { isAuthenticated, userProfile, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated()) return <p>Please login</p>;
  
  return <p>Welcome {userProfile?.name}</p>;
}
```

### Get Current User
```javascript
const { user, userProfile } = useAuth();
// user = Firebase Auth user (email, uid)
// userProfile = Firestore data (name, role, gender)
```

### Signup User
```javascript
const { register } = useAuth();

const result = await register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'secure123',
  role: 'User', // or 'Owner'
  gender: 'Male',
  emergencyContact: '+919876543210'
});

if (result.success) {
  console.log('User created:', result.profile);
}
```

### Login User
```javascript
const { login } = useAuth();

const result = await login('john@example.com', 'secure123');
if (result.success) {
  console.log('Logged in');
}
```

### Logout User
```javascript
const { logout } = useAuth();
await logout();
// User cleared, redirects to home
```

### Check User Role
```javascript
const { userProfile, hasRole } = useAuth();

if (hasRole('Owner')) {
  // Show owner features
}

// OR
if (userProfile?.role === 'User') {
  // Show user features
}
```

---

## Real-time Data Subscription

### Get All PGs (Real-time)
```javascript
import { usePGs } from '@/hooks/useFirestore';

function BrowsePage() {
  const { pgs, loading } = usePGs();
  // Auto-updates when data changes
  
  return (
    <div>
      {pgs.map(pg => <PGCard key={pg.pgId} pg={pg} />)}
    </div>
  );
}
```

### Get Rooms for a PG (Real-time)
```javascript
import { usePGRooms } from '@/hooks/useFirestore';

function PGDetailsPage({ pgId }) {
  const { rooms, loading } = usePGRooms(pgId);
  
  return (
    <div>
      {rooms.map(room => <RoomCard key={room.roomId} room={room} />)}
    </div>
  );
}
```

### Get Reviews for a PG (Real-time)
```javascript
import { usePGReviews } from '@/hooks/useFirestore';

function ReviewsSection({ pgId }) {
  const { reviews, loading } = usePGReviews(pgId);
  
  return (
    <div>
      {reviews.map(r => <ReviewCard key={r.reviewId} review={r} />)}
    </div>
  );
}
```

### Get User's Bookings (Real-time)
```javascript
import { useUserBookings } from '@/hooks/useFirestore';
import { useAuth } from '@/context/AuthContext';

function MyBookingsPage() {
  const { user } = useAuth();
  const { bookings, loading } = useUserBookings(user?.uid);
  
  return (
    <div>
      {bookings.map(b => <BookingCard key={b.bookingId} booking={b} />)}
    </div>
  );
}
```

### Get Owner's Bookings (Real-time)
```javascript
import { useOwnerBookings } from '@/hooks/useFirestore';

function OwnerBookingsPage({ ownerId }) {
  const { bookings, loading } = useOwnerBookings(ownerId);
  
  return (
    <div>
      {bookings.map(b => <BookingCard key={b.bookingId} booking={b} />)}
    </div>
  );
}
```

---

## Create/Update/Delete Data

### Create PG
```javascript
import { pgService } from '@/services/firestore';
import { useAuth } from '@/context/AuthContext';

function CreatePGForm() {
  const { user } = useAuth();
  
  const handleCreate = async (formData) => {
    try {
      await pgService.createPG({
        title: formData.title,
        location: formData.location,
        genderAllowed: formData.gender,
        pricePerMonth: formData.price,
        pricePerDay: formData.priceDay,
        amenities: ['WiFi', 'AC'],
        oneDayStayAllowed: true
      }, user.uid);
      
      alert('PG created!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };
}
```

### Update PG
```javascript
await pgService.updatePG('pg123', {
  title: 'Updated Title',
  pricePerMonth: 12000
});
```

### Delete PG
```javascript
await pgService.deletePG('pg123');
// Only owner can delete
```

### Create Room
```javascript
await roomService.createRoom({
  sharingType: '2-sharing',
  totalBeds: 2,
  availableBeds: 1,
  roomType: 'AC',
  price: 5000
}, 'pg123'); // pgId
```

### Update Room
```javascript
await roomService.updateRoom('room123', {
  availableBeds: 0
});
```

### Create Booking
```javascript
import { bookingService } from '@/services/firestore';

await bookingService.createBooking({
  userId: user.uid,
  pgId: 'pg123',
  roomId: 'room123',
  ownerId: 'owner123',
  stayType: 'monthly', // or 'daily'
  bookingDate: '2024-02-18',
  checkInDate: '2024-02-20',
  checkOutDate: '2024-03-20',
  totalPrice: 50000,
  status: 'pending'
});
```

### Update Booking Status
```javascript
// Owner approves
await bookingService.updateBookingStatus('booking123', 'approved');

// User cancels
await bookingService.cancelBooking('booking123', 'Cannot make it');
```

### Create Review
```javascript
await reviewService.createReview({
  userId: user.uid,
  pgId: 'pg123',
  bookingId: 'booking123',
  rating: 4, // 1-5
  comment: 'Great PG!'
});
```

### Update Review
```javascript
await reviewService.updateReview('review123', {
  rating: 5,
  comment: 'Amazing!'
});
```

### Delete Review
```javascript
await reviewService.deleteReview('review123');
```

---

## Protected Routes

### Single Role Protection
```javascript
import ProtectedRoute from '@/pages/ProtectedRoute';
import MyComponent from '@/pages/MyComponent';

<Route
  path="/my-bookings"
  element={
    <ProtectedRoute requiredRole="User">
      <MyComponent />
    </ProtectedRoute>
  }
/>
```

### Manual Auth Check
```javascript
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

function OwnerOnlyPage() {
  const { userProfile, isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated()) return <Navigate to="/login" />;
  if (userProfile?.role !== 'Owner') return <Navigate to="/" />;

  return <div>Owner Dashboard</div>;
}
```

---

## Error Handling

### Try-Catch Pattern
```javascript
async function handleSubmit() {
  try {
    const result = await register(data);
    if (result.success) {
      console.log('Success!');
    } else {
      setError(result.error);
    }
  } catch (error) {
    setError(error.message);
  }
}
```

### Common Firebase Errors
```javascript
// Email already exists
"auth/email-already-in-use"

// Wrong password
"auth/wrong-password"

// User not found
"auth/user-not-found"

// Weak password
"auth/weak-password"

// Permission denied
"permission-denied"
```

---

## Firestore Queries

### Manual Query (One-time Fetch)
```javascript
import { pgService } from '@/services/firestore';

// Get single PG
const pg = await pgService.getPG('pg123');

// Get owner's PGs
const ownerPGs = await pgService.getOwnerPGs('owner123');

// Get PGs by gender
const boysPGs = await pgService.getPGsByGender('boys');
```

### Subscribe to Real-time Changes
```javascript
// Use hooks (easier)
const { pgs, loading } = usePGs();

// OR manually subscribe
useEffect(() => {
  const unsubscribe = pgService.subscribeAllPGs((pgs) => {
    setPGs(pgs);
  });
  
  // Cleanup on unmount
  return () => unsubscribe();
}, []);
```

---

## Page Templates

### User Dashboard Template
```javascript
import { useAuth } from '@/context/AuthContext';
import { useUserBookings } from '@/hooks/useFirestore';
import ProtectedRoute from '@/pages/ProtectedRoute';

function UserDashboard() {
  const { user, userProfile } = useAuth();
  const { bookings, loading } = useUserBookings(user?.uid);

  return (
    <ProtectedRoute requiredRole="User">
      <div className="container mx-auto p-4">
        <h1>Welcome {userProfile?.name}</h1>
        
        <section>
          <h2>Your Bookings</h2>
          {loading ? (
            <p>Loading...</p>
          ) : bookings.length > 0 ? (
            bookings.map(b => (
              <div key={b.bookingId}>
                <p>Status: {b.status}</p>
                <p>Check-in: {b.checkInDate}</p>
              </div>
            ))
          ) : (
            <p>No bookings yet</p>
          )}
        </section>
      </div>
    </ProtectedRoute>
  );
}
```

### Owner Dashboard Template
```javascript
import { useAuth } from '@/context/AuthContext';
import { useOwnerBookings } from '@/hooks/useFirestore';
import { pgService } from '@/services/firestore';
import ProtectedRoute from '@/pages/ProtectedRoute';

function OwnerDashboard() {
  const { user, userProfile } = useAuth();
  const { bookings, loading } = useOwnerBookings(user?.uid);
  const [pgs, setPGs] = useState([]);

  useEffect(() => {
    pgService.getOwnerPGs(user.uid).then(setPGs);
  }, [user.uid]);

  return (
    <ProtectedRoute requiredRole="Owner">
      <div className="container mx-auto p-4">
        <h1>{userProfile?.name}'s Properties</h1>
        
        <section>
          <h2>Your PGs ({pgs.length})</h2>
          {pgs.map(pg => (
            <div key={pg.pgId}>{pg.title}</div>
          ))}
        </section>

        <section>
          <h2>Bookings</h2>
          {bookings.map(b => (
            <div key={b.bookingId}>
              Status: {b.status}
              <button onClick={() => 
                bookingService.updateBookingStatus(b.bookingId, 'approved')
              }>Approve</button>
            </div>
          ))}
        </section>
      </div>
    </ProtectedRoute>
  );
}
```

---

## Debugging Tips

### Check Auth State
```javascript
import { auth } from '@/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

onAuthStateChanged(auth, user => {
  console.log('Auth state:', user);
});
```

### Check Firestore Data
```
Firebase Console → Firestore → Data
→ Inspect collections and documents
```

### Check Security Rules Errors
```
Browser Console:
→ Network tab → Firestore requests
→ Look for permission-denied errors
→ Fix rules in Firebase Console
```

### Monitor Real-time Listeners
```javascript
// In browser DevTools Network tab, look for:
// batch requests to firestore.googleapis.com
// Shows real-time connection active
```

---

## Performance Tips

### 1. Use Hooks Instead of Manual Subscriptions
```javascript
// GOOD ✅
const { pgs } = usePGs();

// AVOID ❌
useEffect(() => {
  pgService.subscribeAllPGs(setPGs);
}, []);
```

### 2. Unsubscribe on Cleanup
```javascript
// GOOD ✅
useEffect(() => {
  const unsub = pgService.subscribePGs(callback);
  return () => unsub(); // Cleanup
}, []);
```

### 3. Don't Fetch Unnecessarily
```javascript
// GOOD ✅
const pgs = usePGs(); // Real-time, once

// AVOID ❌
useEffect(() => {
  async function fetch() {
    const p = await pgService.getAllPGs();
    setPGs(p);
  }
  // Called every time, inefficient
}, []);
```

### 4. Limit Query Results
```javascript
// Query with limit (future optimization)
// For now, limit client-side
const limited = pgs.slice(0, 10);
```

---

## Security Checklist

- [ ] Never store passwords in Firestore
- [ ] Never expose Firebase credentials (use .env.local)
- [ ] Use .gitignore to hide .env.local
- [ ] Validate user role before sensitive operations
- [ ] Check Firestore rules allow access
- [ ] Use UID to reference users, not email
- [ ] Always use secure password in production

---

## Common File Imports

```javascript
// Auth
import { useAuth } from '@/context/AuthContext';

// Real-time data
import { usePGs, usePGRooms, useUserBookings } from '@/hooks/useFirestore';

// Firestore services
import { 
  pgService, 
  roomService, 
  bookingService, 
  reviewService, 
  userService 
} from '@/services/firestore';

// Firebase config
import { auth, db } from '@/config/firebase';

// Protected routes
import ProtectedRoute from '@/pages/ProtectedRoute';
```

---

## Environment Variables

```bash
# .env.local cheat sheet
VITE_FIREBASE_API_KEY         # From Firebase Console
VITE_FIREBASE_AUTH_DOMAIN     # your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID      # your-project
VITE_FIREBASE_STORAGE_BUCKET  # your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID # Numbers
VITE_FIREBASE_APP_ID          # 1:numbers:web:hash
```

---

## Database Collection IDs (Firestore)

- `users/{uid}` - User profiles
- `pgs/{pgId}` - PG listings
- `pgs/{pgId}/rooms/{roomId}` - Rooms (subcollection)
- `bookings/{bookingId}` - Bookings
- `reviews/{reviewId}` - Reviews

---

## Need Help?

1. Check browser console for errors (F12)
2. Check Firestore Console → Data for structure
3. Check security rules are published
4. Test credentials in .env.local
5. See FIREBASE_IMPLEMENTATION.md for detailed examples
6. Firebase Docs: https://firebase.google.com/docs

---

Keep this handy while developing! 🚀
