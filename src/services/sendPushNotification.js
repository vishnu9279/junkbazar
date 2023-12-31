"use strict";

import initializeFirebase from "../configuration/fireBaseConfiguration.js";
import notificationMeassageModel from "../model/users/notificationMessage.model.js";
import userFcmModel from "../model/users/fcm.model.js";
import fieldValidator from "../utils/fieldValidator.js";
import ApiError from "../utils/ApiError.js";

import {
    CommonMessage, statusCodeObject, errorAndSuccessCodeConfiguration
} from "../utils/constants.js";
const adminInstance =  initializeFirebase();

console.log("adminInstance", adminInstance);
const sendNotification = async (notificationData, userId) => {
    try {
        const fcms = await userFcmModel.find({
            enabled: true,
            userId
        }).lean();
        const registrationTokens = fieldValidator(fcms) ? [] : fcms.map(el => el.fcmToken);
        const notificatonMessageResp = await notificationMeassageModel.create({
            message: notificationData,
            userId
        });
        
        if (fieldValidator(notificatonMessageResp)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.SOMETHING_WENT_WRONG);
        
        const message = {
            data: notificationData,
            tokens: registrationTokens
        };

        console.log("message", message);
        const messagesSend = await adminInstance.messaging().sendMulticast(message, false);
        
        console.log("messageSend", messagesSend);
        console.log("messageSend", messagesSend.responses[0]);
    }
    catch (error) {
        console.error("Error While Sending Notification", error);
    }
};

export default sendNotification;
