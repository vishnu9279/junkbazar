"use strict";

import mongoose from "mongoose";
import RolesEnum  from "../../utils/roles.js";
const userSchema = new mongoose.Schema(
    {
        aadhaarID: {
            required: false,
            type: String
        },
        aadhaarUrl: {
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
        docUrl: {
            type: String
        },
        firstName: {
            required: false,
            type: String
        },
        isActive: {
            default: false,
            type: Boolean
        },
        isDocumentUploaded: {
            default: false,
            required: true,
            type: Boolean 
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

        panID: {
            required: false,
            type: String 
        },
        panUrl: {
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
        
        profileUrl: {
            type: String
        },
        roles: {
            default: RolesEnum.USER,
            type: Number
        },
        stateCode: {
            required: false,
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
