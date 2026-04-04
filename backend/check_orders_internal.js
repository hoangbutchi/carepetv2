const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const checkOrdersFull = async () => {
    try {
        console.log('Connecting to', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
        
        const allOrders = await Order.find().lean();
        console.log(`Total orders in DB: ${allOrders.length}`);
        
        allOrders.forEach((o, i) => {
            console.log(`${i+1}. Order# ${o.orderNumber}, ID: ${o._id}, Status: ${o.orderStatus}, Payment: ${o.paymentStatus}, Customer: ${o.customer}`);
        });

        console.log(`Total users in DB: ${await User.countDocuments()}`);
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

checkOrdersFull();
