"use strict";

import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
    {
        address: {
            required: false,
            type: String
        },
        countryCode: {
            required: false,
            type: String
        },
        currentTime: {
            required: true,
            type: Number
        },
        // docId: {
        //     required: true,
        //     type: String,
        //     unique: true
        // },
        docPath: {
            required: true,
            type: String
            // unique: true
        },
        docUrl: {
            required: false,
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
            required: true,
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
            required: false,
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

const Scrap = mongoose.model("scrap", userSchema);

export default Scrap;
