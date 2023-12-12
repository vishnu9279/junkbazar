"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import userScrapModel  from "../../../model/users/userScrapModel.model.js";
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

const getUserScrap = asyncHandler(async (req, res) => {
    console.log("getUserScrap working");

    try {
        const userId = req.decoded.userId;
        let limit = req.query.limit;
        let page = req.query.page;

        if (fieldValidator(limit) || isNaN(page)) limit = 10;

        if (fieldValidator(page) || isNaN(page)) page = page || 0;

        const skip = page * limit;
        const scraps = await userScrapModel.find({
            enabled: true,
            userId
        }).populate("scrapIdF_K")
            .skip(skip)
            .limit(limit);

        if (fieldValidator(scraps)) {
            throw new ApiError(
                statusCodeObject.HTTP_STATUS_CONFLICT,
                errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT,
                ScrapMessage.SCRAP_NOT_FOUND
            );
        }

        for (let index = 0; index < scraps.length; index++){
            const url = await generateS3SignedUrl(scraps[index].scrapIdF_K.docPath);
    
            scraps[index].docUrl = url;
        }

        const totalScrapCount = await userScrapModel.countDocuments({
            userId
        });

        const finalObj = {
            scraps: scraps,
            totalScrapCount
        };

        return res.status(statusCodeObject.HTTP_STATUS_OK).json(
            new ApiResponse(
                statusCodeObject.HTTP_STATUS_OK,
                errorAndSuccessCodeConfiguration.HTTP_STATUS_OK,
                finalObj,
                CommonMessage.DETAIL_FETCHED_SUCCESSFULLY
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
            console.error("Error in getUserScrap:", error);

            return res.status(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
                error: CommonMessage.SOMETHING_WENT_WRONG
            });
        }
    }
});

export default getUserScrap;
