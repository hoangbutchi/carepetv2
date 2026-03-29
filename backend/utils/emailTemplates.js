/**
 * File này chứa các mẫu Email HTML cho dự án CarePet
 */

const getBookingSuccessTemplate = (appointment) => {
    const { customer, pet, service, date, timeSlot, price, staff } = appointment;
    const formattedDate = new Date(date).toLocaleDateString('vi-VN');
    const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
    
    // Link Google Maps cho cửa hàng (Bạn có thể thay bằng link thực tế của shop)
    const googleMapsLink = "https://www.google.com/maps/search/123+Đường+Thú+Cưng,+Quận+Hoàn+Kiếm,+Hà+Nội";
    // Avatar mặc định nếu bác sĩ chưa có ảnh
    const doctorAvatar = staff?.avatar || "https://cdn-icons-png.flaticon.com/512/387/387561.png";

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; color: #444; line-height: 1.6; }
            .details { background-color: #f9f9f9; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #eee; }
            .detail-item { margin-bottom: 12px; display: flex; justify-content: space-between; border-bottom: 1px dashed #ddd; padding-bottom: 8px; }
            .label { font-weight: bold; color: #666; }
            
            .doctor-card { display: flex; align-items: center; background-color: #fff5f5; border-radius: 12px; padding: 15px; margin-top: 20px; border: 1px solid #ffebeb; }
            .doctor-img { width: 70px; height: 70px; border-radius: 50%; object-fit: cover; margin-right: 15px; border: 3px solid #FF6B6B; }
            .doctor-info { flex: 1; }
            
            .map-container { margin-top: 30px; text-align: center; }
            .map-img { width: 100%; border-radius: 12px; height: 180px; object-fit: cover; border: 1px solid #eee; }
            
            .footer { background-color: #f1f1f1; padding: 25px; text-align: center; font-size: 13px; color: #777; }
            .btn { display: inline-block; padding: 12px 30px; background-color: #FF6B6B; color: white !important; text-decoration: none; border-radius: 30px; font-weight: bold; margin-top: 15px; box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3); }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div style="font-size: 45px; margin-bottom: 10px;">🐶🐱</div>
                <h1 style="margin:0; font-size: 26px;">ĐẶT LỊCH THÀNH CÔNG!</h1>
            </div>
            <div class="content">
                <p>Chào <b>${customer.name || 'bạn'}</b>,</p>
                <p>Cảm ơn bạn đã lựa chọn CarePet. Chúng tôi rất hân hạnh được phục vụ bạn và bé thú cưng!</p>
                
                <div class="details">
                    <div class="detail-item">
                        <span class="label">Ngày hẹn:</span>
                        <span>${formattedDate}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Khung giờ:</span>
                        <span style="font-weight: bold; color: #FF6B6B;">${timeSlot}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Thú cưng:</span>
                        <span>${pet ? pet.name : 'Chưa xác định'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Dịch vụ:</span>
                        <span style="text-transform: capitalize;">${service}</span>
                    </div>
                    <div class="detail-item" style="border-bottom: none;">
                        <span class="label">Tạm tính:</span>
                        <span style="color: #e67e22; font-weight: bold; font-size: 18px;">${formattedPrice}</span>
                    </div>
                </div>

                ${staff ? `
                <h3 style="color: #444; margin-top: 30px; margin-bottom: 10px;">Bác sĩ phụ trách:</h3>
                <div class="doctor-card">
                    <img src="${doctorAvatar}" class="doctor-img" alt="Bác sĩ">
                    <div class="doctor-info">
                        <div style="font-weight: bold; color: #333; font-size: 17px;">Dr. ${staff.name}</div>
                        <div style="color: #888; font-size: 14px;">${staff.specialization || 'Chuyên gia thú y'}</div>
                    </div>
                </div>
                ` : ''}

                <div class="map-container" style="margin-top: 30px;">
                    <h3 style="color: #444; margin-bottom: 15px; text-align: left;">Địa chỉ cửa hàng:</h3>
                    <a href="${googleMapsLink}" target="_blank" style="text-decoration: none; display: block;">
                        <div style="background-color: #f8f9fa; border-radius: 12px; padding: 25px; text-align: center; border: 2px dashed #FF6B6B; cursor: pointer;">
                            <div style="font-size: 45px; margin-bottom: 10px;">📍🗺️</div>
                            <div style="font-weight: bold; color: #333; font-size: 16px;">123 Đường Thú Cưng, Quận Hoàn Kiếm, Hà Nội</div>
                            <div style="color: #FF6B6B; font-size: 14px; margin-top: 15px; font-weight: bold; text-decoration: underline;">NHẤN ĐỂ XEM BẢN ĐỒ DẪN ĐƯỜNG →</div>
                        </div>
                    </a>
                </div>

                <div style="text-align: center; margin-top: 40px;">
                    <a href="#" class="btn">QUẢN LÝ LỊCH HẸN</a>
                </div>
            </div>
            <div class="footer">
                <p><b>Trung tâm Chăm sóc Thú cưng CarePet VN</b></p>
                <p>Hotline: 0123 456 789 | Email: contact@carepet.vn</p>
                <p>© 2024 CarePet - Chăm sóc từ trái tim</p>
            </div>
        </div>
    </body>
    </html>`;
};

const getReminderTemplate = (appointment) => {
    const { customer, pet, service, date, timeSlot } = appointment;
    const formattedDate = new Date(date).toLocaleDateString('vi-VN');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #4ECDC4 0%, #45B7AF 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; color: #444; line-height: 1.6; }
            .details { background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 5px solid #4ECDC4; }
            .detail-item { margin-bottom: 10px; }
            .label { font-weight: bold; color: #666; width: 100px; display: inline-block; }
            .footer { background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #888; }
            .alert-text { color: #d35400; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div style="font-size: 40px;">📅</div>
                <h1>Nhắc Lịch Hẹn Ngày Mai</h1>
            </div>
            <div class="content">
                <p>Chào <b>${customer.name || 'bạn'}</b>,</p>
                <p class="alert-text">Đừng quên lịch hẹn chăm sóc bé vào ngày mai nhé!</p>
                
                <div class="details">
                    <div class="detail-item"><span class="label">Thú cưng:</span> ${pet ? pet.name : 'thú cưng'}</div>
                    <div class="detail-item"><span class="label">Dịch vụ:</span> ${service}</div>
                    <div class="detail-item"><span class="label">Thời gian:</span> ${timeSlot}</div>
                    <div class="detail-item"><span class="label">Ngày:</span> ${formattedDate}</div>
                </div>

                <p>Để buổi chăm sóc diễn ra tốt nhất, bạn vui lòng đưa bé đến sớm hơn 5-10 phút nhé.</p>
                <p>Hẹn sớm gặp lại bạn và bé!</p>
            </div>
            <div class="footer">
                <p><b>Trung tâm Chăm sóc Thú cưng CarePet</b></p>
                <p>Hotline: 0123 456 789 | Email: support@carepet.com</p>
            </div>
        </div>
    </body>
    </html>`;
};

const getServiceCompletedTemplate = (appointment) => {
    const { customer, pet, service, price } = appointment;
    const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%); color: white; padding: 40px 30px; text-align: center; }
            .content { padding: 30px; color: #444; text-align: center; line-height: 1.6; }
            .star-rating { font-size: 35px; color: #f1c40f; margin: 20px 10px; }
            .summary { background-color: #f8f9fa; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: left; border: 1px dashed #ddd; }
            .btn-rate { display: inline-block; padding: 15px 40px; background-color: #FF6B6B; color: white !important; text-decoration: none; border-radius: 30px; font-weight: bold; margin-top: 10px; box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3); }
            .footer { background-color: #f1f1f1; padding: 25px; text-align: center; font-size: 13px; color: #777; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div style="font-size: 50px; margin-bottom: 10px;">❤️</div>
                <h1 style="margin:0;">CẢM ƠN BẠN & BÉ!</h1>
            </div>
            <div class="content">
                <p style="font-size: 18px; color: #333;">Chào <b>${customer.name || 'bạn'}</b>,</p>
                <p>Bé <b>${pet ? pet.name : 'thú cưng'}</b> đã hoàn thành dịch vụ <b>${service}</b> tại CarePet.</p>
                <p>Chúng tôi hy vọng bạn và bé hài lòng với trải nghiệm ngày hôm nay.</p>
                
                <div class="summary">
                    <p style="margin: 0 0 10px 0; font-weight: bold; color: #666;">Tóm tắt dịch vụ:</p>
                    <p style="margin: 5px 0;">🐾 Bé: <b>${pet ? pet.name : 'thú cưng'}</b></p>
                    <p style="margin: 5px 0;">🛠️ Dịch vụ: <b>${service}</b></p>
                    <p style="margin: 5px 0;">💵 Chi phí: <b>${formattedPrice}</b></p>
                </div>

                <p style="margin-top: 30px;"><b>Bạn cảm thấy dịch vụ thế nào?</b></p>
                <p style="color: #888; font-size: 14px;">Đánh giá của bạn giúp chúng tôi phục vụ các bé tốt hơn.</p>
                <div class="star-rating">⭐⭐⭐⭐⭐</div>
                
                <a href="#" class="btn-rate">ĐÁNH GIÁ NGAY</a>
                
                <p style="margin-top: 30px; font-style: italic; color: #888;">"Chăm sóc từ trái tim - CarePet"</p>
            </div>
            <div class="footer">
                <p><b>Trung tâm Chăm sóc Thú cưng CarePet VN</b></p>
                <p>Hotline: 0123 456 789 | Email: contact@carepet.vn</p>
                <p>Hẹn gặp lại bạn và bé lần tới!</p>
            </div>
        </div>
    </body>
    </html>`;
};

module.exports = {
    getBookingSuccessTemplate,
    getReminderTemplate,
    getServiceCompletedTemplate
};
