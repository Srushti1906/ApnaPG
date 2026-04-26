# ChatBot Quick Start 🤖

## What I've Built For You ✨

A beautiful, AI-powered chatbot with a cute animated home icon (🏠) that:
- Answers all questions about your ApnaPG platform
- Reads all PG, room, booking, and review data
- Maintains conversation context
- Works even without an AI API key (fallback mode)
- Has a gorgeous gradient design with smooth animations

## 3-Minute Setup

### Step 1️⃣: Install Dependencies
```bash
# Terminal 1 - Server
cd server
npm install

# Terminal 2 - Client  
cd client
npm install
```

### Step 2️⃣: (Optional) Add AI Power - Get Free API Key

1. Visit: https://console.anthropic.com
2. Sign up (free account)
3. Create API key
4. Add to `server/.env`:
   ```env
   ANTHROPIC_API_KEY=sk-ant-your_key_here
   ```

**Skip this if you want to use fallback mode - chatbot still works!**

### Step 3️⃣: Start the App
```bash
# Terminal 1 - Start Backend
cd server
npm run dev

# Terminal 2 - Start Frontend
cd client
npm run dev
```

### Step 4️⃣: Test It! 🎉
- Open http://localhost:5173
- Look for the floating **home icon (🏠)** in bottom-right
- Click it and start chatting!

## Try These Prompts

```
"What PGs are available in Pune?"
"Show me rooms under 8000"
"What amenities do you have?"
"How do I book a room?"
"Tell me about girls' hostels"
"What's the price range?"
"How do I create an account?"
```

## Two Modes

### 🤖 AI Mode (With ANTHROPIC_API_KEY)
- Intelligent conversational responses
- Understands complex questions
- Provides contextual help
- Best experience!

### 📝 Fallback Mode (Without API Key)
- Smart pattern-based responses
- Still answers common questions
- No API key needed
- Chatbot still fully functional

## File Locations

```
🎨 Frontend:
- client/src/components/ChatBot.jsx        (Component)
- client/src/components/ChatBot.css         (Styling)

🔧 Backend:
- server/controllers/chatbotController.js   (AI Logic)
- server/routes/chatbotRoutes.js            (API Endpoint)

📖 Documentation:
- CHATBOT_SETUP_GUIDE.md                   (Full Guide)
```

## API Endpoint

```javascript
POST /api/chatbot/chat

Request:
{
  "message": "What PGs are in Mumbai?",
  "conversationHistory": []
}

Response:
{
  "reply": "Here are some great PGs in Mumbai...",
  "status": "success"
}
```

## Troubleshooting ❓

**Chatbot not appearing?**
- Check if frontend is running (http://localhost:5173)
- Look for purple gradient button in bottom-right corner

**Not getting responses?**
- Make sure backend is running (Port 5000)
- Check browser console for errors (F12)
- Verify `VITE_API_URL=http://localhost:5000/api` in client/.env.local

**Want AI responses?**
- Get free API key from https://console.anthropic.com
- Add to `server/.env` as `ANTHROPIC_API_KEY=...`
- Restart backend

## Features Included

✅ **Beautiful UI**
- Gradient buttons (purple → pink)
- Smooth animations
- Floating action button
- Toast messages

✅ **Smart AI**
- Reads all your PG data
- Understands context
- Maintains conversation history
- Intelligent fallback responses

✅ **Mobile Ready**
- Fully responsive
- Works on phones & tablets
- Touch-friendly

✅ **Production Ready**
- Error handling
- Performance optimized
- CORS configured
- Rate limiting ready

## Next Steps

1. ✅ Install deps
2. ✅ Get API key (optional)
3. ✅ Start servers
4. ✅ Test chatbot
5. 📝 Customize if needed

## Customize It!

**Change Colors** → Edit `ChatBot.css`
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

**Change Welcome Message** → Edit `ChatBot.jsx`
```javascript
text: "Your custom welcome message"
```

**Add Custom Instructions** → Edit `chatbotController.js`
```javascript
// Add to buildSystemPrompt() function
```

## Need Help?

Check `CHATBOT_SETUP_GUIDE.md` for:
- Detailed setup instructions
- Production deployment
- Full customization guide
- Advanced configuration
- Environment variables

---

🚀 **You're all set! Your AI-powered chatbot is ready to go!**

Any questions? Check the full setup guide or server logs for debugging info.
