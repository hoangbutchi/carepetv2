const crypto = require('crypto');
const moment = require('moment');
const Order = require('../models/Order');


function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

// @desc    Create VNPAY payment url
// @route   POST /api/vnpay/payment
// @access  Private
exports.createPayment = async (req, res) => {
    // Moved credentials inside to ensure they pick up latest .env changes
    const tmnCode = process.env.VNP_TMN_CODE;
    const secretKey = process.env.VNP_HASH_SECRET;
    const vnpUrl = process.env.VNP_URL;

    try {
        const { orderId, amount, bankCode, language } = req.body;

        if (!orderId || !amount) {
            return res.status(400).json({ success: false, message: 'Missing required fields: orderId or amount' });
        }

        const date = new Date();
        const createDate = moment(date).format('YYYYMMDDHHmmss');
        const expireDate = moment(date).add(15, 'minutes').format('YYYYMMDDHHmmss');

        const returnUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-result`;
        const ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress || '127.0.0.1';

        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = process.env.VNP_TMN_CODE;
        vnp_Params['vnp_Locale'] = language || 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang PetCare ' + orderId;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount * 100; // VNPAY amount is multiplied by 100
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        vnp_Params['vnp_ExpireDate'] = expireDate;

        if (bankCode !== null && bankCode !== '' && bankCode !== undefined) {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        vnp_Params = sortObject(vnp_Params);
        const querystring = require('qs');
        const signData = querystring.stringify(vnp_Params, { encode: false });
        
        const hmac = crypto.createHmac("sha512", process.env.VNP_HASH_SECRET);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
        vnp_Params['vnp_SecureHash'] = signed;
        
        const paymentUrl = process.env.VNP_URL + '?' + querystring.stringify(vnp_Params, { encode: false });

        res.status(200).json({
            success: true,
            payUrl: paymentUrl
        });

    } catch (error) {
        console.error('Create VNPAY Payment Error Stack:', error.stack || error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error while creating payment',
            error: error.message
        });
    }
};

// @desc    Handle VNPAY IPN Webhook
// @route   GET /api/vnpay/ipn
// @access  Public
exports.ipnWebhook = async (req, res) => {
    try {
        let vnp_Params = req.query;
        let secureHash = vnp_Params['vnp_SecureHash'];

        let orderId = vnp_Params['vnp_TxnRef'];
        let rspCode = vnp_Params['vnp_ResponseCode'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);
        const querystring = require('qs');
        const signData = querystring.stringify(vnp_Params, { encode: false });
        
        const hmac = crypto.createHmac("sha512", process.env.VNP_HASH_SECRET);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");     

        let paymentStatus = '0'; // default init

        if (secureHash === signed) { // verify signature
            // Find order in database
            const order = await Order.findById(orderId);
            if (order) {
                // Check if payment already processed
                let isProcessed = (order.paymentStatus === 'paid' || order.paymentStatus === 'failed');

                if (!isProcessed) {
                    // Update Payment Status
                    if (rspCode == "00") {
                        // success
                        paymentStatus = '1';
                        order.paymentStatus = 'paid';
                        order.orderStatus = 'confirmed';
                        order.paymentDetails = {
                            transactionId: vnp_Params['vnp_TransactionNo'],
                            paidAt: Date.now(),
                            bankName: vnp_Params['vnp_BankCode'] || 'VNPAY'
                        };
                    } else {
                        // failure
                        paymentStatus = '2';
                        order.paymentStatus = 'failed';
                    }
                    
                    await order.save();
                    
                    console.log(`Order ${orderId} marked as ${order.paymentStatus} via VNPAY IPN.`);
                    
                    // Return success to VNPAY
                    res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
                } else {
                    res.status(200).json({ RspCode: '02', Message: 'This order has been updated to the payment status' });
                }
            } else {
                res.status(200).json({ RspCode: '01', Message: 'Order not found' });
            }
        } else {
            console.error('Invalid VNPAY signature');
            res.status(200).json({ RspCode: '97', Message: 'Checksum failed' });
        }
    } catch (error) {
        console.error('VNPAY IPN Error:', error);
        res.status(200).json({ RspCode: '99', Message: 'Unknow error' });
    }
};
