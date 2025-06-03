const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExploreCategorySchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
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
  productNames: [{
    type: String,
    trim: true
  }],
  metaDescription: {
    type: String,
    maxlength: 160
  },
  keywords: [{
    type: String,
    trim: true
  }]
}, { timestamps: true });

// Create a text index for improved search functionality
ExploreCategorySchema.index({
  title: 'text',
  'productNames': 'text',
  metaDescription: 'text',
  keywords: 'text'
});

// Pre-save hook to generate slug from title if not provided
ExploreCategorySchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.title.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-');
  }
  next();
});

module.exports = mongoose.model('ExploreCategory', ExploreCategorySchema);