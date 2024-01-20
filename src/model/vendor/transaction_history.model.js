"use strict";

import mongoose from "mongoose";
const transactionHistorySchema = new mongoose.Schema(
    {
        after_balance: {
            required: true,
            type: Number 
        },
        amount: {
            required: true,
            type: Number
        },
        before_balance: {
            required: true,
            type: Number 
        },
        currency: {
            required: true,
            type: String
        },
        transaction_id: {
            required: true,
            type: String  
        },
        type: {
            required: true,
            type: String  
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

const transactionHistoryModel = mongoose.model("transaction_history", transactionHistorySchema);

export default transactionHistoryModel;
