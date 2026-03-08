const express = require('express');
const router = express.Router();
const {
    getNews,
    getNewsDetail,
    createNews,
    updateNews,
    deleteNews,
    getFeaturedNews,
    getPendingNews,
    getMyArticles,
    approveNews,
    rejectNews
} = require('../controllers/newsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getNews);
router.get('/featured', getFeaturedNews);

// Protected routes - any authenticated user
router.get('/my-articles', protect, getMyArticles);
router.post('/', protect, createNews);
router.put('/:id', protect, updateNews);
router.delete('/:id', protect, deleteNews);

// Staff/Admin only routes
router.get('/pending', protect, authorize('staff', 'admin'), getPendingNews);
router.put('/:id/approve', protect, authorize('staff', 'admin'), approveNews);
router.put('/:id/reject', protect, authorize('staff', 'admin'), rejectNews);

// Public route (must be last due to :id param)
router.get('/:id', getNewsDetail);

module.exports = router;

