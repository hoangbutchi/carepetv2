require('dotenv').config({ path: __dirname + '/.env' });
const sendEmail = require('./utils/mailer');

async function test() {
    console.log('--- Đang bắt đầu kiểm tra Email ---');
    console.log('Gửi tới:', process.env.SMTP_USER);
    
    try {
        await sendEmail({
            email: process.env.SMTP_USER, // Gửi tới chính email cấu hình để kiểm tra
            subject: 'CarePet Test Email 🐾',
            html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h1 style="color: #FF6B6B;">CHÚC MỪNG!</h1>
                <p>Cấu hình gửi Email của bạn tại dự án <b>CarePet</b> đã hoạt động thành công.</p>
                <p>Thời gian nhận mail: ${new Date().toLocaleString('vi-VN')}</p>
                <p>---</p>
                <p><i>Admin CarePet</i></p>
            </div>`
        });
        console.log('\n✅ THÀNH CÔNG! Hãy kiểm tra hòm thư (Inbox hoặc Spam) của bạn.');
    } catch (error) {
        console.error('\n❌ THẤT BẠI rùi! Vui lòng kiểm tra lại SMTP_USER hoặc SMTP_PASS trong file .env.');
        console.error('Chi tiết lỗi:', error.message);
    }
}

test();
