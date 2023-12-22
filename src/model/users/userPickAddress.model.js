"use strict";

import mongoose from "mongoose";
const userPickupSchema = new mongoose.Schema(
    {
        address: {
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
        dayNumber: {
            required: true,
            type: Number 
        },
        dialCode: {
            required: true,
            type: String
        },
        docUrl: {
            required: false,
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
        monthNumber: {
            required: true,
            type: Number
        },
        orderId: {
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
            type: mongoose.Schema.Types.ObjectId
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
        },
        vendorId: {
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

// userPickupSchema.virtual("scraps", {
//     foreignField: "scrapId",
//     justOne: true,
//     localField: "scrapId",
//     ref: "Scrap"
// });
const UserPickAddress = mongoose.model("user_order", userPickupSchema);

export default UserPickAddress;
