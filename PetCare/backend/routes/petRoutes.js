const express = require('express');
const router = express.Router();
const {
    getPets,
    getPet,
    createPet,
    updatePet,
    deletePet,
    addMedicalRecord,
    getReminders,
    getAllReminders
} = require('../controllers/petController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

router.route('/')
    .get(getPets)
    .post(createPet);

router.get('/reminders/all', getAllReminders);

router.route('/:id')
    .get(getPet)
    .put(updatePet)
    .delete(deletePet);

router.post('/:id/medical', addMedicalRecord);
router.get('/:id/reminders', getReminders);

module.exports = router;
