# 🏃 Quick Start Guide - Apna PG

## 5-Minute Setup

### Prerequisites
- Node.js v16+ installed
- MongoDB Atlas account OR local MongoDB
- 5 GB free disk space

---

## ⚡ Backend Setup (5 minutes)

```bash
# 1. Navigate to server
cd server

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Edit .env and add your MongoDB URI
# If using local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/apna-pg

# If using MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/apna-pg?retryWrites=true&w=majority

# 5. Start server
npm run dev

# ✅ Server running on http://localhost:5000
```

---

## ⚡ Frontend Setup (5 minutes)

```bash
# 1. In new terminal, navigate to client
cd client

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# ✅ Frontend running on http://localhost:3000
```

---

## 🧪 Test the Application

### 1. Create Account (User)
- Go to `http://localhost:3000`
- Click "Register"
- Fill form:
  - Role: "User (Looking for PG)"
  - Gender: Select any
  - All other fields required
- Click Register

### 2. Create Account (Owner)
- Register again with:
  - Role: "Owner (PG Manager)"
- Login with owner credentials

### 3. Login
- Go to `/login`
- Use your registered email/password
- You'll be logged in

### 4. Browse PGs
- Click "Browse PGs"
- See available PGs
- (Note: No PGs yet until owner creates them)

### 5. Create PG (as Owner)
- Note: Owner dashboard page not fully built, but API works
- Use Postman/API client to create PG:
  ```
  POST http://localhost:5000/api/pgs
  Authorization: Bearer <your_token>
  
  {
    "name": "Test Hostel",
    "description": "Test description",
    "address": {
      "street": "123 Main St",
      "city": "Delhi",
      "state": "Delhi",
      "zipCode": "110001"
    },
    "location": {
      "type": "Point",
      "coordinates": [77.1025, 28.7041]
    },
    "genderAllowed": "Boys",
    "amenities": {
      "wifi": true,
      "ac": false
    }
  }
  ```

### 6. Create Room (as Owner)
```
POST http://localhost:5000/api/rooms
Authorization: Bearer <your_token>

{
  "pg": "<pg_id_from_step_5>",
  "roomNumber": "101",
  "roomType": "Single",
  "bedCount": 1,
  "monthlyPrice": 8000,
  "dailyPrice": 500,
  "allowOneDayStay": true
}
```

### 7. Book Room (as User)
```
POST http://localhost:5000/api/bookings
Authorization: Bearer <user_token>

{
  "roomId": "<room_id>",
  "checkInDate": "2024-03-01",
  "checkOutDate": "2024-03-02",
  "bookingType": "Daily"
}
```

### 8. Test Gender Validation
- Create "Girls Only" PG
- Try to book as Male user
- ✅ Should fail with: "This PG is for Girls only"

---

## 🛠️ Development Commands

### Backend
```bash
npm run dev     # Start with nodemon (auto-reload)
npm start       # Start normally
npm test        # Run tests (when configured)
```

### Frontend
```bash
npm run dev     # Start Vite dev server
npm run build   # Build for production
npm run preview # Preview production build
npm run lint    # Lint code
```

---

## 🔑 Test Credentials

### Test User Account
```
Email: testuser@example.com
Password: TestUser123
Role: User
Gender: Male
```

### Test Owner Account
```
Email: testowner@example.com
Password: TestOwner123
Role: Owner
Gender: Female
```

---

## 📚 File Locations

### Backend Entry Point
- `server/server.js` - Start here

### Frontend Entry Point
- `client/src/App.jsx` - Main component
- `client/src/main.jsx` - React entry
- `client/index.html` - HTML template

### API Documentation
- `API_DOCUMENTATION.md` - Complete API reference
- `DEPLOYMENT_GUIDE.md` - Deploy to production
- `README.md` - Full documentation
- `PROJECT_COMPLETION_SUMMARY.md` - Project overview

---

## 🐛 Troubleshooting

### Port 5000 Already in Use (Windows)
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Port 3000 Already in Use (Windows)
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### MongoDB Connection Failed
1. Check `.env` MongoDB URI
2. Verify MongoDB is running (if local)
3. Check MongoDB Atlas IP whitelist
4. Verify username/password

### CORS Errors
- Frontend and backend on different ports is normal
- CORS already configured in server.js
- If still failing, check Axios proxy in vite.config.js

### Token Expired
- Tokens expire after 7 days
- Login again to get new token
- Frontend auto-redirects to login

---

## 🔄 Common Workflows

### Create Booking (Complete Flow)
```
1. Register as User (note gender)
2. Register as Owner (different email)
3. Owner creates PG with specific gender policy
4. Owner creates Room in that PG
5. User browses and sees PG
6. User books room
7. System validates gender compatibility
8. Owner approves booking
9. Booking status changes to Confirmed
```

### Test Gender Validation
```
1. Create "Girls Only" PG as Owner
2. Login as Male User
3. Try to book room in that PG
4. ✅ Should get error: "This PG is for Girls only"
```

### Test One-Day Stay
```
1. Owner creates room with allowOneDayStay: true
2. User books for 1 night (checkOut same day + 1)
3. Booking created with bookingType: "Daily"
4. Price = dailyPrice * 1
```

### Test Double-Booking Prevention
```
1. Create booking for Jan 1-5
2. Try to create another booking for Jan 3-7 (overlaps)
3. ✅ Should fail: "Room is already booked"
```

---

## 📊 Test Data Structure

### User
- fullName: string (required)
- email: string (unique, required)
- password: string (min 6 chars, required)
- phone: string (10 digits, required)
- gender: "Male" | "Female" | "Other" (required)
- role: "User" | "Owner" (default: "User")

### PG
- name: string (required)
- address: object (required)
- genderAllowed: "Boys" | "Girls" | "Mixed" | "Family/Couple"
- amenities: object
- allowsDailyStay: boolean

### Room
- roomNumber: string
- roomType: "Single" | "Double" | "Triple" | "Dormitory"
- bedCount: number
- monthlyPrice: number
- dailyPrice: number
- allowOneDayStay: boolean

### Booking
- checkInDate: ISO date string
- checkOutDate: ISO date string
- bookingType: "Daily" | "Monthly"
- status: "Pending" | "Confirmed" | "CheckedIn" | "Completed" | "Cancelled"

---

## 🚀 Deployment Checklist

### Before Deploying
- [ ] All tests passing
- [ ] No console errors
- [ ] Environment variables configured
- [ ] MongoDB connection working
- [ ] API endpoints tested
- [ ] Frontend pages loading
- [ ] Forms validating
- [ ] Authentication working

### Deploy Backend
- [ ] Push to GitHub
- [ ] Connect Render
- [ ] Set environment variables
- [ ] Deploy
- [ ] Test `/api/health` endpoint

### Deploy Frontend
- [ ] Run `npm run build`
- [ ] Check `dist/` folder created
- [ ] Update `VITE_API_URL` to production backend
- [ ] Deploy to Netlify
- [ ] Test all pages loading

See `DEPLOYMENT_GUIDE.md` for detailed steps.

---

## 🎯 Features to Test

### Must Test
- ✅ User registration
- ✅ User login
- ✅ PG browsing
- ✅ Gender validation
- ✅ Booking creation
- ✅ Double-booking prevention
- ✅ Cancellation
- ✅ Review creation

### Nice to Test
- ⭐ PG filtering
- ⭐ One-day stay
- ⭐ Refund calculation
- ⭐ Owner approval workflow
- ⭐ Review approval
- ⭐ Admin stats

---

## 📞 Quick Links

- **API Base**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health
- **Frontend**: http://localhost:3000
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
- **Render**: https://render.com
- **Netlify**: https://netlify.com

---

## 🎓 Learning Points

This codebase demonstrates:
- ✅ Full-stack MERN development
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Database modeling
- ✅ RESTful API design
- ✅ React hooks and routing
- ✅ Tailwind CSS styling
- ✅ Production deployment
- ✅ Error handling
- ✅ Input validation

---

## ⏱️ Expected Timings

- Setup Backend: 2 minutes
- Setup Frontend: 2 minutes
- First test user: 1 minute
- Create PG + Room: 2 minutes
- Book room: 1 minute
- **Total: 8 minutes**

---

## ✅ You're Ready!

Everything is set up and ready to go. Start building! 🚀

Questions? Check the full documentation files included in the project.

---

*Happy Development! 💻*
