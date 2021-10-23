const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate fied value ${value}. Please use another value!`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = err =>{
    const errors = Object.values(err.errors).map(el=> el.message)
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const handleJWTError = () =>{
    const message = `You are not authorized`;
    return new AppError(message, 401);
}
const handleJWTExpiredError = () =>{
    const message = `Session Expired. Please login again!`;
    return new AppError(message, 401);
}

const sendErrorDev = (err, req, res)=> {
    // A) API
    if(req.originalUrl.startsWith('/api')){
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        })    
    }
    // B) RENDERED WEBSITE
    return res.status(err.statusCode).render('error', {
        title: 'Something went Wrong',
        msg: err.message
    })
    
    
};

const sendErrorProd =(err, req, res)=>{
    // A) API
    if(req.originalUrl.startsWith('/api')){
    // A) Operational error, trusted error: send message to client
        if(err.isOperational){
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message
        });
    }
    // B) Programming or other unknown error: don't leak error details
    return res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!'
    })
    
} 
    // B) RENDERED WEBSITE
    // A) Operational error, trusted error: send message to client
    if(err.isOperational){
        return res.status(err.statusCode).render('error', {
            title: 'Something went Wrong',
            msg: err.message
        })
}
// B) Programming or other unknown error: don't leak error details
    return res.status(err.statusCode).render('error', {
        title: 'Something went Wrong',
        msg: 'Please try again later'
    })
    
}

module.exports = (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development'){
        sendErrorDev(err, req, res);
    } else if ((process.env.NODE_ENV).trim() === 'production'){
        //DB error Handlings
        let error = err;
        console.log('code', error.name)
        if(error.name === 'CastError') error = handleCastErrorDB(error);
        if(error.code === 11000) error = handleDuplicateFieldsDB(error);
        if(error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if(error.name === 'JsonWebTokenError') error = handleJWTError();
        if(error.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, req, res);
    }
    
}