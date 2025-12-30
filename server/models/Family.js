const mongoose = require("mongoose");

const familyMemberSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional for pending invites
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    accessLevel: { type: String, enum: ["admin", "caregiver", "member", "child", "view_only"], default: "member" },
    addedAt: { type: Date, default: Date.now },

    // New fields for Linked Accounts
    type: { type: String, enum: ["managed", "linked"], default: "managed" },
    status: { type: String, enum: ["active", "pending", "rejected"], default: "active" },
    inviteEmail: { type: String } // Used to track pending invites
});

const familySchema = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true }, // One family group per admin for simplicity initially
    members: [familyMemberSchema]
}, { timestamps: true });

module.exports = mongoose.model("Family", familySchema);
