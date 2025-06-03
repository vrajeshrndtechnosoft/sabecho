const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageItemSchema = new Schema({
  image: {
    url: {
      type: String,
      required: true
    },
    altText: {
      type: String,
      required: true,
      maxlength: 100
    }
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  }
});

const AboutUsSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  listOfImages: [ImageItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('AboutUs', AboutUsSchema);  