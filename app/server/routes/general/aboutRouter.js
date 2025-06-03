const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AboutUs = require('../../models/crud/AboutUs');


// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Make sure this directory exists
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
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

// Middleware to validate AboutUs data
const validateAboutUsData = (req, res, next) => {
  const { title, description, listOfImages } = req.body;
  
  if (!title || !description || !listOfImages) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  if (title.length > 100) {
    return res.status(400).json({ message: 'Title must be 100 characters or less' });
  }
  
  if (description.length > 1000) {
    return res.status(400).json({ message: 'Description must be 1000 characters or less' });
  }
  
  next();
};

// Helper function to delete file
const deleteFile = (filename) => {
  fs.unlink(path.join('uploads', filename), (err) => {
    if (err) console.error('Error deleting file:', err);
  });
};

// Create AboutUs
router.post('/', upload.array('images', 10), validateAboutUsData, async (req, res) => {
  try {
    const { title, description, listOfImages } = req.body;
    
    let parsedListOfImages;
    try {
      parsedListOfImages = JSON.parse(listOfImages);
    } catch (error) {
      req.files?.forEach(file => deleteFile(file.filename));
      return res.status(400).json({ message: 'Invalid listOfImages format' });
    }

    if (!Array.isArray(parsedListOfImages) || parsedListOfImages.length !== req.files.length) {
      req.files?.forEach(file => deleteFile(file.filename));
      return res.status(400).json({ message: 'Mismatch between listOfImages and uploaded files' });
    }

    const imageItems = parsedListOfImages.map((item, index) => {
      if (item.image.altText.length > 100 || item.title.length > 100 || item.description.length > 500) {
        throw new Error('Image item data exceeds maximum length');
      }
      return {
        image: {
          url: req.files[index].filename,
          altText: item.image.altText
        },
        title: item.title,
        description: item.description
      };
    });

    const aboutUs = new AboutUs({
      title,
      description,
      listOfImages: imageItems
    });

    await aboutUs.save();
    res.status(201).json(aboutUs);
  } catch (error) {
    // Delete uploaded files if saving to database fails
    req.files?.forEach(file => deleteFile(file.filename));
    res.status(500).json({ message: 'Error creating AboutUs', error: error.message });
  }
});


// Get all AboutUs
router.get('/', async (req, res) => {
    try {
        const aboutUs = await AboutUs.find();
        res.json(aboutUs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single AboutUs
router.get('/:id', getAboutUs, (req, res) => {
    res.json(res.aboutUs);
});

router.patch('/:id', getAboutUs, upload.array('images', 10), async (req, res) => {
  try {
    const { title, description, listOfImages } = req.body;

    if (title) res.aboutUs.title = title;
    if (description) res.aboutUs.description = description;

    if (listOfImages) {
      let parsedListOfImages;
      try {
        parsedListOfImages = typeof listOfImages === 'string' ? JSON.parse(listOfImages) : listOfImages;
      } catch (error) {
        throw new Error('Invalid listOfImages format');
      }

      const newImages = req.files || [];
      let newImageIndex = 0;

      // Keep track of existing images to delete
      const existingImages = new Set(res.aboutUs.listOfImages.map(item => item.image.url));

      res.aboutUs.listOfImages = parsedListOfImages.map((item) => {
        if (!item.image.url || item.image.url === 'new') {
          // This is a new image
          if (newImageIndex >= newImages.length) {
            throw new Error('Not enough image files uploaded');
          }
          return {
            image: {
              url: newImages[newImageIndex++].filename,
              altText: item.image.altText
            },
            title: item.title,
            description: item.description
          };
        } else {
          // This is an existing image
          existingImages.delete(item.image.url);
          return item;
        }
      });

      // Delete old images that are no longer used
      for (const oldImageUrl of existingImages) {
        deleteFile(oldImageUrl);
      }
    }

    // Validate required fields
    if (!res.aboutUs.title || !res.aboutUs.description || res.aboutUs.listOfImages.length === 0) {
      throw new Error('Missing required fields');
    }

    // Validate field lengths
    if (res.aboutUs.title.length > 100 || res.aboutUs.description.length > 1000) {
      throw new Error('Title or description exceeds maximum length');
    }

    for (const item of res.aboutUs.listOfImages) {
      if (item.image.altText.length > 100 || item.title.length > 100 || item.description.length > 500) {
        throw new Error('Image item exceeds maximum length for altText, title, or description');
      }
    }

    await res.aboutUs.save();
    res.json(res.aboutUs);
  } catch (error) {
    // Delete any newly uploaded files if an error occurred
    req.files?.forEach(file => deleteFile(file.filename));
    res.status(400).json({ message: error.message });
  }
});
// Delete AboutUs
router.delete('/:id', getAboutUs, async (req, res) => {
    try {
        // Delete associated image files
        res.aboutUs.listOfImages.forEach(item => {
            deleteFile(item.image.url);
        });

        await AboutUs.findByIdAndDelete(req.params.id);
        res.json({ message: 'AboutUs deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Middleware to get AboutUs by ID
async function getAboutUs(req, res, next) {
    let aboutUs;
    try {
        aboutUs = await AboutUs.findById(req.params.id);
        if (aboutUs == null) {
            return res.status(404).json({ message: 'Cannot find AboutUs' });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

    res.aboutUs = aboutUs;
    next();
}

module.exports = router;

