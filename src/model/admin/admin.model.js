"use strict";

import mongoose from "mongoose";
import RolesEnum  from "../../utils/roles.js";
import ShortUniqueId from "short-unique-id";
import CryptoJS  from "crypto-js";
import {
    CommonMessage, basicConfigurationObject
} from "../../utils/constants.js";
const uid = new ShortUniqueId();
const userSchema = new mongoose.Schema(
    {
        accountBlocked: {
            default: false,
            type: Boolean 
        },
        balance: {
            type: Number
        },
        dialCode: {
            required: true,
            type: String
        },
        docUrl: {
            type: String
        },
       
        firstName: {
            required: false,
            type: String
        },
        
        lastName: {
            required: false,
            type: String
        },
        
        OTP: {
            type: Number
        },
        
        otpGenerateTime: {
            required: true,
            type: Number
        },
        
        password: {
            required: [ true,
                CommonMessage.PASSWORD_REQUIRED ],
            type: String
        },
       
        phoneNumber: {
            required: true,
            type: String,
            unique: true
        },
        roles: {
            default: RolesEnum.ADMIN,
            type: Number
        },
        salt: {
            type: String
        },
        status: {
            default: "Offline",
            type: String
        },
        userId: {
            required: true,
            type: String,
            unique: true
        },
        verified: {
            default: false,
            type: Boolean
        }
    },
    {
        timestamps: true 
    }
);

async function passworEncryption(password, salt){
    const loginKey = basicConfigurationObject.PASSWORD_SECRET_KEY;

    if (!loginKey) return CommonMessage.LOGIN_KEY_MISSING;

    const passwordHashed = await CryptoJS.HmacSHA256(password + salt, loginKey).toString();

    return passwordHashed;
}

userSchema.pre("save", async function(next){
    if (!this.isModified("password")) return next();
    
    this.salt = uid.stamp(32);

    this.password = await passworEncryption(this.password, this.salt);
});
const AdminModel = mongoose.model("admin_user", userSchema);

export default AdminModel;
