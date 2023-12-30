"use strict";

import initializeFirebase from "../configuration/fireBaseConfiguration.js";
import notificationMeassageModel from "../model/users/notificationMessage.model.js";
import fieldValidator from "../utils/fieldValidator.js";
import ApiError from "../utils/ApiError.js";

import {
    CommonMessage, statusCodeObject, errorAndSuccessCodeConfiguration
} from "../utils/constants.js";

const sendNotification = async (registrationTokens, notificationData, userId) => {
    const message = {
        data: notificationData,
        tokens: registrationTokens
    };

    try {
        const notificatonMessageResp = await notificationMeassageModel.create({
            message: notificationData,
            userId
        });

        if (fieldValidator(notificatonMessageResp)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.SOMETHING_WENT_WRONG);

        const adminInstance = await initializeFirebase();
        const messagesSend = await adminInstance.messaging().sendMulticast(message, false);

        console.log("messageSend", messagesSend);
        console.log("messageSend", messagesSend.responses[0]);
    }
    catch (error) {
        console.error("Error While Sending Notification", error);
    }
};

export default sendNotification;
