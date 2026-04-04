const mongoose = require('mongoose');
const Order = require('./models/Order');
const dotenv = require('dotenv');

dotenv.config();

const checkStatus = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const orders = await Order.find().lean();
        console.log(`Total: ${orders.length}`);
        const statusMap = {};
        orders.forEach(o => {
            statusMap[o.orderStatus] = (statusMap[o.orderStatus] || 0) + 1;
        });
        console.log('OrderStatus breakdown:', statusMap);
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
};

checkStatus();
