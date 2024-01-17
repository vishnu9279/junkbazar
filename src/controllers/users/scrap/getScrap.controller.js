"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import Scrap from "../../../model/users/scrap.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonMessage,
    statusCodeObject,
    errorAndSuccessCodeConfiguration,
    ScrapMessage
} from "../../../utils/constants.js";

import ApiResponse from "../../../utils/ApiSuccess.js";
import generateS3SignedUrl from "../../../services/generateS3SignedUrl.js";

const getScrap = asyncHandler(async (req, res) => {
    console.log("getScrap working");

    try {
        let limit = req.query.limit;
        let page = req.query.page;
        const scrapName = req.query.scrapName;

        if (fieldValidator(limit) || isNaN(page)) limit = 10;

        if (fieldValidator(page) || isNaN(page)) page = page || 0;

        const skip = page * limit;
        const filterObj = {
            enabled: true
        };

        if (!fieldValidator(scrapName))
            filterObj.scrapName = new RegExp(scrapName, "i");

        const scraps = await Scrap.find(filterObj).sort({
            createdAt: -1
        })
            .skip(skip)
            .limit(limit);

        for (let index = 0; index < scraps.length; index++){
            const url = await generateS3SignedUrl(scraps[index].docPath);

            scraps[index].docUrl = url;
        }

        const totalScrapCount = await Scrap.countDocuments({
            filterObj
        });

        const finalObj = {
            scraps: scraps,
            totalScrapCount
        };

        // if (fieldValidator(scraps)) {
        //     throw new ApiError(
        //         statusCodeObject.HTTP_STATUS_CONFLICT,
        //         errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT,
        //         ScrapMessage.SCRAP_ALREADY_EXIST
        //     );
        // }

        return res.status(statusCodeObject.HTTP_STATUS_OK).json(
            new ApiResponse(
                statusCodeObject.HTTP_STATUS_OK,
                errorAndSuccessCodeConfiguration.HTTP_STATUS_OK,
                finalObj,
                ScrapMessage.SCRAP_SUCCESSFULLY_SAVED
            )
        );
    }
    catch (error) {
        console.error("Error on getting scrap", error.message);

        if (error instanceof ApiError) {
            console.log("Api Error instance");

            // Handle ApiError instances with dynamic status code and message
            return res.status(error.statusCode).json({
                error: error || CommonMessage.SOMETHING_WENT_WRONG
            });
        }
        else {
            // Handle other types of errors
            console.error("Error in getScrap:", error);

            return res.status(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
                error: CommonMessage.SOMETHING_WENT_WRONG
            });
        }
    }
});

export default getScrap;
