const Room = require('../models/Room');
const PG = require('../models/PG');

// @route   POST /api/rooms
// @desc    Create a new room (Owner only)
// @access  Private
exports.createRoom = async (req, res) => {
  try {
    const {
      pg,
      roomNumber,
      roomType,
      bedCount,
      monthlyPrice,
      dailyPrice,
      amenities,
      allowOneDayStay,
      minStayDays,
      maxStayDays,
    } = req.body;

    // Validation
    if (!pg || !roomNumber || !roomType || !bedCount || !monthlyPrice || !dailyPrice) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided',
      });
    }

    // Check if PG exists and user is owner
    const pgData = await PG.findById(pg);
    if (!pgData) {
      return res.status(404).json({
        success: false,
        message: 'PG not found',
      });
    }

    if (pgData.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add rooms to this PG',
      });
    }

    const room = await Room.create({
      pg,
      roomNumber,
      roomType,
      bedCount,
      availableBeds: bedCount,
      monthlyPrice,
      dailyPrice,
      amenities,
      allowOneDayStay,
      minStayDays,
      maxStayDays,
      availability: {
        totalBeds: bedCount,
        vacantBeds: bedCount,
        nextAvailableDate: new Date(),
      },
    });

    // Add room to PG
    pgData.rooms.push(room._id);
    pgData.minPrice = Math.min(pgData.minPrice || dailyPrice, dailyPrice);
    pgData.maxPrice = Math.max(pgData.maxPrice || dailyPrice, dailyPrice);
    await pgData.save();

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating room',
      error: error.message,
    });
  }
};

// @route   GET /api/rooms/:id
// @desc    Get room details
// @access  Public
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('pg')
      .populate('recentBookings', 'user checkInDate checkOutDate');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching room',
      error: error.message,
    });
  }
};

// @route   PUT /api/rooms/:id
// @desc    Update room (Owner only)
// @access  Private
exports.updateRoom = async (req, res) => {
  try {
    let room = await Room.findById(req.params.id).populate('pg');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Check authorization
    if (room.pg.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this room',
      });
    }

    room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating room',
      error: error.message,
    });
  }
};

// @route   DELETE /api/rooms/:id
// @desc    Delete room (Owner only)
// @access  Private
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('pg');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Check authorization
    if (room.pg.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this room',
      });
    }

    await Room.findByIdAndDelete(req.params.id);

    // Remove from PG
    await PG.findByIdAndUpdate(room.pg._id, {
      $pull: { rooms: room._id },
    });

    res.status(200).json({
      success: true,
      message: 'Room deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting room',
      error: error.message,
    });
  }
};

// @route   PUT /api/rooms/:id/availability
// @desc    Update room availability
// @access  Private
exports.updateAvailability = async (req, res) => {
  try {
    const { vacantBeds, nextAvailableDate } = req.body;

    const room = await Room.findById(req.params.id).populate('pg');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Authorization check
    if (room.pg.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (vacantBeds >= 0 && vacantBeds <= room.bedCount) {
      room.availability.vacantBeds = vacantBeds;
    }

    if (nextAvailableDate) {
      room.availability.nextAvailableDate = nextAvailableDate;
    }

    await room.save();

    res.status(200).json({
      success: true,
      message: 'Availability updated',
      room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating availability',
      error: error.message,
    });
  }
};

// @route   POST /api/rooms/:id/upload-images
// @desc    Upload images for a room (Owner only)
// @access  Private
exports.uploadRoomImages = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('pg');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Check authorization
    if (room.pg.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to upload images for this room',
      });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided',
      });
    }

    // Generate image URLs
    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);

    // Add new images to room
    room.images = [...(room.images || []), ...imageUrls];
    await room.save();

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      images: imageUrls,
      room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading images',
      error: error.message,
    });
  }
};

// @route   DELETE /api/rooms/:id/images/:imagePath
// @desc    Delete a specific image from room (Owner only)
// @access  Private
exports.deleteRoomImage = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('pg');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Check authorization
    if (room.pg.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete images from this room',
      });
    }

    const { imagePath } = req.params;
    const decodedPath = decodeURIComponent(imagePath);

    // Remove image from array
    room.images = room.images.filter(img => img !== decodedPath);
    await room.save();

    // Delete file from filesystem
    const path = require('path');
    const fs = require('fs');
    const filePath = path.join(__dirname, '../', decodedPath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting image',
      error: error.message,
    });
  }
};
