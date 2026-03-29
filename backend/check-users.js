const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkUsers() {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({});
    console.log('Total users:', users.length);
    
    const districtCounts = {};
    users.forEach(u => {
        const key = u.district?.code || 'no-district';
        districtCounts[key] = (districtCounts[key] || 0) + 1;
        if (key === '1') {
            console.log(`User in Ba Dinh (code 1): ${u.email}`);
        }
    });
    
    console.log('District distribution:', districtCounts);
    process.exit(0);
}

checkUsers();
