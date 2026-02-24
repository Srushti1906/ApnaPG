const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // Basic Information
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [3, 'Full name must be at least 3 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[0-9]{10}$/, 'Phone must be 10 digits'],
    },

    // Gender (Important for booking restrictions)
    gender: {
      type: String,
      enum: {
        values: ['Male', 'Female', 'Other'],
        message: 'Please select a valid gender',
      },
      required: [true, 'Gender is required'],
    },

    // ID & Emergency Contact (Required for one-day stay)
    idNumber: {
      type: String, // Mock field - could be Aadhaar, PAN, etc.
      default: null,
    },
    idType: {
      type: String,
      enum: ['Aadhaar', 'PAN', 'DrivingLicense', 'Passport'],
      default: null,
    },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },

    // Role-based access
    role: {
      type: String,
      enum: {
        values: ['User', 'Owner', 'Admin'],
        message: 'Invalid role',
      },
      default: 'User',
    },

    // Address Information
    city: {
      type: String,
      default: null,
    },
    state: {
      type: String,
      default: null,
    },

    // Status
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Profile
    profileImage: {
      type: String,
      default: null,
    },

    // Preferences
    preferredLocations: [String],
    bookingHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
      },
    ],
  },
  {
    timestamps: true,
    indexes: [{ email: 1 }, { phone: 1 }, { role: 1 }],
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Hide sensitive data
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
