const PG = require('../models/PG');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const User = require('../models/User');

// @route   POST /api/pgs
// @desc    Create a new PG (Owner only)
// @access  Private
exports.createPG = async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      location,
      nearbyCollege,
      nearbySchool,
      nearbyOffice,
      genderAllowed,
      amenities,
      rules,
      allowsDailyStay,
      allowsMonthlyStay,
      securityDepositPercentage,
      hasMess,
      price,
    } = req.body;

    console.log('Received PG data:', req.body);

    // Validation
    if (!name || !description || !address || !genderAllowed) {
      console.error('Validation failed - Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Required fields: name, description, address, genderAllowed',
      });
    }

    const pgData = {
      name,
      description,
      address,
      location,
      nearbyCollege,
      nearbySchool,
      nearbyOffice,
      genderAllowed,
      amenities,
      rules,
      allowsDailyStay,
      allowsMonthlyStay,
      securityDepositPercentage,
      hasMess,
      price,
      owner: req.user._id,
      ownerEmail: req.user.email,
      ownerPhone: req.user.phone,
    };

    const pg = await PG.create(pgData);
    console.log('PG created successfully:', pg._id);

    // Create a default room for the PG
    try {
      const defaultRoom = await Room.create({
        pg: pg._id,
        roomNumber: '101',
        roomType: 'Standard',
        capacity: 2,
        dailyPrice: Math.round((price || 5000) / 30), // Estimate daily price from monthly price
        monthlyPrice: price || 5000,
        availability: {
          totalBeds: 2,
          vacantBeds: 2,
        },
        amenities: amenities || {},
        allowOneDayStay: true,
        isActive: true,
      });
      
      // Add room to PG's rooms array
      pg.rooms = pg.rooms || [];
      pg.rooms.push(defaultRoom._id);
      await pg.save();
      
      console.log('Default room created for PG:', defaultRoom._id);
    } catch (roomErr) {
      console.error('Error creating default room:', roomErr.message);
      // Don't fail the PG creation if room creation fails
    }

    res.status(201).json({
      success: true,
      message: 'PG created successfully. Awaiting admin verification.',
      pg,
    });
  } catch (error) {
    console.error('Error creating PG:', error.message);
    console.error('Full error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating PG: ' + error.message,
      error: error.message,
    });
  }
};

// @route   GET /api/pgs
// @desc    Get all PGs with filters (both verified and unverified active PGs)
// @access  Public
exports.getPGs = async (req, res) => {
  try {
    const { city, gender, budget, nearbyCollege, page = 1, limit = 10 } = req.query;

    let filter = { isActive: true, isBlocked: false };

    if (city) filter['address.city'] = { $regex: new RegExp(`^${city}$`, 'i') };
    if (gender) {
      const g = (gender || '').toString().toLowerCase();
      if (g.includes('family') || g.includes('couple')) {
        filter.genderAllowed = { $regex: /Mixed|Family|Couple/i };
      } else {
        filter.genderAllowed = { $regex: new RegExp(`^${gender}$`, 'i') };
      }
    }
    if (nearbyCollege) filter.nearbyCollege = nearbyCollege;

    if (budget) {
      filter.minPrice = { $lte: parseInt(budget) };
    }

    const skip = (page - 1) * limit;

    let pgs = await PG.find(filter)
      .populate('owner', 'fullName phone email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await PG.countDocuments(filter);

    // Compute realistic min/max prices from rooms for each PG (daily prices)
    const pgsWithPrices = [];
    const roundToNearest = (n, step = 10, roundUp = false) => {
      if (roundUp) return Math.ceil(n / step) * step;
      return Math.floor(n / step) * step;
    };

    for (const pg of pgs) {
      const rooms = await Room.find({ pg: pg._id }).select('dailyPrice monthlyPrice');
      const pgObj = pg.toObject();
      if (rooms && rooms.length > 0) {
        const dailyPrices = rooms.map((r) => r.dailyPrice || (r.monthlyPrice ? Math.round(r.monthlyPrice / 30) : 0)).filter(Boolean);
        if (dailyPrices.length) {
          let minDaily = Math.min(...dailyPrices);
          let maxDaily = Math.max(...dailyPrices);

          // if min and max are equal, expand to a sensible range
          if (minDaily === maxDaily) {
            const newMin = Math.max(50, Math.floor(minDaily * 0.5));
            const newMax = Math.ceil(maxDaily * 1.5);
            pgObj.minPrice = roundToNearest(newMin, 10, false) || minDaily;
            pgObj.maxPrice = roundToNearest(newMax, 10, true) || maxDaily;
          } else {
            pgObj.minPrice = roundToNearest(minDaily, 10, false) || minDaily;
            pgObj.maxPrice = roundToNearest(maxDaily, 10, true) || maxDaily;
          }
        }
      }

      pgsWithPrices.push(pgObj);
    }

    res.status(200).json({
      success: true,
      pgs: pgsWithPrices,
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
      message: 'Error fetching PGs',
      error: error.message,
    });
  }
};

// @route   GET /api/pgs/:id
// @desc    Get single PG with rooms
// @access  Public
exports.getPGById = async (req, res) => {
  try {
    let pg = await PG.findById(req.params.id).populate('owner', 'fullName phone email');
    // fetch rooms separately (rooms may not be stored in pg.rooms array)
    const rooms = await Room.find({ pg: req.params.id });

    if (!pg) {
      return res.status(404).json({
        success: false,
        message: 'PG not found',
      });
    }

    // compute min/max from fetched rooms
    if (rooms && rooms.length > 0) {
      const dailyPrices = rooms.map((r) => r.dailyPrice || (r.monthlyPrice ? Math.round(r.monthlyPrice / 30) : 0)).filter(Boolean);
      pg = pg.toObject();
      pg.rooms = rooms;
      if (dailyPrices.length) {
        let minDaily = Math.min(...dailyPrices);
        let maxDaily = Math.max(...dailyPrices);
        const roundToNearest = (n, step = 10, roundUp = false) => {
          if (roundUp) return Math.ceil(n / step) * step;
          return Math.floor(n / step) * step;
        };

        if (minDaily === maxDaily) {
          const newMin = Math.max(50, Math.floor(minDaily * 0.5));
          const newMax = Math.ceil(maxDaily * 1.5);
          pg.minPrice = roundToNearest(newMin, 10, false) || minDaily;
          pg.maxPrice = roundToNearest(newMax, 10, true) || maxDaily;
        } else {
          pg.minPrice = roundToNearest(minDaily, 10, false) || minDaily;
          pg.maxPrice = roundToNearest(maxDaily, 10, true) || maxDaily;
        }
      }
    }

    res.status(200).json({
      success: true,
      pg,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching PG',
      error: error.message,
    });
  }
};

// @route   PUT /api/pgs/:id
// @desc    Update PG (Owner only)
// @access  Private
exports.updatePG = async (req, res) => {
  try {
    let pg = await PG.findById(req.params.id);

    if (!pg) {
      return res.status(404).json({
        success: false,
        message: 'PG not found',
      });
    }

    // Check if user is owner
    if (pg.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this PG',
      });
    }

    pg = await PG.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'PG updated successfully',
      pg,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating PG',
      error: error.message,
    });
  }
};

// @route   DELETE /api/pgs/:id
// @desc    Delete PG (Owner only)
// @access  Private
exports.deletePG = async (req, res) => {
  try {
    const pg = await PG.findById(req.params.id);

    if (!pg) {
      return res.status(404).json({
        success: false,
        message: 'PG not found',
      });
    }

    // Check if user is owner
    if (pg.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this PG',
      });
    }

    await PG.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'PG deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting PG',
      error: error.message,
    });
  }
};

// @route   GET /api/pgs/owner/my-pgs
// @desc    Get all PGs owned by the logged-in owner
// @access  Private (Owner only)
exports.getOwnerPGs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let pgs = await PG.find({ owner: req.user._id })
      .populate('owner', 'fullName phone email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await PG.countDocuments({ owner: req.user._id });

    // Compute realistic min/max prices from rooms for each PG
    const pgsWithPrices = [];
    const roundToNearest = (n, step = 10, roundUp = false) => {
      if (roundUp) return Math.ceil(n / step) * step;
      return Math.floor(n / step) * step;
    };

    for (const pg of pgs) {
      const rooms = await Room.find({ pg: pg._id }).select('dailyPrice monthlyPrice');
      const pgObj = pg.toObject();
      
      if (rooms && rooms.length > 0) {
        const dailyPrices = rooms.map((r) => r.dailyPrice || (r.monthlyPrice ? Math.round(r.monthlyPrice / 30) : 0)).filter(Boolean);
        if (dailyPrices.length) {
          let minDaily = Math.min(...dailyPrices);
          let maxDaily = Math.max(...dailyPrices);

          if (minDaily === maxDaily) {
            const newMin = Math.max(50, Math.floor(minDaily * 0.5));
            const newMax = Math.ceil(maxDaily * 1.5);
            pgObj.minPrice = roundToNearest(newMin, 10, false) || minDaily;
            pgObj.maxPrice = roundToNearest(newMax, 10, true) || maxDaily;
          } else {
            pgObj.minPrice = roundToNearest(minDaily, 10, false) || minDaily;
            pgObj.maxPrice = roundToNearest(maxDaily, 10, true) || maxDaily;
          }
        }
      }
      
      pgObj.roomCount = rooms ? rooms.length : 0;
      pgsWithPrices.push(pgObj);
    }

    res.status(200).json({
      success: true,
      pgs: pgsWithPrices,
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
      message: 'Error fetching owner PGs',
      error: error.message,
    });
  }
};

// @route   GET /api/pgs/:id/rooms
// @desc    Get all rooms in a PG
// @access  Public
exports.getPGRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ pg: req.params.id }).sort({ roomNumber: 1 });

    res.status(200).json({
      success: true,
      rooms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching rooms',
      error: error.message,
    });
  }
};
