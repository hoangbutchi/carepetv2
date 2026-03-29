# 🐾 Hướng Dẫn Sử Dụng Chức Năng Gửi Email - Dự Án CarePet

Hệ thống gửi Email đã được tích hợp hoàn chỉnh và tự động hóa. Dưới đây là mọi thứ bạn cần biết để vận hành.

---

## 1. Cấu hình Quan trọng (Bắt buộc)
Bạn cần điền thông tin vào file `backend/.env` để hệ thống có thể gửi thư qua Gmail.

```env
# backend/.env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=email_cua_ban@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # Mã 16 ký tự "Mật khẩu ứng dụng" từ Google
```

> [!IMPORTANT]
> **Mật khẩu ứng dụng:** Bạn KHÔNG dùng mật khẩu đăng nhập Gmail thường. Hãy vào [Google App Passwords](https://myaccount.google.com/apppasswords) để tạo mã 16 ký tự.

---

## 2. Quản lý Mẫu Email (Templates)
Tất cả thiết kế Giao diện Email nằm trong file: `backend/utils/emailTemplates.js`.

Hiện tại có 3 mẫu thiết kế:
1.  **getBookingSuccessTemplate:** Gửi ngay khi khách vừa nhấn đặt lịch xong.
2.  **getReminderTemplate:** Gửi tự động vào 8:00 sáng hàng ngày để nhắc lịch ngày mai.
3.  **getServiceCompletedTemplate:** Gửi ngay khi bác sĩ nhấn nút "Hoàn thành" dịch vụ (Gồm nút Đánh giá 5 sao).

---

## 3. Hệ thống Tự động hóa
Bạn không cần gọi API thủ công, hệ thống sẽ tự kích hoạt dựa trên hành động:

*   **Khi Đặt lịch thành công:** Trong hàm `createAppointment` (Controllers), email xác nhận sẽ được gửi ngay.
*   **Khi Hoàn thành dịch vụ:** Trong hàm `updateAppointment` (Controllers), nếu trạng thái thay đổi sang `completed`, email cảm ơn sẽ được gửi đi.
*   **Khi Nhắc lịch hẹn:** Job `reminderJob.js` sẽ chạy ngầm vào 8:00 sáng hàng ngày để tìm các lịch hẹn của ngày mai và gửi mail nhắc nhở.

---

## 4. Các lệnh Kiểm tra Nhanh (Test)
Bạn có thể dùng các lệnh sau trong terminal để test giao diện và kết nối mà không cần thao tác trên trình duyệt:

1.  **Kiểm tra kết nối cơ bản:**
    `node backend/test-email.js`
2.  **Kiểm tra mẫu Đặt lịch (Mẫu Bác sĩ + Bản đồ):**
    `node backend/test-booking-email.js`
3.  **Kiểm tra mẫu Cảm ơn & Đánh giá:**
    `node backend/test-thankyou-email.js`

---

## 🛡️ Lưu ý Bảo mật
*   **KHÔNG** đẩy file `.env` lên GitHub. Tôi đã cấu hình `.gitignore` để tự động bỏ qua file này.
*   Nếu bạn đổi Gmail khác để gửi thư, hãy nhớ tạo lại **Mật khẩu ứng dụng** mới cho email đó.

🐾 **Chúc CarePet vận hành trơn tru!**
