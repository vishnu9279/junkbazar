"use strict";

import mongoose from "mongoose";
const configSchema = new mongoose.Schema({
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
    userId: {
        ref: "User",
        required: true, 
        type: String
    }
});

const Session = mongoose.model("session", configSchema);

export default Session;
