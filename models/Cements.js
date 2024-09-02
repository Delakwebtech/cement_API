const slugify = require('slugify');
const mongoose = require('mongoose');

const CementSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    slug: String,
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description can not be more than 500 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
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
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});


// Create cement slug from the name
CementSchema.pre('save', function(next){
    this.slug = slugify(this.name, {lower: true});
    next();
});

module.exports = mongoose.model('Cements', CementSchema);