"use strict";

import mongoose from "mongoose";
import RolesEnum  from "../../utils/roles.js";
const userSchema = new mongoose.Schema(
    {
        accountBlocked: {
            default: false,
            type: Boolean 
        },
        dialCode: {
            required: true,
            type: String
        },
        OTP: {
            type: Number
        },
        otpGenerateTime: {
            required: true,
            type: Number
        },
        
        phoneNumber: {
            required: true,
            type: String,
            unique: true
        },
        
        roles: {
            default: RolesEnum.USER,
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

const User = mongoose.model("user", userSchema);

export default User;
