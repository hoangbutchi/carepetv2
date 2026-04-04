const Order = require('../models/Order');
const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');

// @desc    Get revenue stats for charts
// @route   GET /api/stats/revenue
// @access  Private (Admin, Doctor, Staff)
exports.getRevenueStats = async (req, res) => {
    try {
        const { period = 'month', year = new Date().getFullYear() } = req.query;
        const role = req.user.role;
        const userId = req.user._id;

        let matchStage = {};
        
        // Date range filter based on year
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59);

        // If Doctor, filter by their appointments only
        if (role === 'doctor') {
            matchStage.staff = userId;
        }

        // 1. Get Appointment Revenue
        const appointmentRevenue = await Appointment.aggregate([
            {
                $match: {
                    ...matchStage,
                    status: { $in: ['completed', 'rated'] },
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: getGroupId(period),
                    total: { $sum: '$price' },
                    date: { $first: '$date' }
                }
            },
            { $sort: { '_id.year': 1, '_id.value': 1 } }
        ]);

        // 2. Get Order Revenue (Only for Admin/Staff)
        let orderRevenue = [];
        if (role === 'admin' || role === 'staff') {
            orderRevenue = await Order.aggregate([
                {
                    $match: {
                        $or: [
                            { paymentStatus: 'paid' },
                            { orderStatus: 'delivered' }
                        ],
                        createdAt: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: getGroupId(period, 'createdAt'),
                        total: { $sum: '$totalAmount' },
                        date: { $first: '$createdAt' }
                    }
                },
                { $sort: { '_id.year': 1, '_id.value': 1 } }
            ]);
        }

        // Combine and format data
        const combinedData = combineStats(appointmentRevenue, orderRevenue, period, year);

        res.status(200).json({
            success: true,
            data: combinedData
        });

    } catch (error) {
        console.error('Error fetching revenue stats:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// Helper to get group ID structure for aggregation
const getGroupId = (period, dateField = 'date') => {
    const field = `$${dateField}`;
    switch (period) {
        case 'day':
            return {
                year: { $year: field },
                month: { $month: field },
                day: { $dayOfMonth: field },
                value: { $dayOfYear: field }
            };
        case 'week':
            return {
                year: { $year: field },
                value: { $week: field }
            };
        case 'month':
        default:
            return {
                year: { $year: field },
                value: { $month: field }
            };
    }
};

// Helper to format and combine stats
const combineStats = (apps, orders, period, year) => {
    const map = new Map();

    const addToMap = (items) => {
        items.forEach(item => {
            const key = `${item._id.year}-${item._id.value}`;
            if (map.has(key)) {
                map.set(key, { ...map.get(key), value: map.get(key).value + item.total });
            } else {
                let label = '';
                if (period === 'month') {
                    label = `Tháng ${item._id.value}`;
                } else if (period === 'week') {
                    label = `Tuần ${item._id.value}`;
                } else {
                    label = `${item._id.day}/${item._id.month}`;
                }
                map.set(key, { label, value: item.total, sortKey: item._id.value });
            }
        });
    };

    addToMap(apps);
    addToMap(orders);

    // Ensure all months/weeks/days are represented if needed, or just return sorted map
    const result = Array.from(map.values()).sort((a, b) => a.sortKey - b.sortKey);
    
    // If monthly, ensure 12 months (optional but better for UI)
    if (period === 'month' && result.length < 12) {
        const fullYear = [];
        for (let i = 1; i <= 12; i++) {
            const monthData = result.find(r => r.label === `Tháng ${i}`);
            fullYear.push(monthData || { label: `Tháng ${i}`, value: 0 });
        }
        return fullYear;
    }

    return result;
};
