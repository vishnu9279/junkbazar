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
        // quantity: {
        //     default: 0,
        //     required: true,
        //     type: Number
        // },
        
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

const Scrap = mongoose.model("scrap", userSchema);

export default Scrap;
