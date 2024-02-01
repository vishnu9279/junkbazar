"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import UserOrderModel  from "../../../model/users/userOrder.model.js";
import UserModel  from "../../../model/users/user.model.js";
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
    console.log("getPendingOrdersAssignToAdmin working", req.query);

    try {
        let limit = req.query.limit;
        let page = req.query.page;
        const filterValue = req.query.filterValue;
        const userId = req.decoded.userId;
        const scrap_name = req.query.scrapName;

        if (fieldValidator(limit) || isNaN(page)) limit = 10;

        if (fieldValidator(page) || isNaN(page)) page = page || 0;

        const skip = page * limit;
        const filterObj = {
            orderStatus: OrdersEnum.ASSIGN_TO_ADMIN
        };
        
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

        let condition = [
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
                $lookup: {
                    as: "addressInfo",
                    foreignField: "addressId",
                    from: "user_addresses",
                    localField: "addressId"
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
                $skip: parseInt(skip)  // Add the skip stage
            },
            {
                $limit: parseInt(limit)  // Add the limit stage
            },
            {
                $sort: {
                    createdAt: -1  // Sort in descending order based on the createdAt field
                }
            }
        ];

        if (!fieldValidator(scrap_name)){
            condition[2].$lookup.pipeline = [{
                $match: {
                    scrapName: new RegExp(scrap_name, "i")
                }
            }];
        }

        console.log("filter", {
            condition: JSON.stringify(condition),
            filterObj,
            limit,
            page
        });
        const scraps = await UserOrderModel.aggregate(condition).exec();

        // console.log("scraps", scraps);
        for (const scrap of scraps){
            const vendors =  await UserModel.find({
                $or: [{
                    city: scrap.addressInfo.city
                },
                {
                    stateCode: scrap.addressInfo.stateCode
                }],
                managedBy: userId
            });

            if (!fieldValidator(vendors)){
                vendors.map(async (el) => {
                    console.log("profile", el);

                    if (el.profile){
                        const url = await generateS3SignedUrl(el.profile);
                        const pan = await generateS3SignedUrl(el.panID);
                        const aadhaar = await generateS3SignedUrl(el.aadhaarID);
        
                        el.profileUrl = url;
                        el.panUrl = pan;
                        el.aadhaarUrl = aadhaar;
                    }

                    return el;
                });

                scrap.vendors = vendors;
            }

            scrap.items.map(async(el) => {
                const url = await generateS3SignedUrl( el.scrapInfo.docPath);
    
                el.scrapInfo.docUrl = url;
    
                return el;
            });
        }
        condition = condition.slice(0, -3);
        condition.push({
            $count: "totalCount"
        });
        // console.log("totalScrapCount", condition);
        const totalScrapCount = await UserOrderModel.aggregate(condition);

        console.log("totalScrapCount", totalScrapCount);
        const finalObj = {
            scrap: scraps,
            totalScrapCount: (totalScrapCount.length > 0) ? totalScrapCount[0].totalCount : 0
        };

        console.log("finalObj", filterObj);

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
