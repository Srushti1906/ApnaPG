const Booking = require('../models/Booking');

/**
 * Service to handle automatic booking completion/cancellation
 * when the checkout date has passed
 */

// Auto-complete bookings whose checkout date has passed
const autoCompleteExpiredBookings = async () => {
  try {
    const now = new Date();
    
    // Find all active bookings where checkout date has passed
    const expiredBookings = await Booking.find({
      checkOutDate: { $lt: now },
      status: { 
        $in: ['Pending', 'Confirmed', 'CheckedIn']
      }
    });

    console.log(`Found ${expiredBookings.length} expired bookings to update`);

    // Update each expired booking
    for (const booking of expiredBookings) {
      const updateData = {
        status: 'Completed',
        completedAt: now,
      };

      // If booking was not checked out, auto-checkout
      if (booking.status !== 'CheckedOut') {
        updateData.checkOutTime = now;
      }

      const updatedBooking = await Booking.findByIdAndUpdate(
        booking._id,
        updateData,
        { new: true }
      );

      console.log(`✓ Booking ${booking.bookingId || booking._id} auto-completed`);
    }

    console.log(`✓ Auto-completion process completed. Updated ${expiredBookings.length} bookings`);
    return {
      success: true,
      message: `Auto-completed ${expiredBookings.length} expired bookings`,
      updated: expiredBookings.length,
    };
  } catch (error) {
    console.error('Error in autoCompleteExpiredBookings:', error);
    return {
      success: false,
      message: 'Error auto-completing bookings',
      error: error.message,
    };
  }
};

module.exports = {
  autoCompleteExpiredBookings,
};
