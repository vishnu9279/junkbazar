"use strict";

import mongoose from "mongoose";
const userScrapSchema = new mongoose.Schema(
    {
        addToCartId: {
            required: true, 
            type: String 
        },
        docUrl: {
            type: String
        },
        enabled: {
            default: true,
            type: Boolean
        },
        quantity: {
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

const userScrapModel = mongoose.model("user_scrap", userScrapSchema);

export default userScrapModel;
