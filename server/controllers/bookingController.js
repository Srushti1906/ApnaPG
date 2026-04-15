const Booking = require('../models/Booking');
const Room = require('../models/Room');
const PG = require('../models/PG');
const User = require('../models/User');
const { updateRoomAvailability } = require('../services/roomAvailabilityService');

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

    // Add to user's booking history using $push operator
    await User.findByIdAndUpdate(req.user._id, {
      $push: { bookingHistory: booking._id },
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
    if (status) {
      // Handle multiple statuses separated by comma
      if (status.includes(',')) {
        filter.status = { $in: status.split(',').map(s => s.trim()) };
      } else {
        filter.status = status;
      }
    }

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

// @route   GET /api/bookings/owner/customers
// @desc    Get owner's customers with their booking history
// @access  Private (Owner only)
exports.getOwnerCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'lastBooking' } = req.query;
    const skip = (page - 1) * limit;

    // Get all bookings for this owner
    const allBookings = await Booking.find({ owner: req.user._id })
      .populate('user', 'fullName email phone gender createdAt')
      .populate('pg', 'name')
      .populate('room', 'roomNumber')
      .sort({ createdAt: -1 });

    // Group bookings by customer (userId)
    const customerMap = new Map();

    allBookings.forEach(booking => {
      // Skip if booking doesn't have required data
      if (!booking.user || !booking.pg || !booking.room) {
        return;
      }

      const userId = booking.user._id.toString();
      
      if (!customerMap.has(userId)) {
        customerMap.set(userId, {
          _id: booking.user._id,
          fullName: booking.user.fullName || 'Unknown',
          email: booking.user.email || 'N/A',
          phone: booking.user.phone || 'N/A',
          gender: booking.user.gender || 'Not specified',
          memberSince: booking.user.createdAt,
          totalBookings: 0,
          totalAmount: 0,
          lastBooking: null,
          bookingStatus: {},
          bookings: [],
        });
      }

      const customer = customerMap.get(userId);
      customer.totalBookings += 1;
      customer.totalAmount += booking.finalPrice || 0;
      
      // Track status count
      customer.bookingStatus[booking.status] = (customer.bookingStatus[booking.status] || 0) + 1;
      
      // Track last booking
      if (!customer.lastBooking || new Date(booking.checkInDate) > new Date(customer.lastBooking.checkInDate)) {
        customer.lastBooking = {
          date: booking.checkInDate,
          status: booking.status,
          pg: booking.pg.name,
        };
      }
      
      customer.bookings.push({
        _id: booking._id,
        bookingId: booking.bookingId,
        pg: booking.pg.name,
        room: booking.room.roomNumber,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        actualCheckIn: booking.actualCheckIn,
        actualCheckOut: booking.actualCheckOut,
        status: booking.status,
        bookingType: booking.bookingType,
        finalPrice: booking.finalPrice,
        numberOfNights: booking.numberOfNights,
      });
    });

    // Convert map to array
    let customers = Array.from(customerMap.values());

    // Sort by different criteria
    if (sortBy === 'totalAmount') {
      customers.sort((a, b) => b.totalAmount - a.totalAmount);
    } else if (sortBy === 'totalBookings') {
      customers.sort((a, b) => b.totalBookings - a.totalBookings);
    } else if (sortBy === 'lastBooking') {
      customers.sort((a, b) => {
        const dateA = b.lastBooking ? new Date(b.lastBooking.date) : new Date(0);
        const dateB = a.lastBooking ? new Date(a.lastBooking.date) : new Date(0);
        return dateA - dateB;
      });
    }

    const total = customers.length;
    
    // Paginate
    const paginatedCustomers = customers.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      success: true,
      customers: paginatedCustomers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
      summary: {
        totalCustomers: customers.length,
        totalRevenue: customers.reduce((sum, c) => sum + c.totalAmount, 0),
        totalBookings: allBookings.length,
        averageSpentPerCustomer: customers.length > 0 
          ? Math.round(customers.reduce((sum, c) => sum + c.totalAmount, 0) / customers.length)
          : 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching customers',
      error: error.message,
    });
  }
};

// @route   PATCH /api/bookings/:id/check-in-out
// @desc    Update check-in and check-out details
// @access  Private (Owner only)
exports.updateCheckInOut = async (req, res) => {
  try {
    const { id } = req.params;
    const { actualCheckIn, actualCheckOut, stayedCustomers } = req.body;

    // Find booking
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Authorization check
    if (booking.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this booking',
      });
    }

    // Update check-in and check-out details
    if (actualCheckIn) booking.actualCheckIn = new Date(actualCheckIn);
    if (actualCheckOut) booking.actualCheckOut = new Date(actualCheckOut);

    // Update stayed customers
    if (stayedCustomers && Array.isArray(stayedCustomers)) {
      booking.stayedCustomers.push(...stayedCustomers);
    }

    await booking.save();

    // Update room availability after check-in/check-out update
    await updateRoomAvailability(booking.room);

    res.status(200).json({
      success: true,
      message: 'Check-in and check-out details updated successfully',
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating check-in and check-out details',
      error: error.message,
    });
  }
};
