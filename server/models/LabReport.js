const mongoose = require("mongoose");

const labReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportDate: { type: Date, required: true },
  testType: { type: String }, // e.g., "HbA1c", "Lipid Profile", "CBC"
  parsedResults: { type: mongoose.Schema.Types.Mixed }, // extracted key-value data
  fileUrl: { type: String }, // URL to PDF/image in cloud storage (S3/GridFS)
  originalReport: { type: String }, // Cloudinary URL of the original report image
  notes: { type: String }
}, {
  timestamps: true
});

labReportSchema.index({ userId: 1, reportDate: -1 });

module.exports = mongoose.model('LabReport', labReportSchema);
