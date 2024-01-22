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
        stateCode: {
            required: false,
            type: String
        },
        userId: {
            ref: "user",
            required: false,
            type: String
        },
        userIdF_k: {
            ref: "user",
            required: false, 
            type: mongoose.Schema.Types.ObjectId
        }
    },
    {
        timestamps: true 
    }
);

const Scrap = mongoose.model("scrap", userSchema);

export default Scrap;
