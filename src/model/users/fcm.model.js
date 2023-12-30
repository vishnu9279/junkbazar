"use strict";

import mongoose from "mongoose";
const fcmSchems = new mongoose.Schema(
    {
        deviceId: {
            required: true,
            type: String
        },
        
        enabled: {
            default: true,
            required: true,
            type: Boolean   
        },
       
        fcmToken: {
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

const userFcmModel = mongoose.model("user_fcm", fcmSchems);

export default userFcmModel;
