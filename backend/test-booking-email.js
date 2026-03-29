require('dotenv').config({ path: __dirname + '/.env' });
const sendEmail = require('./utils/mailer');
const { getBookingSuccessTemplate } = require('./utils/emailTemplates');

async function testBookingTemplate() {
    console.log('--- Đang bắt đầu kiểm tra Email Đặt Lịch ---');
    
    // Giả lập dữ liệu lịch hẹn
    const mockAppointment = {
        customer: { name: 'Văn Hoàng' },
        pet: { name: 'Luna (Cún cưng)' },
        service: 'grooming',
        date: new Date(),
        timeSlot: '14:00-15:00',
        price: 350000,
        staff: {
            name: 'Minh Tuấn',
            specialization: 'Chuyên gia Grooming & Spa',
            avatar: 'https://images.pexels.com/photos/6131569/pexels-photo-6131569.jpeg'
        }
    };

    try {
        await sendEmail({
            email: process.env.SMTP_USER, // Gửi tới chính mình để test
            subject: 'CarePet - Xác nhận Đặt lịch thành công! 🐾',
            html: getBookingSuccessTemplate(mockAppointment)
        });
        console.log('\n✅ THÀNH CÔNG! Hãy kiểm tra hòm thư của bạn để xem mẫu thiết kế mới.');
    } catch (error) {
        console.error('\n❌ Lỗi:', error.message);
    }
}

testBookingTemplate();
