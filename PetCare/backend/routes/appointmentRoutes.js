const express = require('express');
const router = express.Router();
const {
    getAppointments,
    getAppointment,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getAvailableSlots,
    getTodayAppointments,
    getAppointmentsByDate
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

router.get('/available-slots', getAvailableSlots);
router.get('/today', authorize('staff', 'admin'), getTodayAppointments);
router.get('/by-date', authorize('staff', 'admin'), getAppointmentsByDate);

router.route('/')
    .get(getAppointments)
    .post(createAppointment);

router.route('/:id')
    .get(getAppointment)
    .put(updateAppointment)
    .delete(deleteAppointment);

module.exports = router;
