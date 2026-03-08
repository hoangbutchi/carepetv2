const Appointment = require('../models/Appointment');
const User = require('../models/User');

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res) => {
    try {
        let query;

        if (req.user.role === 'admin') {
            // Admin sees all appointments
            query = Appointment.find();
        } else if (req.user.role === 'staff') {
            // Staff sees their assigned appointments
            query = Appointment.find({ staff: req.user.id });
        } else {
            // Customer sees their own appointments
            query = Appointment.find({ customer: req.user.id });
        }

        const appointments = await query
            .populate('customer', 'name email phone')
            .populate('pet', 'name species breed avatar')
            .populate('staff', 'name email')
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: appointments.length,
            appointments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('customer', 'name email phone')
            .populate('pet', 'name species breed avatar')
            .populate('staff', 'name email');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Check authorization
        if (
            req.user.role === 'customer' &&
            appointment.customer._id.toString() !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        res.status(200).json({
            success: true,
            appointment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
exports.createAppointment = async (req, res) => {
    try {
        const { pet, staff, service, date, timeSlot, notes, price } = req.body;

        // Check for staff schedule conflict
        if (staff) {
            const hasConflict = await Appointment.checkConflict(staff, date, timeSlot);
            if (hasConflict) {
                return res.status(400).json({
                    success: false,
                    message: 'This time slot is already booked for the selected staff member'
                });
            }
        }

        const appointment = await Appointment.create({
            customer: req.user.id,
            pet,
            staff,
            service,
            date,
            timeSlot,
            notes,
            price
        });

        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('customer', 'name email phone')
            .populate('pet', 'name species breed')
            .populate('staff', 'name email');

        res.status(201).json({
            success: true,
            appointment: populatedAppointment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
exports.updateAppointment = async (req, res) => {
    try {
        let appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Check authorization - Staff and Admin can update any appointment
        // Customers can only update their own appointments
        if (
            req.user.role === 'customer' &&
            appointment.customer.toString() !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const { staff, date, timeSlot } = req.body;

        // Check for conflicts if changing staff, date, or time
        if (staff && date && timeSlot) {
            const hasConflict = await Appointment.checkConflict(
                staff,
                date,
                timeSlot,
                req.params.id
            );
            if (hasConflict) {
                return res.status(400).json({
                    success: false,
                    message: 'This time slot is already booked for the selected staff member'
                });
            }
        }

        appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
            .populate('customer', 'name email phone')
            .populate('pet', 'name species breed')
            .populate('staff', 'name email');

        res.status(200).json({
            success: true,
            appointment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Cancel/Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
exports.deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Check authorization
        if (
            req.user.role === 'customer' &&
            appointment.customer.toString() !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Soft delete - mark as cancelled
        appointment.status = 'cancelled';
        await appointment.save();

        res.status(200).json({
            success: true,
            message: 'Appointment cancelled successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get available time slots for a date and staff
// @route   GET /api/appointments/available-slots
// @access  Private
exports.getAvailableSlots = async (req, res) => {
    try {
        const { date, staffId } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a date'
            });
        }

        const allSlots = [
            '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
            '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
        ];

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        let query = {
            date: { $gte: startOfDay, $lte: endOfDay },
            status: { $nin: ['cancelled'] }
        };

        if (staffId) {
            query.staff = staffId;
        }

        const bookedAppointments = await Appointment.find(query).select('timeSlot staff');

        // If no specific staff, return all slots with availability info
        if (!staffId) {
            const staff = await User.find({ role: { $in: ['staff', 'admin'] } }).select('name');

            const slotsWithAvailability = allSlots.map(slot => {
                const availableStaff = staff.filter(s => {
                    const isBooked = bookedAppointments.some(
                        a => a.timeSlot === slot && a.staff?.toString() === s._id.toString()
                    );
                    return !isBooked;
                });

                return {
                    slot,
                    available: availableStaff.length > 0,
                    availableStaff
                };
            });

            return res.status(200).json({
                success: true,
                date,
                slots: slotsWithAvailability
            });
        }

        // For specific staff
        const bookedSlots = bookedAppointments.map(a => a.timeSlot);
        const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

        res.status(200).json({
            success: true,
            date,
            staffId,
            availableSlots,
            bookedSlots
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get today's appointments for admin dashboard
// @route   GET /api/appointments/today
// @access  Private/Staff/Admin
exports.getTodayAppointments = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        let query = {
            date: { $gte: today, $lt: tomorrow }
        };

        if (req.user.role === 'staff') {
            query.staff = req.user.id;
        }

        const appointments = await Appointment.find(query)
            .populate('customer', 'name email phone')
            .populate('pet', 'name species breed avatar')
            .populate('staff', 'name')
            .sort({ timeSlot: 1 });

        // Group by status
        const stats = {
            total: appointments.length,
            pending: appointments.filter(a => a.status === 'pending').length,
            confirmed: appointments.filter(a => a.status === 'confirmed').length,
            completed: appointments.filter(a => a.status === 'completed').length,
            cancelled: appointments.filter(a => a.status === 'cancelled').length
        };

        res.status(200).json({
            success: true,
            stats,
            appointments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get appointments by specific date
// @route   GET /api/appointments/by-date
// @access  Private/Staff/Admin
exports.getAppointmentsByDate = async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a date'
            });
        }

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        let query = {
            date: { $gte: startOfDay, $lte: endOfDay }
        };

        // Staff only sees their own appointments
        if (req.user.role === 'staff') {
            query.staff = req.user.id;
        }

        const appointments = await Appointment.find(query)
            .populate('customer', 'name email phone')
            .populate('pet', 'name species breed avatar')
            .populate('staff', 'name _id')
            .sort({ timeSlot: 1 });

        res.status(200).json({
            success: true,
            date,
            count: appointments.length,
            appointments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
