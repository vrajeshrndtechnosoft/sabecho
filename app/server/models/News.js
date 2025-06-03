const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define schema for News collection
const newsSchema = new Schema({
    articleId: { type: Number, required: true, unique: true },
    dateCreated: { type: Number, required: true },
    lastModified: { type: Number, required: true },
    title: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    sourceName: { type: String, required: true },
    shares: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    imageUrl: { type: String, default: '' },
    
    thumbnail: { type: String, default: null },
    smallThumbnail: { type: String, default: null },
    byteImage: { type: Buffer, default: null },
    detailImage: { type: Buffer, default: null },
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    excerpt: { type: String, default: '' },
    status: { type: String, default: 'publish' },
    url: { type: String, default: null },
    redirectionUrl: { type: String, default: '' },
    canonicalUrl: { type: String, default: '' },
    ogContent: { type: String, default: '' },
    shortUrl: { type: String, default: '' },
    whatsappExcerpt: { type: String, default: '' },
    resizeImage: { type: Boolean, default: false },
    youtubeUrl: { type: String, default: '' },
    sentimentScore: { type: Number, default: null },
    sentimentType: { type: String, default: 'UNKNOWN' },
    notificationExcerpt: { type: String, default: '' },
    imageDisplayName: { type: String, default: '' },
    liked: { type: Boolean, default: false },
    bookmarked: { type: Boolean, default: false },
    viewed: { type: Boolean, default: false },
    createdAt: {
        type: Date,
        default: Date.now,
      },
});

// Create a Mongoose model from the schema
const News = mongoose.model('News', newsSchema);

module.exports = News;
