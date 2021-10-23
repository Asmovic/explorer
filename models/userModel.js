const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email!'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email!']
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password!'],
        minLength: 8,
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, 'Please confirm your password!'],
        validate: {
            // This only work on create() and save()
            validator: function(el){
                return el === this.password
            },
            messagee: "Passwords are not the same"
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }

});

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);

    this.confirmPassword = undefined;
    next();
});

userSchema.pre('save', async function(next){
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function(next){
    this.find({ active: { $ne: false }});
    next();
})

userSchema.methods.comparePassword = async function(candidatePassword, userPassword){
    return bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.passwordChangedAfter = function (JWTTimeStamp){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000,10);

        return JWTTimeStamp < changedTimestamp;
    }
    return false;
}

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;