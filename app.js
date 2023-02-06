const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitaize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routers/tourRoutes');
const userRouter = require('./routers/userRoutes');
const reviewRouter = require('./routers/reviewRoutes');
const bookingRouter = require('./routers/bookingRoutes');
const bookingController = require('./controllers/bookingController')
const viewRoutes = require('./routers/viewRoutes');

const app = express();
app.enable('trust proxy');

app.set('view engine', 'pug'); 
app.set('views', path.join(__dirname, 'views'));

// Global middlewares
// Implementing cors
app.use(cors());

// Enable pre-flight request for all requests
app.options('*', cors());

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Helmet helps you secure your Express apps by setting various HTTP headers.
// SET Security HTTP headers
app.use(helmet());
// app.use(cors());

// Compressing text file before sending to client.
app.use(compression());


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

app.post('/webhook-checkout', express.raw({ type: 'application/json'}), bookingController.webhookCheckout);

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
/*     res.setHeader('Content-Security-Policy', 
    'script-src-elem https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.js'); */
    const style = req.protocol + '://' + req.get('host');
    res.setHeader('Content-Security-Policy', 
    `style-src-elem https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.css https://fonts.googleapis.com/ ${style}/css/style.css`);
/*     res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); */
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

module.exports = app;
