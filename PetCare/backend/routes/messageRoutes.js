const express = require('express');
const router = express.Router();
const {
    sendMessage,
    getConversations,
    getMessages,
    markAsRead,
    getUnreadCount,
    getAvailableStaff
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

router.post('/', sendMessage);
router.get('/conversations', getConversations);
router.get('/unread/count', getUnreadCount);
router.get('/staff', getAvailableStaff);
router.get('/:userId', getMessages);
router.put('/:userId/read', markAsRead);

module.exports = router;
