"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import UserModel  from "../../../model/user.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonMessage, registerMessage, statusCodeObject, errorAndSuccessCodeConfiguration, otpVerifyMessage
} from "../../../utils/constants.js";

import helper from "../../../utils/helper.js";
import ApiResponse from "../../../utils/ApiSuccess.js";
import sendSms from "../../../3rdPartyServices/sendSms.js";
import ShortUniqueId from "short-unique-id";
const uid = new ShortUniqueId();
const uniqueId = uid.rnd(6);

import {
    getNewMongoSession
} from "../../../configuration/dbConnection.js";
const register = asyncHandler (async (req, res) => {
    console.log("register working", req.body);
    let OTP, session;
    const currentTime = new Date().getTime();

    try {
        session = await getNewMongoSession();
    
        session.startTransaction();
        const {
            dialCode, phoneNumber, otp
        } = req.body;

        if (fieldValidator(dialCode) || fieldValidator(phoneNumber)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.ERROR_FIELD_REQUIRED);

        const user = await UserModel.findOne({
            $or: [
                {
                    userId: uniqueId
                },
                {
                    phoneNumber
                }
            ]
        });

        if (!fieldValidator(user)) 
            throw new ApiError(statusCodeObject.HTTP_STATUS_CONFLICT, errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT, registerMessage.ERROR_USER_ALREADY_EXIST);
    
        const fixOtpUsers = helper.getCacheElement("CONFIG", "FIXED_OTP_USERS");

        if (fixOtpUsers.includes(phoneNumber))
            OTP = helper.getCacheElement("CONFIG", "FIXED_OTP");

        OTP = helper.getRandomOTP(100000, 999999);
        const userSaveObj = {
            dialCode,
            OTP,
            otpGenerateTime: currentTime,
            phoneNumber,
            userId: uniqueId
        };

        if (!fieldValidator(otp)){
            if (!user.OTP)
                throw new ApiError(statusCodeObject.HTTP_STATUS_GONE, errorAndSuccessCodeConfiguration.HTTP_STATUS_GONE, otpVerifyMessage.NO_LOGIN_REQUEST_INITATION);

            if (parseInt(otp) !== parseInt(user.OTP))
                throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, otpVerifyMessage.OTP_MISMATCH);

            console.log("otp genrate Time", currentTime - user.otpGenerateTime);

            if (currentTime - user.otpGenerateTime > helper.getCacheElement("CONFIG", "OTP_EXPIRATION_TIME"))
                throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, otpVerifyMessage.OTP_EXPIRE);

            userSaveObj.verified = true;
        }
        
        const UserModelObj = new UserModel(userSaveObj);

        const resp = await UserModelObj.save({
            session
        });

        if (fieldValidator(resp))  throw new ApiError(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR, errorAndSuccessCodeConfiguration.HTTP_STATUS_INTERNAL_SERVER_ERROR, CommonMessage.SOMETHING_WENT_WRONG);

        await sendSms(phoneNumber, OTP);
        await session.commitTransaction();
        await session.endSession();

        return res.status(201).json(
            new ApiResponse(statusCodeObject.HTTP_STATUS_OK, errorAndSuccessCodeConfiguration.HTTP_STATUS_OK, {}, registerMessage.SUCCESSFULLY_SAVED)
        );
    }
    catch (error) {
        console.error("Error while Creating User", error.message);
        await session.abortTransaction();
        await session.endSession();

        if (error instanceof ApiError) {
            console.log("Api Error instance");

            // Handle ApiError instances with dynamic status code and message
            return res.status(error.statusCode).json({
                error: error || CommonMessage.SOMETHING_WENT_WRONG
            });
        }
        else {
            // Handle other types of errors
            console.error("Error in registerUser:", error);

            return res.status(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
                error: CommonMessage.SOMETHING_WENT_WRONG 
            });
        }
    }
});

export default register;