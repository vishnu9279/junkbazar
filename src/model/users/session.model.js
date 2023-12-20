"use strict";

import mongoose from "mongoose";
const userSessionSchema = new mongoose.Schema({
    enabled: {
        default: true,
        required: true,
        type: Boolean
    },
    encrypt: {
        required: true,
        type: String
    },
    exipryHr: {
        required: true, 
        type: String
    },
    expiryTime: {
        required: true, 
        type: Number
    },
    jwtId: {
        required: true, 
        type: String
    },
    originalUrl: {
        required: true, 
        type: String
    },
    phoneNumber: {
        required: true, 
        type: String
    },
    platform: {
        required: true, 
        type: String
    },
    terminated_at: {
        type: Number
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
});

const Session = mongoose.model("session", userSessionSchema);

export default Session;
