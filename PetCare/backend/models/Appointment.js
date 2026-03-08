const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    pet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet',
        required: true
    },
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    service: {
        type: String,
        enum: ['grooming', 'vaccination', 'checkup', 'surgery', 'boarding', 'training'],
        required: [true, 'Please select a service']
    },
    date: {
        type: Date,
        required: [true, 'Please select a date']
    },
    timeSlot: {
        type: String,
        required: [true, 'Please select a time slot'],
        enum: [
            '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
            '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
        ]
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot be more than 500 characters']
    },
    price: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient conflict checking
AppointmentSchema.index({ staff: 1, date: 1, timeSlot: 1 });

// Static method to check for conflicts
AppointmentSchema.statics.checkConflict = async function (staffId, date, timeSlot, excludeId = null) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const query = {
        staff: staffId,
        date: { $gte: startOfDay, $lte: endOfDay },
        timeSlot: timeSlot,
        status: { $nin: ['cancelled'] }
    };

    if (excludeId) {
        query._id = { $ne: excludeId };
    }

    const conflict = await this.findOne(query);
    return !!conflict;
};

module.exports = mongoose.model('Appointment', AppointmentSchema);
