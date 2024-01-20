"use strict";

import mongoose from "mongoose";
const balanceSchema = new mongoose.Schema(
    {
        balance: {
            required: true,
            type: Number
        },
        
        currency: {
            required: true,
            type: String
        },
        updated: {
            required: true,
            type: Number
        },
        userId: {
            required: true,
            type: String 
        },
        wallet_type: {
            required: true,
            type: String 
        }
        
    },
    {
        timestamps: true 
    }
);

const BalanceModel = mongoose.model("balance", balanceSchema);

export default BalanceModel;
