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
        orderStatus: {
            default: 0,
            required: true,
            type: Number
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
            ref: "scrap",
            required: true,
            type: String
        },
        scrapIdF_K: {
            ref: "scrap",
            required: true,
            type: mongoose.Schema.Types.ObjectId
        },
        stateCode: {
            required: true,
            type: String
        },
        userId: {
            ref: "user",
            required: true,
            type: String
        },
        userIdF_k: {
            ref: "user",
            required: true, 
            type: mongoose.Schema.Types.ObjectId
        }
    },
    {
        timestamps: true 
    }
);

const UserPickAddress = mongoose.model("user_order", userSchema);

export default UserPickAddress;
