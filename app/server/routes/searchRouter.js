const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const sendProductInquiryEmail  = require('../services/sendProductInquiryEmail');

router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;
        const products = await Product.find({ name: { $regex: new RegExp(query, 'i') } })
            .select('categoryType categorySubType location name');
        res.json(products);
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/sendmail', async (req, res) => {
    try {
        const { user, inquiryDetails } = req.query;
        // Replace this with actual user and inquiryDetails data, if available.
        await sendProductInquiryEmail(user, inquiryDetails);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
