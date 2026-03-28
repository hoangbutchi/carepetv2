const express = require('express');
const router = express.Router();
const {
    createOrder,
    getOrders,
    getOrder,
    updateOrderStatus,
    processPayment,
    cancelOrder,
    getOrderStats
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

router.get('/stats', authorize('admin', 'staff', 'doctor'), getOrderStats);

router.route('/')
    .get(getOrders)
    .post(createOrder);

router.route('/:id')
    .get(getOrder);

router.put('/:id/status', authorize('admin', 'staff', 'doctor'), updateOrderStatus);
router.post('/:id/payment', processPayment);
router.put('/:id/cancel', cancelOrder);

module.exports = router;
