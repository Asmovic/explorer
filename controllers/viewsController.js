const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');

exports.getOverview = catchAsync(async (req, res, next) => {
    // 1) Get Tour data from collection
    const tours = await Tour.find();
    // 2) Build template

    // 3) Render that template using tour data from 1)
    res.status(200).render('overview', {
        title: 'All tours',
        tours
    })
});

exports.getTour = catchAsync(async (req,res, next)=>{
    // 1) Get the data for the requested tour (including reviews and guides)
    const tour = await Tour.findOne({slug: req.params.slug}).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    if(!tour){
        return next(new AppError('There is no tour with such name', 404));
    }
    // 2) Build template

    // 3) Render template using tour data from 1)
    res.status(200)
    .render('tour', {
        title: `${tour.name} tour`,
        tour
    })
});

exports.getLoginForm =(req,res)=>{
   
    res.render('login', {
        title: 'Log into your account'
    });
};

exports.getAccount = (req,res)=>{
    res.status(200).render('account', {
        title: 'Your account'
    })
}

exports.getMyTours = catchAsync(async (req,res,next)=>{
    // Find all bookings
    const bookings = await Booking.find({ user: req.user.id });

    // Find tours with the return IDs
    const tourIDs = bookings.map(el=> el.tour);
    const tours = await Tour.find({ _id: { $in: tourIDs } });

    res.status(200).render('overview', {
        title: 'My Tours',
        tours
    })
});

exports.updateUserAccount = async (req,res)=>{
    // console.log('updating.....', req.body.name, req.body.email);
    const updatedUser = await User.findByIdAndUpdate(req.user.id, { 
        name: req.body.name,
        email: req.body.email
    }, {
        new: true,
        runValidators: true
    });
    res.status(200).render('account', {
        title: 'Your account',
        user: updatedUser
    })
}

exports.alerts = (req,res,next)=>{
    const { alert } = req.query;
    if (alert === 'booking'){
        res.locals.alert = "your booking was successful! Please ckeck your email for a comfirmation. If your booking doesn't show up here immediately, please come back later.";
    }
    next();
}