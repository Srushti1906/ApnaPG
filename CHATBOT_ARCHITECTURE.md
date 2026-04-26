# ChatBot Architecture & Visual Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER BROWSER                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           React Frontend (Vite)                      │  │
│  │  ┌───────────────────────────────────────────────┐  │  │
│  │  │  App.jsx                                       │  │  │
│  │  │  ├── Navbar                                   │  │  │
│  │  │  ├── BookingModal                            │  │  │
│  │  │  └── ChatBot ◄─────── (NEW!)                 │  │  │
│  │  │      ├── ChatBot.jsx                         │  │  │
│  │  │      └── ChatBot.css                         │  │  │
│  │  │          • Beautiful UI                      │  │  │
│  │  │          • Floating Button (🏠)              │  │  │
│  │  │          • Message Display                   │  │  │
│  │  │          • Input Form                        │  │  │
│  │  │          • Animations                        │  │  │
│  │  └───────────────────────────────────────────────┘  │  │
│  └────────────┬───────────────────────────────────────┘  │
│               │ HTTP POST                                 │
│               │ /api/chatbot/chat                         │
│               ▼                                           │
└─────────────────────────────────────────────────────────────┘
                      │
                      │ Network Request (Axios)
                      │ {message, conversationHistory}
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│            Express.js Backend (Node.js)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  server.js                                           │  │
│  │  ├── Routes                                          │  │
│  │  │   ├── /api/auth                                  │  │
│  │  │   ├── /api/pgs                                   │  │
│  │  │   ├── /api/rooms                                 │  │
│  │  │   ├── /api/bookings                              │  │
│  │  │   ├── /api/reviews                               │  │
│  │  │   └── /api/chatbot ◄─────── (NEW!)              │  │
│  │  │       └── chatbotRoutes.js                       │  │
│  │  │           └── POST /chat                         │  │
│  │  │               └── chatbotController.js           │  │
│  │  │                   ├── buildSystemPrompt()        │  │
│  │  │                   ├── getWebsiteContext()        │  │
│  │  │                   ├── getSamplePGDetails()       │  │
│  │  │                   ├── chatbotChat() ◄─ Endpoint  │  │
│  │  │                   └── getFallbackResponse()      │  │
│  │  │                                                   │  │
│  │  └─────────────┬──────────────────────────────────┘  │  │
│  │                │                                      │  │
│  │  ┌─────────────▼──────────────────────────────────┐  │  │
│  │  │  MongoDB Database                               │  │  │
│  │  │  ├── PG (Models)                                │  │  │
│  │  │  ├── Room (Models)                              │  │  │
│  │  │  ├── Review (Models)                            │  │  │
│  │  │  ├── Booking (Models)                           │  │  │
│  │  │  └── User (Models)                              │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                │                                       │  │
│  └────────────────┼───────────────────────────────────┘  │
│                   │                                       │
│  ┌────────────────▼───────────────────────────────────┐  │
│  │  AI Processing (Anthropic Claude API)             │  │
│  │  (Optional - works without it too)                │  │
│  │  ├── buildSystemPrompt()                          │  │
│  │  ├── getWebsiteContext()                          │  │
│  │  └── Claude 3.5 Sonnet API Call                  │  │
│  │      └── Natural Language Understanding           │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
                      ▲
                      │ Response: {reply, status}
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Browser - Display Response                     │
│  • Update message list                                      │
│  • Scroll to bottom                                         │
│  • Show timestamps                                          │
│  • Display animations                                       │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App (root)
├── Navbar
├── BookingModal
└── ChatBot (NEW!)
    ├── Floating Button (purple gradient, home icon)
    ├── When Open:
    │   ├── Header
    │   │   ├── Home Icon (animated)
    │   │   ├── Title
    │   │   └── Close Button
    │   ├── Messages Container
    │   │   ├── Bot Messages (left, white box)
    │   │   ├── User Messages (right, gradient box)
    │   │   ├── Typing Indicator (animated)
    │   │   └── Timestamps
    │   ├── Input Form
    │   │   ├── Text Input
    │   │   └── Send Button
    │   └── Tooltip (when closed)
    └── Styling (ChatBot.css)
```

## Data Flow

### 1. User sends message
```
User Types Message
    ↓
User clicks Send or presses Enter
    ↓
React State Updated (messages array + isLoading)
    ↓
Axios POST to /api/chatbot/chat
{
  "message": "What PGs are in Pune?",
  "conversationHistory": [
    { "from": "bot", "text": "Hi! How can I help?" },
    { "from": "user", "text": "I'm looking for a room" }
  ]
}
```

### 2. Backend processes request
```
Express Route Handler: /api/chatbot/chat
    ↓
chatbotController.chatbotChat()
    ↓
Build System Prompt
├── getWebsiteContext() → MongoDB queries
│   ├── Count PGs, Rooms, Reviews
│   ├── Get cities and stats
│   ├── Get price ranges
│   └── Get amenities available
└── getSamplePGDetails() → Get 3 sample PGs
    ↓
AI Processing (if API key available)
├── Initialize Anthropic Client
├── Send to Claude 3.5 Sonnet
│   ├── System Prompt (with website knowledge)
│   ├── Conversation History
│   └── User Message
├── Receive Response
└── Return to Frontend

OR

Fallback Response (if no API key)
├── Analyze message text
├── Match patterns
└── Return contextual fallback response
```

### 3. Response sent to frontend
```
Backend Response:
{
  "reply": "Great! We have several PGs in Pune...",
  "status": "success" or "fallback"
}
    ↓
Frontend Receives Response
    ↓
Add to Messages Array
    ↓
Display in Chat UI
    ↓
Auto-scroll to Bottom
    ↓
Focus Input Field
```

## API Endpoint Details

### POST /api/chatbot/chat

**Request Body:**
```json
{
  "message": "String - user's question",
  "conversationHistory": [
    {
      "from": "bot" | "user",
      "text": "String - message content"
    }
  ]
}
```

**Success Response (200):**
```json
{
  "reply": "AI-generated response or fallback",
  "status": "success" | "fallback"
}
```

**Error Response (400/401):**
```json
{
  "error": "Error message describing the issue"
}
```

## Environment Configuration

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env)
```env
# Database
MONGODB_URI=mongodb+srv://...

# Server
PORT=5000
NODE_ENV=development

# Authentication
JWT_SECRET=your-secret-here

# Chatbot AI (Optional)
ANTHROPIC_API_KEY=sk-ant-...

# Email (Optional)
EMAIL_FROM=noreply@apnapg.com
```

## Key Technologies

### Frontend
- **React 18** - UI Framework
- **React Icons** - Icon library (FiHome, FiSend, etc.)
- **Axios** - HTTP client
- **Vite** - Build tool
- **Tailwind CSS** - Styling (for main app)
- **CSS** - ChatBot custom styling

### Backend
- **Express.js** - REST API framework
- **MongoDB + Mongoose** - Database
- **Anthropic SDK** - AI integration
- **Node.js** - Runtime

## Features Breakdown

### Frontend Features
```
✅ Floating Button
   ├── Home icon (🏠)
   ├── Animated pulse notification
   └── Gradient background

✅ Chat Widget
   ├── Header with close button
   ├── Message list with auto-scroll
   ├── User/Bot message differentiation
   ├── Typing indicator
   ├── Message timestamps
   ├── Input field with send button
   ├── Loading states
   ├── Error display
   └── Responsive design

✅ UI/UX
   ├── Smooth animations
   ├── Gradient colors
   ├── Hover effects
   ├── Mobile responsive
   └── Print-friendly styles
```

### Backend Features
```
✅ AI Processing
   ├── Claude 3.5 Sonnet integration
   ├── System prompt with website knowledge
   ├── Conversation history context
   └── Fallback responses

✅ Data Access
   ├── PG data fetching
   ├── Room details
   ├── Review statistics
   ├── Pricing information
   ├── City information
   └── Amenities catalog

✅ Error Handling
   ├── API key validation
   ├── Graceful fallback
   ├── Error logging
   └── User-friendly errors
```

## Integration Points

### Files Modified
```
1. client/package.json
   ├── Added: react-icons

2. server/package.json
   ├── Added: @anthropic-ai/sdk

3. client/src/App.jsx
   ├── Added: import ChatBot
   ├── Added: <ChatBot /> component

4. server/server.js
   ├── Added: /api/chatbot routes
```

### Files Created
```
1. client/src/components/ChatBot.jsx
   └── React component

2. client/src/components/ChatBot.css
   └── Styling

3. server/controllers/chatbotController.js
   └── Business logic

4. server/routes/chatbotRoutes.js
   └── Route definitions
```

## Performance Considerations

- **Response Time**: 1-3 seconds with AI, <500ms with fallback
- **Message Size**: System prompt + history sent with each request
- **Memory**: Conversation history stored in React state
- **API Calls**: One call to Claude per user message
- **Database Queries**: System prompt generation queries DB once per request

## Security Considerations

- ✅ CORS enabled
- ✅ No authentication required (public endpoint)
- ✅ API key not exposed to frontend
- ✅ Database queries read-only
- ✅ User input validated
- ✅ Error messages don't expose internals

## Future Enhancements

- [ ] Rate limiting per IP
- [ ] Conversation persistence (save/load)
- [ ] Multi-language support
- [ ] User-specific context
- [ ] Suggested questions
- [ ] Analytics/logging
- [ ] Custom knowledge base
- [ ] Image support in messages
