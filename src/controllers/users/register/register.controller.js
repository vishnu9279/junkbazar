import asyncHandler from "../../../utils/asyncHandler.js";
import UserModel  from "../../../model/user.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonErrorMessage, registerErrorMessage, statusCodeObject, errorAndSuccessCodeConfiguration 
} from "../../../utils/constants.js";

import helper from "../../../utils/helper.js";
import ApiResponse from "../../../utils/ApiSuccess.js";
import sendSms from "../../../sendSms/sendSms.js";
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
        const {
            dialCode, phoneNumber
        } = req.body;

        if (fieldValidator(dialCode) || fieldValidator(phoneNumber)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonErrorMessage.ERROR_FIELD_REQUIRED);

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
            throw new ApiError(statusCodeObject.HTTP_STATUS_CONFLICT, errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT, registerErrorMessage.ERROR_USER_ALREADY_EXIST);
    
        const fixOtpUsers = helper.getCacheElement("CONFIG", "FIXED_OTP_USERS");

        if (fixOtpUsers.includes(phoneNumber))
            OTP = helper.getCacheElement("CONFIG", "FIXED_OTP");

        OTP = helper.getRandomOTP(100000, 999999);
        session = await getNewMongoSession();
    
        session.startTransaction();
        const UserModelObj = new UserModel({
            dialCode,
            OTP,
            otpGenerateTime: currentTime,
            phoneNumber,
            userId: uniqueId
        });

        const resp = await UserModelObj.save({
            session
        });

        if (fieldValidator(resp))  throw new ApiError(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR, errorAndSuccessCodeConfiguration.HTTP_STATUS_INTERNAL_SERVER_ERROR, CommonErrorMessage.SOMETHING_WENT_WRONG);

        await sendSms(phoneNumber, OTP);
        await session.commitTransaction();
        await session.endSession();

        return res.status(201).json(
            new ApiResponse(statusCodeObject.HTTP_STATUS_OK, errorAndSuccessCodeConfiguration.HTTP_STATUS_OK, {}, registerErrorMessage.SUCCESSFULLY_SAVED)
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
                error: error || CommonErrorMessage.SOMETHING_WENT_WRONG
            });
        }
        else {
            // Handle other types of errors
            console.error("Error in registerUser:", error);

            return res.status(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
                error: CommonErrorMessage.SOMETHING_WENT_WRONG 
            });
        }
    }
});

export default register;