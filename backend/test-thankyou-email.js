require('dotenv').config({ path: __dirname + '/.env' });
const sendEmail = require('./utils/mailer');
const { getServiceCompletedTemplate } = require('./utils/emailTemplates');

async function testThankYouTemplate() {
    console.log('--- Đang kiểm tra Email Cảm ơn & Đánh giá ---');
    
    // Giả lập dữ liệu lịch hẹn vừa hoàn thành
    const mockAppointment = {
        customer: { name: 'Khách hàng Thân thiết' },
        pet: { name: 'Bông (Mèo Anh)' },
        service: 'vaccination',
        price: 450000
    };

    try {
        await sendEmail({
            email: process.env.SMTP_USER, // Gửi tới chính mình để test
            subject: 'CarePet - Cảm ơn bạn và bé đã tin dùng dịch vụ! ❤️',
            html: getServiceCompletedTemplate(mockAppointment)
        });
        console.log('\n✅ THÀNH CÔNG! Hãy kiểm tra hòm thư của bạn để xem mẫu Email Cảm ơn mới.');
    } catch (error) {
        console.error('\n❌ Lỗi:', error.message);
    }
}

testThankYouTemplate();
