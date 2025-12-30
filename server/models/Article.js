const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    content: {
        type: String
    },
    url: {
        type: String,
        required: true,
        unique: true
    },
    source: {
        type: String
    },
    imageUrl: {
        type: String
    },
    publishedAt: {
        type: Date
    },
    category: {
        type: [String],
        default: ['health']
    },
    fetchedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Article', articleSchema);
