const mongoose = require('mongoose');

const LostPetPostSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    petName: {
        type: String,
        required: [true, 'Please add a pet name'],
        trim: true
    },
    petImage: {
        type: String,
        required: [true, 'Please add an image']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    contactPhone: {
        type: String,
        required: [true, 'Please add a contact phone']
    },
    // Structured address for filtering
    city: {
        name: String,
        code: String
    },
    district: {
        name: String,
        code: String
    },
    ward: {
        name: String,
        code: String
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [lng, lat]
            required: true
        }
    },
    status: {
        type: String,
        enum: ['lost', 'found', 'resolved'],
        default: 'lost'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

LostPetPostSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('LostPetPost', LostPetPostSchema);
