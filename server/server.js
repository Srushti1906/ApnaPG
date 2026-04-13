
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/database');
const { errorHandler } = require('./middleware/auth');
const { autoCompleteExpiredBookings } = require('./services/bookingCleanupService');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/pgs', require('./routes/pgRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
// Admin routes removed
app.use('/api/enquiries', require('./routes/enquiryRoutes'));

// Initialize automated booking completion task
// Runs every hour to check and complete bookings whose checkout date has passed
setInterval(async () => {
  console.log('[Booking Cleanup] Running scheduled task...');
  await autoCompleteExpiredBookings();
}, 60 * 60 * 1000); // Run every 60 minutes

// Also run on server startup (after a short delay to ensure DB is connected)
setTimeout(async () => {
  console.log('[Booking Cleanup] Running initial task after server startup...');
  await autoCompleteExpiredBookings();
}, 5000); // Wait 5 seconds after server starts

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handling middleware
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  server.close(() => process.exit(1));
});

module.exports = app;
