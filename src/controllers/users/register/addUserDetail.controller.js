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
import createJwtToken from "../../../utils/createJwtToken.js";

const addUserDetail = asyncHandler (async (req, res) => {
    console.log("addUserDetail working", req.body);
    let session;

    try {
        session = await getNewMongoSession();
    
        session.startTransaction();
        const {
            firstName, lastName, userId, address, city, stateCode, countryCode, profile
        } = req.body;
        const platform = req.headers.platform;
        const ip = req.headers.ip;

        if (fieldValidator(firstName) || fieldValidator(lastName) || fieldValidator(stateCode) || fieldValidator(countryCode) || fieldValidator(city) || fieldValidator(address) || fieldValidator(userId)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.ERROR_FIELD_REQUIRED);
        
        const userSaveObj = {
            address,
            city,
            countryCode,
            firstName,
            isDocumentUploaded: true,
            lastName,
            profile,
            stateCode
        };

        const resp = await UserModel.findOneAndUpdate({
            userId
        }, { 
            $set: userSaveObj
        }, {
            session: session
        });

        if (fieldValidator(resp))  throw new ApiError(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR, errorAndSuccessCodeConfiguration.HTTP_STATUS_INTERNAL_SERVER_ERROR, CommonMessage.SOMETHING_WENT_WRONG);

        const tokenObj = {  
            ip,     
            phoneNumber: resp.phoneNumber,
            userId: resp.userId,
            userIdF_k: resp._id,
            userRole: resp.roles
        };

        console.log("tokenObj", tokenObj);
        const token =  await createJwtToken(tokenObj, req.originalUrl, platform);

        await session.commitTransaction();
        await session.endSession();

        return res.status(201).json(
            new ApiResponse(statusCodeObject.HTTP_STATUS_OK, errorAndSuccessCodeConfiguration.HTTP_STATUS_OK, {
                token,
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

export default addUserDetail;