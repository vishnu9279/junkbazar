"use strict";

import asyncHandler from "../../utils/asyncHandler.js";
import UserModel  from "../../model/users/user.model.js";
import Session  from "../../model/users/session.model.js";
import ApiError from "../../utils/ApiError.js";
import userFcmModel from "../../model/users/fcm.model.js";
import {
    CommonMessage, registerMessage, statusCodeObject, errorAndSuccessCodeConfiguration, loginMessage
} from "../../utils/constants.js";
import ApiResponse from "../../utils/ApiSuccess.js";

const logout = asyncHandler(async (req, res) => {
    console.log("decoded", req.decoded);
    const userId = req.decoded.userId;
    const jwtId = req.decoded.jwtId;

    try {
        const count = await UserModel.countDocuments({
            userId  
        });

        if (count === 0)
            throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, registerMessage.ERROR_USER_NOT_FOUND);

        await UserModel.findOneAndUpdate({
            userId
        }, {
            $inc: {
                loginCount: -1
            }
        });
        await Session.updateMany({
            jwtId,
            userId
        }, {
            $set: {
                enabled: false,
                terminated_at: (new Date()).getTime()
            }
        });
        await userFcmModel.findOneAndUpdate({
            enabled: true,
            userId
        }, {
            $set: {
                enabled: false
            }
        });

        return res.status(statusCodeObject.HTTP_STATUS_OK).json(
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

export default logout;