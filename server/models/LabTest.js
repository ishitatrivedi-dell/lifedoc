const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
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
    normalRange: {
        type: String // e.g., "4.5 - 11.0 x 10^9/L" or Free text description
    },
    preparation: {
        type: String // e.g., "Fasting required for 12 hours"
    },
    clinicalSignificance: {
        type: String // What high/low values might mean
    },
    category: {
        type: String // e.g., 'Hematology', 'Biochemistry'
    }
}, {
    timestamps: true
});

// Text index for search
labTestSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('LabTest', labTestSchema);
