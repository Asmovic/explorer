const crypto = require('crypto');
const { promisify } = require('util')
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const secret = process.env.JWT_SECRET;
const expiredDate = process.env.JWT_EXPIRES_IN;

    const signToken = (id) => jwt.sign({ id }, secret, {
        expiresIn: expiredDate
    });

    const createAndSendToken = (user, statusCode, res) => {
        const token = signToken(user._id);
        const cookieOptions =  {
            expires: new Date( Date.now() + (30 * 24 * 60 * 60 * 1000)),
            secure: false, // This will make sure the cookie is send only on encrypted connection (https)
            httpOnly: true // This will ensure the cookie can not be modified or access in any way by the browser
        }
        if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;

     res.cookie('jwt', token, cookieOptions);
     res.status(statusCode).json({
         status: "success",
         token,
         data: { user }
     })
 
    }

exports.signup = catchAsync(async (req, res, next) => {
    const { name, email, role, password, confirmPassword } = req.body;
    const newUser = await User.create({
        name,
        email,
        role,
        password,
        confirmPassword
    });
    
    const url = `${req.protocol}://${req.get('host')}/me`;
    console.log(url);
    await new Email(newUser, url).sendWelcome();

    createAndSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req,res,next)=>{
    const { email, password } = req.body;
    console.log('login credentials...', email, password);
    if(!email || !password){
       return next(new AppError(`Please enter your email and password`, 400));
    }
    
     const user = await User.findOne({ email }).select('+password');

     if(!user || !(await user.comparePassword(password, user.password))) {
        return next(new AppError('Invalid email or password'), 401);
     }

     createAndSendToken(user, 200, res);

});

exports.logout = (req,res,next) => {
    console.log('logging out....');
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 5 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        status: 'success'
    })
}

// Only for rendered pages, and there will be no errors!
exports.isLoggedIn = async (req, res, next)=>{
    try{
        if(req.cookies.jwt){
     
            // 2) Verification of Token
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, secret);
        
            // 3) Check if user still exists
            const freshUser =await User.findById(decoded.id);
            if(!freshUser){
                return next()
            }
            // 4) Check if user has changed password after JWT has been issued.
            if(freshUser.passwordChangedAfter(decoded.iat)){
                return next();
            }
        
            // USER IS LOGGED IN
            res.locals.user = freshUser;
            return next();
            }
    }catch(err){
        return next();
    }

    next();
};

exports.protect = catchAsync( async (req, res, next)=>{
    // 1) Getting Token and check if it's there.
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer ")){
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.jwt){
        token = req.cookies.jwt;
    }
    if(!token){
        return next(new AppError('You are not logged in. Please login to get access!', 401));
    }

    // 2) Verification of Token
    const decoded = await promisify(jwt.verify)(token, secret);

    // 3) Check if user still exists
    const freshUser =await User.findById(decoded.id);
    if(!freshUser){
        return next( new AppError('User that owns this token does no longer exist.', 401))
    }
    // 4) Check if user has changed password after JWT has been issued.
    if(freshUser.passwordChangedAfter(decoded.iat)){
        return next( new AppError('User recently changed password!. Please login again!!', 401));
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = freshUser;
    res.locals.user = freshUser;
    next();
});

exports.restrictTo = (...roles) =>(req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next( new AppError('You do not have permission to perform this action', 403))
        }
        next();
}

exports.forgotPassword = catchAsync(async (req,res,next)=>{
    // Get user by email
    const user = await User.findOne({ email: req.body.email });
    if(!user){
        return next(new Error(`There is no user with email ${req.body.email} on this server`, 404));
    }

    // Generate random token
    const resetToken = user.createPasswordResetToken();

    await user.save({ validateBeforeSave: false });

    // Send token to email

    try{
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
        await new Email(user, resetURL).sendPasswordReset();

        res.status(200).json({
            status: 'success',
            message: 'Token was successfully sent to the email.'
        });
    } catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next( new AppError('There was an error sending the email. Try again later!'), 500);

    }
});

exports.resetPassword = catchAsync( async (req,res,next)=>{
    // Get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ 
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now()} });

    // If token has not expierd, and there is a user, set the new password
        if(!user){
            return next( new AppError('This is invalid or has expired', 400))
        }
        user.password = req.body.password;
        user.confirmPassword = req.body.confirmedPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
    // Update changePasswordAt property for the user

    // Log the user in, send JWT
    
    createAndSendToken(user, 200, res);
    
});

exports.updatePassword = catchAsync(async (req,res,next) => {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // 2) Check if posted current password is correct
    if(!user || !(await user.comparePassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Your current password is wrong'), 401);
     }

    // 3) If so, update password
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;

    await user.save();

    // 4) Log user in, send JWT
    
    createAndSendToken(user, 200, res);
})

