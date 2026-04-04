const mongoose = require('mongoose');
const Order = require('./backend/models/Order');
const User = require('./backend/models/User');
const dotenv = require('dotenv');

dotenv.config({ path: './backend/.env' });

const checkOrdersFull = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const allOrders = await Order.find().lean();
        console.log(`Total orders in DB: ${allOrders.length}`);
        
        allOrders.forEach((o, i) => {
            console.log(`${i+1}. Order# ${o.orderNumber}, ID: ${o._id}, Status: ${o.orderStatus}, Payment: ${o.paymentStatus}, CustomerID: ${o.customer}`);
        });

        const usersCount = await User.countDocuments();
        console.log(`Total users in DB: ${usersCount}`);
        
        process.exit(0);
    } catch (err) {
        console.error('Error during check:', err);
        process.exit(1);
    }
};

checkOrdersFull();
