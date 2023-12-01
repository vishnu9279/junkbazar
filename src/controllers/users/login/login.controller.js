import asyncHandler from "../../../utils/asyncHandler.js";
import UserModel  from "../../../model/user.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonErrorMessage, registerErrorMessage, statusCodeObject, errorAndSuccessCodeConfiguration 
} from "../../../utils/constants.js";

import helper from "../../../utils/helper.js";
import ApiResponse from "../../../utils/ApiSuccess.js";
import {
    getNewMongoSession
} from "../../../configuration/dbConnection.js";
import sendSms from "../../../sendSms/sendSms.js";

const login = asyncHandler (async (req, res) => {
    console.log("login working", req.body);
    let OTP, session;
   
    const currentTime = new Date().getTime();
    
    try {
        session = await getNewMongoSession();
    
        session.startTransaction();
        const {
            dialCode, phoneNumber
        } = req.body;

        if (fieldValidator(dialCode) || fieldValidator(phoneNumber)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonErrorMessage.ERROR_FIELD_REQUIRED);

        const user = await UserModel.findOne({
            phoneNumber
        });

        if (fieldValidator(user)) 
            throw new ApiError(statusCodeObject.HTTP_STATUS_NO_CONTENT, errorAndSuccessCodeConfiguration.HTTP_STATUS_NO_CONTENT, registerErrorMessage.ERROR_USER_NOT_FOUND);
    
        const fixOtpUsers = helper.getCacheElement("CONFIG", "FIXED_OTP_USERS");

        if (fixOtpUsers.includes(phoneNumber))
            OTP = helper.getCacheElement("CONFIG", "FIX_OTP");
        else 
            OTP = helper.getRandomOTP(100000, 999999);

        const resp = await UserModel.findOneAndUpdate({
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

        if (fieldValidator(resp))  throw new ApiError(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR, errorAndSuccessCodeConfiguration.HTTP_STATUS_INTERNAL_SERVER_ERROR, CommonErrorMessage.SOMETHING_WENT_WRONG);

        await sendSms(phoneNumber, OTP);
        await session.commitTransaction();

        return res.status(201).json(
            new ApiResponse(statusCodeObject.HTTP_STATUS_OK, errorAndSuccessCodeConfiguration.HTTP_STATUS_OK, {}, registerErrorMessage.SUCCESSFULLY_SAVED)
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
                error: error || CommonErrorMessage.SOMETHING_WENT_WRONG
            });
        }
        else {
            // Handle other types of errors
            console.error("Error in loginUser:", error);

            return res.status(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
                error: CommonErrorMessage.SOMETHING_WENT_WRONG 
            });
        }
    }
    finally {
        // End the session
        await session.endSession();
    }
});

export default login;