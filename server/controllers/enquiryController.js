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
