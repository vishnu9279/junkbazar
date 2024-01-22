"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import Scrap  from "../../../model/users/scrap.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonMessage, statusCodeObject, errorAndSuccessCodeConfiguration, ScrapMessage
} from "../../../utils/constants.js";

import ApiResponse from "../../../utils/ApiSuccess.js";

import {
    getNewMongoSession
} from "../../../configuration/dbConnection.js";

const editScrap = asyncHandler (async (req, res) => {
    console.log("editScrap working", req.body);
    let  session;

    try {
        session = await getNewMongoSession();
    
        session.startTransaction();
        let scrapName = req.body.scrapName;
        const {
            price, quantityType, imageKey, scrapId
        } = req.body;

        if (fieldValidator(scrapName) || fieldValidator(price) || fieldValidator(quantityType)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.ERROR_FIELD_REQUIRED);
        
        scrapName = scrapName.toLowerCase();
        const scrap = await Scrap.find({
            scrapId
        }).lean();

        console.log("scrap", scrap);

        if (fieldValidator(scrap)) 
            throw new ApiError(statusCodeObject.HTTP_STATUS_CONFLICT, errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT, ScrapMessage.SCRAP_NOT_FOUND);

        const obj = {};

        if (fieldValidator(imageKey))
            obj.docPath = imageKey;

        if (fieldValidator(price))
            obj.price = parseFloat(price);

        if (fieldValidator(quantityType))
            obj.quantityType = quantityType;

        if (fieldValidator(scrapName))
            obj.scrapName = scrapName;

        const resp = await Scrap.findOneAndDelete({
            scrapId
        }, {
            $set: obj
        }, {
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

export default editScrap;