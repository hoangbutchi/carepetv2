const mongoose = require('mongoose');

const HealthRecordSchema = new mongoose.Schema({
    pet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet',
        required: true
    },
    weight: {
        type: Number,
        required: [true, 'Weight is required'],
        min: 0
    },
    checkupDate: {
        type: Date,
        required: [true, 'Checkup date is required'],
        default: Date.now
    },
    vaccines: [
        {
            name: { type: String, required: true },
            dateAdministered: { type: Date, required: true },
            nextDueDate: { type: Date }
        }
    ],
    notes: {
        type: String,
        maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    vetName: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware index to optimize lookup by petId and date
HealthRecordSchema.index({ pet: 1, checkupDate: 1 });

module.exports = mongoose.model('HealthRecord', HealthRecordSchema);
