"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import UserPickAddress  from "../../../model/users/userPickAddress.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonMessage, statusCodeObject, errorAndSuccessCodeConfiguration, ScrapMessage
} from "../../../utils/constants.js";

import ApiResponse from "../../../utils/ApiSuccess.js";
import ShortUniqueId from "short-unique-id";
const uid = new ShortUniqueId();
const uniqueId = uid.rnd(6);

import {
    getNewMongoSession
} from "../../../configuration/dbConnection.js";
const addPickUpAddress = asyncHandler (async (req, res) => {
    console.log("UserPickAddress working", req.body);
    let  session;
    const currentTime = new Date().getTime();

    try {
        session = await getNewMongoSession();
    
        session.startTransaction();
        const userId = req.decoded.userId;
        const {
            fullName, scrapId, stateCode, countryCode, pincode, dialCode, phoneNumber, address, city
        } = req.body;

        if (fieldValidator(fullName) || fieldValidator(scrapId) || fieldValidator(pincode) || fieldValidator(dialCode) || fieldValidator(phoneNumber) || fieldValidator(city)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.ERROR_FIELD_REQUIRED);
        
        const scrap = await UserPickAddress.findOne({
            $or: [
                {
                    addressId: uniqueId
                },
                {
                    address
                }
            ]
        });

        if (!fieldValidator(scrap)) 
            throw new ApiError(statusCodeObject.HTTP_STATUS_CONFLICT, errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT, ScrapMessage.SCRAP_ALREADY_EXIST);

        const scrapSaveObj = {
            address,
            addressId: uniqueId,
            city,
            countryCode,
            currentTime,
            dialCode,
            fullName,
            phoneNumber,
            pincode: parseInt(pincode),
            scrapId,
            stateCode,
            userId
        };
        
        const ScrapModelObj = new UserPickAddress(scrapSaveObj);

        const resp = await ScrapModelObj.save({
            session
        });

        if (fieldValidator(resp))  throw new ApiError(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR, errorAndSuccessCodeConfiguration.HTTP_STATUS_INTERNAL_SERVER_ERROR, CommonMessage.SOMETHING_WENT_WRONG);

        await session.commitTransaction();
        await session.endSession();

        return res.status(201).json(
            new ApiResponse(statusCodeObject.HTTP_STATUS_OK, errorAndSuccessCodeConfiguration.HTTP_STATUS_OK, {}, ScrapMessage.SCRAP_SUCCESSFULLY_SAVED)
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

export default addPickUpAddress;