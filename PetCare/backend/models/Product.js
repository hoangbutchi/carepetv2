const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide product name'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    category: {
        type: String,
        enum: ['food', 'accessory', 'medicine', 'toy', 'hygiene'],
        required: [true, 'Please select a category']
    },
    description: {
        type: String,
        maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please provide price'],
        min: [0, 'Price cannot be negative']
    },
    originalPrice: {
        type: Number,
        min: [0, 'Original price cannot be negative']
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'Stock cannot be negative']
    },
    images: [{
        type: String
    }],
    petType: {
        type: String,
        enum: ['dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'all'],
        default: 'all'
    },
    brand: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    soldCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for search and filtering
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ category: 1, petType: 1, isActive: 1 });

module.exports = mongoose.model('Product', ProductSchema);
