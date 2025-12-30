const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    description: {
        type: String,
        required: true
    },
    uses: [{
        type: String
    }],
    sideEffects: [{
        type: String
    }],
    dosageInfo: {
        type: String
    },
    manufacturer: {
        type: String
    },
    category: {
        type: String // e.g., 'Antibiotic', 'Painkiller'
    }
}, {
    timestamps: true
});

// Text index for search
medicineSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Medicine', medicineSchema);
