"use strict";

import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
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
        dialCode: {
            required: true,
            type: String
        },
        enabled: {
            default: true,
            type: Boolean
        },
        
        fullName: {
            required: true,
            type: String
        },
        phoneNumber: {
            required: true,
            type: Number
        },
        pincode: {
            required: true,
            type: Number
        },
        scrapId: {
            ref: "Scrap",
            required: true,
            type: String  
        },
        stateCode: {
            required: true,
            type: String
        },
        userId: {
            ref: "User",
            required: true,
            type: String
        }
    },
    {
        timestamps: true 
    }
);

const UserPickAddress = mongoose.model("user_pick_addres", userSchema);

export default UserPickAddress;
