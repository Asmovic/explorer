const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitaize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routers/tourRoutes');
const userRouter = require('./routers/userRoutes');
const reviewRouter = require('./routers/reviewRoutes');
const bookingRouter = require('./routers/bookingRoutes');
const viewRoutes = require('./routers/viewRoutes');

const app = express();

app.set('view engine', 'pug'); 
app.set('views', path.join(__dirname, 'views'));

// Global middlewares

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Helmet helps you secure your Express apps by setting various HTTP headers.
// SET Security HTTP headers
app.use(helmet());
// app.use(cors());


// Development Logging
if(process.env.NODE_ENV === 'development'){
    app.use(morgan("dev"));
}

const limiter = rateLimit({
    max: 200,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, Please try again in an hour!.'
});

// Limit requests from the same IP
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb'}));
app.use(express.urlencoded({ extended: true, limit: '100kb'}));
app.use(cookieParser());

// Data sanitization against NOSQL query injections
app.use(mongoSanitaize());

// Data sanitization against xss
app.use(xss());

// Prevent parameter Pollution
app.use(hpp({
    whitelist: [
        'duration', 'ratingsQuantity',
        'ratingsAverage', 'maxGroupSize',
        'price', 'difficulty'
    ]
}))

// Test middleware (Optional)
app.use((req,res, next)=>{
    req.requestTime = new Date().toISOString();
    res.setHeader('Content-Security-Policy', 
    'script-src-elem http://localhost:3000/js/bundle.js https://api.mapbox.com/mapbox-gl-js/v0.54.0/mapbox-gl.js https://js.stripe.com/v3/');
    res.setHeader('Content-Security-Policy', 
    'style-src-elem http://localhost:3000/css/style.css https://api.mapbox.com/mapbox-gl-js/v0.54.0/mapbox-gl.css');

    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//Routers
app.use(viewRoutes);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req,res,next)=>{
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

/*  app.use((err, req, res, next)=>{
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    })
}) */ 

module.exports = app;