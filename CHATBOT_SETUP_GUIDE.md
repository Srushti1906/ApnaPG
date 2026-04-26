# ApnaPG ChatBot Setup Guide

## Overview
The ChatBot is an AI-powered assistant that helps users find PG accommodations and answer questions about the ApnaPG platform. It's built with:
- **Frontend**: React with a beautiful UI
- **Backend**: Express.js with AI integration
- **AI Engine**: Claude 3.5 Sonnet (via Anthropic API)

## Features
✅ Intelligent conversational interface
✅ Answers questions about PGs, rooms, bookings, and pricing
✅ Cute home icon animation (🏠)
✅ Beautiful gradient design
✅ Fallback responses when AI is unavailable
✅ Full conversation history context
✅ Responsive design for mobile & desktop

## Setup Instructions

### Step 1: Install Dependencies

**Frontend:**
```bash
cd client
npm install
# react-icons is already added to package.json
```

**Backend:**
```bash
cd server
npm install
# @anthropic-ai/sdk is already added to package.json
```

### Step 2: Get Anthropic API Key (Optional but Recommended)

The chatbot works in two modes:

**Mode 1: AI-Powered (Recommended)**
For the best experience with intelligent responses:

1. Visit [Anthropic Console](https://console.anthropic.com)
2. Sign up for a free account
3. Navigate to API keys section
4. Create a new API key
5. Copy the key

**Mode 2: Fallback (No API Key Needed)**
The chatbot will work with smart fallback responses without an API key, but it won't have AI intelligence.

### Step 3: Configure Environment Variables

**Server (.env file)**

Create or update `.env` file in the `server` directory:

```env
# Database
MONGODB_URI=mongodb+srv://your_mongodb_uri

# Server Configuration
PORT=5000
NODE_ENV=development

# Authentication
JWT_SECRET=your_jwt_secret_here

# Email (Optional)
EMAIL_FROM=noreply@apnapg.com

# Chatbot AI (Optional for AI-powered responses)
ANTHROPIC_API_KEY=sk-ant-your_api_key_here

# Frontend Configuration
VITE_API_URL=http://localhost:5000/api
```

**Client (.env.local file)**

Create or update `.env.local` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### Step 4: Start the Application

**Terminal 1 - Start Backend:**
```bash
cd server
npm run dev
# Server will run on http://localhost:5000
```

**Terminal 2 - Start Frontend:**
```bash
cd client
npm run dev
# Client will run on http://localhost:5173
```

### Step 5: Test the ChatBot

1. Open your browser: `http://localhost:5173`
2. Look for the floating home icon (🏠) in the bottom-right corner
3. Click to open the ChatBot
4. Try asking questions like:
   - "Show me PGs in Pune under 10000"
   - "What amenities are available?"
   - "How do I book a room?"
   - "Tell me about gender policies"
   - "What's the price range?"

## ChatBot Capabilities

### With AI Enabled (ANTHROPIC_API_KEY set)
The chatbot can:
- Understand natural language queries
- Provide contextual answers about your platform
- Answer questions about PGs, rooms, pricing, amenities
- Guide users through booking process
- Explain house rules and policies
- Provide booking and account help

### Without AI (Fallback Mode)
The chatbot can:
- Respond to common greetings
- Guide users with basic information
- Help with search, booking, and registration questions
- Provide fallback responses for various queries

## API Endpoint

**POST `/api/chatbot/chat`**

Send a message to the chatbot:

```javascript
// Request
{
  "message": "What PGs are available in Pune?",
  "conversationHistory": [
    { "from": "bot", "text": "Hi! How can I help?" },
    { "from": "user", "text": "I'm looking for a room" }
  ]
}

// Response
{
  "reply": "I can help you find a room! Tell me...",
  "status": "success" // or "fallback" if using fallback mode
}
```

## Data Accessible to ChatBot

The chatbot has access to:
- ✅ All active PGs and their details
- ✅ Room information (types, pricing, amenities)
- ✅ Pricing ranges and statistics
- ✅ Available amenities and gender policies
- ✅ Review statistics and ratings
- ✅ City information
- ✅ Booking information (public)

## Troubleshooting

### ChatBot doesn't respond
- Check if backend server is running on port 5000
- Check browser console for errors
- Verify `VITE_API_URL` is correct in `.env.local`

### AI responses not working
- Verify `ANTHROPIC_API_KEY` is set in server `.env`
- Check if API key is valid and has credits
- Check server logs: `console.log` will show errors
- Fallback mode will automatically activate if AI fails

### Module not found errors
```bash
# Reinstall dependencies
cd server
npm install @anthropic-ai/sdk

cd ../client
npm install react-icons
```

### CORS errors
- Ensure backend CORS is properly configured
- Check if frontend URL matches allowed origins
- Verify backend is running

## Customization

### Change ChatBot Colors
Edit `client/src/components/ChatBot.css`:
- Gradient color: Update `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Font: Modify `font-family` in `.chatbot-container`

### Change Welcome Message
Edit `client/src/components/ChatBot.jsx`:
```javascript
const welcomeMessage = {
  text: "Hi there! Welcome to ApnaPG! I'm your AI assistant..."
}
```

### Add System Prompt Instructions
Edit `server/controllers/chatbotController.js` in `buildSystemPrompt()` function:
```javascript
const systemPrompt = `You are ApnaPG Assistant...
// Add more instructions here
`;
```

## Production Deployment

### Before Deploying:
1. Set `NODE_ENV=production` in server `.env`
2. Use a production MongoDB URI
3. Ensure `ANTHROPIC_API_KEY` is set (recommended)
4. Update `VITE_API_URL` to production backend URL
5. Build frontend: `npm run build`

### Environment Variables for Production:
```env
# Server
NODE_ENV=production
PORT=5000
JWT_SECRET=your-very-secure-random-secret
ANTHROPIC_API_KEY=your-api-key

# Database
MONGODB_URI=production_mongodb_uri

# URLs
VITE_API_URL=https://api.apnapg.com
```

## File Structure

```
client/src/components/
├── ChatBot.jsx          # Main component
└── ChatBot.css          # Styling

server/
├── controllers/
│   └── chatbotController.js  # AI logic
├── routes/
│   └── chatbotRoutes.js      # API routes
└── server.js            # Register routes
```

## API Limits & Considerations

- **Rate Limiting**: Consider adding rate limiting for production
- **Token Usage**: Monitor Anthropic API usage for costs
- **Conversation History**: Currently sent with each request for context
- **Response Time**: Typically 1-3 seconds (depends on internet)

## Support & Issues

For issues or questions:
1. Check the troubleshooting section above
2. Review server console logs
3. Check browser dev tools (F12) for frontend errors
4. Verify all environment variables are set correctly

## Next Steps

1. ✅ Install dependencies
2. ✅ Set up environment variables
3. ✅ Run the application
4. ✅ Test the chatbot
5. ✅ Customize as needed
6. ✅ Deploy to production

Enjoy your AI-powered ApnaPG ChatBot! 🚀
