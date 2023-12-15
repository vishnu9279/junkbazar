"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import UserModel  from "../../../model/users/user.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import RolesEnum  from "../../../utils/roles.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonMessage, registerMessage, statusCodeObject, errorAndSuccessCodeConfiguration
} from "../../../utils/constants.js";

import helper from "../../../utils/helper.js";
import ApiResponse from "../../../utils/ApiSuccess.js";
import sendSms from "../../../services/sendSms.js";
import ShortUniqueId from "short-unique-id";
const uid = new ShortUniqueId();

import {
    getNewMongoSession
} from "../../../configuration/dbConnection.js";
const register = asyncHandler (async (req, res) => {
    console.log("register working", req.body);
    let OTP, session;
    const currentTime = new Date().getTime();
    const uniqueId = uid.rnd(6);

    try {
        session = await getNewMongoSession();
    
        session.startTransaction();
        const {
            dialCode, phoneNumber
        } = req.body;

        if (fieldValidator(dialCode) || fieldValidator(phoneNumber)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.ERROR_FIELD_REQUIRED);

        if (!helper.phoneNumberValidation(phoneNumber)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.PLEASE_ENTER_VALID_PHONE_NUMBER);

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

        console.log("user", user);

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
            roles: RolesEnum.VENDOR,
            userId: uniqueId
        };
        
        const UserModelObj = new UserModel(userSaveObj);

        const resp = await UserModelObj.save({
            session
        });

        if (fieldValidator(resp))  throw new ApiError(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR, errorAndSuccessCodeConfiguration.HTTP_STATUS_INTERNAL_SERVER_ERROR, CommonMessage.SOMETHING_WENT_WRONG);

        if (!fixOtpUsers.includes(phoneNumber))
            await sendSms(phoneNumber, OTP);

        await session.commitTransaction();
        await session.endSession();

        return res.status(201).json(
            new ApiResponse(statusCodeObject.HTTP_STATUS_OK, errorAndSuccessCodeConfiguration.HTTP_STATUS_OK, {
                userId: userSaveObj.userId
            }, registerMessage.SUCCESSFULLY_SAVED)
        );
    }
    catch (error) {
        console.error("Error while Creating UserModel", error.message);
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