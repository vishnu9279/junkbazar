"use strict";

import mongoose from "mongoose";
const fcmSchems = new mongoose.Schema(
    {
        enabled: {
            default: true,
            required: true,
            type: Boolean   
        },
        readCount: {
            type: Number
        },
        totalCount: {
            type: Number
        },
        unreadCount: {
            type: Number
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

const notificationMessageCountModel = mongoose.model("notification_message_count", fcmSchems);

export default notificationMessageCountModel;
