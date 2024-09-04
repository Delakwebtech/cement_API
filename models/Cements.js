const slugify = require('slugify');
const mongoose = require('mongoose');

const CementSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [100, 'Name can not be more than 100 characters']
    },
    slug: String,
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    price: {
        type: Number,
        required: [true, 'Please add price']
    },
    discountQuantity1: {
        quantity: {
            type: Number,
            required: [true, 'Please specify the quantity']
        },
        discount: {
            type: Number,
            default: 0,
            min: [0, 'Discount cannot be less than 0%'],
            max: [100, 'Discount cannot be more than 100%']
        }
    },
    discountQuantity2: {
        quantity: {
            type: Number,
            required: [true, 'Please specify the quantity']
        },
        discount: {
            type: Number,
            default: 0,
            min: [0, 'Discount cannot be less than 0%'],
            max: [100, 'Discount cannot be more than 100%']
        }
    },
    photo: {
        type: String,
        default: 'no-photo.jpg'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, 
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Create cement slug from the name
CementSchema.pre('save', function(next){
    this.slug = slugify(this.name, {lower: true});
    next();
});

// Calculate discounted price for quantity 1
CementSchema.virtual('discountedPrice1').get(function() {
    const discountAmount = (this.price * this.discountQuantity1.discount) / 100;
    return this.price - discountAmount;
});

// Calculate discounted price for quantity 2
CementSchema.virtual('discountedPrice2').get(function() {
    const discountAmount = (this.price * this.discountQuantity2.discount) / 100;
    return this.price - discountAmount;
});

module.exports = mongoose.model('Cements', CementSchema);
