"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import UserModel  from "../../../model/users/user.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonMessage, registerMessage, statusCodeObject, errorAndSuccessCodeConfiguration
} from "../../../utils/constants.js";

import ApiResponse from "../../../utils/ApiSuccess.js";

import {
    getNewMongoSession
} from "../../../configuration/dbConnection.js";
const uploadDocument = asyncHandler (async (req, res) => {
    console.log("uploadDocument working", req.body);
    let session;

    try {
        session = await getNewMongoSession();
    
        session.startTransaction();
        const {
            firstName, lastName, aadhaarID, panID, profile, userId, address, city, stateCode, countryCode
        } = req.body;

        if (fieldValidator(firstName) || fieldValidator(lastName) || fieldValidator(aadhaarID) || fieldValidator(panID) || fieldValidator(profile)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.ERROR_FIELD_REQUIRED);
        
        const userSaveObj = {
            aadhaarID,
            address,
            city,
            countryCode,
            firstName,
            lastName,
            panID,
            profile,
            stateCode
        };
        
        const UserModelObj = new UserModel(userSaveObj);

        const resp = await UserModelObj.findOneAndUpdate({
            userId
        }, { 
            $set: userSaveObj
        }, {
            session: session
        });

        if (fieldValidator(resp))  throw new ApiError(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR, errorAndSuccessCodeConfiguration.HTTP_STATUS_INTERNAL_SERVER_ERROR, CommonMessage.SOMETHING_WENT_WRONG);

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

export default uploadDocument;