"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import AdminModel  from "../../../model/admin/admin.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ApiError from "../../../utils/ApiError.js";
import {
    basicConfigurationObject, CommonMessage, registerMessage, statusCodeObject, errorAndSuccessCodeConfiguration, loginMessage
} from "../../../utils/constants.js";

import helper from "../../../utils/helper.js";
import ApiResponse from "../../../utils/ApiSuccess.js";
import {
    getNewMongoSession
} from "../../../configuration/dbConnection.js";
import CryptoJS  from "crypto-js";

const login = asyncHandler (async (req, res) => {
    console.log("login working", req.body);
    let OTP, session;
   
    const currentTime = new Date().getTime();
    
    try {
        session = await getNewMongoSession();
    
        session.startTransaction();
        const {
            dialCode, phoneNumber, password
        } = req.body;

        if (fieldValidator(dialCode) || fieldValidator(phoneNumber) || fieldValidator(password)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.ERROR_FIELD_REQUIRED);

        if (!helper.phoneNumberValidation(phoneNumber)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.PLEASE_ENTER_VALID_PHONE_NUMBER);

        const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})");

        if (!strongRegex.test(password)) throw new ApiError(statusCodeObject.HTTP_UNPROCESSABLE_ENTITY, errorAndSuccessCodeConfiguration.HTTP_UNPROCESSABLE_ENTITY, registerMessage.ERROR_PASSWORD_VALIDATION);

        const user = await AdminModel.findOne({
            phoneNumber
        });

        if (fieldValidator(user)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, registerMessage.ERROR_USER_NOT_FOUND);
    
        if (!helper.phoneNumberValidation(phoneNumber)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.INVALID_PHONE_NUMBER);

        const passwordHashed = CryptoJS.HmacSHA256(password + user.salt, basicConfigurationObject.PASSWORD_SECRET_KEY).toString();

        console.log("passwordHashed", passwordHashed);

        if (passwordHashed !== user.password) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, loginMessage.EITHER_PHONE_NUMBER_OR_PASSWORD_WRONG);

        const fixOtpUsers = await helper.getCacheElement("CONFIG", "FIXED_OTP_USERS");

        if (fixOtpUsers.includes(phoneNumber))
            OTP = await helper.getCacheElement("CONFIG", "FIX_OTP");
        else 
            OTP = helper.getRandomOTP(100000, 999999);

        console.log({
            OTP
        });
        const resp = await AdminModel.findOneAndUpdate({
            phoneNumber
        }, {
            $set: {
                OTP: parseInt(OTP),
                otpGenerateTime: currentTime
            }
        }, {
            new: true,
            session
        });

        if (fieldValidator(resp))  throw new ApiError(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR, errorAndSuccessCodeConfiguration.HTTP_STATUS_INTERNAL_SERVER_ERROR, CommonMessage.SOMETHING_WENT_WRONG);

        await session.commitTransaction();

        return res.status(201).json(
            new ApiResponse(statusCodeObject.HTTP_STATUS_OK, errorAndSuccessCodeConfiguration.HTTP_STATUS_OK, {}, loginMessage.LOGIN_OTP_SENT_SUCCESSFULLY)
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