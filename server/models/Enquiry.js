const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    pg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PG',
    },
    pgName: String,
    name: { type: String, required: true },
    phone: { type: String, required: true },
    altPhone: String,
    collegeName: String,
    age: Number,
    occupation: String,
    durationType: {
      type: String,
      enum: ['oneDay', 'custom', 'oneMonth'],
      default: 'custom',
    },
    days: Number,
    message: String,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Enquiry', enquirySchema);
