const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        min: 3,
        max :20
    },
    email:{
        type:String,
        required:true,
        unique:true,
        max :20
    },
    password:{
        type:String,
        required:true,
        min:8
    },
    isAvatarImageSet :{
        type:Boolean,
        default:false
    },
    avatarImage : {
        type:String,
        default:""
    },
    resetPasswordToken: {
        type: String,
        default: ""
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    mfaCode: {
        type: String,
        default: null
    },
    mfaCodeExpires:{
        type: Date,
        default: null
    }, // 10 minutes
});
const User =  mongoose.model('user',userSchema);
module.exports = User