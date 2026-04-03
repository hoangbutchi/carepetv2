const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getMe,
    updateProfile,
    getAllUsers,
    getStaff,
    getDoctors,
    updateUserRole,
    deleteUser,
    createDoctor,
    updateDoctor
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id/role', protect, authorize('admin'), updateUserRole);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);
router.get('/staff', protect, getStaff);
router.get('/doctors', getDoctors);
router.post('/doctors', protect, authorize('admin'), createDoctor);
router.put('/doctors/:id', protect, authorize('admin'), updateDoctor);

module.exports = router;

