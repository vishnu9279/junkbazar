"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import UserModel  from "../../../model/users/user.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonMessage, 
    // registerMessage, 
    statusCodeObject, errorAndSuccessCodeConfiguration, loginMessage
} from "../../../utils/constants.js";

import helper from "../../../utils/helper.js";
import ApiResponse from "../../../utils/ApiSuccess.js";
import {
    getNewMongoSession
} from "../../../configuration/dbConnection.js";
import sendSms from "../../../services/sendSms.js";
import logOutFirstUser from "../../../utils/logOutFirstUser.js";

// import RolesEnum from "../../../utils/roles.js";
import ShortUniqueId from "short-unique-id";
const uid = new ShortUniqueId();

const login = asyncHandler (async (req, res) => {
    console.log("login working", req.body);
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

        // if (fieldValidator(user)) 
        //     throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, registerMessage.ERROR_USER_NOT_FOUND);
        if (user && user.accountBlocked) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, loginMessage.ACCOUNT_BLOCKED);
    
        if (!helper.phoneNumberValidation(phoneNumber)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.INVALID_PHONE_NUMBER);

        // if (user.loginCount >= await helper.getCacheElement("CONFIG", "LOGIN_COUNT")) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.LOGIN_COUNT_EXCEEDED);
        if (user && user.loginCount >= await helper.getCacheElement("CONFIG", "LOGIN_COUNT")) await logOutFirstUser(user.userId, session);

        const fixOtpUsers = await helper.getCacheElement("CONFIG", "FIXED_OTP_USERS");

        if (fixOtpUsers.includes(phoneNumber))
            OTP = await helper.getCacheElement("CONFIG", "FIX_OTP");
        else 
            OTP = helper.getRandomOTP(100000, 999999);

        const userSaveObj = {
            OTP,
            otpGenerateTime: currentTime
           
        };

        if (fieldValidator(user)){
            userSaveObj.dayNumber = await  helper.getDayNumber();
            userSaveObj.dialCode = dialCode;
            userSaveObj.monthNumber = await helper.getMonthNumber();
            userSaveObj.phoneNumber = phoneNumber;
            userSaveObj.userId = uniqueId,
            userSaveObj.weekNumber = await helper.getWeekNumber();
        }

        const resp = await UserModel.findOneAndUpdate({
            phoneNumber
            // roles: RolesEnum.USER
        }, {
            $set: userSaveObj
        }, {
            new: true,
            session,
            upsert: true
        });

        if (fieldValidator(resp))  throw new ApiError(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR, errorAndSuccessCodeConfiguration.HTTP_STATUS_INTERNAL_SERVER_ERROR, CommonMessage.SOMETHING_WENT_WRONG);

        if (!fixOtpUsers.includes(phoneNumber))
            await sendSms(phoneNumber, OTP);

        await session.commitTransaction();

        return res.status(201).json(
            new ApiResponse(statusCodeObject.HTTP_STATUS_OK, errorAndSuccessCodeConfiguration.HTTP_STATUS_OK, {
                isDocumentUploaded: resp.isDocumentUploaded,
                userId: resp.userId
            }, loginMessage.LOGIN_OTP_SENT_SUCCESSFULLY)
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

export default login;