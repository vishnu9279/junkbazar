"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import userOrder  from "../../../model/users/userOrder.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonMessage,
    statusCodeObject,
    errorAndSuccessCodeConfiguration
} from "../../../utils/constants.js";

import ApiResponse from "../../../utils/ApiSuccess.js";
import generateS3SignedUrl from "../../../services/generateS3SignedUrl.js";

const getVendorOrder = asyncHandler(async (req, res) => {
    console.log("getVendorOrder working");

    try {
        const userId = req.decoded.userId;
        let limit = req.query.limit;
        let page = req.query.page;
        const vendorId = req.body.vendorId;

        if (fieldValidator(limit) || isNaN(page)) limit = 10;

        if (fieldValidator(page) || isNaN(page)) page = page || 0;
        
        const skip = page * limit;
       
        const orders = await userOrder.aggregate([
            {
                $match: {
                    vendorId
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
                    createdAt: -1  // Sort in descending order based on the createdAt field
                }
            },
            {
                $skip: parseInt(skip)  // Add the skip stage
            },
            {
                $limit: parseInt(limit)  // Add the limit stage
            }
        ]);

        for (let index = 0; index < orders.length; index++){
            const scrapUrl = await generateS3SignedUrl(orders[index].scrapInfo.docPath);

            console.log("orders[index].orderStatus", orders[index].orderStatus);

            orders[index].scrapInfo.docUrl = scrapUrl;
        }
            
        const totalScrapCount = await userOrder.countDocuments({
            vendorId: userId
        });
    
        const finalObj = {
            orders: orders,
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
            console.error("Error in getVendorOrder:", error);

            return res.status(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
                error: CommonMessage.SOMETHING_WENT_WRONG
            });
        }
    }
});

export default getVendorOrder;
