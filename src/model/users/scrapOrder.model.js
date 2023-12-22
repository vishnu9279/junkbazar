"use strict";

import mongoose from "mongoose";
const scrapOrderSchema = new mongoose.Schema(
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
        
        scrapId: {
            // ref: "scrap",
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

const ScrapOrder = mongoose.model("scrap_order", scrapOrderSchema);

// scrapOrderSchema.virtual("scraps", {
//     foreignField: "scrapId",
//     justOne: true,
//     localField: "scrapId",
//     ref: "scrap"
// });
// scrapOrderSchema.virtual("user", {
//     foreignField: "userId",
//     justOne: true,
//     localField: "userId",
//     ref: "user"
// });

// scrapOrderSchema.virtual("pickupAddress", {
//     foreignField: "addressId",
//     justOne: true,
//     localField: "addressId",
//     ref: "user_pickup_address"
// });

export default ScrapOrder;
