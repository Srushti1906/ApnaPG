# 🏠 Apna PG - Smart PG & One-Day Stay Platform

A production-ready web platform for finding and booking PGs (Paying Guest accommodations) and one-day stays in India. Designed for students, teachers, and working professionals.

## 🚨 IMPORTANT: Authentication System (FIXED!)

**Status**: ✅ **FIXED - Registration Now Works!**

- **Previous Issue**: Firebase-based auth was failing with generic "Registration failed" error
- **Current Solution**: MongoDB + Express + JWT backend authentication
- **Real Error Messages**: Now shows specific validation errors
- **Security**: Industry-standard bcrypt password hashing

👉 **Quick Start**: Read [QUICK_START_AUTHENTICATION.md](QUICK_START_AUTHENTICATION.md) (5 minutes)
👉 **Full Guide**: Read [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md) (detailed info)
👉 **MongoDB Setup**: Read [MONGODB_SETUP.md](MONGODB_SETUP.md) (if you need MongoDB Atlas)

---

## ✨ Key Features

### Core Functionality
- ✅ **User Authentication** - Secure JWT-based auth with role-based access
- ✅ **PG Listings & Search** - Filter by location, budget, gender policy
- ✅ **Smart Booking System** - Daily and monthly bookings with gender validation
- ✅ **One-Day Stay** - Perfect for exams, temporary needs
- ✅ **Owner Dashboard** - Manage PGs, rooms, and bookings
- ✅ **Review & Ratings** - Verified reviews from actual bookers
- ✅ **Admin Panel** - Moderate PGs, reviews, and users
- ✅ **Payment Tracking** - Booking status and refund calculations
- ✅ **Emergency Contacts** - Safety-first approach

### Safety & Compliance
- 🔒 **Gender-Based Access Control** - No mixed-gender rooms (Indian cultural standard)
- 🛡️ **ID Verification** - Aadhaar/PAN/DL verification support
- ✅ **Verified PGs** - Admin verification before listing
- 🚫 **Fraud Prevention** - Double-booking prevention, fake listing detection
- 📋 **Audit Trail** - Complete booking and review history

---

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime
- **Express.js** - REST API Framework
- **MongoDB** - Database (using MongoDB Atlas - FREE)
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React 18** - UI Library
- **Vite** - Build tool
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - HTTP Client

### Deployment Ready
- **Backend**: Render, Railway, Heroku
- **Frontend**: Netlify, Vercel, AWS S3
- **Database**: MongoDB Atlas (FREE M0 tier)

---

## 📁 Project Structure

```
apna-pg/
├── server/
│   ├── models/                 # MongoDB Schemas
│   │   ├── User.js
│   │   ├── PG.js
│   │   ├── Room.js
│   │   ├── Booking.js
│   │   └── Review.js
│   ├── controllers/            # Business Logic
│   │   ├── authController.js
│   │   ├── pgController.js
│   │   ├── roomController.js
│   │   ├── bookingController.js
│   │   ├── reviewController.js
│   │   └── adminController.js
│   ├── routes/                 # API Endpoints
│   │   ├── authRoutes.js
│   │   ├── pgRoutes.js
│   │   ├── roomRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── adminRoutes.js
│   ├── middleware/             # Auth & Validation
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── tokenUtils.js
│   ├── config/
│   │   └── database.js
│   ├── server.js               # Entry Point
│   ├── package.json
│   └── .env.example
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Common.jsx
│   │   │   └── AuthForms.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Browse.jsx
│   │   │   ├── PGDetails.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── index.js
│   │   ├── hooks/
│   │   │   └── index.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── .env.example
│
├── API_DOCUMENTATION.md
├── DEPLOYMENT_GUIDE.md
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. **Clone and navigate**
```bash
cd server
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

4. **Start server**
```bash
npm run dev
```
Server runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to client**
```bash
cd ../client
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# VITE_API_URL is already set to http://localhost:5000/api
```

4. **Start development server**
```bash
npm run dev
```
Frontend runs on `http://localhost:3000`

---

## 📝 Core Rules Implementation

### 1. Gender-Based Access Control
```javascript
// Gender validation in booking creation
const isGenderCompatible = (userGender, policy) => {
  if (policy === 'Mixed') return true;
  if (policy === 'Boys' && userGender === 'Male') return true;
  if (policy === 'Girls' && userGender === 'Female') return true;
  if (policy === 'Family/Couple') return true;
  return false;
};

// Enforced in: bookingController.js - createBooking()
```

### 2. One-Day Stay Features
- Daily and monthly pricing per room
- Minimum/maximum stay days configurable
- ID verification required for one-day bookings
- Emergency contact verification

### 3. No Double Booking
- MongoDB query prevents overlapping bookings
- Real-time availability updates
- Automatic bed count management

### 4. Owner Full Control
- Only owner can modify their PGs and rooms
- Can enable/disable daily or monthly stays
- Can approve/reject bookings
- Can update room availability

---

## 🔑 Key API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### PGs & Rooms
- `GET /api/pgs` - Get all PGs with filters
- `GET /api/pgs/:id` - Get single PG details
- `POST /api/pgs` - Create PG (Owner only)
- `POST /api/rooms` - Create room (Owner only)

### Bookings
- `POST /api/bookings` - Create booking (with gender validation)
- `GET /api/bookings/user/bookings` - Get user bookings
- `GET /api/bookings/owner/bookings` - Get owner bookings
- `PUT /api/bookings/:id/approve` - Approve booking
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Reviews
- `POST /api/reviews` - Create review (verified bookers only)
- `GET /api/reviews/pg/:pgId` - Get PG reviews
- `PUT /api/reviews/:id/respond` - Owner response

### Admin
- `GET /api/admin/stats` - Platform statistics
- `PUT /api/admin/pgs/:id/verify` - Verify PG
- `PUT /api/admin/pgs/:id/block` - Block fake PG
- `PUT /api/admin/reviews/:id/approve` - Approve review

Full API documentation: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## 🗄️ Database Schemas

### User Schema
- Authentication (email, password, phone)
- Gender (used for booking validation)
- ID details (Aadhaar/PAN)
- Emergency contact
- Role (User, Owner, Admin)
- Booking history

### PG Schema
- Owner reference
- Location & coordinates (geospatial)
- Gender policy (Boys/Girls/Family/Mixed)
- Amenities & rules
- Verification status
- Average rating & review count
- Daily/monthly stay toggle

### Room Schema
- PG reference
- Bed configuration
- Daily & monthly pricing
- Availability tracking
- One-day stay settings
- Booking calendar

### Booking Schema
- User, PG, Room references
- Check-in/out dates
- Pricing & payment status
- Gender compatibility record
- ID verification status
- Approval workflow
- Refund calculation

### Review Schema
- PG & Booking references
- Individual ratings (cleanliness, amenities, safety, etc.)
- Overall rating
- Owner response capability
- Moderation status

---

## 🔐 Security Features

1. **Authentication**
   - JWT tokens with 7-day expiry
   - Secure password hashing (bcryptjs)
   - Automatic token refresh capability

2. **Authorization**
   - Role-based access control (User, Owner, Admin)
   - Route-level protection
   - Gender-based booking validation

3. **Data Protection**
   - Input sanitization
   - SQL/NoSQL injection prevention
   - CORS enabled
   - Environment variables for secrets

4. **Audit Trail**
   - Booking timestamps
   - Review moderation logs
   - Admin action tracking

---

## 📊 Database Indexes

For optimal performance:
```javascript
// User
email: unique
phone: indexed
role: indexed

// PG
owner: indexed
address.city: indexed
genderAllowed: indexed
isVerified: indexed
location: 2dsphere (geospatial)

// Room
pg: indexed
availability.vacantBeds: indexed
allowOneDayStay: indexed

// Booking
user, owner, pg, room: indexed
status, paymentStatus: indexed
checkInDate, checkOutDate: indexed

// Review
pg, user, booking: indexed
overallRating: indexed
createdAt: indexed
```

---

## 🧪 Testing

### Sample Test Data

**Create Test User (Role: User)**
```json
{
  "fullName": "Rahul Sharma",
  "email": "rahul@test.com",
  "password": "Test@1234",
  "phone": "9876543210",
  "gender": "Male",
  "role": "User"
}
```

**Create Test Owner**
```json
{
  "fullName": "Priya Patel",
  "email": "priya@test.com",
  "password": "Test@1234",
  "phone": "9876543211",
  "gender": "Female",
  "role": "Owner"
}
```

### Test Scenarios

1. **Gender Validation**: Book a "Girls Only" PG as a Male user → Should fail
2. **Double Booking**: Try to book same room for overlapping dates → Should fail
3. **Refund Calculation**: Cancel booking 7+ days before → Should get 80% refund
4. **Owner Verification**: Try to update other owner's PG → Should fail
5. **Review Permissions**: Try to review without booking → Should fail

---

## 📦 Deployment

### Backend Deployment (Render)

1. Push code to GitHub
2. Connect Render to GitHub
3. Set environment variables:
   ```
   PORT=5000
   MONGODB_URI=<your-atlas-uri>
   JWT_SECRET=<strong-secret>
   NODE_ENV=production
   ```
4. Deploy

### Frontend Deployment (Netlify)

1. Build the frontend:
   ```bash
   npm run build
   ```
2. Connect GitHub to Netlify
3. Set environment:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```
4. Deploy

Detailed guide: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## 🐛 Common Issues & Solutions

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MongoDB URI in .env
- Verify IP whitelist in MongoDB Atlas

### CORS Errors
- Frontend and Backend on different ports is normal
- Check `cors()` middleware in server.js
- Ensure proxy configured in vite.config.js

### Token Expired
- Tokens expire after 7 days
- Users need to login again
- Frontend automatically redirects to login

---

## 📚 Learning Resources

- Express.js: https://expressjs.com
- MongoDB: https://docs.mongodb.com
- React: https://react.dev
- JWT: https://jwt.io
- Tailwind CSS: https://tailwindcss.com

---

## 👥 Team & Contributing

This is a complete, production-ready application built for the hackathon.

---

## 📄 License

ISC License - Feel free to use for personal or commercial projects.

---

## 🎯 Future Enhancements

- [ ] Payment Gateway Integration (Razorpay/Stripe)
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Chat between owner and user
- [ ] Video tours of rooms
- [ ] Advanced search filters
- [ ] Map-based search
- [ ] Mobile app (React Native)
- [ ] Analytics dashboard
- [ ] Referral rewards

---

## 📞 Support

For issues or questions:
1. Check API documentation
2. Review error logs
3. Check database connections
4. Verify environment variables

---

**Happy Booking! 🎉**
