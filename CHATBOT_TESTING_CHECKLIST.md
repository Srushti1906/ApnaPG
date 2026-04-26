# ChatBot Testing & Deployment Checklist

## Pre-Installation Checklist

- [ ] Node.js installed (v14+)
- [ ] MongoDB URI available
- [ ] Code editor open (VS Code)
- [ ] Terminal access (PowerShell/CMD/Bash)

## Installation Steps

### ✅ Step 1: Install Server Dependencies
```bash
cd server
npm install
```
**Expected output:** `added X packages`

### ✅ Step 2: Install Client Dependencies
```bash
cd client
npm install
```
**Expected output:** `added X packages`

### ✅ Step 3: Setup Environment Variables

**Server (.env file in server/ directory):**
```env
MONGODB_URI=mongodb+srv://your_user:your_password@cluster.mongodb.net/apnapg
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secure_random_secret_key_here
ANTHROPIC_API_KEY=sk-ant-your_api_key_here
VITE_API_URL=http://localhost:5000/api
```

**Client (.env.local file in client/ directory):**
```env
VITE_API_URL=http://localhost:5000/api
```

## Startup Commands

### 🚀 Terminal 1: Start Backend Server
```bash
cd server
npm run dev
```

**Expected output:**
```
[nodemon] restarting due to changes...
[nodemon] starting `node server.js`
Server running on port 5000
```

### 🚀 Terminal 2: Start Frontend
```bash
cd client
npm run dev
```

**Expected output:**
```
VITE v4.X.X build 0.XX s

➜ Local:   http://localhost:5173/
```

## Testing the ChatBot

### 1️⃣ Open Application
- Navigate to: `http://localhost:5173`
- You should see the ApnaPG homepage

### 2️⃣ Find the ChatBot
- Look in the **bottom-right corner**
- You'll see a **purple floating button with a home icon (🏠)**
- There will be a small **blue notification dot** pulsing

### 3️⃣ Click to Open
- Click the **home icon button**
- ChatBot window should slide up from the bottom-right
- You'll see the welcome message

### 4️⃣ Test Responses

**Test Simple Greeting:**
```
You: "Hi there"
Bot: "Hello! Welcome to ApnaPG!..."
```

**Test PG Search:**
```
You: "What PGs are in Pune?"
Bot: "We have several PGs in Pune ranging from..."
```

**Test Booking Question:**
```
You: "How do I book a room?"
Bot: "To book a room:\n1. Browse available PGs\n2. Select a room..."
```

**Test Amenities:**
```
You: "What amenities do you have?"
Bot: "We have PGs with various amenities like WiFi, AC..."
```

**Test Price Question:**
```
You: "What's the price range?"
Bot: "Our PGs range from ₹3,000 to ₹25,000+ per month..."
```

### 5️⃣ Verify Features
- [ ] Chatbot opens and closes
- [ ] Messages appear with timestamps
- [ ] Bot messages are on the left (white box)
- [ ] User messages are on the right (gradient box)
- [ ] Typing indicator shows while loading
- [ ] Scroll auto-scrolls to latest message
- [ ] Input field works and clears after send
- [ ] Close button works

## Troubleshooting During Testing

### ❌ Chatbot Not Visible
**Solution:**
```
1. Check frontend running on port 5173
2. Refresh page (Ctrl+F5)
3. Open DevTools (F12) and check Console
4. Check if ChatBot is imported in App.jsx
```

### ❌ No Response from Bot
**Solution:**
```
1. Check backend running on port 5000
2. Check browser console (F12 → Console tab)
3. Check terminal for errors
4. Verify VITE_API_URL is correct
5. Check MongoDB connection
```

### ❌ API Key Error
**Solution:**
```
1. Fallback mode works without API key
2. To use AI: Get key from console.anthropic.com
3. Add to server/.env as ANTHROPIC_API_KEY=sk-ant-...
4. Restart backend (npm run dev)
```

### ❌ Module Not Found Errors
**Solution:**
```bash
# Clear and reinstall
cd server
rm -rf node_modules package-lock.json
npm install

cd ../client
rm -rf node_modules package-lock.json
npm install
```

## Browser DevTools Debugging

### Open DevTools
- **Windows/Linux:** F12
- **Mac:** Cmd+Option+I

### Check Console Tab
- Look for red errors
- Check network requests (Network tab)
- Look for failed POST requests to `/api/chatbot/chat`

### Check Network Tab
- Open DevTools Network tab
- Send a message to bot
- Look for POST request to `http://localhost:5000/api/chatbot/chat`
- Check Response for the reply
- Check Status code (should be 200)

## Production Deployment Checklist

### Pre-Deployment
- [ ] All tests pass locally
- [ ] No console errors
- [ ] Environment variables set correctly
- [ ] MongoDB connection working
- [ ] API key obtained (optional but recommended)

### Server Deployment
```bash
# Build for production
cd server

# Set environment variables
NODE_ENV=production
PORT=5000
JWT_SECRET=production_secret
ANTHROPIC_API_KEY=your_api_key
MONGODB_URI=production_uri
```

### Frontend Deployment
```bash
# Build static files
cd client
npm run build

# This creates a 'dist' folder with optimized files
# Deploy this folder to your hosting service
```

### Verify Production
- [ ] Frontend loads without errors
- [ ] Chatbot appears in bottom-right
- [ ] Can send and receive messages
- [ ] No CORS errors
- [ ] API responses working

## Performance Testing

### Response Time Check
1. Open DevTools Network tab
2. Send message to chatbot
3. Check response time:
   - With API Key: 1-3 seconds (normal)
   - Without API Key: <500ms (fallback mode)

### Browser DevTools Performance
1. Open DevTools → Performance tab
2. Start recording
3. Send a message
4. Stop recording
5. Review performance graph

## Monitoring in Production

### Backend Logs
```bash
# Real-time logs
npm run dev

# Or check logs file if set up
tail -f logs/server.log
```

### Frontend Errors
- Set up error tracking (e.g., Sentry)
- Monitor browser console for errors
- Track API response times

## Version Check

### Verify Dependencies
```bash
# Server
cd server
npm list | grep anthropic
npm list | grep express

# Client
cd client
npm list | grep react-icons
npm list | grep react
```

## Security Checklist

- [ ] JWT_SECRET is strong and random
- [ ] ANTHROPIC_API_KEY is secret (not in code)
- [ ] MONGODB_URI is secure
- [ ] CORS is configured correctly
- [ ] No sensitive data in logs
- [ ] No API keys in git repository

## Documentation Check

Verify all documentation files exist:
- [ ] `CHATBOT_QUICK_START.md`
- [ ] `CHATBOT_SETUP_GUIDE.md`
- [ ] `CHATBOT_ARCHITECTURE.md`
- [ ] `CHATBOT_IMPLEMENTATION_COMPLETE.md`
- [ ] This file: `CHATBOT_TESTING_CHECKLIST.md`

## Success Criteria

✅ All items should be true:
- [ ] Frontend runs on port 5173
- [ ] Backend runs on port 5000
- [ ] Chatbot appears in UI
- [ ] Can open/close chatbot
- [ ] Can send and receive messages
- [ ] Messages display with timestamps
- [ ] No console errors
- [ ] No CORS errors
- [ ] Fallback mode works (without API key)
- [ ] AI mode works (with API key)

## Common Issues & Solutions

| Issue | Symptom | Solution |
|-------|---------|----------|
| **Port Already in Use** | `EADDRINUSE` error | Kill process on port 5000/5173 or change port |
| **MongoDB Error** | Connection failed | Check MONGODB_URI in .env |
| **Module Missing** | `Cannot find module` | Run `npm install` again |
| **API Key Invalid** | 401 error in logs | Check ANTHROPIC_API_KEY format |
| **CORS Error** | API calls blocked | Verify CORS configuration on backend |
| **Blank Chat** | No welcome message | Refresh page, check browser cache |

## Performance Optimization Tips

1. **Frontend:**
   - Use Vite dev server (faster rebuilds)
   - Check bundle size: `npm run build`

2. **Backend:**
   - Monitor MongoDB queries
   - Use connection pooling
   - Cache system prompts

3. **API:**
   - Add response caching
   - Implement rate limiting
   - Compress responses

## Next Steps After Testing

1. ✅ Confirm all tests pass
2. ✅ Review and customize as needed
3. ✅ Deploy to staging environment
4. ✅ Run final UAT (User Acceptance Testing)
5. ✅ Deploy to production
6. ✅ Monitor performance and errors
7. ✅ Gather user feedback

## Support Resources

**Quick Reference:**
- Quick Start: `CHATBOT_QUICK_START.md`
- Full Setup: `CHATBOT_SETUP_GUIDE.md`
- System Design: `CHATBOT_ARCHITECTURE.md`

**Code Reference:**
- Frontend: `client/src/components/ChatBot.jsx`
- Backend: `server/controllers/chatbotController.js`
- Routes: `server/routes/chatbotRoutes.js`

---

**You're ready to test! Follow the steps above and enjoy your new AI-powered chatbot! 🎉**
