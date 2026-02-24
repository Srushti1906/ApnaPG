const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to check if user is authenticated
exports.protect = async (req, res, next) => {
  let token;

  // Extract token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID from token
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

// Middleware to check specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

// Middleware to check gender compatibility (Core rule enforcement)
exports.checkGenderCompatibility = async (req, res, next) => {
  try {
    const { roomId } = req.body;
    const Room = require('../models/Room');
    const PG = require('../models/PG');

    const room = await Room.findById(roomId).populate('pg');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    const pgGenderPolicy = room.pg.genderAllowed;
    const userGender = req.user.gender;

    // Gender Validation Logic
    const isGenderCompatible = (userGender, policy) => {
      if (policy === 'Mixed') return true;
      if (policy === 'Boys' && userGender === 'Male') return true;
      if (policy === 'Girls' && userGender === 'Female') return true;
      if (policy === 'Family/Couple') return true; // Can add couple verification later
      return false;
    };

    if (!isGenderCompatible(userGender, pgGenderPolicy)) {
      return res.status(403).json({
        success: false,
        message: `This PG is for ${pgGenderPolicy} only. You cannot book this room.`,
      });
    }

    // Attach room and pg info to request for later use
    req.room = room;
    req.pgPolicy = pgGenderPolicy;

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking gender compatibility',
      error: error.message,
    });
  }
};

// Middleware for error handling
exports.errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    err.statusCode = 400;
    err.message = `${field} already exists`;
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    err.statusCode = 401;
    err.message = 'Invalid token';
  }

  // JWT expiration error
  if (err.name === 'TokenExpiredError') {
    err.statusCode = 401;
    err.message = 'Token expired';
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

// Async error wrapper
exports.asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
