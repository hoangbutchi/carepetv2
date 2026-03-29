const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const sendEmail = require('../utils/mailer');

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

            const emailHtml = `
            <!DOCTYPE html>
            <html>
            <body style="font-family: sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 20px auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #FF6B6B, #4ECDC4); padding: 20px; text-align: center; color: white;">
                        <h2>CarePet Reminder</h2>
                    </div>
                    <div style="padding: 20px;">
                        <p>Chào <b>${customer.name}</b>,</p>
                        <p>Bạn có lịch hẹn vào ngày mai cho bé <b>${pet ? pet.name : 'thú cưng'}</b>:</p>
                        <ul>
                            <li><b>Dịch vụ:</b> ${appointment.service}</li>
                            <li><b>Thời gian:</b> ${appointment.timeSlot}</li>
                            <li><b>Ngày:</b> ${appointment.date.toLocaleDateString('vi-VN')}</li>
                        </ul>
                        <p>Hẹn gặp lại bạn và bé!</p>
                    </div>
                </div>
            </body>
            </html>`;

            await sendEmail({
                email: customer.email,
                subject: `Nhắc lịch hẹn cho ${pet ? pet.name : 'bé'} vào ngày mai!`,
                html: emailHtml
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

