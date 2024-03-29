"use strict";

import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import {
    CommonMessage, statusCodeObject, errorAndSuccessCodeConfiguration, loginMessage
} from "../../utils/constants.js";

import ApiResponse from "../../utils/ApiSuccess.js";
import sendNotification from "../../services/sendPushNotification.js";
const dummy = asyncHandler (async (req, res) => {
    console.log("dummy working", req.body);
    
    try {
        const userId = req.decoded.userId;
        
        const notificationData = {
            name: "hello World"
        };

        await sendNotification(notificationData, userId);

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

export default dummy;