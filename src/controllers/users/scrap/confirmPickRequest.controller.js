"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import UserPickAddress  from "../../../model/users/userPickAddress.model.js";
import Scrap  from "../../../model/users/scrap.model.js";
import ScrapOrder from "../../../model/users/scrapOrder.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonMessage, statusCodeObject, errorAndSuccessCodeConfiguration, ScrapMessage
} from "../../../utils/constants.js";

import ApiResponse from "../../../utils/ApiSuccess.js";
import helper from "../../../utils/helper.js";

import {
    getNewMongoSession
} from "../../../configuration/dbConnection.js";
const confirmPickRequest = asyncHandler (async (req, res) => {
    console.log("confirmPickRequest working", req.body);
    let  session;
    const currentTime = new Date().getTime();

    try {
        session = await getNewMongoSession();
    
        session.startTransaction();
        const userId = req.decoded.userId;
        const {
            scrapIds, addressId
        } = req.body;

        if (fieldValidator(scrapIds) || fieldValidator(addressId)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.ERROR_FIELD_REQUIRED);
        
        const pickAddress = await UserPickAddress.findOne({
            addressId
        });

        if (!fieldValidator(pickAddress)) 
            throw new ApiError(statusCodeObject.HTTP_STATUS_CONFLICT, errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT, ScrapMessage.SCRAP_ALREADY_EXIST);

        const scrap = await Scrap.find({
            scrapId: {
                $in: scrapIds
            }
        });
    
        if (!fieldValidator(scrap)) 
            throw new ApiError(statusCodeObject.HTTP_STATUS_CONFLICT, errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT, ScrapMessage.SCRAP_ALREADY_EXIST);

        const scrapOrderSaveObj = {
            addressId,
            currentTime,
            dayNumber: helper.getDayNumber(),
            monthNumber: helper.getMonthNumber(),
            // scrapId,
            userId,
            weekNumber: helper.getWeekNumber()
        };
        const arr = [];

        for (const scrapId of scrapIds){
            scrapOrderSaveObj.scrapId = scrapId;
            arr.push(scrapOrderSaveObj);
        }

        const resp = await ScrapOrder.insertMany(scrapOrderSaveObj, session);

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

export default confirmPickRequest;