"use strict";

import mongoose from "mongoose";
const userAddressSchema = new mongoose.Schema(
    {
        address: {
            required: true,
            type: String
        },
        addressId: {
            required: true,
            type: String
        },
        city: {
            required: true,
            type: String 
        },
        countryCode: {
            required: true,
            type: String
        },
        currentTime: {
            required: true,
            type: Number
        },
        
        dayNumber: {
            required: true,
            type: Number 
        },
        enabled: {
            default: true,
            type: Boolean
        },
        monthNumber: {
            required: true,
            type: Number
        },
        pincode: {
            required: true,
            type: Number
        },
        stateCode: {
            required: true,
            type: String
        },
       
        userId: {
            required: true,
            type: String
        },
        weekNumber: {
            required: true,
            type: Number
        }
    },
    {
        timestamps: true 
    }
);

const userAddress = mongoose.model("user_address", userAddressSchema);

export default userAddress;
