const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const sosContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  relationship: { type: String }
});

const emergencySettingsSchema = new mongoose.Schema({
  enableAutoAlert: { type: Boolean, default: false },
  criticalThresholds: {
    glucose: { low: Number, high: Number },
    bloodPressure: {
      systolicHigh: Number,
      diastolicHigh: Number
    }
  }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  type: { type: String, default: "user" },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date },
  profileImage: { type: String },

  // New health profile fields
  profile: {
    gender: { type: String, enum: ['male', 'female', 'other'] },
    height: { type: Number }, // in cm
    weight: { type: Number }, // in kg
    bloodGroup: { type: String },
    chronicConditions: [{ type: String }], // e.g., ["diabetes", "hypertension"]
    storyDesc: { type: String } // AI generated summary of user's lifestyle
  },

  sosContacts: [sosContactSchema],

  emergencySettings: emergencySettingsSchema

}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
