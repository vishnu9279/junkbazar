"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import addToCartSchema  from "../../../model/users/userScrapModel.model.js";
// import Scrap from "../../../model/users/scrap.model.js";
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

const getAddToCart = asyncHandler(async (req, res) => {
    console.log("getAddToCart working");

    try {
        const userId = req.decoded.userId;
        let limit = req.query.limit;
        let page = req.query.page;

        if (fieldValidator(limit) || isNaN(page)) limit = 10;

        if (fieldValidator(page) || isNaN(page)) page = page || 0;

        const skip = page * limit;

        const addToCarpScraps = await addToCartSchema.aggregate([
            {
                $match: {
                    enabled: true,
                    userId
                }
            },
            {
                $lookup: {
                    as: "scrapInfo",
                    foreignField: "scrapId",
                    from: "scraps",
                    localField: "scrapId"
                }
            },
            {
                $unwind: "$scrapInfo"
            },
            {
                $sort: {
                    createdAt: -1  // Sort in descending order based on createdAt field
                }
            },
            {
                $skip: parseInt(skip)  // Add the skip stage
            },
            {
                $limit: parseInt(limit)  // Add the limit stage
            }
        ]);

        // const scraps = await addToCartSchema.find({
        //     enabled: true,
        //     userIdF_k
        // }).populate("scrapIdF_K")
        //     .skip(skip)
        //     .limit(limit);

        for (let index = 0; index < addToCarpScraps.length; index++){
            const url = await generateS3SignedUrl(addToCarpScraps[index].scrapInfo.docPath);

            addToCarpScraps[index].docUrl = url;
        }

        const totalScrapCount = await addToCartSchema.countDocuments({
            userId
        });

        const finalObj = {
            cartLists: addToCarpScraps,
            totalScrapCount
        };

        // console.log("finalObj", finalObj);

        if (fieldValidator(addToCarpScraps)) {
            throw new ApiError(
                statusCodeObject.HTTP_STATUS_CONFLICT,
                errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT,
                ScrapMessage.SCRAP_ALREADY_EXIST
            );
        }

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
            console.error("Error in getAddToCart:", error);

            return res.status(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
                error: CommonMessage.SOMETHING_WENT_WRONG
            });
        }
    }
});

export default getAddToCart;
