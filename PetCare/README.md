# 🐾 Pet Care Pro - Pet Management System

<div align="center">

![Pet Care Pro](https://img.shields.io/badge/Pet%20Care%20Pro-v1.0.0-06b6d4?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat-square&logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/MongoDB-6.x-47A248?style=flat-square&logo=mongodb)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=flat-square&logo=tailwindcss)

**A full-stack web application for pet management, veterinary appointments, and pet product shopping.**

[English](#-english) | [Tiếng Việt](#-tiếng-việt)

</div>

---

# 🇺🇸 English

## 📋 Table of Contents
- [Introduction](#introduction)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Installation](#installation)
- [API Documentation](#api-documentation)
- [Demo Accounts](#demo-accounts)

## Introduction

**Pet Care Pro** is a comprehensive pet management system built with modern web technologies:

- 🐕 **Pet Management** - Track pet info, medical history
- 📅 **Appointment Booking** - Book checkups, vaccinations, grooming
- 🛒 **Online Shop** - Buy food, accessories
- 💬 **Live Chat** - Chat with veterinarians
- 📰 **News** - Read and write pet articles
- 👨‍💼 **Admin Dashboard** - For Staff/Admin management

## Tech Stack

### Frontend
| Technology | Version | Description |
|------------|---------|-------------|
| React.js | 18.x | Modern UI library |
| Vite | 5.x | Fast build tool |
| Tailwind CSS | 3.x | Utility-first CSS |
| React Router | 6.x | Client-side routing |

### Backend
| Technology | Version | Description |
|------------|---------|-------------|
| Node.js | 18.x | JavaScript runtime |
| Express.js | 4.x | Web framework |
| MongoDB | 6.x | NoSQL database |
| Mongoose | 8.x | MongoDB ODM |
| JWT | - | Authentication |

## Features

### 🐕 Pet Management
- Add/edit/delete pets
- Health timeline visualization
- Medical history (vaccinations, checkups)
- Vaccination reminders

### 📅 Appointment Booking
- 4-step booking wizard
- Service selection (Grooming, Vaccination, Checkup, Surgery, Boarding, Training)
- Date/time slot picker
- Staff selection

### 🛒 Online Shop
- Product categories (Food, Accessories, Medicine, Toys, Hygiene)
- Search and filter
- Shopping cart
- Order tracking with status timeline

### 👨‍💼 Admin Dashboard
- **Overview**: Quick stats (appointments, orders, revenue)
- **Appointments**: View by date, filter All/Pending, update status
- **Orders**: Manage orders, update delivery status
- **Products**: Add/edit/delete products (Admin only)
- **Articles**: Review articles, manage news
- **Doctors**: Manage staff (Admin only)

### 🌐 Internationalization
- English and Vietnamese support
- Easy language toggle

### 🎨 UI/UX
- Dark mode / Light mode
- Responsive design (mobile, tablet, desktop)
- Smooth animations

## Installation

### Prerequisites
- **Node.js** >= 18.0.0
- **MongoDB** >= 6.0 (local or MongoDB Atlas)

### Step 1: Clone Repository

```bash
git clone https://github.com/your-username/pet-management-system.git
cd pet-management-system
```

### Step 2: Setup Backend

```bash
cd backend
npm install

# Create .env file with:
# MONGO_URI=mongodb://localhost:27017/petcare
# JWT_SECRET=your_jwt_secret_key_here
# PORT=5000

node seed.js  # Seed demo data
npm run dev
```

> Backend runs at: `http://localhost:5000`

### Step 3: Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

> Frontend runs at: `http://localhost:5173`

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Auth Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Get current user |
| GET | `/auth/staff` | Get staff list |

### Pet Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/pets` | Get user's pets |
| POST | `/pets` | Add new pet |
| PUT | `/pets/:id` | Update pet |
| DELETE | `/pets/:id` | Delete pet |
| POST | `/pets/:id/medical` | Add medical record |

### Appointment Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/appointments` | Get appointments |
| POST | `/appointments` | Create appointment |
| PUT | `/appointments/:id` | Update appointment |
| GET | `/appointments/available-slots` | Get available slots |
| GET | `/appointments/by-date` | Get by date (Staff/Admin) |

### Product Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List products |
| GET | `/products/:id` | Get product detail |
| POST | `/products` | Add product (Admin) |
| PUT | `/products/:id` | Update product (Admin) |

### Order Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders` | Get orders |
| POST | `/orders` | Create order |
| PUT | `/orders/:id/status` | Update status (Staff/Admin) |
| PUT | `/orders/:id/cancel` | Cancel order |

### Message Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/messages/conversations` | Get conversations |
| GET | `/messages/:userId` | Get messages |
| POST | `/messages` | Send message |

### News Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/news` | Get articles |
| POST | `/news` | Create article |
| PUT | `/news/:id/approve` | Approve article (Staff/Admin) |

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| 👑 Admin | admin@petcare.com | admin123 |
| 👨‍⚕️ Staff | staff@petcare.com | staff123 |
| 👤 Customer | customer@example.com | customer123 |

---

# 🇻🇳 Tiếng Việt

## 📋 Mục Lục
- [Giới Thiệu](#giới-thiệu)
- [Công Nghệ](#công-nghệ)
- [Tính Năng](#tính-năng)
- [Cài Đặt](#cài-đặt)
- [API Documentation](#api-documentation-1)
- [Tài Khoản Demo](#tài-khoản-demo)

## Giới Thiệu

**Pet Care Pro** là hệ thống quản lý thú cưng toàn diện:

- 🐕 **Quản lý thú cưng** - Theo dõi thông tin, lịch sử y tế
- 📅 **Đặt lịch hẹn** - Đặt lịch khám, tiêm phòng, làm đẹp
- 🛒 **Cửa hàng online** - Mua sắm thức ăn, phụ kiện
- 💬 **Chat trực tiếp** - Trao đổi với bác sĩ thú y
- 📰 **Tin tức** - Đọc và viết bài về thú cưng
- 👨‍💼 **Dashboard quản lý** - Dành cho Admin/Staff

## Công Nghệ

### Frontend
| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| React.js | 18.x | Library UI hiện đại |
| Vite | 5.x | Build tool nhanh |
| Tailwind CSS | 3.x | Utility-first CSS |
| React Router | 6.x | Client-side routing |

### Backend
| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| Node.js | 18.x | JavaScript runtime |
| Express.js | 4.x | Web framework |
| MongoDB | 6.x | NoSQL database |
| Mongoose | 8.x | MongoDB ODM |
| JWT | - | Authentication |

## Tính Năng

### 🐕 Quản Lý Thú Cưng
- Thêm/sửa/xóa thông tin thú cưng
- Timeline sức khỏe với biểu đồ
- Lịch sử y tế (tiêm phòng, khám bệnh)
- Nhắc nhở lịch tiêm phòng

### 📅 Đặt Lịch Hẹn
- Wizard đặt lịch 4 bước
- Chọn dịch vụ (Làm đẹp, Tiêm phòng, Khám bệnh, Phẫu thuật, Trông giữ, Huấn luyện)
- Chọn ngày/giờ
- Chọn bác sĩ/nhân viên

### 🛒 Cửa Hàng Online
- Danh mục sản phẩm (Thức ăn, Phụ kiện, Thuốc, Đồ chơi, Vệ sinh)
- Tìm kiếm và lọc
- Giỏ hàng
- Theo dõi đơn hàng

### 👨‍💼 Admin Dashboard
- **Tổng quan**: Thống kê nhanh
- **Lịch hẹn**: Xem theo ngày, lọc All/Pending
- **Đơn hàng**: Quản lý, cập nhật trạng thái
- **Sản phẩm**: Thêm/sửa/xóa (Admin)
- **Bài viết**: Duyệt bài viết
- **Bác sĩ**: Quản lý nhân viên (Admin)

### 🌐 Đa Ngôn Ngữ
- Tiếng Việt và English
- Chuyển đổi dễ dàng

### 🎨 Giao Diện
- Dark mode / Light mode
- Responsive (mobile, tablet, desktop)
- Animations mượt mà

## Cài Đặt

### Yêu Cầu
- **Node.js** >= 18.0.0
- **MongoDB** >= 6.0

### Bước 1: Clone Repository

```bash
git clone https://github.com/your-username/pet-management-system.git
cd pet-management-system
```

### Bước 2: Cài Đặt Backend

```bash
cd backend
npm install

# Tạo file .env:
# MONGO_URI=mongodb://localhost:27017/petcare
# JWT_SECRET=your_jwt_secret_key_here
# PORT=5000

node seed.js  # Seed dữ liệu demo
npm run dev
```

> Backend chạy tại: `http://localhost:5000`

### Bước 3: Cài Đặt Frontend

```bash
cd frontend
npm install
npm run dev
```

> Frontend chạy tại: `http://localhost:5173`

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Auth Endpoints
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/auth/register` | Đăng ký |
| POST | `/auth/login` | Đăng nhập |
| GET | `/auth/me` | Lấy thông tin user |
| GET | `/auth/staff` | Lấy danh sách staff |

### Pet Endpoints
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/pets` | Lấy danh sách pet |
| POST | `/pets` | Thêm pet |
| PUT | `/pets/:id` | Cập nhật pet |
| DELETE | `/pets/:id` | Xóa pet |
| POST | `/pets/:id/medical` | Thêm hồ sơ y tế |

### Appointment Endpoints
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/appointments` | Lấy lịch hẹn |
| POST | `/appointments` | Tạo lịch hẹn |
| PUT | `/appointments/:id` | Cập nhật lịch hẹn |
| GET | `/appointments/available-slots` | Lấy khung giờ trống |
| GET | `/appointments/by-date` | Lấy theo ngày (Staff/Admin) |

### Product Endpoints
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/products` | Lấy sản phẩm |
| GET | `/products/:id` | Chi tiết sản phẩm |
| POST | `/products` | Thêm sản phẩm (Admin) |
| PUT | `/products/:id` | Cập nhật sản phẩm (Admin) |

### Order Endpoints
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/orders` | Lấy đơn hàng |
| POST | `/orders` | Tạo đơn hàng |
| PUT | `/orders/:id/status` | Cập nhật trạng thái (Staff/Admin) |
| PUT | `/orders/:id/cancel` | Hủy đơn hàng |

### Message Endpoints
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/messages/conversations` | Lấy hội thoại |
| GET | `/messages/:userId` | Lấy tin nhắn |
| POST | `/messages` | Gửi tin nhắn |

### News Endpoints
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/news` | Lấy bài viết |
| POST | `/news` | Tạo bài viết |
| PUT | `/news/:id/approve` | Duyệt bài (Staff/Admin) |

## Tài Khoản Demo

| Role | Email | Password |
|------|-------|----------|
| 👑 Admin | admin@petcare.com | admin123 |
| 👨‍⚕️ Staff | staff@petcare.com | staff123 |
| 👤 Customer | customer@example.com | customer123 |

---

## 📁 Project Structure

```
pet-management-system/
├── backend/                 # Node.js API server
│   ├── config/              # Database connection
│   ├── controllers/         # Route handlers
│   ├── middleware/          # Auth middleware
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API routes
│   ├── server.js            # Entry point
│   └── seed.js              # Demo data seeder
│
├── frontend/                # React application
│   └── src/
│       ├── components/      # Reusable components
│       ├── context/         # React contexts
│       ├── i18n/            # Translations (EN/VI)
│       ├── pages/           # Page components
│       ├── services/        # API services
│       └── App.jsx          # Main app
│
└── README.md
```

---

## 📝 License

MIT License - Free to use for learning and personal projects!

---

<div align="center">

**Built with ❤️ for pet lovers everywhere 🐾**

</div>
