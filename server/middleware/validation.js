// Input validation middleware
exports.validateEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

exports.validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

exports.validatePassword = (password) => {
  // At least 6 chars, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/;
  return passwordRegex.test(password);
};

exports.validateBooking = (req, res, next) => {
  const { checkInDate, checkOutDate, roomId } = req.body;

  if (!roomId) {
    return res.status(400).json({
      success: false,
      message: 'Room ID is required',
    });
  }

  if (!checkInDate || !checkOutDate) {
    return res.status(400).json({
      success: false,
      message: 'Check-in and check-out dates are required',
    });
  }

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkIn < today) {
    return res.status(400).json({
      success: false,
      message: 'Check-in date cannot be in the past',
    });
  }

  if (checkOut <= checkIn) {
    return res.status(400).json({
      success: false,
      message: 'Check-out date must be after check-in date',
    });
  }

  next();
};

exports.sanitizeInput = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
};
