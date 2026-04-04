const express = require('express');
const router = express.Router();
const { getRevenueStats } = require('../controllers/statsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/revenue', protect, authorize('admin', 'staff', 'doctor'), getRevenueStats);

module.exports = router;
