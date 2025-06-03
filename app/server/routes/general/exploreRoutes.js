const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const ExploreCategory = require('../../models/crud/ExploreCategory'); // Adjust the path as needed

// Configure Multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Make sure this directory exists
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

// Create a new ExploreCategory
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { title, productNames, metaDescription, keywords, slug } = req.body;
        const newCategory = new ExploreCategory({
            title,
            slug: slug || generateSlug(title),
            productNames: JSON.parse(productNames),
            metaDescription,
            keywords: JSON.parse(keywords),
            image: {
                url: req.file.filename,
                altText: req.body.altText || title
            }
        });
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all ExploreCategories
router.get('/', async (req, res) => {
    try {
        const categories = await ExploreCategory.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single ExploreCategory by ID
router.get('/:id', async (req, res) => {
    try {
        const category = await ExploreCategory.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update an ExploreCategory
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { title, productNames,slug, metaDescription, keywords } = req.body;
        const updateData = {
            title,
            productNames: JSON.parse(productNames),
            metaDescription,
            slug: slug,
            keywords: JSON.parse(keywords)
        };

        if (req.file) {
            updateData.image = {
                url: req.file.filename,
                altText: req.body.altText || title
            };

            // Delete old image if it exists
            const oldCategory = await ExploreCategory.findById(req.params.id);
            if (oldCategory && oldCategory.image && oldCategory.image.url) {
                fs.unlink(oldCategory.image.url, (err) => {
                    if (err) console.error('Error deleting old image:', err);
                });
            }
        }

        const updatedCategory = await ExploreCategory.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedCategory) return res.status(404).json({ message: 'Category not found' });
        res.json(updatedCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete an ExploreCategory
router.delete('/:id', async (req, res) => {
    try {
        const category = await ExploreCategory.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

  
        await ExploreCategory.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const IMAGE_DIRECTORY = path.join(__dirname, '../../uploads');
router.get('/image/:filename', (req, res) => {
    const { filename } = req.params;
    const imagePath = path.join(IMAGE_DIRECTORY, filename);

    res.sendFile(imagePath, (err) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.status(404).send('Image not found');
            } else {
                res.status(500).send('Error serving the image');
            }
        }
    });
});


module.exports = router;