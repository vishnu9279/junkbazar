"use strict";

import mongoose from "mongoose";
const configSchema = new mongoose.Schema({
    address: {
        required: true,
        type: String
    },
    fullName: {
        required: true, 
        type: String
    },
    phone: {
        required: true,
        type: String
    },
    pincode: {
        required: true, 
        type: String
    }
});

const AppVersion = mongoose.model("contact", configSchema);

export default AppVersion;
