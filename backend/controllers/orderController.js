const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, paymentMethod } = req.body;
        
        console.log("Create Order Payload Check:", { items, shippingAddress, paymentMethod });

        if (!items || items.length === 0) {
            console.error("Order Creation Failed: No order items", req.body);
            return res.status(400).json({
                success: false,
                message: 'No order items'
            });
        }

        // Validate products and calculate total
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.product);

            if (!product) {
                console.error(`Order Creation Failed: Product not found: ${item.product}`);
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.product}`
                });
            }

            if (product.stock < item.quantity) {
                console.error(`Order Creation Failed: Insufficient stock for ${product.name}. Requested ${item.quantity}, have ${product.stock}`);
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`
                });
            }

            orderItems.push({
                product: product._id,
                name: product.name,
                quantity: item.quantity,
                price: product.price
            });

            totalAmount += product.price * item.quantity;

            // Reduce stock
            product.stock -= item.quantity;
            product.soldCount += item.quantity;
            await product.save();
        }

        const order = await Order.create({
            customer: req.user.id,
            items: orderItems,
            totalAmount,
            shippingAddress,
            paymentMethod
        });

        res.status(201).json({
            success: true,
            order
        });
    } catch (error) {
        console.error("Order Creation Fatal Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
    try {
        let query;
        const { status, page = 1, limit = 10 } = req.query;

        if (req.user.role === 'admin' || req.user.role === 'staff') {
            query = Order.find();
        } else {
            query = Order.find({ customer: req.user.id });
        }

        if (status) {
            query = query.find({ orderStatus: status });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const orders = await query
            .populate('customer', 'name email phone')
            .populate('items.product', 'name images')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Order.countDocuments(query.getFilter());

        res.status(200).json({
            success: true,
            count: orders.length,
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
    try {
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID format'
            });
        }
        const order = await Order.findById(req.params.id)
            .populate('customer', 'name email phone')
            .populate('items.product', 'name images price');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check authorization
        if (
            req.user.role === 'customer' &&
            order.customer._id.toString() !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Staff/Admin
exports.updateOrderStatus = async (req, res) => {
    try {
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID format'
            });
        }
        const { orderStatus, paymentStatus } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (orderStatus) {
            order.orderStatus = orderStatus;
        }

        if (paymentStatus) {
            order.paymentStatus = paymentStatus;
            if (paymentStatus === 'paid') {
                order.paymentDetails.paidAt = Date.now();
            }
        }

        await order.save();

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Process mock payment
// @route   POST /api/orders/:id/payment
// @access  Private
exports.processPayment = async (req, res) => {
    try {
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID format'
            });
        }
        const { paymentMethod, transactionId } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check authorization
        if (order.customer.toString() !== req.user.id && req.user.role === 'customer') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Mock payment processing
        // In production, this would integrate with actual payment gateways
        const mockPaymentSuccess = Math.random() > 0.1; // 90% success rate for demo

        if (mockPaymentSuccess) {
            order.paymentStatus = 'paid';
            order.orderStatus = 'confirmed';
            order.paymentDetails = {
                transactionId: transactionId || `TXN${Date.now()}`,
                paidAt: Date.now(),
                bankName: paymentMethod === 'bank_transfer' ? 'Mock Bank' : null
            };

            await order.save();

            res.status(200).json({
                success: true,
                message: 'Payment successful',
                order
            });
        } else {
            order.paymentStatus = 'failed';
            await order.save();

            res.status(400).json({
                success: false,
                message: 'Payment failed. Please try again.'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
    try {
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID format'
            });
        }
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check authorization
        if (order.customer.toString() !== req.user.id && req.user.role === 'customer') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Only pending orders can be cancelled
        if (!['pending', 'confirmed'].includes(order.orderStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled at this stage'
            });
        }

        // Restore stock
        for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (product) {
                product.stock += item.quantity;
                product.soldCount -= item.quantity;
                await product.save();
            }
        }

        order.orderStatus = 'cancelled';
        if (order.paymentStatus === 'paid') {
            order.paymentStatus = 'refunded';
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get order stats for dashboard
// @route   GET /api/orders/stats
// @access  Private/Admin
exports.getOrderStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Today's stats
        const todayOrders = await Order.find({
            createdAt: { $gte: today }
        });

        // This month's stats
        const monthOrders = await Order.find({
            createdAt: { $gte: thisMonth }
        });

        // Revenue calculations
        const todayRevenue = todayOrders
            .filter(o => o.paymentStatus === 'paid')
            .reduce((sum, o) => sum + o.totalAmount, 0);

        const monthRevenue = monthOrders
            .filter(o => o.paymentStatus === 'paid')
            .reduce((sum, o) => sum + o.totalAmount, 0);

        // Pending orders
        const pendingOrders = await Order.countDocuments({
            orderStatus: { $in: ['pending', 'confirmed', 'processing'] }
        });

        res.status(200).json({
            success: true,
            stats: {
                today: {
                    orders: todayOrders.length,
                    revenue: todayRevenue
                },
                month: {
                    orders: monthOrders.length,
                    revenue: monthRevenue
                },
                pending: pendingOrders
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
