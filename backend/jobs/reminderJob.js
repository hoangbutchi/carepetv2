const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const sendEmail = require('../utils/mailer');
const { getReminderTemplate } = require('../utils/emailTemplates');

const processReminders = async () => {
    console.log('Starting Appointment Reminder Process...');
    try {
        const tomorrowStart = new Date();
        tomorrowStart.setDate(tomorrowStart.getDate() + 1);
        tomorrowStart.setHours(0, 0, 0, 0);

        const tomorrowEnd = new Date();
        tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
        tomorrowEnd.setHours(23, 59, 59, 999);

        const appointments = await Appointment.find({
            date: { $gte: tomorrowStart, $lte: tomorrowEnd },
            status: 'confirmed',
            isReminded: false
        }).populate('customer pet');

        if (appointments.length === 0) {
            console.log('No appointments to remind for tomorrow.');
            return;
        }

        for (let appointment of appointments) {
            const customer = appointment.customer;
            const pet = appointment.pet;

            if (!customer || !customer.email) continue;

            await sendEmail({
                email: customer.email,
                subject: `Nhắc lịch hẹn cho ${pet ? pet.name : 'bé'} vào ngày mai! 🐾`,
                html: getReminderTemplate(appointment)
            });

            appointment.isReminded = true;
            await appointment.save();
            console.log(`Sent to ${customer.email}`);
        }
    } catch (error) {
        console.error('Error in job:', error);
    }
};

const initReminderJob = () => {
    // 08:00 AM daily
    cron.schedule('0 8 * * *', processReminders);
    console.log('Appointment Reminder Job scheduled.');
};

module.exports = { initReminderJob, processReminders };

