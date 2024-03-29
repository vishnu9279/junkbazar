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
        address: {
            required: false,
            type: String
        },
        city: {
            required: false,
            type: String 
        },
        countryCode: {
            required: false,
            type: String
        },

        dialCode: {
            required: true,
            type: String
        },
        documentUploaded: {
            default: false,
            required: true,
            type: Boolean
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
        stateCode: {
            required: false,
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

const Vendor = mongoose.model("user", userSchema);

export default Vendor;
