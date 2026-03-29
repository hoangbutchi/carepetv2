const express = require('express');
const router = express.Router();
const {
    createLostPetPost,
    getLostPetPosts,
    updateLostPetStatus,
    deleteLostPetPost
} = require('../controllers/lostPetController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(getLostPetPosts)
    .post(protect, createLostPetPost);

router.route('/:id')
    .put(protect, updateLostPetStatus)
    .delete(protect, deleteLostPetPost);

module.exports = router;
