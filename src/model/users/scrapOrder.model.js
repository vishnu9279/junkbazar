"use strict";

import mongoose from "mongoose";
const scrapOrder = new mongoose.Schema(
    {
        addressId: {
            ref: "user_pick_addres",
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
            ref: "scrap",
            required: true,
            type: String
        },
       
        userId: {
            ref: "User",
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

const ScrapOrder = mongoose.model("scrap_order", scrapOrder);

export default ScrapOrder;
