const crypto = require('crypto');
const axios = require('axios');

const partnerCode = process.env.MOMO_PARTNER_CODE || 'MOMOVBOG20220610';
const accessKey = process.env.MOMO_ACCESS_KEY || 'jfT3S6yvKIfDk7a3';
const secretKey = process.env.MOMO_SECRET_KEY || 'N9N28hB2EclUe8Y7z3N9uA1Fv9K7m3nQ';
const endpoint = process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';

async function testMomo() {
    try {
        const orderId = '123456789';
        const amount = 50000;
        const orderInfo = 'Thanh toan don hang PetCare 123456789';
        const requestId = orderId + new Date().getTime();
        const redirectUrl = 'http://localhost:5173/payment-result';
        const ipnUrl = 'http://localhost:5000/api/momo/ipn';

        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=captureWallet`;
        console.log('rawSignature:', rawSignature);
        const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

        const requestBody = {
            partnerCode,
            accessKey,
            requestId,
            amount,
            orderId,
            orderInfo,
            redirectUrl,
            ipnUrl,
            extraData: '',
            requestType: 'captureWallet',
            signature,
            lang: 'vi'
        };

        const response = await axios.post(endpoint, requestBody);
        require('fs').writeFileSync('momo_out.json', JSON.stringify(response.data, null, 2));
        console.log('Success, wrote momo_out.json');
    } catch (e) {
        if (e.response && e.response.data) {
            require('fs').writeFileSync('momo_out.json', JSON.stringify(e.response.data, null, 2));
            console.log('Error, wrote momo_out.json');
        } else {
            console.error('Error:', e.message);
        }
    }
}

testMomo();
