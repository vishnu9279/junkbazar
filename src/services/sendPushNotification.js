"use strict";

import {
    initializeFirebase
} from "../configuration/fireBaseConfiguration.js";
import notificationMeassageModel from "../model/users/pushNotificationMessage.model.js";
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
    console.log("sendNotification working", notificationData, userId);
    let session;

    try {
        session = await getNewMongoSession();
    
        session.startTransaction();
        const data = (notificationData.data) ? notificationData.data : null;
        const title = notificationData.title;
        const message = notificationData.message;
        const fcms = await userFcmModel.find({
            enabled: true,
            userId
        }).lean();

        // console.log("====================================");
        // console.log("fcmToken", fcms);
        // console.log("====================================");
        const registrationTokens = fieldValidator(fcms.length === 0) ? [] : fcms.map(el => el.fcmToken);

        const mesaagaeModel = new notificationMeassageModel({
            message,
            payload: data,
            title,
            userId
        });
        const notificatonMessageResp = await mesaagaeModel.save({
            session
        });
        
        if (fieldValidator(notificatonMessageResp)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.SOMETHING_WENT_WRONG);
        
        const payload = {
            data,
            notification: {
                body: message,
                title
            }
        };

        const options = {
            priority: "high",
            timeToLive: 60 * 60
        };

        console.log("message", payload, registrationTokens);
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
            },
            $setOnInsert: {
                userId: userId
            }
        }, {
            new: true,
            session: session,
            upsert: true
        });
        
        console.log({
            messageCountResp,
            // messagesSend,
            readCount: totalMessageCount - unreadCount,
            totalMessageCount,
            unreadCount
        });

        await session.commitTransaction();
        await session.endSession();
        console.log("messageSend", messagesSend, "messageCountResp", messageCountResp);
        // console.log("messageSend", messagesSend.results[0], "messageCountResp", messageCountResp);
    }
    catch (error) {
        console.error("Error While Sending Notification", error);
        await session.abortTransaction();
        await session.endSession();
    }
};

export default sendNotification;
