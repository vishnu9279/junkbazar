"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import UserPickAddress  from "../../../model/users/userPickAddress.model.js";
import userScrapModel  from "../../../model/users/userScrapModel.model.js";
import UserModel  from "../../../model/users/user.model.js";
import Scrap  from "../../../model/users/scrap.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonMessage, statusCodeObject, errorAndSuccessCodeConfiguration, ScrapMessage
} from "../../../utils/constants.js";
import helper from "../../../utils/helper.js";

import ApiResponse from "../../../utils/ApiSuccess.js";
import ShortUniqueId from "short-unique-id";
const uid = new ShortUniqueId();

import {
    getNewMongoSession
} from "../../../configuration/dbConnection.js";
const addPickUpAddress = asyncHandler (async (req, res) => {
    console.log("UserPickAddress working", req.body);
    let  session;
    const currentTime = new Date().getTime();
    const scrapArrayOfObject = [];

    try {
        session = await getNewMongoSession();
    
        session.startTransaction();
        const userId = req.decoded.userId;
        const userIdF_k = req.decoded.userIdF_k;
        const scrapIds = req.body.scrapIds;
        const {
            fullName, stateCode, countryCode, pincode, dialCode, phoneNumber, address, city
        } = req.body;
        
        if (fieldValidator(fullName) || fieldValidator(pincode) || fieldValidator(dialCode) || fieldValidator(phoneNumber) || fieldValidator(city) || fieldValidator(scrapIds) || fieldValidator(stateCode)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.ERROR_FIELD_REQUIRED);

        if (!helper.phoneNumberValidation(phoneNumber)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.PLEASE_ENTER_VALID_PHONE_NUMBER);

        scrapIds.split(",");
        const scraps = await Scrap.find({
            scrapId: {
                $in: scrapIds
            }
        });

        if (fieldValidator(scraps)) 
            throw new ApiError(statusCodeObject.HTTP_STATUS_CONFLICT, errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT, ScrapMessage.SCRAP_NOT_FOUND);

        for (const scrap of scraps){
            const scrapSaveObj = {
                address,
                city,
                countryCode,
                currentTime,
                dayNumber: helper.getDayNumber(),
                dialCode,
                fullName,
                monthNumber: helper.getMonthNumber(),
                orderId: uid.rnd(6),
                phoneNumber,
                pincode: parseInt(pincode),
                scrapId: scrap.scrapId,
                scrapIdF_K: scrap._id,
                stateCode,
                userId,
                userIdF_k,
                weekNumber: helper.getWeekNumber()
            };

            scrapArrayOfObject.push(scrapSaveObj);
        }
       
        const resp = await UserPickAddress.insertMany(scrapArrayOfObject, {
            session
        });

        if (fieldValidator(resp))  throw new ApiError(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR, errorAndSuccessCodeConfiguration.HTTP_STATUS_INTERNAL_SERVER_ERROR, CommonMessage.SOMETHING_WENT_WRONG);
        
        const respValue = await userScrapModel.updateMany({
            enabled: true,
            scrapId: {
                $in: scrapIds
            },
            userId
        }, {
            $set: {
                enabled: false
            }
        }, {
            session: session
        });

        if (fieldValidator(respValue)) 
            throw new ApiError(statusCodeObject.HTTP_STATUS_CONFLICT, errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT, ScrapMessage.SCRAP_ALREADY_EXIST);

        console.log("scrapIds", scrapIds, scrapIds.length);
        const userResp = await UserModel.updateOne({
            userId
        }, {
            $inc: {
                scrapSoldCount: scrapIds.length
            }
        }, {
            session: session
        });

        if (fieldValidator(userResp)) 
            throw new ApiError(statusCodeObject.HTTP_STATUS_CONFLICT, errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT, ScrapMessage.SCRAP_ALREADY_EXIST);

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