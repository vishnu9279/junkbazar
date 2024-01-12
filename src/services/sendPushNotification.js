"use strict";

import {
    initializeFirebase
} from "../configuration/fireBaseConfiguration.js";
import notificationMeassageModel from "../model/users/notificationMessage.model.js";
import userFcmModel from "../model/users/fcm.model.js";
import fieldValidator from "../utils/fieldValidator.js";
import ApiError from "../utils/ApiError.js";

import {
    CommonMessage, statusCodeObject, errorAndSuccessCodeConfiguration
} from "../utils/constants.js";
import notificationMessageCountModel from "../model/users/notificationCount.model.js";
import {
    getNewMongoSession
} from "../configuration/dbConnection.js";

const sendNotification = async (notificationData, userId) => {
    console.log("sendNotification working");
    let session;

    try {
        session = await getNewMongoSession();
    
        session.startTransaction();
        const data = notificationData.data;
        const title = notificationData.title;
        const message = notificationData.message;
        const fcms = await userFcmModel.find({
            enabled: true,
            userId
        }).lean();
        const registrationTokens = fieldValidator(fcms) ? [] : fcms.map(el => el.fcmToken);
        const notificatonMessageResp = await notificationMeassageModel.create({
            message,
            payload: data,
            title,
            userId
        });
        
        if (fieldValidator(notificatonMessageResp)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.SOMETHING_WENT_WRONG);
        
        const payload = {
            data: {
                data: JSON.stringify(data)
            },
            notification: {
                body: message,
                title
            }
        };
        // tokens: registrationTokens
        const options = {
            priority: "high",
            timeToLive: 60 * 60
        };

        console.log("message", payload);
        const adminInstance = await initializeFirebase();
        const messagesSend = await adminInstance.messaging().sendToDevice(registrationTokens, payload, options);
        
        const unreadCount = await notificationMeassageModel.countDocuments({
            readStatus: false,
            userId
        });
        const totalMessageCount = await notificationMeassageModel.countDocuments({
            userId
        });
        const messageCountResp =  await notificationMessageCountModel.updateOne({
            userId
        }, {
            $set: {
                readCount: totalMessageCount - unreadCount,
                totalCount: totalMessageCount,
                unreadCount
            }
        }, {
            new: true,
            session: session,
            upsert: true
        });

        console.log("messageSend", messagesSend, "messageCountResp", messageCountResp);
    }
    catch (error) {
        console.error("Error While Sending Notification", error);
    }
};

export default sendNotification;
