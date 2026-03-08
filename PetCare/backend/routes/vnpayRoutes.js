const express = require('express');
const router = express.Router();
const { createPayment, ipnWebhook } = require('../controllers/vnpayController');
const { protect } = require('../middleware/authMiddleware');

router.post('/payment', protect, createPayment);
router.get('/ipn', ipnWebhook); // IPN is public so VNPAY servers can reach it

module.exports = router;
