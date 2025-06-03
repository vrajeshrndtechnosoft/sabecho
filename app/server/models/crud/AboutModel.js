const mongoose = require('mongoose');

const aboutUsSchema = new mongoose.Schema({
  headerImage: {
    type: String,
    required: true
  },
  whoWeAre: {
    title: {
      type: String,
      default: "Who We Are"
    },
    description: {
      type: String,
      required: true
    },
    images: [{
      type: String
    }]
  },
  ourValues: {
    title: {
      type: String,
      default: "Our Values"
    },
    description: {
      type: String
    },
    values: [{
      icon: String,
      title: String
    }]
  },
  ourJourney: {
    title: {
      type: String,
      default: "Our Journey"
    },
    description: {
      type: String
    },
    milestones: [{
      icon: String,
      description: String,
      year: String
    }]
  },
  awardsAndAchievements: {
    title: {
      type: String,
      default: "Awards & Achievements"
    },
    awards: [{
      image: String,
      title: String
    }]
  },
  navigationButtons: [{
    label: String,
    link: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const AboutUs = mongoose.model('Aboutpage', aboutUsSchema);

module.exports = AboutUs;