"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import UserPickAddress  from "../../../model/users/userOrder.model.js";

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
    console.log("Admin getUserScrap working", req.query);

    try {
        let limit = req.query.limit;
        let page = req.query.page;

        const scrapName = req.query.scrapName;
        const orderStatus = req.query.orderStatus;
        const filterValue = req.query.filterValue;
        const userId = req.query.userId;
        
        if (fieldValidator(userId)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.ERROR_FIELD_REQUIRED);

        if (fieldValidator(limit) || isNaN(page)) limit = 10;

        if (fieldValidator(page) || isNaN(page)) page = page || 0;

        const skip = page * limit;
        const filterObj = {
            userId
        };
        
        const scrapFilterObj = {};

        if (!fieldValidator(filterValue)){
            filterObj.$or = [
                {
                    fullName: new RegExp(filterValue, "i")
                },
                {
                    phoneNumber: new RegExp(filterValue, "i")
                },
                {
                    city: new RegExp(filterValue, "i")
                },
                {
                    stateCode: new RegExp(filterValue, "i")
                }
            ];
        }

        if (!fieldValidator(orderStatus))
            filterObj.orderStatus = new RegExp(orderStatus, "i");

        if (!fieldValidator(scrapName))
            scrapFilterObj.scrapName = new RegExp(scrapName, "i");

        console.log("filterObj", filterObj);
        const orders = await UserPickAddress.aggregate([
            {
                $match: filterObj
            },
            {
                $lookup: {
                    as: "scrapInfo",
                    foreignField: "scrapId",
                    from: "scraps",
                    localField: "scrapId",
                    pipeline: [{
                        $match: scrapFilterObj
                    }]
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

        if (!fieldValidator(orders)) {
            for (let index = 0; index < orders.length; index++){
                const url = await generateS3SignedUrl(orders[index].scrapInfo.docPath);

                orders[index].scrapInfo.docUrl = url;
            }
        }

        const ordersWithCount = await UserPickAddress.aggregate([
            {
                $match: filterObj
            },
            {
                $lookup: {
                    as: "scrapInfo",
                    foreignField: "scrapId",
                    from: "scraps",
                    localField: "scrapId",
                    pipeline: [
                        {
                            $match: scrapFilterObj
                        }
                        // Add more pipeline stages if needed
                    ]
                }
            },
            {
                $unwind: "$scrapInfo"
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: 1 
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    total: 1
                }
            }
        ]);

        const finalObj = {
            orders,
            totalCount: ordersWithCount.length > 0 ? ordersWithCount[0].total : 0
        };

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
            console.error("Error in getUserScrap:", error);

            return res.status(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
                error: CommonMessage.SOMETHING_WENT_WRONG
            });
        }
    }
});

export default getUserScrap;
