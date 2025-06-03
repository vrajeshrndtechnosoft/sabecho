const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const mime = require('mime-types');
const WhyChoose = require('../../models/crud/Services'); // Adjust the path as needed



// Set up Multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Create
router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Image is required' });
        }

        const whyChoose = new WhyChoose({
            ...req.body,
            image: req.file.filename,
            keywords: JSON.parse(req.body.keywords || '[]')
        });

        await whyChoose.save();
        res.status(201).json(whyChoose);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Read (Get all)
router.get('/', async (req, res) => {
    try {
        const whyChooses = await WhyChoose.find();
        res.json(whyChooses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Read (Get one)
router.get('/:id', async (req, res) => {
    try {
        const whyChoose = await WhyChoose.findById(req.params.id);
        if (!whyChoose) return res.status(404).json({ message: 'Not found' });
        res.json(whyChoose);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        let updateData = { ...req.body };
        if (req.file) {
            updateData.image = req.file.filename;
        }
        if (req.body.keywords) {
            updateData.keywords = JSON.parse(req.body.keywords);
        }

        const whyChoose = await WhyChoose.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!whyChoose) return res.status(404).json({ message: 'Not found' });
        res.json(whyChoose);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete
router.delete('/:id', async (req, res) => {
    try {
        const whyChoose = await WhyChoose.findByIdAndDelete(req.params.id);
        if (!whyChoose) return res.status(404).json({ message: 'Not found' });

        // Delete associated image file
        if (whyChoose.image) {
            fs.unlink(whyChoose.image, (err) => {
                if (err) console.error('Error deleting image:', err);
            });
        }

        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;