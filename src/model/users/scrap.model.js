"use strict";

import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
    {
        address: {
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
        docId: {
            required: true,
            type: String,
            unique: true
        },
        docPath: {
            required: true,
            type: String,
            unique: true
        },
        docUrl: {
            required: true,
            type: String 
        },
        
        enabled: {
            default: true,
            type: Boolean
        },
        
        price: {
            required: true,
            type: Number
        },
        quantity: {
            required: false,
            type: Number
        },
        
        quantityType: {
            required: true,
            type: String
        },

        scrapId: {
            required: true,
            type: String
        },
        scrapName: {
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

const Scrap = mongoose.model("Scrap", userSchema);

export default Scrap;
