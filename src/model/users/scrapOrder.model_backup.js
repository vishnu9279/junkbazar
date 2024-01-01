"use strict";

import mongoose from "mongoose";
const userAddressSchema = new mongoose.Schema(
    {
        addressId: {
            // ref: "user_pickup_address",
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
            type: String
        },
        
        address: {
            required: true,
            type: String
        },
        stateCode: {
            required: true,
            type: String
        },
        pincode: {
            required: true,
            type: Number
        },
        countryCode: {
            required: true,
            type: String
        },
        city: {
            required: true,
            type: String 
        },
       
        userId: {
            // ref: "user",
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

const user_address = mongoose.model("user_address", userAddressSchema);

export default user_address;
