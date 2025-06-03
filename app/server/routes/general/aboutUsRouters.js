const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AboutUs = require('../../models/crud/AboutModel'); // Adjust the path as needed

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!');
    }
  }
});

// Helper function to handle file uploads
const handleFileUpload = (file) => {
  if (file) {
    return file.filename; // Return only the filename
  }
  return null;
};

// GET endpoint to retrieve the AboutUs data
router.get('/', async (req, res) => {
  try {
    const aboutUs = await AboutUs.findOne().sort({ createdAt: -1 });
    if (!aboutUs) {
      return res.status(404).json({ message: 'About Us content not found' });
    }
    res.json(aboutUs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST endpoint to create or update the AboutUs data
router.post('/', upload.fields([
  { name: 'headerImage', maxCount: 1 },
  { name: 'whoWeAreImages', maxCount: 5 },
  { name: 'awardImages', maxCount: 10 }
]), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);
    
    // Handle file uploads
    if (req.files.headerImage) {
      data.headerImage = handleFileUpload(req.files.headerImage[0]);
    }
    
    if (req.files.whoWeAreImages) {
      data.whoWeAre = data.whoWeAre || {}; // Ensure whoWeAre object exists
      data.whoWeAre.images = req.files.whoWeAreImages.map(handleFileUpload);
    }
    
    if (req.files.awardImages) {
      data.awardsAndAchievements = data.awardsAndAchievements || {}; // Ensure awardsAndAchievements object exists
      data.awardsAndAchievements.awards = (data.awardsAndAchievements.awards || []).map((award, index) => ({
        ...award,
        image: req.files.awardImages[index] ? handleFileUpload(req.files.awardImages[index]) : award.image
      }));
    }

    const updatedAboutUs = await AboutUs.findOneAndUpdate(
      {}, // Empty filter to match any document
      { ...data, updatedAt: Date.now() },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(updatedAboutUs);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;