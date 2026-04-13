const User = require('../models/User');
const { generateToken } = require('../middleware/tokenUtils');
const { validateEmail, validatePassword, validatePhone } = require('../middleware/validation');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, phone, gender, role } = req.body;

    // Validation
    if (!fullName || !email || !password || !confirmPassword || !phone || !gender) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone must be 10 digits',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Create new user
    user = await User.create({
      fullName,
      email,
      password,
      phone,
      gender,
      role: role || 'User',
    });

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message,
    });
  }
};

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Check for user (include password field)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is inactive',
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        role: user.role,
        city: user.city,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
    });
  }
};

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('bookingHistory');

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message,
    });
  }
};

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phone, city, state, emergencyContact, idNumber, idType } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        fullName,
        phone,
        city,
        state,
        emergencyContact,
        idNumber,
        idType,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message,
    });
  }
};

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token deletion)
// @access  Public
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful. Please delete the token from client side.',
  });
};

// @route   POST /api/auth/forgot-password
// @desc    Request password reset via phone number verification
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone must be 10 digits',
      });
    }

    // Find user by phone
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this phone number',
      });
    }

    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

    // Save reset code to user
    user.passwordResetCode = resetCode;
    user.passwordResetExpiry = resetExpiry;
    await user.save();

    // In production, send SMS via Twilio or similar service
    // For now, log it for testing
    console.log(`Password reset code for ${phone}: ${resetCode}`);

    res.status(200).json({
      success: true,
      message: 'Password reset code sent to your phone',
      // In production, don't return the code. For testing:
      resetCode: resetCode,
      expiresIn: '15 minutes',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing forgot password',
      error: error.message,
    });
  }
};

// @route   POST /api/auth/reset-password
// @desc    Reset password with verification code
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { phone, resetCode, newPassword, confirmPassword } = req.body;

    if (!phone || !resetCode || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Find user and check reset code
    const user = await User.findOne({ phone }).select('+passwordResetCode +passwordResetExpiry');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this phone number',
      });
    }

    // Verify reset code
    if (user.passwordResetCode !== resetCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset code',
      });
    }

    // Check if code has expired
    if (!user.passwordResetExpiry || new Date() > user.passwordResetExpiry) {
      return res.status(400).json({
        success: false,
        message: 'Reset code has expired. Please request a new one',
      });
    }

    // Update password
    user.password = newPassword;
    user.passwordResetCode = null;
    user.passwordResetExpiry = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. Please login with your new password',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message,
    });
  }
};
