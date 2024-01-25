"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import userOrderModel  from "../../../model/users/userOrder.model.js";
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
    console.log("getVendorOrder working", req.query);

    try {
        // const userId = req.decoded.userId;
        let limit = req.query.limit;
        let page = req.query.page;
        let orderStatus = req.query.orderStatus;
        const filterValue = req.query.filterValue;
        const vendorId = req.query.vendorId;

        if (fieldValidator(limit) || isNaN(page)) limit = 10;
    
        if (fieldValidator(page) || isNaN(page)) page = page || 0;
    
        orderStatus = (!fieldValidator(orderStatus)) ? orderStatus.split(",").map(el => parseInt(el)) : "";
        console.log("orderStatus", orderStatus);
        const skip = page * limit;
       
        const filterObj = {
            vendorId
        };

        if (orderStatus.length > 0){
            filterObj.orderStatus = {
                $in: orderStatus
            };
        }
    
        if (!fieldValidator(filterValue)){
            filterObj.$or = [
                {
                    orderId: new RegExp(filterValue, "i")
                }
            ];
        }
    
        console.log("filterObj", filterObj);
        const orders = await userOrderModel.aggregate([
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
                    localField: "items.scrapId"
                }
            },
            {
                $unwind: "$items.scrapInfo"
            },
            {
                $group: {
                    _id: "$_id",
                    addressInfo: {
                        $first: "$addressInfo"
                    },
                    addToCartId: {
                        $first: "$addToCartId" 
                    },
                    createdAt: {
                        $first: "$createdAt" 
                    },
                    dialCode: {
                        $first: "$dialCode"
                    },
                    enabled: {
                        $first: "$enabled" 
                    },
                    finalAmount: {
                        $first: "$finalAmount"
                    },
                    fullName: {
                        $first: "$fullName"
                    },
                    items: {
                        $push: "$items" 
                    },
                    markupFee: {
                        $first: "$markupFee"
                    },
                    orderId: {
                        $first: "$orderId"
                    },
                    orderStatus: {
                        $first: "$orderStatus"
                    },
                    phoneNumber: {
                        $first: "$phoneNumber"
                    },
                    updatedAt: {
                        $first: "$updatedAt" 
                    },
                    userId: {
                        $first: "$userId" 
                    },
                    userIdF_k: {
                        $first: "$userIdF_k" 
                    },
                    vendorId: {
                        $first: "$vendorId"
                    }
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
    
        // console.log("orders", orders);
        for (let index = 0; index < orders.length; index++){
            console.log("inside if condtionvendor ", orders[index].vendorId);
    
            orders[index].items.map(async(el) => {
                const url = await generateS3SignedUrl(el.scrapInfo.docPath);
    
                el.scrapInfo.docUrl = url;
    
                return el;
            });
        }
                
        const totalScrapCount = await userOrderModel.countDocuments(filterObj);
    
        console.log("totalScrapCount", totalScrapCount.length);
       
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
