const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Testimonial = require('../../models/crud/Testimonial'); // Adjust the path as needed

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) // Append timestamp to filename
  }
});

const upload = multer({ storage: storage });

// GET all testimonials
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find();
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new testimonial
router.post('/', upload.single('image'), async (req, res) => {
  const testimonial = new Testimonial({
    title: req.body.title,
    quote: req.body.quote,
    name: req.body.name,
    position: req.body.position,
    backgroundColor: req.body.backgroundColor,
    imagePath: req.file  ? req.file.filename : ''
  });

  try {
    const newTestimonial = await testimonial.save();
    res.status(201).json(newTestimonial);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;