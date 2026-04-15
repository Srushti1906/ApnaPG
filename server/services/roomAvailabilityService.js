const Booking = require('../models/Booking');
const Room = require('../models/Room');

/**
 * Calculate actual available beds for a room based on current bookings
 * Takes into account:
 * - Confirmed bookings with future dates
 * - Checked-in customers
 * - Actual check-outs
 */
exports.calculateActualAvailableBeds = async (roomId) => {
  try {
    const room = await Room.findById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const now = new Date();

    // Get all active bookings for this room
    const activeBookings = await Booking.find({
      room: roomId,
      status: { $in: ['Confirmed', 'CheckedIn', 'CheckedOut'] },
    });

    // Count occupied beds
    let occupiedBeds = 0;

    activeBookings.forEach(booking => {
      // If already checked out with actual check-out date, don't count
      if (booking.actualCheckOut && new Date(booking.actualCheckOut) <= now) {
        return; // Skip this booking
      }

      // If checked in (actualCheckIn is set)
      if (booking.actualCheckIn) {
        occupiedBeds += 1;
      }
      // If confirmed but not yet checked in
      else if (booking.status === 'Confirmed') {
        // Check if booking date is today or in future
        const checkInDate = new Date(booking.checkInDate);
        checkInDate.setHours(0, 0, 0, 0);
        const todayDate = new Date(now);
        todayDate.setHours(0, 0, 0, 0);

        if (checkInDate >= todayDate) {
          occupiedBeds += 1;
        } else if (
          new Date(booking.checkOutDate) > now &&
          checkInDate <= todayDate
        ) {
          // Booking is ongoing but not checked in yet - still occupy bed
          occupiedBeds += 1;
        }
      }
    });

    // Calculate available beds
    const availableBeds = Math.max(0, room.bedCount - occupiedBeds);

    return {
      totalBeds: room.bedCount,
      occupiedBeds,
      availableBeds,
      activeBookings: activeBookings.length,
    };
  } catch (error) {
    console.error('Error calculating available beds:', error);
    throw error;
  }
};

/**
 * Update room availability in database based on actual bookings
 */
exports.updateRoomAvailability = async (roomId) => {
  try {
    const availability = await this.calculateActualAvailableBeds(roomId);

    await Room.findByIdAndUpdate(
      roomId,
      { availableBeds: availability.availableBeds },
      { new: true }
    );

    return availability;
  } catch (error) {
    console.error('Error updating room availability:', error);
    throw error;
  }
};

/**
 * Update availability for all rooms in a PG
 */
exports.updatePGRoomsAvailability = async (pgId) => {
  try {
    const rooms = await Room.find({ pg: pgId });

    for (const room of rooms) {
      await this.updateRoomAvailability(room._id);
    }

    return {
      success: true,
      message: `Updated availability for ${rooms.length} rooms`,
    };
  } catch (error) {
    console.error('Error updating PG rooms availability:', error);
    throw error;
  }
};

/**
 * Get room availability including real-time data
 */
exports.getRoomAvailabilityWithDetails = async (roomId) => {
  try {
    const room = await Room.findById(roomId).populate('pg', 'name address');
    if (!room) {
      throw new Error('Room not found');
    }

    const availability = await this.calculateActualAvailableBeds(roomId);

    return {
      room: {
        _id: room._id,
        roomNumber: room.roomNumber,
        roomType: room.roomType,
        bedCount: room.bedCount,
        dailyPrice: room.dailyPrice,
        monthlyPrice: room.monthlyPrice,
        pg: room.pg,
      },
      availability,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('Error getting room availability:', error);
    throw error;
  }
};
