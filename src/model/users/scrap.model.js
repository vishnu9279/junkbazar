"use strict";

import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
    {
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
            required: false,
            type: Number
        },
        // quantity: {
        //     default: 0,
        //     required: true,
        //     type: Number
        // },
        
        quantityType: {
            required: false,
            type: String
        },

        scrapId: {
            required: false,
            type: String
        },
        scrapName: {
            required: false,
            type: String   
        },
        userId: {
            required: false,
            type: String
        }
    },
    {
        timestamps: true 
    }
);

const Scrap = mongoose.model("scrap", userSchema);

export default Scrap;
