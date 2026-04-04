const crypto = require('crypto');
const axios = require('axios');
const Order = require('../models/Order');


// @desc    Create MoMo payment url
// @route   POST /api/momo/payment
// @access  Private
exports.createPayment = async (req, res) => {
    // Moved credentials inside to ensure they pick up latest .env changes
    const partnerCode = process.env.MOMO_PARTNER_CODE || 'MOMO';
    const accessKey = process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85';
    const secretKey = process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    const endpoint = process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';

    try {
        const { orderId, amount, orderInfo } = req.body;

        if (!orderId || !amount) {
            return res.status(400).json({ success: false, message: 'Missing required fields: orderId or amount' });
        }

        const requestId = partnerCode + new Date().getTime();
        const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-result`;
        const ipnUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/momo/ipn`;
        const stringAmount = String(amount);
        const safeOrderInfo = String(orderInfo || "Pay with MoMo");
        const extraData = "";
        const requestType = "captureWallet";

        // Create raw signature string
        const rawSignature = `accessKey=${accessKey}&amount=${stringAmount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${safeOrderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

        // Calculate HMAC SHA256 signature
        const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

        // Prepare request body for MoMo API
        const requestBody = {
            partnerCode,
            accessKey,
            requestId,
            amount: stringAmount,
            orderId,
            orderInfo: safeOrderInfo,
            redirectUrl,
            ipnUrl,
            extraData,
            requestType,
            signature,
            lang: 'en'
        };

        // Call MoMo API
        const response = await axios.post(endpoint, requestBody);

        if (response.data && response.data.payUrl) {
            res.status(200).json({
                success: true,
                payUrl: response.data.payUrl
            });
        } else {
            console.error('MoMo API Error:', response.data);
            res.status(400).json({
                success: false,
                message: response.data.message || 'Error connecting to MoMo or invalid response',
                data: response.data
            });
        }
    } catch (error) {
        console.error('Create MoMo Payment Error Stack:', error.stack || error);
        
        const errorData = error.response ? error.response.data : null;
        if (errorData) {
            console.error('MoMo Response Data:', errorData);
        }
        
        res.status(500).json({
            success: false,
            message: errorData ? (errorData.message || 'MoMo error') : 'Server error while creating payment',
            error: errorData || error.message
        });
    }
};

// @desc    Handle MoMo IPN Webhook
// @route   POST /api/momo/ipn
// @access  Public
exports.ipnWebhook = async (req, res) => {
    try {
        const {
            partnerCode,
            orderId,
            requestId,
            amount,
            orderInfo,
            orderType,
            transId,
            resultCode,
            message,
            payType,
            responseTime,
            extraData,
            signature
        } = req.body;

        console.log(`MoMo IPN hit for order [${orderId}] with resultCode: ${resultCode}`);

        const accessKey = process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85';
        const secretKey = process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz';

        // Reconstruct raw signature to verify
        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
        const expectedSignature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

        if (signature !== expectedSignature) {
            console.error('Invalid MoMo signature');
            return res.status(400).json({ success: false, message: 'Invalid signature' });
        }

        // If payment is successful, update order in MongoDB
        if (resultCode === 0) {
            const order = await Order.findById(orderId);
            if (order) {
                if (order.paymentStatus !== 'paid') {
                    order.paymentStatus = 'paid';
                    order.orderStatus = 'confirmed';
                    order.paymentDetails = {
                        transactionId: transId,
                        paidAt: Date.now(),
                        bankName: payType || 'MOMO'
                    };
                    await order.save();
                    console.log(`Order ${orderId} marked as PAID via MoMo IPN.`);
                }
            } else {
                console.error(`Order ${orderId} not found in DB during IPN processing`);
            }
        } else {
            // Log failed payment IPN but return 204 to MoMo
            console.log(`Payment failed or canceled for order ${orderId}. Message: ${message}`);
        }

        // Must return 204 No Content to acknowledge Momo webhook
        return res.status(204).send();

    } catch (error) {
        console.error('IPN Error:', error);
        return res.status(500).json({ success: false, message: 'Server error during IPN processing' });
    }
};
