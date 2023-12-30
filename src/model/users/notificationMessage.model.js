"use strict";

import mongoose from "mongoose";
const notificatioMessageSchems = new mongoose.Schema(
    {
        enabled: {
            default: true,
            required: true,
            type: Boolean   
        },
       
        message: {
            required: true,
            type: Object
        },
        
        userId: {
            required: true,
            type: String 
        }
    },
    {
        timestamps: true 
    }
);

const notificationMeassageModel = mongoose.model("notification_message", notificatioMessageSchems);

export default notificationMeassageModel;
