"use strict";

import mongoose from "mongoose";

const vendorBookingSchema = new mongoose.Schema(
    {
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
        orderId: {
            required: true,
            type: String
        },
        orderStatus: {
            default: 0,
            required: true,
            type: Number
        },
        vendorId: {
            ref: "user",
            required: true,
            type: String  
        },
        weekNumber: {
            required: true,
            type: Number
        }
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true
        },
        toObject: {
            virtuals: true
        }
    }
);

// vendorBookingSchema.virtual("scraps", {
//     foreignField: "scrapId",
//     justOne: true,
//     localField: "scrapId",
//     ref: "Scrap"
// });
const vendorBookingModel = mongoose.model("vendor_booking_order", vendorBookingSchema);

export default vendorBookingModel;
