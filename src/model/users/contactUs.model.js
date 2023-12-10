"use strict";

import mongoose from "mongoose";
const contactUsSchema = new mongoose.Schema(
    {
        address: {
            required: true,
            type: String
        },
        
        dialCode: {
            required: true,
            type: String
        },
       
        enabled: {
            default: true,
            type: Boolean
        },
        
        fullName: {
            required: true,
            type: String
        },
        message: {
            required: true,
            type: String 
        },
        phoneNumber: {
            required: true,
            type: Number
        },
        pincode: {
            required: true,
            type: Number
        }
    },
    {
        timestamps: true 
    }
);

const contactUsModel = mongoose.model("contact", contactUsSchema);

export default contactUsModel;
