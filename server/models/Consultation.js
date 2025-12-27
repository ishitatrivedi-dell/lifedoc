const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    symptoms: {
        type: String,
        required: true
    },
    aiSummary: {
        type: String,
        required: true
    },
    urgency: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Low'
    },
    actions: [{
        type: String
    }],
    language: {
        type: String,
        default: 'en'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Consultation', consultationSchema);
