const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { initReminderJob } = require('./jobs/reminderJob');

// Load env vars
dotenv.config();

// Connect to database
connectDB();
initReminderJob();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Route files
const authRoutes = require('./routes/authRoutes');
const petRoutes = require('./routes/petRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const messageRoutes = require('./routes/messageRoutes');
const newsRoutes = require('./routes/newsRoutes');
const momoRoutes = require('./routes/momoRoutes');
const vnpayRoutes = require('./routes/vnpayRoutes');
const healthRoutes = require('./routes/healthRoutes');

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/momo', momoRoutes);
app.use('/api/vnpay', vnpayRoutes);
app.use('/api/health', healthRoutes);

// Status check (previously health)
app.get('/api/status', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Pet Management API is running',
        timestamp: new Date().toISOString()
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
