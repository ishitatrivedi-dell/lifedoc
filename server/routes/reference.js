const express = require('express');
const router = express.Router();
const referenceController = require('./referenceController');
// No auth middleware required for viewing reference info? 
// Or maybe we want to protect it. Given the app nature, usually protects everything.
const auth = require('../middleware/authMiddleware');

router.get('/search', auth, referenceController.searchItems);
router.get('/medicines', auth, referenceController.getAllMedicines);
router.get('/medicines/:id', auth, referenceController.getMedicineById);
router.get('/tests', auth, referenceController.getAllTests);
router.get('/tests/:id', auth, referenceController.getTestById);

module.exports = router;
