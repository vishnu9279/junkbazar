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
            type: String
        },
        payload: {
            required: true,
            type: Object
        },
        readStatus: {
            default: false,
            required: true,
            type: Boolean
        },
        
        title: {
            required: true,
            type: String
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
