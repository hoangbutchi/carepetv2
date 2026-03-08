const express = require('express');
const router = express.Router();
const { createPayment, ipnWebhook } = require('../controllers/momoController');
const { protect } = require('../middleware/authMiddleware');

router.post('/payment', protect, createPayment);
router.post('/ipn', ipnWebhook); // IPN is public so MoMo servers can reach it

module.exports = router;
