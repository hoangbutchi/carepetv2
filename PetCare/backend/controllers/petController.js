const Pet = require('../models/Pet');

// @desc    Get all pets for current user
// @route   GET /api/pets
// @access  Private
exports.getPets = async (req, res) => {
    try {
        let query;

        // Admin/Staff can see all pets
        if (req.user.role === 'admin' || req.user.role === 'staff') {
            query = Pet.find().populate('owner', 'name email phone');
        } else {
            // Customers can only see their own pets
            query = Pet.find({ owner: req.user.id });
        }

        const pets = await query.sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: pets.length,
            pets
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single pet
// @route   GET /api/pets/:id
// @access  Private
exports.getPet = async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.id).populate('owner', 'name email phone');

        if (!pet) {
            return res.status(404).json({
                success: false,
                message: 'Pet not found'
            });
        }

        // Check ownership (unless admin/staff)
        if (req.user.role === 'customer' && pet.owner._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this pet'
            });
        }

        res.status(200).json({
            success: true,
            pet
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create new pet
// @route   POST /api/pets
// @access  Private
exports.createPet = async (req, res) => {
    try {
        req.body.owner = req.user.id;

        const pet = await Pet.create(req.body);

        res.status(201).json({
            success: true,
            pet
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update pet
// @route   PUT /api/pets/:id
// @access  Private
exports.updatePet = async (req, res) => {
    try {
        let pet = await Pet.findById(req.params.id);

        if (!pet) {
            return res.status(404).json({
                success: false,
                message: 'Pet not found'
            });
        }

        // Check ownership (unless admin/staff)
        if (req.user.role === 'customer' && pet.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this pet'
            });
        }

        // Don't allow changing owner
        delete req.body.owner;

        pet = await Pet.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            pet
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete pet
// @route   DELETE /api/pets/:id
// @access  Private
exports.deletePet = async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.id);

        if (!pet) {
            return res.status(404).json({
                success: false,
                message: 'Pet not found'
            });
        }

        // Check ownership (unless admin)
        if (req.user.role !== 'admin' && pet.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this pet'
            });
        }

        await pet.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Pet deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Add medical record to pet
// @route   POST /api/pets/:id/medical
// @access  Private
exports.addMedicalRecord = async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.id);

        if (!pet) {
            return res.status(404).json({
                success: false,
                message: 'Pet not found'
            });
        }

        // Only owner, staff, or admin can add medical records
        if (req.user.role === 'customer' && pet.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const { date, type, description, veterinarian, nextDueDate, notes } = req.body;

        pet.medicalHistory.push({
            date: date || Date.now(),
            type,
            description,
            veterinarian,
            nextDueDate,
            notes
        });

        await pet.save();

        res.status(201).json({
            success: true,
            pet
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get upcoming reminders for a pet
// @route   GET /api/pets/:id/reminders
// @access  Private
exports.getReminders = async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.id);

        if (!pet) {
            return res.status(404).json({
                success: false,
                message: 'Pet not found'
            });
        }

        // Check ownership (unless admin/staff)
        if (req.user.role === 'customer' && pet.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const reminders = pet.getUpcomingReminders();

        res.status(200).json({
            success: true,
            petName: pet.name,
            reminders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all reminders for user's pets
// @route   GET /api/pets/reminders/all
// @access  Private
exports.getAllReminders = async (req, res) => {
    try {
        const pets = await Pet.find({ owner: req.user.id });

        const allReminders = [];
        pets.forEach(pet => {
            const reminders = pet.getUpcomingReminders();
            reminders.forEach(reminder => {
                allReminders.push({
                    petId: pet._id,
                    petName: pet.name,
                    petAvatar: pet.avatar,
                    ...reminder
                });
            });
        });

        // Sort by due date
        allReminders.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        res.status(200).json({
            success: true,
            count: allReminders.length,
            reminders: allReminders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
