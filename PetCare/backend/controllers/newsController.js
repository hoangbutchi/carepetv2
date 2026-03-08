const News = require('../models/News');

// @desc    Get all published news
// @route   GET /api/news
// @access  Public
exports.getNews = async (req, res) => {
    try {
        const { category, page = 1, limit = 10 } = req.query;

        let query = { isPublished: true, status: 'approved' };

        if (category && category !== 'all') {
            query.category = category;
        }

        const news = await News.find(query)
            .populate('author', 'name avatar')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await News.countDocuments(query);

        res.status(200).json({
            success: true,
            count: news.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            news
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single news article
// @route   GET /api/news/:id
// @access  Public
exports.getNewsDetail = async (req, res) => {
    try {
        const news = await News.findById(req.params.id)
            .populate('author', 'name avatar');

        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'Article not found'
            });
        }

        // Increment view count
        news.views += 1;
        await news.save();

        res.status(200).json({
            success: true,
            news
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create news article (any authenticated user)
// @route   POST /api/news
// @access  Private
exports.createNews = async (req, res) => {
    try {
        const { title, content, summary, image, category } = req.body;

        // Staff and Admin articles are auto-approved
        const isStaffOrAdmin = ['staff', 'admin'].includes(req.user.role);

        const news = await News.create({
            title,
            content,
            summary,
            image,
            category,
            author: req.user.id,
            status: isStaffOrAdmin ? 'approved' : 'pending',
            isPublished: isStaffOrAdmin,
            approvedBy: isStaffOrAdmin ? req.user.id : undefined,
            approvedAt: isStaffOrAdmin ? new Date() : undefined
        });

        res.status(201).json({
            success: true,
            message: isStaffOrAdmin
                ? 'Article published successfully'
                : 'Article submitted for review',
            news
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get pending articles for approval
// @route   GET /api/news/pending
// @access  Private/Staff/Admin
exports.getPendingNews = async (req, res) => {
    try {
        const news = await News.find({ status: 'pending' })
            .populate('author', 'name avatar email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: news.length,
            news
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get my articles (for the logged-in user)
// @route   GET /api/news/my-articles
// @access  Private
exports.getMyArticles = async (req, res) => {
    try {
        const news = await News.find({ author: req.user.id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: news.length,
            news
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Approve article
// @route   PUT /api/news/:id/approve
// @access  Private/Staff/Admin
exports.approveNews = async (req, res) => {
    try {
        const news = await News.findById(req.params.id);

        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'Article not found'
            });
        }

        news.status = 'approved';
        news.isPublished = true;
        news.approvedBy = req.user.id;
        news.approvedAt = new Date();
        await news.save();

        res.status(200).json({
            success: true,
            message: 'Article approved and published',
            news
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Reject article
// @route   PUT /api/news/:id/reject
// @access  Private/Staff/Admin
exports.rejectNews = async (req, res) => {
    try {
        const { reason } = req.body;
        const news = await News.findById(req.params.id);

        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'Article not found'
            });
        }

        news.status = 'rejected';
        news.isPublished = false;
        news.rejectionReason = reason || 'No reason provided';
        await news.save();

        res.status(200).json({
            success: true,
            message: 'Article rejected',
            news
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update news article
// @route   PUT /api/news/:id
// @access  Private
exports.updateNews = async (req, res) => {
    try {
        let news = await News.findById(req.params.id);

        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'Article not found'
            });
        }

        // Only author or staff/admin can update
        if (news.author.toString() !== req.user.id && !['staff', 'admin'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        news = await News.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            news
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete news article
// @route   DELETE /api/news/:id
// @access  Private
exports.deleteNews = async (req, res) => {
    try {
        const news = await News.findById(req.params.id);

        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'Article not found'
            });
        }

        // Only author or staff/admin can delete
        if (news.author.toString() !== req.user.id && !['staff', 'admin'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        await news.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Article deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get featured/latest news for homepage
// @route   GET /api/news/featured
// @access  Public
exports.getFeaturedNews = async (req, res) => {
    try {
        const news = await News.find({ isPublished: true, status: 'approved' })
            .populate('author', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            news
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

