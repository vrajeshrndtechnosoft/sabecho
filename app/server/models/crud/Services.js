const mongoose = require('mongoose');

// Why Services Schema
const whyServicesSchema = new mongoose.Schema({

    image: {
        type: String,
        required: true
    },
    imageAlt: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    metaTitle: {
        type: String,
        trim: true
    },
    metaDescription: {
        type: String,
        trim: true
    },
    keywords: [{
        type: String,
        trim: true
    }]
}, { timestamps: true });


module.exports  = mongoose.model('WhyServices', whyServicesSchema);

