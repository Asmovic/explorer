const mongoose = require('mongoose');
const slugify = require('slugify');
/* const validator = require('validator'); */

const { Schema } = mongoose;

const tourSchema = new Schema({
    name: {
        type: String,
        required: [true, 'A tour name is required.'],
        unique: true,
        trim: true,
        maxLength: [40, "Name must be equal or less than 40 characters."],
        minLength: [10, "Name must be equal or greater than 10 characters."]
        /* validate: [validator.isAlpha, "Tour name must only contain characters"] */
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a maximum group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: { 
            values: ['easy', 'medium', 'difficult'],
            message: "Difficulty is either: easy, medium, difficult"
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, "Rating can't be less than 1.0"],
        max: [5, "Rating can't be greater than 5.0"],
        set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour price is required.']

    }, 
    priceDiscount: {
        type: Number,
        validate: {
            validator: function(val){
                // This only points to current Document on new Document creation
                return val < this.price
            },
            message: "Discount Price ({VALUE}) should be below regular Price"
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour summary is required.']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image.']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        //GeoJSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description:  String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
}, {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ 
    startLocation: '2dsphere'
});
tourSchema.index({ slug: 1 });

// Virtual Property
tourSchema.virtual('durationWeeks').get(function(){
    return this.duration / 7;
});

// Virtual populate
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
})

////////////////////////////////****MIDDLEWARES****////////////////////////////////

// Document Middleware
//Runs before .save() and .create()
tourSchema.pre('save', function(next){
    this.slug = slugify(this.name, { lower: true});
    next();
});

/* tourSchema.pre('save', async function(next){
    const guidesPromises = this.guides.map(async id=> await User.findById(id));
    this.guides = await Promise.all(guidesPromises);
    next();
}); */
/* 
tourSchema.post('save', (doc, next)=> {
    console.log(doc);
    next();
}); */


// QUERY MIDDLEWARE
/* tourSchema.pre('find', function (next){ */
tourSchema.pre(/^find/, function (next){
    this.find({secretTour: { $ne: true }});
    this.start = Date.now();
    next();
});

tourSchema.pre(/^find/, function (next){
    this.populate({ 
        path: 'guides',
        select: '-__v -passwordChangedAt',
    });
    next();
})

tourSchema.post(/^find/, function(docs, next){
    console.log(Date.now() - this.start );
    next();
});


//AGGREGATION MIDDLEWARE
/* tourSchema.pre('aggregate', function(next){
    this.pipeline().unshift({ $match: { secretTour: { $ne: true }}})
    next();
}) */

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;