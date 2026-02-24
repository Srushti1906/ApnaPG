const Booking = require('../models/Booking');
const Room = require('../models/Room');
const PG = require('../models/PG');
const User = require('../models/User');

// @route   POST /api/bookings
// @desc    Create a new booking (with gender validation)
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const {
      roomId,
      checkInDate,
      checkOutDate,
      bookingType,
      specialRequests,
      kitchenAccess,
      idProof,
    } = req.body;

    // Validation
    if (!roomId || !checkInDate || !checkOutDate || !bookingType) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: roomId, checkInDate, checkOutDate, bookingType',
      });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Date validation
    if (checkIn >= checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date',
      });
    }

    // Get room details
    const room = await Room.findById(roomId).populate('pg');
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    const pg = room.pg;

    // GENDER COMPATIBILITY CHECK - CORE RULE
    const isGenderCompatible = (userGender, policy) => {
      if (policy === 'Mixed') return true;
      if (policy === 'Boys' && userGender === 'Male') return true;
      if (policy === 'Girls' && userGender === 'Female') return true;
      if (policy === 'Family/Couple') return true;
      return false;
    };

    if (!isGenderCompatible(req.user.gender, pg.genderAllowed)) {
      return res.status(403).json({
        success: false,
        message: `This PG is for ${pg.genderAllowed} only. You cannot book this room based on your gender.`,
      });
    }

    // Check availability
    if (room.availability.vacantBeds <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No vacant beds available in this room',
      });
    }

    // One-day stay validation
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    if (nights === 1 && !room.allowOneDayStay) {
      return res.status(400).json({
        success: false,
        message: 'One-day stay not allowed in this room',
      });
    }

    // Check for double booking
    const existingBooking = await Booking.findOne({
      room: roomId,
      status: { $in: ['Confirmed', 'CheckedIn'] },
      $or: [
        {
          checkInDate: { $lt: checkOut },
          checkOutDate: { $gt: checkIn },
        },
      ],
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Room is already booked for these dates',
      });
    }

    // Calculate pricing
    const roomPrice = bookingType === 'Daily' ? room.dailyPrice : room.monthlyPrice;
    const totalPrice = roomPrice * nights;
    const securityDeposit = Math.round((totalPrice * pg.securityDepositPercentage) / 100);
    const finalPrice = totalPrice + securityDeposit;

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      pg: pg._id,
      room: roomId,
      owner: pg.owner,
      bookingType,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numberOfNights: nights,
      roomPrice,
      totalPrice,
      securityDeposit,
      finalPrice,
      specialRequests,
      kitchenAccess,
      idProof,
      userGender: req.user.gender,
      pgGenderPolicy: pg.genderAllowed,
      idVerified: !!idProof,
      emergencyContactVerified: !!req.user.emergencyContact,
      status: 'Pending',
      paymentStatus: 'Pending',
    });

    // Update room availability
    room.availability.vacantBeds -= 1;
    room.recentBookings.push(booking._id);
    await room.save();

    // Add to user's booking history
    req.user.bookingHistory.push(booking._id);
    await User.findByIdAndUpdate(req.user._id, {
      bookingHistory: req.user.bookingHistory,
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully. Pending approval.',
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message,
    });
  }
};

// @route   GET /api/bookings/:id
// @desc    Get booking details
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'fullName email phone')
      .populate('owner', 'fullName phone')
      .populate('pg', 'name address')
      .populate('room', 'roomNumber bedCount')
      .populate('review');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Authorization
    if (
      booking.user._id.toString() !== req.user._id.toString() &&
      booking.owner._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'Admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking',
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message,
    });
  }
};

// @route   GET /api/bookings
// @desc    Get user bookings
// @access  Private
exports.getUserBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let filter = { user: req.user._id };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const bookings = await Booking.find(filter)
      .populate('pg', 'name address')
      .populate('room', 'roomNumber')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      success: true,
      bookings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message,
    });
  }
};

// @route   GET /api/owner/bookings
// @desc    Get owner's PG bookings
// @access  Private
exports.getOwnerBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let filter = { owner: req.user._id };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const bookings = await Booking.find(filter)
      .populate('user', 'fullName email phone gender')
      .populate('pg', 'name')
      .populate('room', 'roomNumber bedCount')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ checkInDate: 1 });

    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      success: true,
      bookings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching owner bookings',
      error: error.message,
    });
  }
};

// @route   PUT /api/bookings/:id/approve
// @desc    Approve booking (Owner only)
// @access  Private
exports.approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Authorization
    if (booking.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    booking.status = 'Confirmed';
    booking.approvedBy = req.user._id;
    booking.approvedAt = new Date();
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking approved',
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving booking',
      error: error.message,
    });
  }
};

// @route   PUT /api/bookings/:id/reject
// @desc    Reject booking (Owner only)
// @access  Private
exports.rejectBooking = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Authorization
    if (booking.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    booking.status = 'Cancelled';
    booking.rejectionReason = rejectionReason;
    booking.rejectedAt = new Date();
    await booking.save();

    // Release room
    const room = await Room.findById(booking.room);
    room.availability.vacantBeds += 1;
    await room.save();

    res.status(200).json({
      success: true,
      message: 'Booking rejected',
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting booking',
      error: error.message,
    });
  }
};

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel booking (User)
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Authorization
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (['CheckedIn', 'CheckedOut', 'Completed'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this booking',
      });
    }

    booking.status = 'Cancelled';
    booking.cancellationReason = cancellationReason;
    booking.cancelledAt = new Date();
    
    // Calculate refund (80% if cancelled 7 days before)
    const daysUntilCheckIn = Math.ceil((booking.checkInDate - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntilCheckIn >= 7) {
      booking.refundAmount = Math.round(booking.finalPrice * 0.8);
    } else {
      booking.refundAmount = 0;
    }

    await booking.save();

    // Release room
    const room = await Room.findById(booking.room);
    room.availability.vacantBeds += 1;
    await room.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled. Refund will be processed.',
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error: error.message,
    });
  }
};
