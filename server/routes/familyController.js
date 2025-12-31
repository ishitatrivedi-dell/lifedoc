const Family = require("../models/Family");
const User = require("../models/User");
const Prescription = require("../models/Prescription");
const LabReport = require("../models/LabReport");
const DoctorReport = require("../models/DoctorReport");
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config();


// Add a family member (Managed User)
exports.addMember = async (req, res) => {
    try {
        const { name, relation, age, gender, chronicConditions } = req.body;
        const adminId = req.user.id;

        // 1. Create a "Managed" User account for the member
        // We generate a dummy email/password since they are managed and don't login directly
        const dummyEmail = `${name.replace(/\s+/g, '').toLowerCase()}.${Date.now()}@managed.family`;
        const dummyPassword = "managed_account_password_123";

        const newMemberUser = new User({
            name,
            email: dummyEmail,
            password: dummyPassword,
            age,
            isManaged: true,
            profile: {
                gender,
                chronicConditions: chronicConditions || []
            }
        });

        await newMemberUser.save();

        // 2. Add to Family group
        let family = await Family.findOne({ adminId });
        if (!family) {
            family = new Family({ adminId, members: [] });
        }

        family.members.push({
            userId: newMemberUser._id,
            name,
            relationship: relation,
            accessLevel: req.body.accessLevel || "child" // Default managed members to 'child'
        });

        await family.save();

        res.status(201).json({ success: true, message: "Family member added successfully", member: newMemberUser });
    } catch (error) {
        console.error("Error adding family member:", error);
        res.status(500).json({ success: false, message: "Error adding family member", error: error.message });
    }
};

// Get all family members with health summaries
exports.getMembers = async (req, res) => {
    try {
        const adminId = req.user.id;
        const family = await Family.findOne({ adminId }).populate("members.userId", "name age profile profileImage");
        const Measurement = require('../models/Measurement');

        if (!family) {
            return res.status(200).json({ success: true, members: [] });
        }

        const membersWithHealth = await Promise.all(family.members.map(async (member) => {
            const memberObj = member.toObject();

            // Only fetch health data for active members linked to a user
            if (member.userId) {
                const targetUserId = member.userId._id; // Use _id from populated object
                const [bpReadings, weightReadings, glucoseReadings] = await Promise.all([
                    Measurement.find({ userId: targetUserId, "readings.type": "bloodPressure" }).sort({ date: -1 }).limit(5),
                    Measurement.find({ userId: targetUserId, "readings.type": "weight" }).sort({ date: -1 }).limit(5),
                    Measurement.find({ userId: targetUserId, "readings.type": "glucose" }).sort({ date: -1 }).limit(5)
                ]);

                // Helper to extract relevant reading
                const extractData = (docs, type) => docs.map(d => {
                    const r = d.readings.find(r => r.type === type);
                    return { date: d.date, value: r ? r.value : null };
                }).filter(r => r.value !== null);

                memberObj.healthData = {
                    bp: extractData(bpReadings, 'bloodPressure').reverse(),
                    weight: extractData(weightReadings, 'weight').reverse(),
                    glucose: extractData(glucoseReadings, 'glucose').reverse()
                };
            } else {
                memberObj.healthData = { bp: [], weight: [], glucose: [] };
            }

            return memberObj;
        }));

        res.status(200).json({ success: true, members: membersWithHealth });
    } catch (error) {
        console.error("Error fetching family members:", error);
        res.status(500).json({ success: false, message: "Error fetching family members", error: error.message });
    }
}


// Get health data for a specific member
exports.getMemberHealth = async (req, res) => {
    try {
        const adminId = req.user.id;
        const memberId = req.params.id;

        // 1. Verify Access: Ensure this member belongs to the admin's family
        const family = await Family.findOne({ adminId, "members.userId": memberId });
        if (!family) {
            return res.status(403).json({ success: false, message: "Access denied. Member not found in your family." });
        }

        // 2. Fetch Aggregated Health Data
        const Measurement = require('../models/Measurement');
        const [prescriptions, labReports, doctorReports, measurements] = await Promise.all([
            Prescription.find({ user: memberId }).sort({ date: -1 }).limit(10),
            LabReport.find({ userId: memberId }).sort({ date: -1 }).limit(10),
            DoctorReport.find({ userId: memberId }).sort({ visitDate: -1 }).limit(5),
            Measurement.find({ userId: memberId }).sort({ date: 1 }).limit(30) // Get last 30 entries for graphs
        ]);

        // Process measurements for graphs
        const healthTrends = {
            bp: [], weight: [], glucose: []
        };
        measurements.forEach(m => {
            m.readings.forEach(r => {
                if (r.type === 'bloodPressure') healthTrends.bp.push({ date: m.date, value: r.value });
                if (r.type === 'weight') healthTrends.weight.push({ date: m.date, value: r.value });
                if (r.type === 'glucose') healthTrends.glucose.push({ date: m.date, value: r.value });
            });
        });

        res.status(200).json({
            success: true,
            data: {
                prescriptions,
                labReports,
                doctorReports,
                healthTrends
            }
        });


    } catch (error) {
        console.error("Error fetching member health:", error);
        res.status(500).json({ success: false, message: "Error fetching member health", error: error.message });
    }
};

// Invite a family member by email (Linked Account)
exports.inviteMember = async (req, res) => {
    try {
        const { email, relation } = req.body;
        const adminId = req.user.id;

        console.log("Inviting member:", { email, relation, adminId });

        if (!email || !relation) {
            return res.status(400).json({ success: false, message: "Email and relation are required." });
        }

        // 1. Check if user exists
        const userToInvite = await User.findOne({ email });
        if (!userToInvite) {
            console.log("User not found for email:", email);
            return res.status(404).json({ success: false, message: "User with this email not found." });
        }

        if (userToInvite._id.toString() === adminId) {
            return res.status(400).json({ success: false, message: "You cannot invite yourself." });
        }

        // 2. Check if already in family
        let family = await Family.findOne({ adminId });
        if (!family) {
            family = new Family({ adminId, members: [] });
        }

        const existingMember = family.members.find(m =>
            (m.userId && m.userId.toString() === userToInvite._id.toString()) ||
            (m.inviteEmail === email)
        );

        if (existingMember) {
            return res.status(400).json({ success: false, message: "User already in family or invited." });
        }

        // 3. Add pending member
        // Ensure all required fields are present
        const newMember = {
            userId: userToInvite._id,
            name: userToInvite.name || 'Unknown', // Fallback if name missing
            relationship: relation,
            type: "linked",
            status: "pending",
            inviteEmail: email
        };

        console.log("Adding member object:", newMember);
        family.members.push(newMember);

        await family.save();

        res.status(200).json({ success: true, message: "Invitation sent successfully." });

    } catch (error) {
        console.error("Error inviting member detailed:", error);
        // Check for Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: "Error inviting member", error: error.message });
    }
};

// Get pending invitations for the logged-in user
exports.getIncomingRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        // Find families where this user is listed as a member with status 'pending'
        const requests = await Family.find({
            "members": {
                $elemMatch: {
                    $or: [
                        { userId: userId },
                        { inviteEmail: user.email }
                    ],
                    status: "pending"
                }
            }
        }).populate("adminId", "name email profileImage");

        const formattedRequests = requests.map(f => {
            const memberDetails = f.members.find(m =>
                (m.userId && m.userId.toString() === userId) ||
                (m.inviteEmail === user.email)
            );
            return {
                familyId: f._id,
                adminName: f.adminId.name,
                adminEmail: f.adminId.email,
                relationshipToAdmin: memberDetails.relationship, // How the admin sees this user (e.g. "Father")
                invitedAt: memberDetails.addedAt
            };
        });

        res.status(200).json({ success: true, requests: formattedRequests });

    } catch (error) {
        console.error("Error fetching requests:", error);
        res.status(500).json({ success: false, message: "Error fetching requests", error: error.message });
    }
};

// Respond to invitation (Accept/Reject)
exports.respondToInvite = async (req, res) => {
    try {
        const { familyId, action } = req.body; // action: 'accept' or 'reject'
        const userId = req.user.id;
        const user = await User.findById(userId);

        const family = await Family.findById(familyId);
        if (!family) {
            return res.status(404).json({ success: false, message: "Family group not found." });
        }

        const memberIndex = family.members.findIndex(m =>
            (m.userId && m.userId.toString() === userId) ||
            (m.inviteEmail === user.email)
        );

        if (memberIndex === -1) {
            return res.status(404).json({ success: false, message: "Invitation not found." });
        }

        if (action === 'accept') {
            family.members[memberIndex].status = 'active';
            family.members[memberIndex].userId = userId; // Ensure ID is linked
        } else if (action === 'reject') {
            family.members[memberIndex].status = 'rejected';
            family.members.splice(memberIndex, 1);
        } else {
            return res.status(400).json({ success: false, message: "Invalid action." });
        }

        await family.save();

        res.status(200).json({ success: true, message: `Invitation ${action}ed.` });

    } catch (error) {
        console.error("Error responding to invite:", error);
        res.status(500).json({ success: false, message: "Error responding to invite", error: error.message });
    }
};

// AI Health Guardian: Analyze member health data
exports.analyzeMemberHealth = async (req, res) => {
    try {
        const adminId = req.user.id;
        const memberId = req.params.id;

        // 1. Verify Access
        const family = await Family.findOne({ adminId, "members.userId": memberId });
        if (!family) {
            return res.status(403).json({ success: false, message: "Access denied." });
        }

        const member = family.members.find(m => m.userId.toString() === memberId);

        // 2. Aggregate Data for Context
        const Measurement = require('../models/Measurement');
        // Note: findOne returns the document which has 'readings' array. We want recent history.
        // Actually Measurement schema is per day presumably or has readings array.
        // Schema: { userId, date, readings: [{type, value, time}] }
        // So we need to query multiple docs or aggregated readings.
        // Simplification: Fetch last 5 Measurement docs and extract readings.
        const measurements = await Measurement.find({ userId: memberId }).sort({ date: -1 }).limit(7);

        let healthSummary = {
            bp: [], weight: [], glucose: []
        };
        measurements.forEach(m => {
            m.readings.forEach(r => {
                if (r.type === 'bloodPressure') healthSummary.bp.push({ date: m.date, value: r.value });
                if (r.type === 'weight') healthSummary.weight.push({ date: m.date, value: r.value });
                if (r.type === 'glucose') healthSummary.glucose.push({ date: m.date, value: r.value });
            });
        });

        const prescriptions = await Prescription.find({ user: memberId }).sort({ date: -1 }).limit(3).select('medicines date doctorName');
        const labs = await LabReport.find({ userId: memberId }).sort({ date: -1 }).limit(3).select('testType result date');

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ success: false, message: "AI Configuration missing." });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
        You are a senior Family Doctor AI. Analyze these health records for a ${member.userId?.age || 'unknown age'} year old family member.
        
        Recent Vitals (Last 7 days):
        ${JSON.stringify(healthSummary)}
        
        Recent Medical History:
        - Prescriptions: ${JSON.stringify(prescriptions || [])}
        - Lab Reports: ${JSON.stringify(labs || [])}

        Task:
        1. Identify concerning trends.
        2. Assign Risk Level: "Low", "Medium", "High".
        3. Explain WHY (Summary).
        4. Recommend 3 specific actions.

        Output JSON only:
        {
            "riskLevel": "Low/Medium/High",
            "summary": "...",
            "actionItems": ["...", "..."],
            "doctorQuestions": ["...", "..."]
        }
        `;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });

        const textResponse = result.response.text();
        const cleanText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const analysis = JSON.parse(cleanText);

        res.status(200).json({ success: true, analysis });

    } catch (error) {
        console.error("AI Analysis Error:", error);
        res.status(500).json({ success: false, message: "AI Analysis failed", error: error.message });
    }
};

// Add Measurement for a Family Member (Managed Child)
exports.addMemberMeasurement = async (req, res) => {
    try {
        const adminId = req.user.id;
        const memberId = req.params.id;
        const { readings, date } = req.body; // readings: [{type, value}]

        // 1. Verify Access (Admin or Caregiver)
        const family = await Family.findOne({
            $or: [{ adminId: adminId }, { "members.userId": adminId }]
        });

        // Simple check: Is the requester the Admin? (For now, prioritizing Admin control)
        // If we want detailed RBAC later, we check member.accessLevel
        const isAuthorized = family && family.adminId.toString() === adminId;

        // Also check if the target member exists in this family
        const targetMember = family ? family.members.find(m => m.userId.toString() === memberId) : null;

        if (!isAuthorized || !targetMember) {
            return res.status(403).json({ success: false, message: "Not authorized to manage this member." });
        }

        const Measurement = require('../models/Measurement');

        // Create Measurement
        // Note: Our Measurement model might expect 'readings' array or single fields.
        // Assuming consistent schema with previous usage: { userId, date, readings: [...] }
        const newMeasurement = new Measurement({
            userId: memberId,
            date: date || new Date(),
            readings: readings
        });

        await newMeasurement.save();

        res.status(201).json({ success: true, message: "Measurement added successfully", data: newMeasurement });

    } catch (error) {
        console.error("Add Member Measurement Error:", error);
        res.status(500).json({ success: false, message: "Failed to add measurement", error: error.message });
    }
};


