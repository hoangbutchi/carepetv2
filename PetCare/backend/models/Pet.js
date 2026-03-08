const mongoose = require('mongoose');

const MedicalRecordSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    type: {
        type: String,
        enum: ['vaccination', 'deworming', 'checkup', 'treatment', 'surgery'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    veterinarian: {
        type: String
    },
    nextDueDate: {
        type: Date
    },
    notes: {
        type: String
    }
});

const PetSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please provide pet name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    species: {
        type: String,
        enum: ['dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'other'],
        required: [true, 'Please specify pet species']
    },
    breed: {
        type: String,
        trim: true
    },
    age: {
        type: Number,
        min: 0
    },
    weight: {
        type: Number,
        min: 0
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: true
    },
    avatar: {
        type: String,
        default: ''
    },
    medicalHistory: [MedicalRecordSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Virtual for calculating upcoming reminders
PetSchema.methods.getUpcomingReminders = function () {
    const now = new Date();
    const reminders = [];

    this.medicalHistory.forEach(record => {
        if (record.nextDueDate && record.nextDueDate > now) {
            reminders.push({
                type: record.type,
                dueDate: record.nextDueDate,
                description: record.description
            });
        }
    });

    return reminders.sort((a, b) => a.dueDate - b.dueDate);
};

module.exports = mongoose.model('Pet', PetSchema);
