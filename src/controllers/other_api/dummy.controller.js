"use strict";

import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import {
    CommonMessage, statusCodeObject, errorAndSuccessCodeConfiguration, loginMessage
} from "../../utils/constants.js";

import ApiResponse from "../../utils/ApiSuccess.js";
import sendNotification from "../../services/sendPushNotification.js";
const login = asyncHandler (async (req, res) => {
    console.log("login working", req.body);
    
    try {
        const registrationTokens = [ "epoJZOe1TqyW8Pn1Mk80Gf:APA91bHJkoebKnUTVjWsfK_w4AbqI3HZiKNIrK8GucN0PF8h4BUE6Die__x1jbS-bMdiC4QJAEbsgINKVGqm69YZEB3HDEOFy7I1DtlFWvvKJPXua5v5-wIV1R-F8O4Cowy9L_9V5k9Y" ];
        const notificationData = {
            name: "hello World"
        };
        const userId = "jdhsfyu";

        await sendNotification(registrationTokens, notificationData, userId);

        return res.status(201).json(
            new ApiResponse(statusCodeObject.HTTP_STATUS_OK, errorAndSuccessCodeConfiguration.HTTP_STATUS_OK, {}, loginMessage.LOGIN_OTP_SENT_SUCCESSFULLY)
        );
    }
    catch (error) {
        console.error("Error while Login User", error.message);
        // await session.abortTransaction();

        if (error instanceof ApiError) {
            console.log("Api Error instance");

            // Handle ApiError instances with dynamic status code and message
            return res.status(error.statusCode).json({
                error: error || CommonMessage.SOMETHING_WENT_WRONG
            });
        }
        else {
            // Handle other types of errors
            console.error("Error in loginUser:", error);

            return res.status(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
                error: CommonMessage.SOMETHING_WENT_WRONG 
            });
        }
    }
});

export default login;