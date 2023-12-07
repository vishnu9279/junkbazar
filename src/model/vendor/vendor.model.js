"use strict";

import mongoose from "mongoose";
import RolesEnum  from "../../utils/roles.js";
const userSchema = new mongoose.Schema(
    {
        aadhaarID: {
            required: false,
            type: String
        },
        accountBlocked: {
            default: false,
            type: Boolean 
        },
        dialCode: {
            required: true,
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
            required: false,
            type: Number
        },
        
        otpGenerateTime: {
            required: true,
            type: Number
        },

        panID: {
            required: false,
            type: String 
        },
        phoneNumber: {
            required: true,
            type: String,
            unique: true
        },
        profile: {
            required: false,
            type: String 
        },
        roles: {
            default: RolesEnum.VENDOR,
            type: Number
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

const User = mongoose.model("User", userSchema);

export default User;
