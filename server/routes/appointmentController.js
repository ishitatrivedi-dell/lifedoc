const Appointment = require('../models/Appointment');

exports.createAppointment = async (req, res) => {
    try {
        const { providerName, type, date, time, notes } = req.body;
        const userId = req.user.id; // Assuming auth middleware adds user to req

        const newAppointment = new Appointment({
            userId,
            providerName,
            type,
            date,
            time,
            notes
        });

        const savedAppointment = await newAppointment.save();
        res.status(201).json({ success: true, data: savedAppointment });
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getAppointments = async (req, res) => {
    try {
        const userId = req.user.id;
        // Get upcoming appointments first, then past ones? Or just all sorted by date.
        // Let's sort by date descending (newest first)
        const appointments = await Appointment.find({ userId }).sort({ date: 1, time: 1 });
        res.status(200).json({ success: true, data: appointments });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        // Ensure user owns appointment
        if (appointment.userId.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        appointment.status = status;
        await appointment.save();

        res.status(200).json({ success: true, data: appointment });
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        // Ensure user owns appointment
        if (appointment.userId.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        await appointment.deleteOne();

        res.status(200).json({ success: true, message: 'Appointment removed' });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
