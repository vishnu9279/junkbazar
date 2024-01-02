"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import cartModel  from "../../../model/users/cart.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonMessage,
    statusCodeObject,
    errorAndSuccessCodeConfiguration
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

        const addToCarpScraps = await cartModel.aggregate([
            {
                $match: {
                    enabled: true,
                    userId
                }
            },
            {
                $unwind: "$items" // Unwind the items array
            },
            {
                $lookup: {
                    as: "items.scrapInfo",
                    foreignField: "scrapId",
                    from: "scraps",
                    localField: "items.scrapId"
                }
            },
            {
                $unwind: "$items.scrapInfo" // Unwind the scrapInfo array
            },
            {
                $group: {
                    _id: "$_id",
                    addToCartId: {
                        $first: "$addToCartId" 
                    },
                    createdAt: {
                        $first: "$createdAt" 
                    },
                    enabled: {
                        $first: "$enabled" 
                    },
                    items: {
                        $push: "$items" 
                    },
                    updatedAt: {
                        $first: "$updatedAt" 
                    },
                    userId: {
                        $first: "$userId" 
                    },
                    userIdF_k: {
                        $first: "$userIdF_k" 
                    } // Push the items back into an array
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $skip: parseInt(skip)
            },
            {
                $limit: parseInt(limit)
            }
        ]);        

        // console.log("addToCarpScraps", JSON.stringify(addToCarpScraps));
    
        for (let index = 0; index < addToCarpScraps[0].items.length; index++){
            // console.log("addToCarpScraps[index].scrapInfo", addToCarpScraps[0].items[index].scrapInfo);
            const url = await generateS3SignedUrl(addToCarpScraps[0].items[index].scrapInfo.docPath);

            addToCarpScraps[0].items[index].scrapInfo.docUrl = url;
        }

        const totalScrapCount = await cartModel.aggregate([
            {
                $match: {
                    userId
                }
            },
            {
                $unwind: "$items"
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: 1 
                    }
                }
            }
        ]);

        const finalObj = {
            cartLists: addToCarpScraps[0],
            totalScrapCount: totalScrapCount[0].total
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
            console.error("Error in getAddToCart:", error);

            return res.status(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
                error: CommonMessage.SOMETHING_WENT_WRONG
            });
        }
    }
});

export default getAddToCart;
