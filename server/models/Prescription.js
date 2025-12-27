const mongoose = require('mongoose');

const scriptSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    image: {
        type: String, // Store Base64 or URL
        required: false
    },
    medicines: [{
        name: String,
        dosage: String,
        timing: String,
        precaution: String
    }],
    audioSummary: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Prescription', scriptSchema);
