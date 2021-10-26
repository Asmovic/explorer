const stripe = require('stripe')((process.env.STRIPE_SECRET_KEY).trim());
const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

exports.getCheckoutSession = catchAsync(async (req,res,next)=>{
    // 1) Get the currently booked tour
    const tour = await Tour.findById(req.params.tourId);
    /* console.log('tour...', tour) */
    // 2) Create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
       /*  success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`, */
        success_url: `${req.protocol}://${req.get('host')}/my-tours/`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                name: `${tour.name} Tour`,
                description: tour.summary,
                images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
                amount: tour.price * 100,
                currency: 'usd',
                quantity: 1
            } 
        ]
    });
    // Send session as response
    res.status(200).json({
        status: 'success',
        session
    })
});

/* exports.createBookingCheckout = async (req,res,next)=>{
    // This is temporary, because it's UNSECURE: anyone can make bookings without paying
    const { tour, user, price } = req.query;
    if(!tour && !user && !price) return next();

    await Booking.create({ tour, user, price });
     res.redirect(req.originalUrl.split('?')[0]);
} */

const createBookingCheckout = async session =>{

try{
    const tour = session.client_reference_id;
    const user = (await User.findOne({ email: session.customer_email })).id;
    const price = session.amount_total / 100;
    await Booking.create({ tour, user, price });
}catch(err){
    return next(new AppError('Error creating Booking', 400))
}
}

exports.webhookCheckout = (req, res, next)=>{
    const signature = req.headers['stripe-signature'];
    let event;
    let inside;
    try{

        event = stripe.webhooks.constructEvent(
            req.body, 
            signature, 
            (process.env.STRIPE_WEBHOOK_SECRET).trim()
            );
        }catch(err){
            return res.status(400).send(`Webhook error: ${err.message}`);
        }
        console.log('outside completed');
        if(event.type === 'checkout.session.completed'){
            inside = 'yes';
            console.log('inside completed');
            createBookingCheckout(event.data.object);
        }
        res.status(200).json({ received: true, created: inside });
    }


exports.getBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.createBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
