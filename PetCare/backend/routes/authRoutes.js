const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getMe,
    updateProfile,
    getAllUsers,
    getStaff,
    getDoctors
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.get('/staff', protect, getStaff);
router.get('/doctors', getDoctors);

module.exports = router;

