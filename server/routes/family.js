const express = require("express");
const router = express.Router();
const familyController = require("./familyController");
const authMiddleware = require("../middleware/authMiddleware");

// Apply auth middleware to all family routes
router.use(authMiddleware);

router.post("/add-member", familyController.addMember);
router.get("/members", familyController.getMembers);
router.get("/member/:id/health", familyController.getMemberHealth);



router.post("/invite", familyController.inviteMember);
router.get("/requests", familyController.getIncomingRequests);
router.post("/respond", familyController.respondToInvite);
router.post("/member/:id/analyze", familyController.analyzeMemberHealth);
router.post("/member/:id/measurement", familyController.addMemberMeasurement);

module.exports = router;

