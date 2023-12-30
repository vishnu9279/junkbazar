"use strict";

import asyncHandler from "../../utils/asyncHandler.js";
import fcmModel  from "../../model/users/fcm.model.js";
import fieldValidator from "../../utils/fieldValidator.js";
import ApiError from "../../utils/ApiError.js";
import {
    CommonMessage, statusCodeObject, errorAndSuccessCodeConfiguration
} from "../../utils/constants.js";

import ApiResponse from "../../utils/ApiSuccess.js";
import {
    getNewMongoSession
} from "../../configuration/dbConnection.js";

const saveFcmToken = asyncHandler (async (req, res) => {
    console.log("saveFcmToken working", req.body);
    let session;
    
    try {
        session = await getNewMongoSession();
    
        session.startTransaction();
        const userId = req.decoded.userId;
        const {
            fcmToken, deviceId
        } = req.body;

        if (fieldValidator(fcmToken) || fieldValidator(deviceId)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.ERROR_FIELD_REQUIRED);

        const fcm = await fcmModel.findOneAndUpdate({
            deviceId,
            fcmToken,
            userId
        }, {
            $set: {
                deviceId,
                fcmToken,
                userId
            } 
        }, {
            new: true,
            session,
            upsert: true
        });

        if (fieldValidator(fcm)) 
            throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.SOMETHING_WENT_WRONG);

        await session.commitTransaction();

        return res.status(201).json(
            new ApiResponse(statusCodeObject.HTTP_STATUS_OK, errorAndSuccessCodeConfiguration.HTTP_STATUS_OK, {}, CommonMessage.DETAIL_SAVED_SUCCESSFULLY)
        );
    }
    catch (error) {
        console.error("Error while Login User", error.message);
        // await session.abortTransaction();
        await session.abortTransaction();

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
    finally {
        // End the session
        await session.endSession();
    }
});

export default saveFcmToken;