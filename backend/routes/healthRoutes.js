const express = require('express');
const router = express.Router();
const {
    getPetHealthHistory,
    createHealthRecord,
    exportHealthPDF
} = require('../controllers/healthController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createHealthRecord);
router.get('/:petId', getPetHealthHistory);
router.get('/export-pdf/:petId', exportHealthPDF);

module.exports = router;
