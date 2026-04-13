const Enquiry = require('../models/Enquiry');
const PG = require('../models/PG');

exports.createEnquiry = async (req, res) => {
  try {
    const { pgId, name, phone, altPhone, collegeName, age, occupation, message, durationType, days } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required' });
    }

    let pgName = null;
    if (pgId) {
      const pg = await PG.findById(pgId).select('name');
      if (pg) pgName = pg.name;
    }

    const enquiry = await Enquiry.create({
      pg: pgId || null,
      pgName,
      name,
      phone,
      altPhone,
      collegeName,
      age,
      occupation,
      durationType,
      days,
      message,
    });

    res.status(201).json({ success: true, message: 'Enquiry received', enquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating enquiry', error: error.message });
  }
};

// Get enquiries for owner's PGs
exports.getOwnerEnquiries = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Get all PGs owned by this user
    const ownerPGs = await PG.find({ owner: req.user._id }).select('_id');
    const pgIds = ownerPGs.map(pg => pg._id);

    if (pgIds.length === 0) {
      return res.status(200).json({
        success: true,
        enquiries: [],
        pagination: {
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: 0,
        },
      });
    }

    const enquiries = await Enquiry.find({ pg: { $in: pgIds } })
      .populate('pg', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Enquiry.countDocuments({ pg: { $in: pgIds } });

    res.status(200).json({
      success: true,
      enquiries,
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
      message: 'Error fetching enquiries',
      error: error.message,
    });
  }
};
