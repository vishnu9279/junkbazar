"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import UserOrderModel  from "../../../model/users/userOrder.model.js";
// import UserModel  from "../../../model/users/user.model.js";
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
import OrdersEnum from "../../../utils/orderStatus.js";

const getPendingOrdersAssignToAdmin = asyncHandler(async (req, res) => {
    console.log("getPendingOrdersAssignToAdmin working");

    try {
        let limit = req.query.limit;
        let page = req.query.page;
        const filterValue = req.query.filterValue;
        // const userId = req.decoded.userId;
        const scrapName = req.query.scrapName;
        const addressFilter = req.query.addressFilter;

        if (fieldValidator(limit) || isNaN(page)) limit = 10;

        if (fieldValidator(page) || isNaN(page)) page = page || 0;

        const skip = page * limit;
        const filterObj = {
            orderStatus: OrdersEnum.PENDING
        };
        const scrapFilterObj = {};
        const addressFilterObj = {};

        if (!fieldValidator(addressFilter)){
            addressFilterObj.$or = [
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

        if (!fieldValidator(filterValue)){
            filterObj.$or = [
                {
                    orderId: new RegExp(filterValue, "i")
                }
            ];
        }

        if (!fieldValidator(scrapName))
            scrapFilterObj.scrapName = new RegExp(scrapName, "i");

        console.log("====================================");
        console.log("filterObj", {
            filterObj,
            scrapFilterObj
        });
        console.log("====================================");
        const scraps = await UserOrderModel.aggregate([
            {
                $match: filterObj
            },
            {
                $unwind: "$items" // Unwind the items array
            },
            {
                $lookup: {
                    as: "items.scrapInfo",
                    foreignField: "scrapId",
                    from: "scraps",
                    localField: "items.scrapId",
                    pipeline: [{
                        $match: scrapFilterObj
                    }]
                }
            },
            
            {
                $unwind: "$items.scrapInfo"
            },
            {
                $lookup: {
                    as: "addressInfo",
                    foreignField: "addressId",
                    from: "user_addresses",
                    localField: "addressId",
                    pipeline: [{
                        $match: addressFilterObj
                    }]
                }
            },
            {
                $unwind: "$addressInfo"
            },
            {
                $group: {
                    _id: "$_id",
                    addressId: {
                        $first: "$addressId"
                    },
                    addressInfo: {
                        $first: "$addressInfo"
                    },
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
                    orderId: {
                        $first: "$orderId"
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

        for (const scrap of scraps){
            scrap.items.map(async(el) => {
                const url = await generateS3SignedUrl( el.scrapInfo.docPath);
    
                el.scrapInfo.docUrl = url;
    
                return el;
            });
        }

        const scrapCount = await UserOrderModel.aggregate([
            {
                $match: filterObj
            },
            {
                $unwind: "$items" // Unwind the items array
            },
            {
                $lookup: {
                    as: "items.scrapInfo",
                    foreignField: "scrapId",
                    from: "scraps",
                    localField: "items.scrapId",
                    pipeline: [{
                        $match: scrapFilterObj
                    }]
                }
            },
            
            {
                $unwind: "$items.scrapInfo"
            },
            {
                $lookup: {
                    as: "addressInfo",
                    foreignField: "addressId",
                    from: "user_addresses",
                    localField: "addressId",
                    pipeline: [{
                        $match: addressFilterObj
                    }]
                }
            },
            {
                $unwind: "$addressInfo"
            },
            {
                $group: {
                    _id: "$_id",
                    addressId: {
                        $first: "$addressId"
                    },
                    addressInfo: {
                        $first: "$addressInfo"
                    },
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
                    orderId: {
                        $first: "$orderId"
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
                $count: "totalScrapCount"
            }
        ]);

        // console.log("scrapCount", scrapCount);
        const finalObj = {
            scrap: scraps,
            totalScrapCount: scrapCount.length > 0 ? scrapCount[0].totalScrapCount : 0
        };
        
        console.log("finalObj", {
            filterObj,
            finalObj,
            scrapCount
        });

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
            console.error("Error in getPendingOrdersAssignToAdmin:", error);

            return res.status(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
                error: CommonMessage.SOMETHING_WENT_WRONG
            });
        }
    }
});

export default getPendingOrdersAssignToAdmin;
