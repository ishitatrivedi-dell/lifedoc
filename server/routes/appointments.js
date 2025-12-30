const express = require('express');
const router = express.Router();
const appointmentController = require('./appointmentController');
const auth = require('../middleware/authMiddleware'); // Corrected path

router.post('/', auth, appointmentController.createAppointment);
router.get('/', auth, appointmentController.getAppointments);
router.patch('/:id/status', auth, appointmentController.updateAppointmentStatus);
router.delete('/:id', auth, appointmentController.deleteAppointment);

module.exports = router;
