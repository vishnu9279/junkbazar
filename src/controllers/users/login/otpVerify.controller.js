"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import UserModel  from "../../../model/users/user.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonMessage, registerMessage, statusCodeObject, errorAndSuccessCodeConfiguration, otpVerifyMessage
} from "../../../utils/constants.js";

import helper from "../../../utils/helper.js";
import ApiResponse from "../../../utils/ApiSuccess.js";
import {
    getNewMongoSession
} from "../../../configuration/dbConnection.js";
import createJwtToken from "../../../utils/createJwtToken.js";

const otpVerify = asyncHandler (async (req, res) => {
    console.log("otpVerify working", req.body);
   
    let session;
    const currentTime = new Date().getTime();

    try {
        session = await getNewMongoSession();
    
        session.startTransaction();
        const {
            phoneNumber, otp
        } = req.body;
        const platform = req.headers.platform;

        if (fieldValidator(otp) || fieldValidator(phoneNumber) || fieldValidator(platform)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.ERROR_FIELD_REQUIRED);

        if (!helper.phoneNumberValidation(phoneNumber)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.PLEASE_ENTER_VALID_PHONE_NUMBER);

        const user = await UserModel.findOne({
            phoneNumber
        });

        if (fieldValidator(user)) 
            throw new ApiError(statusCodeObject.HTTP_STATUS_NO_CONTENT, errorAndSuccessCodeConfiguration.HTTP_STATUS_NO_CONTENT, registerMessage.ERROR_USER_NOT_FOUND);
        
        if (!user.OTP)
            throw new ApiError(statusCodeObject.HTTP_STATUS_GONE, errorAndSuccessCodeConfiguration.HTTP_STATUS_GONE, otpVerifyMessage.NO_LOGIN_REQUEST_INITATION);

        if (parseInt(otp) !== parseInt(user.OTP))
            throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, otpVerifyMessage.OTP_MISMATCH);

        console.log("otp genrate Time", currentTime - user.otpGenerateTime);

        if (currentTime - user.otpGenerateTime > helper.getCacheElement("CONFIG", "OTP_EXPIRATION_TIME"))
            throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, otpVerifyMessage.OTP_EXPIRE);

        const userOtpObj = {
            OTP: "",
            otpVerifyTime: currentTime
        };

        if (!user.verified) userOtpObj.verified = true;

        const resp = await UserModel.findOneAndUpdate({
            phoneNumber
        }, {
            $set: userOtpObj
        }, {
            new: true,
            session: session
        });

        if (fieldValidator(resp))  throw new ApiError(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR, errorAndSuccessCodeConfiguration.HTTP_STATUS_INTERNAL_SERVER_ERROR, CommonMessage.SOMETHING_WENT_WRONG);

        const tokenObj = {       
            phoneNumber,
            userId: user.userId,
            userIdF_k: user._id,
            userRole: user.roles
        };

        const token =  await createJwtToken(tokenObj, req.originalUrl, platform);

        await session.commitTransaction();

        return res.status(201).json(
            new ApiResponse(statusCodeObject.HTTP_STATUS_OK, errorAndSuccessCodeConfiguration.HTTP_STATUS_OK, {
                token
            }, otpVerifyMessage.USER_LOGGED_IN)
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
    finally {
        // End the session
        await session.endSession();
    }
});

export default otpVerify;