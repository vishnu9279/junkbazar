"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import Scrap  from "../../../model/users/scrap.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonMessage, statusCodeObject, errorAndSuccessCodeConfiguration, ScrapMessage
} from "../../../utils/constants.js";

import ApiResponse from "../../../utils/ApiSuccess.js";

const getScrap = asyncHandler (async (req, res) => {
    console.log("getScrap working");

    try {
        const userId = req.decoded.userId;
        let limit = req.query.limit;
        let page = req.query.page;

        if (fieldValidator(limit) || isNaN(page))
            limit = 10; 

        if (fieldValidator(page) || isNaN(page))
            page = page || 0;
 
        const skip = page * limit;
        const scrap = await Scrap.find({
            userId
        }) 
            .skip(skip)
            .limit(limit);

        const totalScrapCount = await Scrap.countDocuments({
            userId 
        });

        const finalObj = {
            scrap,
            totalScrapCount
        };
  
        // scrap.totalScrapCount = totalScrapCount;

        if (fieldValidator(scrap)) 
            throw new ApiError(statusCodeObject.HTTP_STATUS_CONFLICT, errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT, ScrapMessage.SCRAP_ALREADY_EXIST);

        return res.status(201).json(
            new ApiResponse(statusCodeObject.HTTP_STATUS_OK, errorAndSuccessCodeConfiguration.HTTP_STATUS_OK, finalObj, ScrapMessage.SCRAP_SUCCESSFULLY_SAVED)
        );
    }
    catch (error) {
        console.error("Error while Creating User", error.message);

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

export default getScrap;