const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { processReminders } = require('./jobs/reminderJob');

dotenv.config();

const runTest = async () => {
    try {
        await connectDB();
        console.log('Testing Email Reminder Logic...');
        await processReminders();
        console.log('Test completed. Check your console and email.');
        process.exit(0);
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
};

runTest();
