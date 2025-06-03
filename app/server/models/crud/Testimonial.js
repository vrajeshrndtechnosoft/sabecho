const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  quote: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  backgroundColor: {
    type: String,
    required: true,
    trim: true
  },
  imagePath: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

module.exports = Testimonial;