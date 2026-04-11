#!/bin/bash

# 🚀 APNAPG - Quick Start Commands

## One-Time Setup (First Time Only)

# 1. Install backend dependencies
cd server
npm install

# 2. Install frontend dependencies  
cd ../client
npm install

# 3. Verify .env is configured
cat ../.env
# Ensure MONGODB_URI and JWT_SECRET are set

---

## Development Workflow

### Terminal 1: Start Backend Server
```powershell
cd server
npm run dev
# Expected: Server running on port 5000, MongoDB Connected
```

### Terminal 2: Start Frontend Dev Server
```powershell
cd client
npm run dev
# Expected: Vite ready at http://localhost:5174
```

### Terminal 3: (Optional) Seed Database with Sample Data
```powershell
cd server
npm run seed
# Creates sample PGs, rooms, reviews, bookings
```

---

## Common Commands

### Backend
```powershell
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start

# Seed database
npm run seed

# View logs
tail -f output.log
```

### Frontend
```powershell
# Development mode
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## Troubleshooting Commands

### Check if ports are in use
```powershell
# Windows
netstat -ano | findstr :5000
netstat -ano | findstr :5174

# macOS/Linux
lsof -i :5000
lsof -i :5174
```

### Kill process on port
```powershell
# Windows
taskkill /PID <PID> /F

# macOS/Linux
kill -9 <PID>
```

### Clear cache and reinstall
```powershell
# Frontend
cd client
rm -r node_modules .vite dist package-lock.json
npm install

# Backend
cd server
rm -r node_modules package-lock.json
npm install
```

### Check MongoDB connection
```powershell
mongosh
# Should connect to MongoDB

# List databases
show dbs

# Use apna-pg database
use apna-pg

# List PGs
db.pgs.find().limit(1)
```

### View server logs
```powershell
cd server
npm run dev 2>&1 | Tee-Object -FilePath server.log
```

---

## Environment Variables (.env)

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/apna-pg

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your-super-secret-key-here

# Client Configuration
VITE_API_URL=http://localhost:5000/api
```

---

## Quick Reference: Port Mapping

| Service | Port | URL |
|---------|------|-----|
| Backend API | 5000 | http://localhost:5000 |
| Frontend Dev | 5174 | http://localhost:5174 |
| MongoDB | 27017 | mongodb://localhost:27017 |
| API Health Check | 5000 | http://localhost:5000/api/health |

---

## Notes

- Both servers must be running for the app to work
- MongoDB must be running locally or configured in .env
- Frontend hot-reloads on file changes
- Backend auto-restarts with nodemon
- Delete `.vite` and `dist` folders if build artifacts cause issues
- Close all terminals and restart if ports don't release

---

**Need help?** Check GLITCH_FIX_GUIDE.md or APP_RUNNING_STATUS.md
