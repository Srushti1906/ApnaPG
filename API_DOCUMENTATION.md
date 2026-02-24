# API Documentation for Apna PG

## Base URL
- Development: `http://localhost:5000/api`
- Production: Will be deployed on Render/Railway

## Authentication
All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## 1. AUTHENTICATION ENDPOINTS

### Register User
**POST** `/auth/register`
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "confirmPassword": "Password123",
  "phone": "9876543210",
  "gender": "Male",
  "role": "User" // or "Owner"
}
```

### Login
**POST** `/auth/login`
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

### Get Current User
**GET** `/auth/me` (Protected)
Returns: User object

### Update Profile
**PUT** `/auth/profile` (Protected)
```json
{
  "fullName": "Jane Doe",
  "phone": "9876543210",
  "city": "Delhi",
  "state": "Delhi",
  "idNumber": "XXXXXXXX1234",
  "idType": "Aadhaar",
  "emergencyContact": {
    "name": "Emergency Name",
    "phone": "9876543210",
    "relation": "Parent"
  }
}
```

---

## 2. PG ENDPOINTS

### Get All PGs (with filters)
**GET** `/pgs?city=Delhi&gender=Boys&budget=5000&page=1&limit=10`
Returns: Array of verified PGs

### Get Single PG
**GET** `/pgs/:id`
Returns: PG details with rooms

### Create PG
**POST** `/pgs` (Protected - Owner only)
```json
{
  "name": "XYZ Hostel",
  "description": "Affordable hostel near Delhi University",
  "address": {
    "street": "123 Main St",
    "city": "Delhi",
    "state": "Delhi",
    "zipCode": "110001",
    "landmark": "Near Metro"
  },
  "location": {
    "type": "Point",
    "coordinates": [77.1025, 28.7041]
  },
  "genderAllowed": "Boys",
  "nearbyCollege": ["Delhi University"],
  "amenities": {
    "wifi": true,
    "ac": false,
    "attachedBathroom": false
  },
  "allowsDailyStay": true,
  "allowsMonthlyStay": true,
  "securityDepositPercentage": 10
}
```

### Update PG
**PUT** `/pgs/:id` (Protected - Owner only)

### Delete PG
**DELETE** `/pgs/:id` (Protected - Owner only)

### Get Rooms in PG
**GET** `/pgs/:pgId/rooms`

---

## 3. ROOM ENDPOINTS

### Get Room Details
**GET** `/rooms/:id`

### Create Room
**POST** `/rooms` (Protected - Owner only)
```json
{
  "pg": "63f1d2c3e4b5a6f7g8h9i0j",
  "roomNumber": "101",
  "roomType": "Single",
  "bedCount": 1,
  "monthlyPrice": 8000,
  "dailyPrice": 500,
  "allowOneDayStay": true,
  "minStayDays": 1,
  "maxStayDays": 30,
  "amenities": {
    "ac": false,
    "attachedBathroom": true
  }
}
```

### Update Room
**PUT** `/rooms/:id` (Protected - Owner only)

### Delete Room
**DELETE** `/rooms/:id` (Protected - Owner only)

### Update Availability
**PUT** `/rooms/:id/availability` (Protected - Owner only)
```json
{
  "vacantBeds": 2,
  "nextAvailableDate": "2024-03-01"
}
```

---

## 4. BOOKING ENDPOINTS

### Create Booking
**POST** `/bookings` (Protected - Gender validation enforced)
```json
{
  "roomId": "63f1d2c3e4b5a6f7g8h9i0j",
  "checkInDate": "2024-03-01",
  "checkOutDate": "2024-03-02",
  "bookingType": "Daily",
  "idProof": "proof_url",
  "specialRequests": "Please provide extra pillows"
}
```

### Get User Bookings
**GET** `/bookings/user/bookings?status=Confirmed&page=1` (Protected)

### Get Owner Bookings
**GET** `/bookings/owner/bookings?status=Pending&page=1` (Protected - Owner only)

### Get Booking Details
**GET** `/bookings/:id` (Protected)

### Approve Booking
**PUT** `/bookings/:id/approve` (Protected - Owner only)

### Reject Booking
**PUT** `/bookings/:id/reject` (Protected - Owner only)
```json
{
  "rejectionReason": "Room not available"
}
```

### Cancel Booking
**PUT** `/bookings/:id/cancel` (Protected - User only)
```json
{
  "cancellationReason": "Change of plans"
}
```

---

## 5. REVIEW ENDPOINTS

### Create Review
**POST** `/reviews` (Protected - Only booked users)
```json
{
  "pgId": "63f1d2c3e4b5a6f7g8h9i0j",
  "bookingId": "63f1d2c3e4b5a6f7g8h9i0j",
  "title": "Great experience!",
  "comment": "Very clean and helpful owner",
  "ratings": {
    "cleanliness": 5,
    "amenities": 4,
    "ownerBehavior": 5,
    "valueForMoney": 4,
    "safety": 5
  },
  "overallRating": 5
}
```

### Get PG Reviews
**GET** `/reviews/pg/:pgId?page=1&limit=5`
Returns: Paginated approved reviews

### Update Review
**PUT** `/reviews/:id` (Protected - Reviewer only)

### Delete Review
**DELETE** `/reviews/:id` (Protected)

### Owner Response to Review
**PUT** `/reviews/:id/respond` (Protected - Owner only)
```json
{
  "comment": "Thank you for your feedback!"
}
```

---

## 6. ADMIN ENDPOINTS

All admin endpoints require `role: 'Admin'`

### Get Platform Stats
**GET** `/admin/stats`
Returns: User count, PG count, booking stats, revenue

### Get Pending PGs
**GET** `/admin/pgs/pending?page=1&limit=10`

### Verify PG
**PUT** `/admin/pgs/:id/verify`

### Block PG
**PUT** `/admin/pgs/:id/block`
```json
{
  "reason": "Fake listing"
}
```

### Unblock PG
**PUT** `/admin/pgs/:id/unblock`

### Get Pending Reviews
**GET** `/admin/reviews/pending?page=1&limit=10`

### Approve Review
**PUT** `/admin/reviews/:id/approve`

### Reject Review
**PUT** `/admin/reviews/:id/reject`

### Get All Users
**GET** `/admin/users?role=Owner&page=1&limit=10`

### Deactivate User
**PUT** `/admin/users/:id/deactivate`

---

## CORE FEATURES IMPLEMENTED

### 🔒 Gender-Based Access Control
- Gender validation happens at booking creation
- Core rule enforced: No mixed-gender room sharing
- Automatic rejection if gender doesn't match PG policy

### 💰 One-Day Stay System
- Separate daily and monthly pricing per room
- Owners can enable/disable one-day stays
- Full ID verification support

### 📅 Booking Management
- Double-booking prevention
- Payment status tracking
- Refund calculation based on cancellation timing
- Owner approval workflow

### ⭐ Review System
- Only verified bookers can review
- Detailed ratings (cleanliness, amenities, safety, etc.)
- Owner responses to reviews
- Automatic PG rating calculation

### 🛡️ Security
- JWT Authentication with 7-day expiry
- Password hashing with bcryptjs
- Role-based access control
- Input validation and sanitization

---

## TESTING SAMPLE REQUESTS

### 1. Register as User
```
POST /auth/register
{
  "fullName": "Rahul Singh",
  "email": "rahul@test.com",
  "password": "Test1234",
  "confirmPassword": "Test1234",
  "phone": "9876543210",
  "gender": "Male",
  "role": "User"
}
```

### 2. Register as Owner
```
POST /auth/register
{
  "fullName": "Priya Sharma",
  "email": "priya@test.com",
  "password": "Test1234",
  "confirmPassword": "Test1234",
  "phone": "9876543211",
  "gender": "Female",
  "role": "Owner"
}
```

### 3. Create PG (as Owner)
```
Authorization: Bearer <owner_token>
POST /pgs
{
  "name": "Delhi Tech Hostel",
  "description": "Modern hostel for students near tech companies",
  "address": {
    "street": "100 Tech Park Road",
    "city": "Delhi",
    "state": "Delhi",
    "zipCode": "110001",
    "landmark": "Near Cyber Hub"
  },
  "location": {
    "type": "Point",
    "coordinates": [77.1025, 28.7041]
  },
  "genderAllowed": "Boys",
  "nearbyCollege": ["Delhi Tech Institute"],
  "amenities": {
    "wifi": true,
    "ac": true,
    "attachedBathroom": true,
    "studyTable": true
  },
  "allowsDailyStay": true,
  "allowsMonthlyStay": true,
  "securityDepositPercentage": 10
}
```

### 4. Create Room (as Owner)
```
Authorization: Bearer <owner_token>
POST /rooms
{
  "pg": "63f1d2c3e4b5a6f7g8h9i0j",
  "roomNumber": "201",
  "roomType": "Single",
  "bedCount": 1,
  "monthlyPrice": 10000,
  "dailyPrice": 800,
  "allowOneDayStay": true,
  "amenities": {
    "ac": true,
    "attachedBathroom": true,
    "studyTable": true
  }
}
```

### 5. Book Room (as User)
```
Authorization: Bearer <user_token>
POST /bookings
{
  "roomId": "63f1d2c3e4b5a6f7g8h9i0j",
  "checkInDate": "2024-03-01",
  "checkOutDate": "2024-03-02",
  "bookingType": "Daily",
  "idProof": "proof_url"
}
```

---

## Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Additional error details (development only)"
}
```

---

## Success Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```
