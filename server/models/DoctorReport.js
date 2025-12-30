const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
  medicine: { type: String, required: true },
  dosage: { type: String },
  frequency: { type: String },
  duration: { type: String }
});

const doctorReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  visitDate: { type: Date, required: true },
  doctorName: { type: String },
  diagnosis: [{ type: String }],
  prescriptions: [prescriptionSchema],
  summary: { type: String }, // AI or manual summary
  fileUrl: { type: String }, // uploaded prescription/report
  followUpDate: { type: Date }
}, {
  timestamps: true
});

doctorReportSchema.index({ userId: 1, visitDate: -1 });

module.exports = mongoose.model('DoctorReport', doctorReportSchema);
