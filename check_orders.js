const mongoose = require('mongoose');
const Order = require('./backend/models/Order');
const dotenv = require('dotenv');

dotenv.config({ path: './backend/.env' });

const checkOrders = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const orders = await Order.find();
        console.log(`Found ${orders.length} orders:`);
        orders.forEach((o, i) => {
            console.log(`${i+1}. ID: ${o._id}, Num: ${o.orderNumber}, Status: ${o.orderStatus}, Customer: ${o.customer}`);
        });
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkOrders();
